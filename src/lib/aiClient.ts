import { ApiHealthStatus, Language, BusinessSector } from '../types';

export function getAiApiBaseUrl(): string {
  return (
    (import.meta as any).env?.VITE_AI_API_BASE_URL ||
    (import.meta as any).env?.NEXT_PUBLIC_AI_API_BASE_URL ||
    'http://localhost:8000'
  );
}

export interface EstimatedCostItem {
  item: string;
  cost_inr: number;
  is_mandatory: boolean;
}

export interface AiChatRequest {
  message: string;
  language: Language;
  project_context: {
    project_id?: string;
    title: string;
    sector: string;
    budget_in_inr: number;
    location: string;
    stage: string;
    target_daily_customers?: number;
  };
  conversation_history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  context_summary?: string;
}

export interface AiChatResponse {
  summary: string;
  business_stage: string;
  recommendations: string[];
  estimated_costs: EstimatedCostItem[];
  assumptions: string[];
  risks: string[];
  next_steps: string[];
  follow_up_question?: string | null;
  source_references: string[];
  model_identifier: string;
  latency_ms: number;
}

export interface BusinessPlanRequest {
  title: string;
  sector: string;
  budget_in_inr: number;
  location: string;
  target_daily_customers?: number;
  operation_mode?: string;
}

export interface BusinessPlanResponse {
  concept: string;
  target_customers: string;
  estimated_startup_costs: EstimatedCostItem[];
  working_capital_7_days: number;
  pricing_strategy: string;
  break_even_units_daily: number;
  daily_revenue_estimate: number;
  monthly_net_profit_estimate: number;
  hygiene_and_licenses: string[];
  funding_recommendations: string[];
  risks_and_mitigation: string[];
  next_action_steps: string[];
}

export async function checkFastApiHealth(customUrl?: string): Promise<ApiHealthStatus> {
  const targetUrl = customUrl || getAiApiBaseUrl();
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${targetUrl.replace(/\/$/, '')}/api/v1/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      return {
        status: 'online',
        modelId: data.model_id || 'Open-Source LLM',
        serviceUrl: targetUrl,
        checkedAt: new Date().toLocaleTimeString(),
        latencyMs,
        message: `Connected (${data.device || 'GPU'} ready)`,
      };
    } else {
      return {
        status: 'offline',
        serviceUrl: targetUrl,
        checkedAt: new Date().toLocaleTimeString(),
        message: `HTTP ${response.status} from ${targetUrl}`,
      };
    }
  } catch (err: any) {
    return {
      status: 'offline',
      serviceUrl: targetUrl,
      checkedAt: new Date().toLocaleTimeString(),
      message:
        err.name === 'AbortError'
          ? 'Connection timed out (Check Google Colab tunnel or local port 8000)'
          : 'Inference server offline (Colab tunnel not connected)',
    };
  }
}

export async function sendAiChat(payload: AiChatRequest): Promise<AiChatResponse> {
  const targetUrl = getAiApiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout for model inference

  try {
    const response = await fetch(`${targetUrl.replace(/\/$/, '')}/api/v1/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errText = `HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        errText = errJson.detail || errJson.error || errText;
      } catch {
        // ignore
      }
      throw new Error(`FastAPI Error: ${errText}`);
    }

    return await response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('AI inference timed out (Google Colab server took more than 20 seconds). Please retry.');
    }
    throw new Error(
      `FastAPI AI service unavailable at ${targetUrl}. Please ensure your Google Colab tunnel or local server is running (${err.message}).`
    );
  }
}

export async function generateBusinessPlan(payload: BusinessPlanRequest): Promise<BusinessPlanResponse> {
  const targetUrl = getAiApiBaseUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${targetUrl.replace(/\/$/, '')}/api/v1/ai/business-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to generate business plan (HTTP ${response.status})`);
    }

    return await response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw new Error(`FastAPI AI service unavailable (${err.message})`);
  }
}

export async function summarizeContext(messages: Array<{ role: string; content: string }>, currentSummary?: string): Promise<string> {
  const targetUrl = getAiApiBaseUrl();
  try {
    const response = await fetch(`${targetUrl.replace(/\/$/, '')}/api/v1/ai/summarize-context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, current_summary: currentSummary }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.updated_summary;
    }
  } catch {
    // fallback
  }
  return currentSummary || '';
}
