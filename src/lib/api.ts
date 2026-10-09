import { EntrepreneurProfile, BusinessProject, DocumentItem, ActionPlanTask } from '../types';

const TOKEN_KEY = 'nariniti_auth_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async signup(data: {
    fullName: string;
    emailOrPhone: string;
    password: string;
    role?: string;
    state?: string;
    district?: string;
  }) {
    const res = await request<{ token: string; user: any; profile: EntrepreneurProfile }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async login(emailOrPhone: string, password: string) {
    const res = await request<{ token: string; user: any; profile: EntrepreneurProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe() {
    return request<{ user: any; profile: EntrepreneurProfile }>('/api/auth/me');
  },

  logout() {
    setStoredToken(null);
  },

  // Profile
  async getProfile(): Promise<EntrepreneurProfile> {
    return request<EntrepreneurProfile>('/api/profile');
  },

  async updateProfile(updates: Partial<EntrepreneurProfile>): Promise<EntrepreneurProfile> {
    return request<EntrepreneurProfile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Projects
  async getProjects(): Promise<BusinessProject[]> {
    return request<BusinessProject[]>('/api/projects');
  },

  async createProject(projectData: Partial<BusinessProject>): Promise<BusinessProject> {
    return request<BusinessProject>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  async getProjectById(id: string): Promise<BusinessProject> {
    return request<BusinessProject>(`/api/projects/${id}`);
  },

  async updateProject(id: string, updates: Partial<BusinessProject>): Promise<BusinessProject> {
    return request<BusinessProject>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProject(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Documents
  async getDocuments(): Promise<DocumentItem[]> {
    return request<DocumentItem[]>('/api/documents');
  },

  async generateDocumentsForScheme(schemeId: string): Promise<DocumentItem[]> {
    return request<DocumentItem[]>('/api/documents/generate-from-scheme', {
      method: 'POST',
      body: JSON.stringify({ schemeId }),
    });
  },

  async updateDocumentStatus(id: string, status: DocumentItem['status']): Promise<DocumentItem[]> {
    return request<DocumentItem[]>(`/api/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Action Plan
  async getActionPlan(): Promise<ActionPlanTask[]> {
    return request<ActionPlanTask[]>('/api/action-plan');
  },

  async generateActionPlan(projectId?: string, schemeId?: string): Promise<ActionPlanTask[]> {
    return request<ActionPlanTask[]>('/api/action-plan/generate', {
      method: 'POST',
      body: JSON.stringify({ projectId, schemeId }),
    });
  },

  async toggleTask(id: string, isCompleted: boolean): Promise<ActionPlanTask[]> {
    return request<ActionPlanTask[]>(`/api/action-plan/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isCompleted }),
    });
  },

  async updateTaskSchedule(id: string, scheduledDate: string, isCompleted?: boolean): Promise<ActionPlanTask[]> {
    return request<ActionPlanTask[]>(`/api/action-plan/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ scheduledDate, isCompleted }),
    });
  },

  // Feedback
  async submitFeedback(data: { recommendationId: string; feedbackType: string; explanation?: string }) {
    return request('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Project Conversation & Context Memory (Phase 4)
  async getProjectConversation(projectId: string) {
    return request<{ conversation: any; messages: any[] }>(`/api/projects/${projectId}/conversation`);
  },

  async sendProjectMessage(projectId: string, content: string, role: string = 'user', structuredResponse?: any) {
    return request<any>(`/api/projects/${projectId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, role, structuredResponse }),
    });
  },

  async clearProjectConversation(projectId: string) {
    return request<{ message: string }>(`/api/projects/${projectId}/conversation`, {
      method: 'DELETE',
    });
  },

  // Structured Business Plan (Phase 4)
  async getProjectBusinessPlan(projectId: string) {
    return request<{ planData: any; isEdited: boolean }>(`/api/projects/${projectId}/business-plan`);
  },

  async saveProjectBusinessPlan(projectId: string, planData: any, isEdited: boolean = false) {
    return request<{ projectId: string; planData: any; isEdited: boolean }>(`/api/projects/${projectId}/business-plan`, {
      method: 'PUT',
      body: JSON.stringify({ planData, isEdited }),
    });
  },

  // Semantic Retrieval (Phase 5)
  async matchSchemesSemantically(query: string) {
    return request<{ results: any[]; query: string }>('/api/retrieval/match-schemes', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  async matchPartners(query: string) {
    return request<{ partners: any[]; query: string }>('/api/retrieval/match-partners', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  // Deterministic Eligibility (Phase 6)
  async evaluateSchemeEligibility(schemeId: string, profile?: any, project?: any, directInput?: any) {
    return request<any>('/api/eligibility/evaluate-scheme', {
      method: 'POST',
      body: JSON.stringify({ schemeId, profile, project, directInput }),
    });
  },

  async evaluateAllSchemesEligibility(profile?: any, project?: any, directInput?: any) {
    return request<{ evaluations: any[]; disclaimer: string }>('/api/eligibility/evaluate-all', {
      method: 'POST',
      body: JSON.stringify({ profile, project, directInput }),
    });
  },

  async validateSchemeRecord(schemeId: string, officialUrl?: string) {
    return request<{ isValid: boolean; schemeId: string; officialUrl?: string }>('/api/eligibility/validate-record', {
      method: 'POST',
      body: JSON.stringify({ schemeId, officialUrl }),
    });
  },
};
