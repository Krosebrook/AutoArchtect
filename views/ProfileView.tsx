
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { UserProfile, Platform } from '../types';
import { 
  UserCircle, 
  Settings, 
  ShieldCheck, 
  Save, 
  Zap, 
  Layout, 
  CheckCircle2,
  Trash2,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Lead Architect',
    role: 'Senior Automation Engineer',
    avatarSeed: 'arch_1',
    preferences: {
      theme: 'system',
      defaultPlatform: 'zapier',
      autoAudit: true
    }
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aa_user_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfile(parsed);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('aa_user_profile', JSON.stringify(profile));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      }
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setProfile(prev => ({ ...prev, preferences: { ...prev.preferences, theme } }));
    applyTheme(theme);
  };

  // Ensure theme is consistent on mount
  useEffect(() => {
    applyTheme(profile.preferences.theme as any);
  }, [profile.preferences.theme]);

  const platforms: Platform[] = ['zapier', 'n8n', 'make', 'langchain', 'shopify', 'google-sheets', 'airtable', 'pipedream'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in pb-20">
      <div className="flex items-center gap-8 p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm transition-colors">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl">
          <UserCircle size={56} strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profile.name}</h2>
          <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">{profile.role}</p>
        </div>
        <button 
          onClick={handleSave}
          className="ml-auto flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover-lift shadow-xl shadow-indigo-500/20"
        >
          {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {isSaved ? 'Synchronized' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="System Identity" subtitle="Environmental Configuration">
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" /> API Authenticator
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                System authenticated via pre-configured environment variables. API_KEY protocol is locked for security.
              </p>
            </div>
          </div>
        </Card>

        <Card title="Preferences" subtitle="Global Environment Settings">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Sun size={14} className="text-orange-400" /> Interface Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', icon: Sun, label: 'Light Mode' },
                  { id: 'dark', icon: Moon, label: 'Dark Mode' },
                  { id: 'system', icon: Monitor, label: 'System Sync' }
                ].map((theme) => (
                  <button 
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id as any)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      profile.preferences.theme === theme.id 
                        ? 'bg-slate-900 dark:bg-indigo-600 border-slate-900 dark:border-indigo-600 text-white shadow-lg scale-105' 
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <theme.icon size={18} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layout size={14} className="text-indigo-400" /> Default Platform
              </label>
              <div className="grid grid-cols-2 gap-3">
                {platforms.map(p => (
                  <button 
                    key={p} 
                    onClick={() => setProfile({...profile, preferences: {...profile.preferences, defaultPlatform: p}})}
                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      profile.preferences.defaultPlatform === p 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl">
              <div className="space-y-1">
                <span className="block text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Automated Audits</span>
                <p className="text-[11px] text-slate-400 font-bold">Perform security scan on generation</p>
              </div>
              <button 
                onClick={() => setProfile({...profile, preferences: {...profile.preferences, autoAudit: !profile.preferences.autoAudit}})}
                className={`w-14 h-8 rounded-full transition-all relative ${profile.preferences.autoAudit ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${profile.preferences.autoAudit ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="p-10 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[3rem] flex items-center justify-between group overflow-hidden relative">
        <div className="absolute right-0 top-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
           <Trash2 size={120} className="text-red-600" />
        </div>
        <div className="space-y-2 relative z-10">
          <h4 className="text-xl font-black text-red-900 dark:text-red-400 uppercase tracking-tight">System Purge</h4>
          <p className="text-xs font-bold text-red-700/60 dark:text-red-400/60 uppercase tracking-widest">Wipe all local vault data and configurations.</p>
        </div>
        <button 
          onClick={() => { if(confirm('Wipe all local architect data?')) { localStorage.clear(); window.location.reload(); } }}
          className="relative z-10 px-8 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all active:scale-95"
        >
          Factory Reset
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
