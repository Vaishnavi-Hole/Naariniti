import React, { useState } from 'react';
import { EntrepreneurProfile, Language } from '../types';
import { UI_STRINGS } from '../lib/translations';
import { 
  UserCircle2, 
  MapPin, 
  Globe2, 
  Mic, 
  IndianRupee, 
  ShieldCheck, 
  Check, 
  Save, 
  Trash2,
  Lock
} from 'lucide-react';

interface ProfilePreferencesPageProps {
  profile: EntrepreneurProfile;
  language: Language;
  onUpdateProfile: (updated: Partial<EntrepreneurProfile>) => void;
  onLanguageChange: (lang: Language) => void;
  onLogout: () => void;
}

export const ProfilePreferencesPage: React.FC<ProfilePreferencesPageProps> = ({
  profile,
  language,
  onUpdateProfile,
  onLanguageChange,
  onLogout,
}) => {
  const strings = UI_STRINGS[language];

  const [fullName, setFullName] = useState(profile.fullName);
  const [preferredName, setPreferredName] = useState(profile.preferredName);
  const [ageBand, setAgeBand] = useState(profile.ageBand);
  const [stateName, setStateName] = useState(profile.state);
  const [districtName, setDistrictName] = useState(profile.district);
  const [villageTown, setVillageTown] = useState(profile.villageTown);
  const [interactionMode, setInteractionMode] = useState(profile.interactionMode);
  const [educationLevel, setEducationLevel] = useState(profile.educationLevel);
  const [occupation, setOccupation] = useState(profile.existingOccupation);
  const [budget, setBudget] = useState(profile.availableInvestment);
  const [hasWorkspace, setHasWorkspace] = useState(profile.hasWorkspace);
  const [hasSmartphone, setHasSmartphone] = useState(profile.hasSmartphone);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      fullName,
      preferredName,
      ageBand: ageBand as any,
      state: stateName,
      district: districtName,
      villageTown,
      interactionMode,
      educationLevel: educationLevel as any,
      existingOccupation: occupation,
      availableInvestment: Number(budget),
      hasWorkspace,
      hasSmartphone,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="space-y-1 border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-2">
          <UserCircle2 className="w-4 h-4 text-emerald-800" />
          <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
            Entrepreneur Profile & Accessibility Settings
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950">
          Personal Profile & Preferences
        </h1>
        <p className="text-xs text-stone-600 max-w-2xl">
          Customize your preferred language, voice readout, village location, and business parameters.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{strings.saveProgress}!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Personal Details */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900">
            1. Personal Identification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Preferred Name (e.g. Sunita Tai)</label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Age Band</label>
              <select
                value={ageBand}
                onChange={(e) => setAgeBand(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              >
                <option value="18-25">18–25 years</option>
                <option value="26-35">26–35 years</option>
                <option value="36-45">36–45 years</option>
                <option value="46-60">46–60 years</option>
                <option value="60+">60+ years</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Education Level (Optional)</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
              >
                <option value="no_formal">No formal schooling</option>
                <option value="primary">Primary (1st–5th)</option>
                <option value="secondary">Secondary (10th pass)</option>
                <option value="higher_secondary">Higher Secondary (12th)</option>
                <option value="graduate">Graduate / Degree</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-800" />
            <span>2. Location & Geographic Scope</span>
          </h2>
          <p className="text-xs text-stone-500">
            Crucial for determining rural vs. urban subsidy percentages (e.g. 35% rural PMEGP vs. 25% urban).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">State</label>
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">District</label>
              <input
                type="text"
                value={districtName}
                onChange={(e) => setDistrictName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Village / Town</label>
              <input
                type="text"
                value={villageTown}
                onChange={(e) => setVillageTown(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>
        </div>

        {/* Interaction & Language Mode */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-emerald-800" />
            <span>3. Language & Interaction Mode</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Preferred Language</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'mr', label: 'मराठी' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'en', label: 'English' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => onLanguageChange(l.code as any)}
                    className={`min-h-[40px] p-2 rounded-xl border font-semibold ${
                      language === l.code
                        ? 'bg-emerald-900 text-white border-emerald-900'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Preferred Interaction Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'text', label: 'Text Only' },
                  { id: 'voice', label: 'Voice First' },
                  { id: 'both', label: 'Both' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setInteractionMode(m.id as any)}
                    className={`min-h-[40px] p-2 rounded-xl border font-semibold ${
                      interactionMode === m.id
                        ? 'bg-emerald-900 text-white border-emerald-900'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Constraints */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-800" />
            <span>4. Financial & Asset Readiness</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Available Investment Capital (INR)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Current Occupation</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-stone-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasWorkspace}
                onChange={(e) => setHasWorkspace(e.target.checked)}
                className="w-4 h-4 accent-emerald-900 rounded"
              />
              <span>Dedicated shopfront / space available</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSmartphone}
                onChange={(e) => setHasSmartphone(e.target.checked)}
                className="w-4 h-4 accent-emerald-900 rounded"
              />
              <span>Smartphone with UPI / Internet</span>
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-emerald-900 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Updates</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="min-h-[48px] px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
          >
            Sign Out of Account
          </button>
        </div>

      </form>

      {/* Privacy Guarantee */}
      <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200/80 text-xs text-stone-600 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <p>
          Your information is stored locally and securely for your business journey. We never use caste or religion to reduce access to opportunities.
        </p>
      </div>

    </div>
  );
};
