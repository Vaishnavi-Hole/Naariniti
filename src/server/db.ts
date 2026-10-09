import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { EntrepreneurProfile, BusinessProject, DocumentItem, ActionPlanTask, GovernmentScheme } from '../types';
import { 
  INITIAL_DEMO_PROFILE, 
  INITIAL_DEMO_PROJECT, 
  INITIAL_DEMO_DOCUMENTS, 
  INITIAL_DEMO_ACTION_PLAN, 
  VERIFIED_GOVERNMENT_SCHEMES 
} from '../lib/constants';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'nariniti.db.json');

export interface StoredUser {
  id: string;
  fullName: string;
  emailOrPhone: string;
  passwordHash: string;
  salt: string;
  role: 'entrepreneur' | 'admin' | 'partner';
  state: string;
  district: string;
  createdAt: string;
}

export interface StoredFeedback {
  id: string;
  userId: string;
  recommendationId: string;
  feedbackType: 'relevant' | 'not_relevant' | 'incorrect_info' | 'outdated_info' | 'missing_info';
  explanation?: string;
  createdAt: string;
}

export interface StoredMessage {
  id: string;
  projectId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  structuredResponse?: any;
  createdAt: string;
}

export interface StoredConversation {
  id: string;
  projectId: string;
  userId: string;
  contextSummary: string;
  updatedAt: string;
}

export interface StoredBusinessPlan {
  projectId: string;
  userId: string;
  planData: any;
  isEdited: boolean;
  updatedAt: string;
}

export interface DatabaseSchema {
  version: number;
  users: StoredUser[];
  profiles: Record<string, EntrepreneurProfile>; // keyed by userId
  projects: BusinessProject[]; // each has userId
  documents: Record<string, DocumentItem[]>; // keyed by userId
  actionPlans: Record<string, ActionPlanTask[]>; // keyed by userId
  feedback: StoredFeedback[];
  conversations?: Record<string, StoredConversation>; // keyed by projectId
  messages?: StoredMessage[];
  businessPlans?: Record<string, StoredBusinessPlan>; // keyed by projectId
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function ensureDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    // Initial schema migration (v1)
    const demoSalt = generateSalt();
    const demoHash = hashPassword('SecurePass123!', demoSalt);

    const initialDb: DatabaseSchema = {
      version: 1,
      users: [
        {
          id: 'usr_sunita_pawar_01',
          fullName: 'Sunita Anand Pawar',
          emailOrPhone: 'sunita.shirur@example.com',
          passwordHash: demoHash,
          salt: demoSalt,
          role: 'entrepreneur',
          state: 'Maharashtra',
          district: 'Pune',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'usr_admin_pooja_01',
          fullName: 'Pooja Deshmukh',
          emailOrPhone: 'curator.schemes@nariniti.org',
          passwordHash: demoHash,
          salt: demoSalt,
          role: 'admin',
          state: 'Maharashtra',
          district: 'Mumbai',
          createdAt: new Date().toISOString(),
        },
      ],
      profiles: {
        usr_sunita_pawar_01: INITIAL_DEMO_PROFILE,
      },
      projects: [
        INITIAL_DEMO_PROJECT,
      ],
      documents: {
        usr_sunita_pawar_01: INITIAL_DEMO_DOCUMENTS,
      },
      actionPlans: {
        usr_sunita_pawar_01: INITIAL_DEMO_ACTION_PLAN,
      },
      feedback: [],
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed.conversations) parsed.conversations = {};
    if (!parsed.messages) parsed.messages = [];
    if (!parsed.businessPlans) parsed.businessPlans = {};
    return parsed;
  } catch (err) {
    console.error('Error reading DB, re-initializing...', err);
    const backupFile = `${DB_FILE}.bak.${Date.now()}`;
    if (fs.existsSync(DB_FILE)) fs.copyFileSync(DB_FILE, backupFile);
    throw err;
  }
}

function saveDb(db: DatabaseSchema) {
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

export const db = {
  // Auth & Users
  findUserByEmailOrPhone(emailOrPhone: string): StoredUser | undefined {
    const data = ensureDb();
    return data.users.find(
      (u) => u.emailOrPhone.toLowerCase() === emailOrPhone.toLowerCase()
    );
  },

  findUserById(id: string): StoredUser | undefined {
    const data = ensureDb();
    return data.users.find((u) => u.id === id);
  },

  createUser(params: {
    fullName: string;
    emailOrPhone: string;
    password: string;
    role?: 'entrepreneur' | 'admin' | 'partner';
    state?: string;
    district?: string;
  }): StoredUser {
    const data = ensureDb();
    const existing = data.users.find(
      (u) => u.emailOrPhone.toLowerCase() === params.emailOrPhone.toLowerCase()
    );
    if (existing) {
      throw new Error('User already exists with this email or mobile number.');
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(params.password, salt);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newUser: StoredUser = {
      id: userId,
      fullName: params.fullName,
      emailOrPhone: params.emailOrPhone,
      passwordHash,
      salt,
      role: params.role || 'entrepreneur',
      state: params.state || 'Maharashtra',
      district: params.district || 'Pune',
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);

    // Initialize default profile
    data.profiles[userId] = {
      id: userId,
      fullName: params.fullName,
      preferredName: params.fullName.split(' ')[0] || params.fullName,
      ageBand: '26-35',
      state: params.state || 'Maharashtra',
      district: params.district || 'Pune',
      villageTown: '',
      language: 'mr',
      interactionMode: 'both',
      educationLevel: 'secondary',
      existingOccupation: 'Self-employed / Exploring',
      previousBusinessExperience: false,
      businessSector: 'food_snacks',
      businessStage: 'planning',
      availableInvestment: 25000,
      hasSmartphone: true,
      hasInternet: true,
      hasWorkspace: false,
      role: newUser.role,
      createdAt: new Date().toISOString(),
    };

    // Initialize default starter documents & action plan
    data.documents[userId] = INITIAL_DEMO_DOCUMENTS.map((d) => ({ ...d }));
    data.actionPlans[userId] = INITIAL_DEMO_ACTION_PLAN.map((t) => ({ ...t }));

    saveDb(data);
    return newUser;
  },

  verifyPassword(password: string, user: StoredUser): boolean {
    const hash = hashPassword(password, user.salt);
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(user.passwordHash, 'hex')
    );
  },

  // Profiles
  getProfile(userId: string): EntrepreneurProfile | undefined {
    const data = ensureDb();
    return data.profiles[userId];
  },

  updateProfile(userId: string, updates: Partial<EntrepreneurProfile>): EntrepreneurProfile {
    const data = ensureDb();
    const current = data.profiles[userId] || {
      id: userId,
      fullName: 'Entrepreneur',
      preferredName: 'Tai',
      ageBand: '26-35',
      state: 'Maharashtra',
      district: 'Pune',
      villageTown: '',
      language: 'mr',
      interactionMode: 'both',
      educationLevel: 'secondary',
      existingOccupation: '',
      previousBusinessExperience: false,
      businessSector: 'food_snacks',
      businessStage: 'planning',
      availableInvestment: 25000,
      hasSmartphone: true,
      hasInternet: true,
      hasWorkspace: false,
      role: 'entrepreneur',
      createdAt: new Date().toISOString(),
    };

    data.profiles[userId] = {
      ...current,
      ...updates,
      id: userId, // immutable
    };

    saveDb(data);
    return data.profiles[userId];
  },

  // Projects (Isolated by userId!)
  getUserProjects(userId: string): BusinessProject[] {
    const data = ensureDb();
    return data.projects.filter((p) => p.userId === userId);
  },

  getProjectById(projectId: string, userId: string): BusinessProject | null {
    const data = ensureDb();
    const project = data.projects.find((p) => p.id === projectId);
    if (!project) return null;
    if (project.userId !== userId) {
      // Authorization violation!
      throw new Error('FORBIDDEN_PROJECT_ACCESS');
    }
    return project;
  },

  createProject(userId: string, projectData: Omit<BusinessProject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): BusinessProject {
    const data = ensureDb();
    const newProject: BusinessProject = {
      ...projectData,
      id: `prj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.projects.push(newProject);
    saveDb(data);
    return newProject;
  },

  updateProject(projectId: string, userId: string, updates: Partial<BusinessProject>): BusinessProject {
    const data = ensureDb();
    const index = data.projects.findIndex((p) => p.id === projectId);
    if (index === -1) {
      throw new Error('Project not found');
    }
    if (data.projects[index].userId !== userId) {
      throw new Error('FORBIDDEN_PROJECT_ACCESS');
    }

    data.projects[index] = {
      ...data.projects[index],
      ...updates,
      id: projectId,
      userId, // keep ownership immutable
      updatedAt: new Date().toISOString(),
    };

    saveDb(data);
    return data.projects[index];
  },

  deleteProject(projectId: string, userId: string): boolean {
    const data = ensureDb();
    const project = data.projects.find((p) => p.id === projectId);
    if (!project) return false;
    if (project.userId !== userId) {
      throw new Error('FORBIDDEN_PROJECT_ACCESS');
    }

    data.projects = data.projects.filter((p) => p.id !== projectId);
    saveDb(data);
    return true;
  },

  // Documents
  getUserDocuments(userId: string): DocumentItem[] {
    const data = ensureDb();
    return data.documents[userId] || INITIAL_DEMO_DOCUMENTS;
  },

  setUserDocuments(userId: string, documents: DocumentItem[]): DocumentItem[] {
    const data = ensureDb();
    data.documents[userId] = documents;
    saveDb(data);
    return documents;
  },

  updateUserDocument(userId: string, docId: string, status: DocumentItem['status']): DocumentItem[] {
    const data = ensureDb();
    if (!data.documents[userId]) {
      data.documents[userId] = INITIAL_DEMO_DOCUMENTS.map((d) => ({ ...d }));
    }
    data.documents[userId] = data.documents[userId].map((d) =>
      d.id === docId ? { ...d, status } : d
    );
    saveDb(data);
    return data.documents[userId];
  },

  // Action Plan Tasks
  getUserTasks(userId: string): ActionPlanTask[] {
    const data = ensureDb();
    return data.actionPlans[userId] || INITIAL_DEMO_ACTION_PLAN;
  },

  setUserTasks(userId: string, tasks: ActionPlanTask[]): ActionPlanTask[] {
    const data = ensureDb();
    data.actionPlans[userId] = tasks;
    saveDb(data);
    return tasks;
  },

  updateUserTask(
    userId: string, 
    taskId: string, 
    updates: { isCompleted?: boolean; scheduledDate?: string; completionState?: ActionPlanTask['completionState'] }
  ): ActionPlanTask[] {
    const data = ensureDb();
    if (!data.actionPlans[userId]) {
      data.actionPlans[userId] = INITIAL_DEMO_ACTION_PLAN.map((t) => ({ ...t }));
    }
    data.actionPlans[userId] = data.actionPlans[userId].map((t) => {
      if (t.id !== taskId) return t;
      const isCompleted = updates.isCompleted !== undefined ? updates.isCompleted : t.isCompleted;
      const completionState = updates.completionState || (isCompleted ? 'completed' : 'pending');
      const scheduledDate = updates.scheduledDate !== undefined ? updates.scheduledDate : t.scheduledDate;
      return {
        ...t,
        isCompleted,
        completionState,
        scheduledDate,
        status: isCompleted ? 'completed' : 'pending',
      };
    });
    saveDb(data);
    return data.actionPlans[userId];
  },

  // Feedback
  addFeedback(feedbackData: Omit<StoredFeedback, 'id' | 'createdAt'>): StoredFeedback {
    const data = ensureDb();
    const item: StoredFeedback = {
      ...feedbackData,
      id: `fb_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    data.feedback.push(item);
    saveDb(data);
    return item;
  },

  // Project Conversation & Context Memory (Phase 4)
  getProjectConversation(projectId: string, userId: string): { conversation: StoredConversation; messages: StoredMessage[] } {
    const project = this.getProjectById(projectId, userId);
    if (!project) throw new Error('Project not found');

    const data = ensureDb();
    let conv = data.conversations?.[projectId];
    if (!conv) {
      conv = {
        id: `conv_${projectId}`,
        projectId,
        userId,
        contextSummary: `Initial business discovery for ${project.title} (Budget: ₹${project.budgetInINR.toLocaleString('en-IN')})`,
        updatedAt: new Date().toISOString(),
      };
      if (!data.conversations) data.conversations = {};
      data.conversations[projectId] = conv;
      saveDb(data);
    }

    const messages = (data.messages || []).filter(
      (m) => m.projectId === projectId && m.userId === userId
    );

    return {
      conversation: conv,
      messages: messages.slice(-10), // Limit to recent 10 messages to avoid indefinite context window blowup
    };
  },

  addProjectMessage(
    projectId: string,
    userId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    structuredResponse?: any
  ): StoredMessage {
    const project = this.getProjectById(projectId, userId);
    if (!project) throw new Error('Project not found');

    const data = ensureDb();
    if (!data.messages) data.messages = [];
    if (!data.conversations) data.conversations = {};

    const msg: StoredMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      userId,
      role,
      content,
      structuredResponse,
      createdAt: new Date().toISOString(),
    };

    data.messages.push(msg);

    if (!data.conversations[projectId]) {
      data.conversations[projectId] = {
        id: `conv_${projectId}`,
        projectId,
        userId,
        contextSummary: `Initial planning for ${project.title}`,
        updatedAt: new Date().toISOString(),
      };
    } else {
      data.conversations[projectId].updatedAt = new Date().toISOString();
    }

    saveDb(data);
    return msg;
  },

  updateProjectContextSummary(projectId: string, userId: string, summary: string): StoredConversation {
    const project = this.getProjectById(projectId, userId);
    if (!project) throw new Error('Project not found');

    const data = ensureDb();
    if (!data.conversations) data.conversations = {};

    const conv: StoredConversation = {
      id: `conv_${projectId}`,
      projectId,
      userId,
      contextSummary: summary,
      updatedAt: new Date().toISOString(),
    };

    data.conversations[projectId] = conv;
    saveDb(data);
    return conv;
  },

  clearProjectConversation(projectId: string, userId: string): boolean {
    const project = this.getProjectById(projectId, userId);
    if (!project) throw new Error('Project not found');

    const data = ensureDb();
    if (data.messages) {
      data.messages = data.messages.filter(
        (m) => !(m.projectId === projectId && m.userId === userId)
      );
    }
    if (data.conversations && data.conversations[projectId]) {
      data.conversations[projectId].contextSummary = `Reset conversation for ${project.title}`;
      data.conversations[projectId].updatedAt = new Date().toISOString();
    }
    saveDb(data);
    return true;
  },

  // Structured Business Plan (Phase 4)
  getProjectBusinessPlan(projectId: string, userId: string): StoredBusinessPlan | null {
    const project = this.getProjectById(projectId, userId);
    if (!project) throw new Error('Project not found');

    const data = ensureDb();
    return data.businessPlans?.[projectId] || null;
  },

  saveProjectBusinessPlan(projectId: string, userId: string, planData: any, isEdited: boolean = false): StoredBusinessPlan {
    const project = this.getProjectById(projectId, userId);
    if (!project) throw new Error('Project not found');

    const data = ensureDb();
    if (!data.businessPlans) data.businessPlans = {};

    const plan: StoredBusinessPlan = {
      projectId,
      userId,
      planData,
      isEdited,
      updatedAt: new Date().toISOString(),
    };

    data.businessPlans[projectId] = plan;
    saveDb(data);
    return plan;
  },
};
