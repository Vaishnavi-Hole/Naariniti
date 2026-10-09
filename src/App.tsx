import React, { useState, useEffect } from 'react';
import { 
  AppPage, 
  Language, 
  EntrepreneurProfile, 
  BusinessProject, 
  GovernmentScheme, 
  DocumentItem, 
  ActionPlanTask,
  UserRole 
} from './types';
import { 
  INITIAL_DEMO_PROFILE, 
  INITIAL_DEMO_PROJECT, 
  VERIFIED_GOVERNMENT_SCHEMES, 
  INITIAL_DEMO_DOCUMENTS, 
  INITIAL_DEMO_ACTION_PLAN 
} from './lib/constants';
import { api, getStoredToken } from './lib/api';
import { Navigation } from './components/Navigation';
import { FastApiStatusBanner } from './components/FastApiStatusBanner';
import { LandingPage } from './pages/LandingPage';
import { AuthPages } from './pages/AuthPages';
import { OnboardingWizardPage } from './pages/OnboardingWizardPage';
import { BusinessDashboardPage } from './pages/BusinessDashboardPage';
import { AiMentorPage } from './pages/AiMentorPage';
import { FundingDiscoveryPage } from './pages/FundingDiscoveryPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';
import { DocumentChecklistPage } from './pages/DocumentChecklistPage';
import { ActionPlanPage } from './pages/ActionPlanPage';
import { ProfilePreferencesPage } from './pages/ProfilePreferencesPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');
  const [language, setLanguage] = useState<Language>('mr');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('sch_mudra_shishu');

  // Application State
  const [profile, setProfile] = useState<EntrepreneurProfile>(INITIAL_DEMO_PROFILE);
  const [projects, setProjects] = useState<BusinessProject[]>([INITIAL_DEMO_PROJECT]);
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_DEMO_PROJECT.id);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>(VERIFIED_GOVERNMENT_SCHEMES);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DEMO_DOCUMENTS);
  const [tasks, setTasks] = useState<ActionPlanTask[]>(INITIAL_DEMO_ACTION_PLAN);

  // Active project derived
  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_DEMO_PROJECT;

  // Phase 6: Deterministic Eligibility Evaluation whenever profile or active project changes
  useEffect(() => {
    async function reevaluateEligibility() {
      try {
        const res = await api.evaluateAllSchemesEligibility(profile, currentProject);
        if (res && res.evaluations && res.evaluations.length > 0) {
          setSchemes((prevSchemes) => {
            return prevSchemes.map((s) => {
              const matchedEval = res.evaluations.find((e: any) => e.schemeId === s.id);
              if (!matchedEval) return s;
              return {
                ...s,
                overallStatus: matchedEval.overallStatus,
                criteria: matchedEval.criteria,
                whyRecommended: matchedEval.summaryExplanation,
                missingInformation: matchedEval.missingInformation,
                evidenceReferences: matchedEval.evidenceReferences,
                preliminaryDisclaimer: matchedEval.preliminaryDisclaimer,
              };
            });
          });
        }
      } catch (err) {
        console.warn('Deterministic eligibility evaluation failed:', err);
      }
    }

    reevaluateEligibility();
  }, [profile, currentProject]);

  // Initial user session verification
  useEffect(() => {
    async function initSession() {
      const token = getStoredToken();
      if (!token) {
        setIsLoggedIn(false);
        setIsLoadingUser(false);
        return;
      }

      try {
        const me = await api.getMe();
        setIsLoggedIn(true);
        if (me.profile) {
          setProfile(me.profile);
          if (me.profile.language) setLanguage(me.profile.language);
        }

        // Load user's real projects
        const userProjects = await api.getProjects();
        if (userProjects && userProjects.length > 0) {
          setProjects(userProjects);
          setActiveProjectId(userProjects[0].id);
        }

        // Load user's documents & tasks
        const userDocs = await api.getDocuments();
        if (userDocs) setDocuments(userDocs);

        const userTasks = await api.getActionPlan();
        if (userTasks) setTasks(userTasks);
      } catch (err) {
        console.warn('Session verification failed:', err);
        api.logout();
        setIsLoggedIn(false);
      } finally {
        setIsLoadingUser(false);
      }
    }

    initSession();
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setProfile((prev) => ({ ...prev, language: newLang }));
    if (isLoggedIn) {
      api.updateProfile({ language: newLang }).catch(() => {});
    }
  };

  const handleAuthSuccess = async (role: UserRole) => {
    setIsLoggedIn(true);
    try {
      const [userProfile, userProjects, userDocs, userTasks] = await Promise.all([
        api.getProfile(),
        api.getProjects(),
        api.getDocuments(),
        api.getActionPlan(),
      ]);

      if (userProfile) {
        setProfile(userProfile);
        if (userProfile.language) setLanguage(userProfile.language);
      }
      if (userProjects && userProjects.length > 0) {
        setProjects(userProjects);
        setActiveProjectId(userProjects[0].id);
      }
      if (userDocs) setDocuments(userDocs);
      if (userTasks) setTasks(userTasks);
    } catch {
      // ignore
    }
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setIsLoggedIn(false);
    setCurrentPage('landing');
  };

  const handleCompleteWizard = async (projectData: any) => {
    try {
      let createdProject: BusinessProject;
      if (isLoggedIn) {
        createdProject = await api.createProject({
          title: projectData.ideaDescription.slice(0, 35) || 'My New Business',
          sector: projectData.sector,
          ideaDescription: projectData.ideaDescription,
          budgetInINR: projectData.budget,
          operationMode: projectData.operationMode,
          location: projectData.location || profile.villageTown,
        });

        await api.updateProfile({
          businessSector: projectData.sector,
          availableInvestment: projectData.budget,
          hasWorkspace: projectData.hasWorkspace,
        });

        setProjects((prev) => [...prev, createdProject]);
        setActiveProjectId(createdProject.id);
      } else {
        createdProject = {
          ...INITIAL_DEMO_PROJECT,
          id: `prj_${Date.now()}`,
          sector: projectData.sector,
          ideaDescription: projectData.ideaDescription,
          budgetInINR: projectData.budget,
          operationMode: projectData.operationMode,
          location: projectData.location || profile.villageTown,
        };
        setProjects((prev) => [...prev, createdProject]);
        setActiveProjectId(createdProject.id);
      }
    } catch (err) {
      console.error('Failed to create project on backend:', err);
    }
    setCurrentPage('dashboard');
  };

  const handleUpdateDocumentStatus = async (id: string, status: DocumentItem['status']) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
    if (isLoggedIn) {
      try {
        const updatedDocs = await api.updateDocumentStatus(id, status);
        if (updatedDocs) setDocuments(updatedDocs);
      } catch (err) {
        console.error('Failed to update document status:', err);
      }
    }
  };

  const handleGenerateDocumentsForScheme = async (schemeId: string) => {
    try {
      if (isLoggedIn) {
        const generated = await api.generateDocumentsForScheme(schemeId);
        if (generated) setDocuments(generated);
      }
    } catch (err) {
      console.error('Failed to generate documents for scheme:', err);
    }
  };

  const handleToggleTaskComplete = async (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    const newCompleted = !targetTask?.isCompleted;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              isCompleted: newCompleted,
              completionState: newCompleted ? 'completed' : 'pending',
              status: newCompleted ? 'completed' : 'pending',
            }
          : t
      )
    );

    if (isLoggedIn) {
      try {
        const updatedTasks = await api.toggleTask(taskId, newCompleted);
        if (updatedTasks) setTasks(updatedTasks);
      } catch (err) {
        console.error('Failed to toggle task:', err);
      }
    }
  };

  const handleRescheduleTask = async (taskId: string, newSchedule: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, scheduledDate: newSchedule } : t))
    );
    if (isLoggedIn) {
      try {
        const updatedTasks = await api.updateTaskSchedule(taskId, newSchedule);
        if (updatedTasks) setTasks(updatedTasks);
      } catch (err) {
        console.error('Failed to reschedule task:', err);
      }
    }
  };

  const handleRegenerateActionPlan = async () => {
    try {
      if (isLoggedIn) {
        const generated = await api.generateActionPlan(activeProjectId, selectedSchemeId);
        if (generated) setTasks(generated);
      }
    } catch (err) {
      console.error('Failed to regenerate action plan:', err);
    }
  };

  const handleUpdateProfile = async (updated: Partial<EntrepreneurProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    if (isLoggedIn) {
      try {
        const saved = await api.updateProfile(updated);
        setProfile(saved);
      } catch (err) {
        console.error('Failed to update profile:', err);
      }
    }
  };

  const handleSelectScheme = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    setCurrentPage('scheme-detail');
  };

  const currentScheme = schemes.find((s) => s.id === selectedSchemeId) || schemes[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-stone-900 selection:bg-amber-200 selection:text-stone-900">
      
      {/* Top Colab / FastAPI Status Banner */}
      <FastApiStatusBanner language={language} />

      {/* Main Top Navigation + Mobile Bottom Tab Bar */}
      <Navigation
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        language={language}
        onLanguageChange={handleLanguageChange}
        isLoggedIn={isLoggedIn}
        onAuthToggle={() => (isLoggedIn ? handleLogout() : setCurrentPage('login'))}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {currentPage === 'landing' && (
          <LandingPage
            language={language}
            onStartWizard={() => setCurrentPage('wizard')}
            onExploreSchemes={() => setCurrentPage('schemes')}
            onViewDashboard={() => setCurrentPage('dashboard')}
            isLoggedIn={isLoggedIn}
          />
        )}

        {currentPage === 'login' && (
          <AuthPages
            mode="login"
            language={language}
            onSuccess={handleAuthSuccess}
            onSwitchMode={(mode) => setCurrentPage(mode as any)}
          />
        )}

        {currentPage === 'signup' && (
          <AuthPages
            mode="signup"
            language={language}
            onSuccess={handleAuthSuccess}
            onSwitchMode={(mode) => setCurrentPage(mode as any)}
          />
        )}

        {currentPage === 'wizard' && (
          <OnboardingWizardPage
            language={language}
            onCompleteWizard={handleCompleteWizard}
            onCancel={() => setCurrentPage(isLoggedIn ? 'dashboard' : 'landing')}
          />
        )}

        {currentPage === 'dashboard' && (
          <BusinessDashboardPage
            profile={profile}
            project={currentProject}
            allProjects={projects}
            onSelectProject={(id) => setActiveProjectId(id)}
            schemes={schemes}
            documents={documents}
            tasks={tasks}
            language={language}
            onNavigate={(page) => setCurrentPage(page)}
            onStartNewProject={() => setCurrentPage('wizard')}
          />
        )}

        {currentPage === 'mentor' && (
          <AiMentorPage
            profile={profile}
            project={currentProject}
            language={language}
          />
        )}

        {currentPage === 'schemes' && (
          <FundingDiscoveryPage
            schemes={schemes}
            language={language}
            onSelectScheme={handleSelectScheme}
            onViewEligibility={handleSelectScheme}
          />
        )}

        {currentPage === 'scheme-detail' && (
          <SchemeDetailPage
            scheme={currentScheme}
            language={language}
            onBack={() => setCurrentPage('schemes')}
            onGoToDocuments={async (schemeId) => {
              if (schemeId) {
                await handleGenerateDocumentsForScheme(schemeId);
              }
              setCurrentPage('documents');
            }}
          />
        )}

        {currentPage === 'documents' && (
          <DocumentChecklistPage
            documents={documents}
            language={language}
            onUpdateDocumentStatus={handleUpdateDocumentStatus}
            onGenerateForScheme={handleGenerateDocumentsForScheme}
            selectedSchemeId={selectedSchemeId}
          />
        )}

        {currentPage === 'action-plan' && (
          <ActionPlanPage
            tasks={tasks}
            project={currentProject}
            profile={profile}
            language={language}
            onToggleTaskComplete={handleToggleTaskComplete}
            onViewRelatedScheme={(schemeId) => handleSelectScheme(schemeId)}
            onRescheduleTask={handleRescheduleTask}
            onRegenerateActionPlan={handleRegenerateActionPlan}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePreferencesPage
            profile={profile}
            language={language}
            onUpdateProfile={handleUpdateProfile}
            onLanguageChange={handleLanguageChange}
            onLogout={handleLogout}
          />
        )}
      </main>

    </div>
  );
}
