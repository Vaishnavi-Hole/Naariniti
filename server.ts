import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/server/db';
import { generateToken, requireAuth, AuthenticatedRequest } from './src/server/auth';
import { VERIFIED_GOVERNMENT_SCHEMES } from './src/lib/constants';
import { matchSchemesSemantically, matchPartners } from './src/server/retrieval';
import { 
  evaluateSchemeEligibility, 
  evaluateAllSchemes, 
  validateSchemeRecordIntegrity, 
  OFFICIAL_PRELIMINARY_LEGAL_DISCLAIMER 
} from './src/server/eligibility';
import {
  generateDocumentChecklistForScheme,
  generatePersonalized30DayActionPlan,
  VERIFIED_SCHEME_DOCUMENT_REQUIREMENTS
} from './src/server/planService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // --------------------------------------------------------------------------
  // AUTHENTICATION API ROUTES
  // --------------------------------------------------------------------------

  // Signup
  app.post('/api/auth/signup', (req, res) => {
    try {
      const { fullName, emailOrPhone, password, role, state, district } = req.body;

      if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
        return res.status(400).json({ error: 'Full name must be at least 2 characters.' });
      }
      if (!emailOrPhone || typeof emailOrPhone !== 'string' || emailOrPhone.trim().length < 4) {
        return res.status(400).json({ error: 'Valid email address or mobile number is required.' });
      }
      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const user = db.createUser({
        fullName: fullName.trim(),
        emailOrPhone: emailOrPhone.trim(),
        password,
        role: role === 'admin' ? 'admin' : 'entrepreneur',
        state: state || 'Maharashtra',
        district: district || 'Pune',
      });

      const token = generateToken(user);
      const profile = db.getProfile(user.id);

      return res.status(201).json({
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          emailOrPhone: user.emailOrPhone,
          role: user.role,
          state: user.state,
          district: user.district,
        },
        profile,
      });
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        return res.status(409).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message || 'Internal server error during registration.' });
    }
  });

  // Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { emailOrPhone, password } = req.body;

      if (!emailOrPhone || !password) {
        return res.status(400).json({ error: 'Email/phone and password are required.' });
      }

      const user = db.findUserByEmailOrPhone(emailOrPhone.trim());
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials. Account not found.' });
      }

      const isValid = db.verifyPassword(password, user);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials. Password does not match.' });
      }

      const token = generateToken(user);
      const profile = db.getProfile(user.id);

      return res.json({
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          emailOrPhone: user.emailOrPhone,
          role: user.role,
          state: user.state,
          district: user.district,
        },
        profile,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal server error during sign in.' });
    }
  });

  // Get current session user & profile
  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = db.findUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const profile = db.getProfile(user.id);
    return res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        emailOrPhone: user.emailOrPhone,
        role: user.role,
        state: user.state,
        district: user.district,
      },
      profile,
    });
  });

  // --------------------------------------------------------------------------
  // PROFILE API ROUTES (PROTECTED)
  // --------------------------------------------------------------------------

  app.get('/api/profile', requireAuth, (req: AuthenticatedRequest, res) => {
    const profile = db.getProfile(req.user!.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    return res.json(profile);
  });

  app.put('/api/profile', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const updates = req.body;
      const updated = db.updateProfile(req.user!.userId, updates);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to update profile.' });
    }
  });

  // --------------------------------------------------------------------------
  // BUSINESS PROJECTS API ROUTES (PROTECTED WITH OWNERSHIP ISOLATION)
  // --------------------------------------------------------------------------

  // List all projects for authenticated user
  app.get('/api/projects', requireAuth, (req: AuthenticatedRequest, res) => {
    const userProjects = db.getUserProjects(req.user!.userId);
    return res.json(userProjects);
  });

  // Create a new business project
  app.post('/api/projects', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { title, sector, ideaDescription, budgetInINR, targetDailyCustomers, operationMode, stage, location, hasEquipment, equipmentNotes } = req.body;

      if (!title || typeof title !== 'string' || title.trim().length < 2) {
        return res.status(400).json({ error: 'Project title is required.' });
      }

      const newProject = db.createProject(req.user!.userId, {
        title: title.trim(),
        sector: sector || 'food_snacks',
        ideaDescription: ideaDescription || '',
        budgetInINR: Number(budgetInINR) || 25000,
        targetDailyCustomers: Number(targetDailyCustomers) || 50,
        operationMode: operationMode || 'stall',
        stage: stage || 'planning',
        location: location || '',
        hasEquipment: Boolean(hasEquipment),
        equipmentNotes: equipmentNotes || '',
        planCompletionPercentage: 20,
      });

      return res.status(201).json(newProject);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to create business project.' });
    }
  });

  // Get project by ID (Strict ownership verification!)
  app.get('/api/projects/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const project = db.getProjectById(req.params.id, req.user!.userId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found.' });
      }
      return res.json(project);
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_PROJECT_ACCESS') {
        return res.status(403).json({ error: 'Access denied. You do not own this business project.' });
      }
      return res.status(500).json({ error: err.message });
    }
  });

  // Update project
  app.put('/api/projects/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const updated = db.updateProject(req.params.id, req.user!.userId, req.body);
      return res.json(updated);
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_PROJECT_ACCESS') {
        return res.status(403).json({ error: 'Access denied. You cannot modify another user’s project.' });
      }
      if (err.message === 'Project not found') {
        return res.status(404).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
  });

  // Delete project
  app.delete('/api/projects/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const success = db.deleteProject(req.params.id, req.user!.userId);
      if (!success) {
        return res.status(404).json({ error: 'Project not found.' });
      }
      return res.json({ message: 'Project successfully deleted.' });
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_PROJECT_ACCESS') {
        return res.status(403).json({ error: 'Access denied. You cannot delete another user’s project.' });
      }
      return res.status(500).json({ error: err.message });
    }
  });

  // --------------------------------------------------------------------------
  // DOCUMENTS & ACTION PLANS (PROTECTED - PHASE 7)
  // --------------------------------------------------------------------------

  // Get user's persistent documents
  app.get('/api/documents', requireAuth, (req: AuthenticatedRequest, res) => {
    const docs = db.getUserDocuments(req.user!.userId);
    return res.json(docs);
  });

  // Generate verified document checklist from selected scheme
  app.post('/api/documents/generate-from-scheme', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { schemeId } = req.body;
      if (!schemeId) {
        return res.status(400).json({ error: 'Scheme ID is required.' });
      }
      const existingDocs = db.getUserDocuments(req.user!.userId);
      const generatedDocs = generateDocumentChecklistForScheme(schemeId, existingDocs);
      const savedDocs = db.setUserDocuments(req.user!.userId, generatedDocs);
      return res.json(savedDocs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to generate document checklist.' });
    }
  });

  // Update single document status (available, needed, not_applicable)
  app.put('/api/documents/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    const { status } = req.body;
    const docs = db.updateUserDocument(req.user!.userId, req.params.id, status);
    return res.json(docs);
  });

  // Get user's persistent action plan
  app.get('/api/action-plan', requireAuth, (req: AuthenticatedRequest, res) => {
    const tasks = db.getUserTasks(req.user!.userId);
    return res.json(tasks);
  });

  // Generate personalized 30-day action plan based on project, budget, location, and scheme eligibility
  app.post('/api/action-plan/generate', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { projectId, schemeId } = req.body;
      const userProjects = db.getUserProjects(req.user!.userId);
      const profile = db.getProfile(req.user!.userId);

      const targetProject = (projectId && userProjects.find((p) => p.id === projectId)) || userProjects[0];
      if (!targetProject) {
        return res.status(404).json({ error: 'No business project found to create action plan for.' });
      }

      const activeSchemeId = schemeId || 'sch_mudra_shishu';
      let schemeEligibilityStatus = 'Potentially Eligible';

      try {
        const evalResult = evaluateSchemeEligibility(activeSchemeId, {
          age: profile?.ageBand,
          state: profile?.state,
          district: profile?.district,
          sector: targetProject.sector,
          stage: targetProject.stage,
          budgetInINR: targetProject.budgetInINR,
          isWoman: true,
          isGreenfield: true,
        });
        schemeEligibilityStatus = evalResult.overallStatus;
      } catch {
        // fallback
      }

      const generatedTasks = generatePersonalized30DayActionPlan({
        project: targetProject,
        profile: profile || ({} as any),
        eligibleSchemeId: activeSchemeId,
        schemeEligibilityStatus,
      });

      const savedTasks = db.setUserTasks(req.user!.userId, generatedTasks);
      return res.json(savedTasks);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to generate personalized action plan.' });
    }
  });

  // Update task completion state or reschedule
  app.put('/api/action-plan/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    const { isCompleted, scheduledDate, completionState } = req.body;
    const tasks = db.updateUserTask(req.user!.userId, req.params.id, {
      isCompleted: isCompleted !== undefined ? Boolean(isCompleted) : undefined,
      scheduledDate,
      completionState,
    });
    return res.json(tasks);
  });

  // Feedback API
  app.post('/api/feedback', requireAuth, (req: AuthenticatedRequest, res) => {
    const { recommendationId, feedbackType, explanation } = req.body;
    const fb = db.addFeedback({
      userId: req.user!.userId,
      recommendationId: recommendationId || 'general',
      feedbackType: feedbackType || 'relevant',
      explanation,
    });
    return res.status(201).json(fb);
  });

  // --------------------------------------------------------------------------
  // CONVERSATION HISTORY & CONTEXT MEMORY (PHASE 4)
  // --------------------------------------------------------------------------

  // Get project conversation & recent messages (strictly isolated to owner)
  app.get('/api/projects/:id/conversation', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const data = db.getProjectConversation(req.params.id, req.user!.userId);
      return res.json(data);
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_PROJECT_ACCESS') {
        return res.status(403).json({ error: 'Access denied to this project conversation.' });
      }
      return res.status(404).json({ error: err.message });
    }
  });

  // Post message to project conversation
  app.post('/api/projects/:id/messages', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { content, role, structuredResponse } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Message content is required.' });
      }

      const msg = db.addProjectMessage(
        req.params.id,
        req.user!.userId,
        role || 'user',
        content.trim(),
        structuredResponse
      );

      return res.status(201).json(msg);
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_PROJECT_ACCESS') {
        return res.status(403).json({ error: 'Access denied.' });
      }
      return res.status(400).json({ error: err.message });
    }
  });

  // Clear conversation history for project
  app.delete('/api/projects/:id/conversation', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      db.clearProjectConversation(req.params.id, req.user!.userId);
      return res.json({ message: 'Conversation history cleared successfully.' });
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_PROJECT_ACCESS') {
        return res.status(403).json({ error: 'Access denied.' });
      }
      return res.status(400).json({ error: err.message });
    }
  });

  // Structured Business Plan CRUD (Phase 4)
  app.get('/api/projects/:id/business-plan', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const plan = db.getProjectBusinessPlan(req.params.id, req.user!.userId);
      return res.json(plan || { planData: null, isEdited: false });
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_PROJECT_ACCESS') {
        return res.status(403).json({ error: 'Access denied.' });
      }
      return res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/projects/:id/business-plan', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const { planData, isEdited } = req.body;
      const plan = db.saveProjectBusinessPlan(req.params.id, req.user!.userId, planData, Boolean(isEdited));
      return res.json(plan);
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_PROJECT_ACCESS') {
        return res.status(403).json({ error: 'Access denied.' });
      }
      return res.status(400).json({ error: err.message });
    }
  });

  // --------------------------------------------------------------------------
  // HYBRID RETRIEVAL ENDPOINTS (PHASE 5)
  // --------------------------------------------------------------------------

  app.post('/api/retrieval/match-schemes', (req, res) => {
    const { query } = req.body;
    const results = matchSchemesSemantically(query || '');
    return res.json({ results, query });
  });

  app.post('/api/retrieval/match-partners', (req, res) => {
    const { query } = req.body;
    const partners = matchPartners(query || '');
    return res.json({ partners, query });
  });

  // --------------------------------------------------------------------------
  // DETERMINISTIC ELIGIBILITY EVALUATION ENDPOINTS (PHASE 6)
  // --------------------------------------------------------------------------

  // Evaluate single scheme deterministically
  app.post('/api/eligibility/evaluate-scheme', (req, res) => {
    try {
      const { schemeId, profile, project, directInput } = req.body;
      if (!schemeId) {
        return res.status(400).json({ error: 'schemeId is required' });
      }

      const input = directInput || {
        age: profile?.ageBand || profile?.age,
        state: profile?.state,
        district: profile?.district,
        isRural: profile?.isRural ?? true,
        sector: project?.sector || profile?.businessSector,
        stage: project?.stage || profile?.businessStage,
        budgetInINR: project?.budgetInINR !== undefined ? Number(project.budgetInINR) : undefined,
        availableInvestment: profile?.availableInvestment !== undefined ? Number(profile.availableInvestment) : undefined,
        isWoman: profile?.role !== 'partner',
        isGreenfield: true,
      };

      const result = evaluateSchemeEligibility(schemeId, input);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Evaluation failed' });
    }
  });

  // Evaluate all catalog schemes against profile & active project
  app.post('/api/eligibility/evaluate-all', (req, res) => {
    try {
      const { profile, project, directInput } = req.body;
      const input = directInput || {
        age: profile?.ageBand || profile?.age,
        state: profile?.state,
        district: profile?.district,
        isRural: profile?.isRural ?? true,
        sector: project?.sector || profile?.businessSector,
        stage: project?.stage || profile?.businessStage,
        budgetInINR: project?.budgetInINR !== undefined ? Number(project.budgetInINR) : undefined,
        availableInvestment: profile?.availableInvestment !== undefined ? Number(profile.availableInvestment) : undefined,
        isWoman: true,
        isGreenfield: true,
      };

      const results = evaluateAllSchemes(input);
      return res.json({
        evaluations: results,
        disclaimer: OFFICIAL_PRELIMINARY_LEGAL_DISCLAIMER,
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Bulk evaluation failed' });
    }
  });

  // Validate scheme record integrity (prevents LLM hallucination of IDs & URLs)
  app.post('/api/eligibility/validate-record', (req, res) => {
    const { schemeId, officialUrl } = req.body;
    const isValid = validateSchemeRecordIntegrity(schemeId, officialUrl);
    return res.json({ isValid, schemeId, officialUrl });
  });

  // Schemes catalog
  app.get('/api/schemes', (_req, res) => {
    return res.json(VERIFIED_GOVERNMENT_SCHEMES);
  });

  // --------------------------------------------------------------------------
  // VITE / STATIC INTEGRATION
  // --------------------------------------------------------------------------

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nariniti Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });

  return server;
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
