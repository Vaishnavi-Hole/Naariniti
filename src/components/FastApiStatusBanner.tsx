import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2, XCircle, RefreshCw, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { getAiApiBaseUrl, checkFastApiHealth } from '../lib/aiClient';
import { ApiHealthStatus, Language } from '../types';
import { UI_STRINGS } from '../lib/translations';

interface FastApiStatusBannerProps {
  language: Language;
}

export const FastApiStatusBanner: React.FC<FastApiStatusBannerProps> = ({ language }) => {
  const [health, setHealth] = useState<ApiHealthStatus>({
    status: 'checking',
    serviceUrl: getAiApiBaseUrl(),
  });
  const [isChecking, setIsChecking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const strings = UI_STRINGS[language];

  const runHealthCheck = async () => {
    setIsChecking(true);
    const result = await checkFastApiHealth();
    setHealth(result);
    setIsChecking(false);
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  return (
    <div className="bg-amber-50/90 border-b border-amber-200/80 text-amber-950 text-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-200/80 text-amber-900">
            <Server className="w-3 h-3" />
          </span>
          <span className="font-semibold text-amber-900">{strings.developmentState}:</span>
          <span className="text-amber-800 hidden sm:inline">
            Inference endpoint targeting <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-amber-900">{health.serviceUrl}</code>
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-stone-600">
            {health.status === 'online' ? (
              <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Live FastAPI Server Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-800">
                <XCircle className="w-3.5 h-3.5 text-amber-700" />
                Colab Tunnel Offline (Expected in Phase 1)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runHealthCheck}
            disabled={isChecking}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md font-medium transition-colors disabled:opacity-50"
            title="Ping /api/v1/health"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Testing...' : 'Test Connection'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-0.5 px-2 py-1 text-amber-900/80 hover:text-amber-950 font-medium"
          >
            <span>{isExpanded ? 'Hide Info' : 'Colab Setup'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-amber-100/70 border-t border-amber-200 px-4 py-3 text-stone-700 max-w-7xl mx-auto space-y-2">
          <p className="font-medium text-stone-900">
            {strings.developmentNotice}
          </p>
          <div className="bg-stone-900 text-stone-100 p-3 rounded-lg font-mono text-[11px] space-y-1">
            <div className="text-stone-400"># Google Colab / FastAPI Setup Command for Phase 3:</div>
            <div>uvicorn server:app --host 0.0.0.0 --port 8000 &</div>
            <div>npx localtunnel --port 8000  # or ngrok http 8000</div>
            <div className="text-emerald-400"># Then set VITE_AI_API_BASE_URL=https://&lt;your-tunnel-url&gt; in .env.local</div>
          </div>
          <div className="text-[11px] text-stone-600">
            Last checked: {health.checkedAt || 'Just now'} · {health.message}
          </div>
        </div>
      )}
    </div>
  );
};
