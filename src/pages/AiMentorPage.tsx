import React, { useState, useEffect } from 'react';
import { EntrepreneurProfile, BusinessProject, Language } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { api } from '../lib/api';
import { 
  getAiApiBaseUrl, 
  checkFastApiHealth, 
  sendAiChat, 
  AiChatResponse,
  generateBusinessPlan,
  BusinessPlanResponse
} from '../lib/aiClient';
import { VoiceControls } from '../components/VoiceControls';
import { 
  Bot, 
  Send, 
  Server, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  IndianRupee, 
  ShieldCheck, 
  Trash2,
  FileSpreadsheet,
  Edit3,
  Save,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AiMentorPageProps {
  profile: EntrepreneurProfile;
  project: BusinessProject;
  language: Language;
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  structuredResponse?: AiChatResponse;
  timestamp: string;
}

export const AiMentorPage: React.FC<AiMentorPageProps> = ({
  profile,
  project,
  language,
}) => {
  const strings = UI_STRINGS[language];
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [modelName, setModelName] = useState<string>('Open-Source LLM');
  const [showColabGuide, setShowColabGuide] = useState(false);
  const [contextSummary, setContextSummary] = useState<string>('');

  // Business Plan State
  const [businessPlan, setBusinessPlan] = useState<BusinessPlanResponse | null>(null);
  const [isPlanEditing, setIsPlanEditing] = useState(false);
  const [isPlanSaved, setIsPlanSaved] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        language === 'mr'
          ? `नमस्ते ${profile.preferredName || profile.fullName}! मी तुमच्या "${project.title}" व्यवसायासाठी नारीनीती मार्गदर्शक आहे. तुमच्या ₹${project.budgetInINR.toLocaleString('en-IN')} भांडवलामध्ये नफा कसा काढायचा, चहा-नाश्त्याचे साहित्य कोठून स्वस्त मिळवायचे आणि मुद्रा योजनेचा फॉर्म कसा भरायचा हे मला विचारू शकता.`
          : language === 'hi'
          ? `नमस्ते ${profile.preferredName || profile.fullName}! मैं आपके "${project.title}" व्यवसाय के लिए नारीनीति मार्गदर्शक हूँ। आपकी ₹${project.budgetInINR.toLocaleString('en-IN')} पूंजी में लागत, ग्राहकों की संख्या और सरकारी ऋण के बारे में मुझसे पूछें।`
          : `Hello ${profile.preferredName || profile.fullName}! I am your dedicated Nariniti business mentor for "${project.title}". With your ₹${project.budgetInINR.toLocaleString('en-IN')} initial capital, ask me anything about daily unit economics, cost estimation, or applying for Mudra Shishu.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Load project-specific conversation and business plan from backend
  useEffect(() => {
    async function loadProjectData() {
      try {
        const convData = await api.getProjectConversation(project.id);
        if (convData && convData.messages && convData.messages.length > 0) {
          const loadedMsgs: MessageItem[] = convData.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            structuredResponse: m.structuredResponse,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setMessages(loadedMsgs);
        }
        if (convData?.conversation?.contextSummary) {
          setContextSummary(convData.conversation.contextSummary);
        }

        const planResult = await api.getProjectBusinessPlan(project.id);
        if (planResult && planResult.planData) {
          setBusinessPlan(planResult.planData);
          setIsPlanSaved(planResult.isEdited);
        }
      } catch (err) {
        console.warn('Could not load project conversation history:', err);
      }
    }

    loadProjectData();
  }, [project.id]);

  const checkConnection = async () => {
    setServerStatus('checking');
    const health = await checkFastApiHealth();
    if (health.status === 'online') {
      setServerStatus('online');
      setModelName(health.modelId || 'Open-Source LLM');
      setErrorMessage(null);
    } else {
      setServerStatus('offline');
      setErrorMessage(health.message || 'FastAPI service offline');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: MessageItem = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setErrorMessage(null);
    setIsLoading(true);

    // Save to project backend database
    api.sendProjectMessage(project.id, textToSend.trim(), 'user').catch(() => {});

    try {
      const response = await sendAiChat({
        message: textToSend.trim(),
        language,
        project_context: {
          project_id: project.id,
          title: project.title,
          sector: project.sector,
          budget_in_inr: project.budgetInINR,
          location: project.location || profile.villageTown,
          stage: project.stage,
          target_daily_customers: project.targetDailyCustomers,
        },
        conversation_history: messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        context_summary: contextSummary,
      });

      const assistantMessage: MessageItem = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: response.summary,
        structuredResponse: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setServerStatus('online');

      // Persist assistant message in project database
      api.sendProjectMessage(project.id, response.summary, 'assistant', response).catch(() => {});
    } catch (err: any) {
      setServerStatus('offline');
      setErrorMessage(
        err.message || 'FastAPI AI inference service is not reachable. Please connect your Google Colab tunnel.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear conversation history for this project?')) {
      await api.clearProjectConversation(project.id).catch(() => {});
      setMessages([
        {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: 'Conversation history reset. You can start fresh questions for this project.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const plan = await generateBusinessPlan({
        title: project.title,
        sector: project.sector,
        budget_in_inr: project.budgetInINR,
        location: project.location || profile.villageTown,
        target_daily_customers: project.targetDailyCustomers || 60,
        operation_mode: project.operationMode || 'stall',
      });
      setBusinessPlan(plan);
      setShowPlanModal(true);
      await api.saveProjectBusinessPlan(project.id, plan, false);
    } catch (err: any) {
      setErrorMessage(`Failed to generate business plan: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEditedPlan = async () => {
    if (!businessPlan) return;
    await api.saveProjectBusinessPlan(project.id, businessPlan, true);
    setIsPlanEditing(false);
    setIsPlanSaved(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                serverStatus === 'online' ? 'bg-emerald-600' : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">
              {serverStatus === 'online'
                ? `Connected: ${modelName}`
                : 'FastAPI Backend Connection Pending'}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 mt-1 flex items-center gap-2">
            <Bot className="w-7 h-7 text-emerald-900" />
            <span>AI Business Mentor (नारीनीती मार्गदर्शक)</span>
          </h1>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl">
            Live business planning, unit economics, and grounded scheme guidance powered by an open-source model running on your Google Colab FastAPI tunnel.
          </p>
        </div>

        {/* Connectivity and Plan Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGeneratePlan}
            disabled={isLoading}
            className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-emerald-900 text-white text-xs font-semibold hover:bg-emerald-800 flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate Business Plan</span>
          </button>
          <button
            type="button"
            onClick={checkConnection}
            className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-stone-50 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-800 ${serverStatus === 'checking' ? 'animate-spin' : ''}`} />
            <span>{serverStatus === 'checking' ? 'Checking...' : 'Ping Colab'}</span>
          </button>
        </div>
      </div>

      {/* Error / Offline Alert Banner with Retry */}
      {errorMessage && serverStatus === 'offline' && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-amber-900">
                FastAPI AI Service Disconnected ({getAiApiBaseUrl()})
              </div>
              <p className="text-stone-700">
                {errorMessage}
              </p>
              <p className="text-stone-600 text-[11px]">
                In accordance with anti-fabrication standards, Nariniti will not substitute hardcoded or fake AI replies while the service is offline.
              </p>
            </div>
          </div>
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={checkConnection}
              className="px-3 py-1.5 bg-amber-200/80 hover:bg-amber-300 rounded-lg text-amber-950 font-semibold"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Active Project Isolation Banner with History Controls */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-800" />
          <span className="font-semibold text-stone-900">Active Project Context:</span>
          <span className="text-emerald-950 font-bold">{project.title}</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="text-stone-600">₹{project.budgetInINR.toLocaleString('en-IN')} Budget</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="text-stone-600">{project.location || profile.villageTown}</span>
        </div>

        <div className="flex items-center gap-2">
          {businessPlan && (
            <button
              type="button"
              onClick={() => setShowPlanModal(true)}
              className="text-xs font-semibold text-emerald-900 hover:text-emerald-950 flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>View Business Plan {isPlanSaved ? '(Edited)' : ''}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleClearHistory}
            className="text-stone-500 hover:text-rose-700 flex items-center gap-1 px-2 py-1"
            title="Clear Project Conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Structured Business Plan Modal / Drawer (Phase 4) */}
      {showPlanModal && businessPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-stone-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  Structured Business Plan & Unit Economics
                </h3>
                <p className="text-xs text-stone-500">
                  {project.title} · Budget: ₹{project.budgetInINR.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!isPlanEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsPlanEditing(true)}
                    className="min-h-[36px] px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Estimates</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveEditedPlan}
                    className="min-h-[36px] px-3 py-1 bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    <span>Save Edits</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="text-stone-400 hover:text-stone-800 text-lg px-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Disclaimer & Non-guarantee notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>Transparent Assumptions & Estimates:</strong> All figures below are illustrative estimates based on user assumptions (e.g. 70 cups @ ₹10/cup). Nariniti does not guarantee loan approval or profit figures. Every estimate is editable.
            </div>

            {/* Concept & Strategy */}
            <div className="space-y-1 text-xs text-stone-700">
              <div className="font-bold text-stone-900">Business Concept:</div>
              <p>{businessPlan.concept}</p>
              <div className="font-bold text-stone-900 pt-1">Target Customers:</div>
              <p>{businessPlan.target_customers}</p>
            </div>

            {/* Startup Costs (Editable) */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-stone-900 flex items-center justify-between">
                <span>Estimated Startup Capital Breakdown:</span>
                <span className="text-[11px] text-stone-500 font-normal">Editable by you</span>
              </div>
              <div className="divide-y divide-stone-100 bg-stone-50 rounded-xl p-3 border border-stone-200">
                {businessPlan.estimated_startup_costs.map((item, i) => (
                  <div key={i} className="py-1.5 flex items-center justify-between gap-2">
                    <span className="text-stone-800 font-medium">{item.item}</span>
                    {isPlanEditing ? (
                      <input
                        type="number"
                        value={item.cost_inr}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updatedCosts = [...businessPlan.estimated_startup_costs];
                          updatedCosts[i].cost_inr = val;
                          setBusinessPlan({ ...businessPlan, estimated_startup_costs: updatedCosts });
                        }}
                        className="w-24 p-1 text-xs border rounded text-right font-mono"
                      />
                    ) : (
                      <span className="font-mono font-semibold text-stone-900">
                        ₹{item.cost_inr.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Unit Economics Snapshot */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border">
                <div className="text-stone-500 text-[11px]">Break-Even Daily</div>
                <div className="font-serif text-lg font-bold text-stone-900">{businessPlan.break_even_units_daily} units</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border">
                <div className="text-stone-500 text-[11px]">Daily Revenue Est.</div>
                <div className="font-serif text-lg font-bold text-emerald-950">₹{businessPlan.daily_revenue_estimate.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border">
                <div className="text-stone-500 text-[11px]">Monthly Net Profit Est.</div>
                <div className="font-serif text-lg font-bold text-emerald-950">₹{businessPlan.monthly_net_profit_estimate.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Recommended Funding & Licenses */}
            <div className="text-xs space-y-1 text-stone-700 pt-2 border-t">
              <div className="font-bold text-stone-900">Recommended Next Actions:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {businessPlan.next_action_steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 bg-stone-800 text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-stone-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-serif font-bold text-xs ${
                  msg.role === 'user'
                    ? 'bg-stone-800 text-white'
                    : 'bg-emerald-900 text-amber-300'
                }`}
              >
                {msg.role === 'user' ? 'मी' : 'ना'}
              </div>

              <div
                className={`p-4 rounded-2xl max-w-xl space-y-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-900 text-white shadow-xs rounded-tr-xs'
                    : 'bg-white text-stone-800 border border-stone-200/90 shadow-xs rounded-tl-xs'
                }`}
              >
                <div className="font-semibold">{msg.content}</div>

                {/* Structured Outputs from FastAPI (If present) */}
                {msg.structuredResponse && (
                  <div className="space-y-3 pt-2 border-t border-stone-100 text-stone-700">
                    
                    {/* Cost estimates breakdown */}
                    {msg.structuredResponse.estimated_costs.length > 0 && (
                      <div className="space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                        <div className="font-bold text-stone-900 flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-800" />
                          <span>Estimated Startup Cost Breakdown:</span>
                        </div>
                        <div className="divide-y divide-stone-200/40 text-[11px]">
                          {msg.structuredResponse.estimated_costs.map((c, i) => (
                            <div key={i} className="py-1 flex justify-between">
                              <span>{c.item}</span>
                              <span className="font-mono font-semibold">₹{c.cost_inr.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {msg.structuredResponse.recommendations.length > 0 && (
                      <div className="space-y-1">
                        <div className="font-bold text-stone-900">Action Recommendations:</div>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                          {msg.structuredResponse.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Metadata & citations */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-stone-500 font-mono pt-1">
                      <span>Model: {msg.structuredResponse.model_identifier}</span>
                      <span aria-hidden="true">·</span>
                      <span>Latency: {msg.structuredResponse.latency_ms}ms</span>
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right font-mono ${
                    msg.role === 'user' ? 'text-emerald-200' : 'text-stone-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center shrink-0 font-serif font-bold text-xs">
                ना
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-2 text-xs text-stone-600">
                <RefreshCw className="w-4 h-4 text-emerald-800 animate-spin" />
                <span>Running open-source model inference on FastAPI...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              language === 'mr'
                ? 'व्यवसायाबद्दल प्रश्न विचारा...'
                : language === 'hi'
                ? 'व्यवसाय संबंधी प्रश्न पूछें...'
                : 'Ask about costs, unit economics, or Mudra loan...'
            }
            className="flex-1 text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800"
          />

          <VoiceControls
            language={language}
            onTranscriptionComplete={(text) => handleSendMessage(text)}
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
            className="min-h-[44px] px-4 py-2 bg-emerald-900 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>

    </div>
  );
};
