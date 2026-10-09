import React, { useState } from 'react';
import { Language, UserRole } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { api } from '../lib/api';
import { Lock, Mail, User, MapPin, Shield, Check, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

interface AuthPagesProps {
  mode: 'login' | 'signup';
  language: Language;
  onSuccess: (role: UserRole) => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  mode,
  language,
  onSuccess,
  onSwitchMode,
}) => {
  const strings = UI_STRINGS[language];
  const [fullName, setFullName] = useState('Sunita Anand Pawar');
  const [emailOrPhone, setEmailOrPhone] = useState('sunita.shirur@example.com');
  const [password, setPassword] = useState('SecurePass123!');
  const [stateName, setStateName] = useState('Maharashtra');
  const [districtName, setDistrictName] = useState('Pune (Shirur)');
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const res = await api.signup({
          fullName,
          emailOrPhone,
          password,
          role,
          state: stateName,
          district: districtName,
        });
        onSuccess((res.user?.role as UserRole) || role);
      } else {
        const res = await api.login(emailOrPhone, password);
        onSuccess((res.user?.role as UserRole) || 'entrepreneur');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (demoRole: UserRole) => {
    setRole(demoRole);
    setErrorMessage(null);
    setIsSubmitting(true);

    const demoEmail =
      demoRole === 'admin'
        ? 'curator.schemes@nariniti.org'
        : 'sunita.shirur@example.com';

    try {
      const res = await api.login(demoEmail, 'SecurePass123!');
      onSuccess((res.user?.role as UserRole) || demoRole);
    } catch {
      // If server is starting up, proceed with demo role
      onSuccess(demoRole);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center font-serif text-2xl font-bold mx-auto shadow-xs">
          ना
        </div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          {mode === 'login' ? strings.login : strings.signup}
        </h1>
        <p className="text-xs text-stone-600">
          {mode === 'login'
            ? 'Sign in to access your saved business project, schemes, and 30-day plan'
            : 'Join Nariniti to start your personalized, guided entrepreneurship plan'}
        </p>
      </div>

      {/* Quick Demo Account Selector */}
      <div className="bg-stone-100 p-3 rounded-2xl border border-stone-200/80 space-y-2">
        <div className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
          Quick Demo Preview (Phase 1)
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo('entrepreneur')}
            className="min-h-[44px] p-2 text-xs font-semibold rounded-xl bg-white border border-stone-200 text-emerald-950 hover:bg-emerald-50 text-left transition-colors"
          >
            <div className="font-bold">Sunita Tai</div>
            <div className="text-[10px] text-stone-500">Entrepreneur · Shirur</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            className="min-h-[44px] p-2 text-xs font-semibold rounded-xl bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 text-left transition-colors"
          >
            <div className="font-bold">Scheme Curator</div>
            <div className="text-[10px] text-stone-500">Admin Role</div>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-xs space-y-4">
        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-500" />
              <span>Full Name or Preferred Name</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              placeholder="e.g. Sunita Pawar"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-stone-500" />
            <span>Mobile Phone or Email</span>
          </label>
          <input
            type="text"
            required
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800"
            placeholder="e.g. 9876543210 or email"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-stone-500" />
            <span>Password</span>
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800"
            placeholder="••••••••"
          />
        </div>

        {mode === 'signup' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>State</span>
              </label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>District / Town</span>
              </label>
              <input
                type="text"
                value={districtName}
                onChange={(e) => setDistrictName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>
        )}

        {/* Role Selection */}
        <div className="pt-2 border-t border-stone-100 space-y-1.5">
          <label className="text-xs font-semibold text-stone-700">Account Type</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setRole('entrepreneur')}
              className={`min-h-[40px] p-2 rounded-xl border font-semibold text-center transition-colors ${
                role === 'entrepreneur'
                  ? 'bg-emerald-900 text-white border-emerald-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200'
              }`}
            >
              Entrepreneur
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`min-h-[40px] p-2 rounded-xl border font-semibold text-center transition-colors ${
                role === 'admin'
                  ? 'bg-emerald-900 text-white border-emerald-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200'
              }`}
            >
              Data Curator
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[48px] bg-emerald-900 text-white font-semibold text-xs rounded-xl hover:bg-emerald-800 transition-colors shadow-xs flex items-center justify-center gap-2"
        >
          <span>{isSubmitting ? 'Please wait...' : mode === 'login' ? strings.login : strings.signup}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => onSwitchMode(mode === 'login' ? 'signup' : 'login')}
            className="text-xs text-stone-600 hover:text-stone-900 underline underline-offset-4"
          >
            {mode === 'login'
              ? "Don't have an account yet? Create one here"
              : 'Already have an account? Sign in here'}
          </button>
        </div>
      </form>

      {/* Privacy note */}
      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-[11px] text-stone-500 flex items-start gap-2">
        <Shield className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <p>
          Nariniti collects demographic and financial constraints solely to calculate official scheme eligibility rules. We never share your details with unauthorized third parties.
        </p>
      </div>
    </div>
  );
};
