
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { generateAutomation, chatWithAssistant } from '../services/geminiService';
import { AutomationResult, Platform, AsyncState, AutomationStep, AppView, SavedBlueprint, ChatMessage } from '../types';
import { Card } from '../components/ui/Card';
import { 
  Loader2, 
  Play, 
  CheckCircle2, 
  Copy, 
  AlertCircle, 
  X,
  Lightbulb,
  Terminal,
  Zap,
  Box,
  Cpu,
  Layers,
  Check,
  ExternalLink,
  Globe,
  ShieldCheck,
  Sparkles,
  Info,
  ShieldAlert,
  FlaskConical,
  Rocket,
  Save,
  MessageCircle,
  Send,
  Bot,
  User,
  History
} from 'lucide-react';

interface PlatformConfig {
  id: Platform;
  label: string;
  tagline: string;
  logo: string;
  brandIcon: string;
  color: string;
  tooltip: string;
  tier: string;
}

const PLATFORMS: PlatformConfig[] = [
  { id: 'zapier', label: 'Zapier', tagline: 'Standard connector ecosystem', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/zapier.com', color: 'bg-[#FF4A00]', tier: 'Essential', tooltip: 'Global standard for simple SaaS integrations.' },
  { id: 'n8n', label: 'n8n.io', tagline: 'Complex node-based logic', logo: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/n8n.io', color: 'bg-[#FF6D5A]', tier: 'Advanced', tooltip: 'Technical control with self-hosting.' },
  { id: 'make', label: 'Make', tagline: 'Visual workflow builder', logo: 'https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/make.com', color: 'bg-[#8A2BE2]', tier: 'Pro-Visual', tooltip: 'Powerful visual orchestration.' },
  { id: 'langchain', label: 'LangChain', tagline: 'AI Agent infrastructure', logo: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://avatars.githubusercontent.com/u/126733545?s=200&v=4', color: 'bg-[#00A67E]', tier: 'AI Native', tooltip: 'Modern stack for LLM apps.' },
  { id: 'shopify', label: 'Shopify', tagline: 'Merchant-first operations', logo: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/shopify.com', color: 'bg-[#95BF47]', tier: 'Enterprise', tooltip: 'Scale commerce operations.' },
  { id: 'google-sheets', label: 'Google Sheets', tagline: 'Legacy data orchestration', logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png', color: 'bg-[#0F9D58]', tier: 'Hybrid', tooltip: 'Universal data bridge.' },
  { id: 'airtable', label: 'Airtable', tagline: 'Modern data modeling', logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/airtable.com', color: 'bg-[#18BFFF]', tier: 'Relational', tooltip: 'Relational databases with views.' },
  { id: 'pipedream', label: 'Pipedream', tagline: 'Engineer-centric control', logo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/pipedream.com', color: 'bg-[#191970]', tier: 'Developer', tooltip: 'Node/Python first automation.' },
];

const StepItem: React.FC<{ step: AutomationStep; index: number }> = ({ step, index }) => (
  <div className="flex gap-10 relative group">
    <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shrink-0 font-black text-white shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${step.type === 'trigger' ? 'bg-orange-500 shadow-orange-500/30' : 'bg-indigo-600 shadow-indigo-600/30'}`}>{index + 1}</div>
    <div className="pt-2 flex-1">
      <div className="flex items-center gap-3 mb-2">
        <h4 className="font-black text-slate-900 text-xl tracking-tight group-hover:text-indigo-600 transition-colors">{step.title}</h4>
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${step.type === 'trigger' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{step.type}</span>
      </div>
      <p className="text-slate-500 text-sm font-semibold leading-relaxed group-hover:text-slate-700">{step.description}</p>
    </div>
  </div>
);

interface Props { onBlueprintGenerated?: (b: AutomationResult) => void; onNavigate?: (v: AppView, b?: AutomationResult) => void; }

const AutomationGeneratorView: React.FC<Props> = ({ onBlueprintGenerated, onNavigate }) => {
  const [platform, setPlatform] = useState<Platform>('zapier');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [state, setState] = useState<AsyncState<AutomationResult>>({ data: null, loading: false, error: null });
  
  // Save State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveVersion, setSaveVersion] = useState('1.0.0');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading]);

  const validation = useMemo(() => ({ isValid: description.trim().length >= 20, progress: Math.min(100, (description.trim().length / 20) * 100) }), [description]);

  const handleGenerate = async () => {
    if (!validation.isValid) return;
    setState({ ...state, loading: true, error: null });
    try {
      const data = await generateAutomation(platform, description);
      setState({ data, loading: false, error: null });
      if (onBlueprintGenerated) onBlueprintGenerated(data);
    } catch (err: any) {
      setState({ data: null, loading: false, error: { message: err.message } });
    }
  };

  const handleSaveToVault = () => {
    if (!state.data || !saveName.trim()) return;
    
    const vault = JSON.parse(localStorage.getItem('auto_architect_vault') || '[]');
    const newSaved: SavedBlueprint = {
      ...state.data,
      id: crypto.randomUUID(),
      name: saveName,
      version: saveVersion,
      timestamp: Date.now()
    };
    
    vault.push(newSaved);
    localStorage.setItem('auto_architect_vault', JSON.stringify(vault));
    
    setSaveSuccess(true);
    setTimeout(() => {
      setShowSaveModal(false);
      setSaveSuccess(false);
    }, 2000);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const contextPrompt = state.data 
      ? `Current Blueprint Status:\nPlatform: ${state.data.platform}\nLogic: ${state.data.explanation}\nSteps: ${state.data.steps.map(s => s.title).join(', ')}\n\nUser Question: ${chatInput}`
      : `User is describing a new automation: "${description}". Target Platform: ${platform}.\n\nUser Question: ${chatInput}`;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const reply = await chatWithAssistant(contextPrompt);
      const botMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'model', content: reply, timestamp: Date.now() };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { id: 'err', role: 'model', content: "Expert link failed. Please retry.", timestamp: Date.now() }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start pb-20 relative">
      <div className="xl:col-span-4 space-y-8 animate-in">
        <Card title="Blueprint Architect" subtitle="Configure target infrastructure">
          <div className="space-y-8">
            <div className="space-y-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Ecosystem</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar p-1">
                {PLATFORMS.map((p) => (
                   <button 
                     key={p.id} 
                     onClick={() => setPlatform(p.id)} 
                     className={`relative w-full flex flex-col items-start p-0 rounded-3xl border transition-all duration-300 overflow-hidden ${platform === p.id ? 'bg-white border-indigo-600 ring-2 ring-indigo-50 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                   >
                     <div className="w-full h-24 relative overflow-hidden">
                       <img src={p.logo} alt={p.label} className="w-full h-full object-cover opacity-80" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                       <div className="absolute bottom-2 left-3 flex items-center gap-2">
                         <img src={p.brandIcon} alt="" className="w-5 h-5 object-contain bg-white rounded-md p-0.5" />
                         <span className="text-[10px] font-black uppercase text-white tracking-widest">{p.label}</span>
                       </div>
                     </div>
                   </button>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Scope</label>
                <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${validation.isValid ? 'bg-indigo-600' : 'bg-orange-400'}`} style={{ width: `${validation.progress}%` }} /></div>
              </div>
              <textarea value={description} onBlur={() => setTouched(true)} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Sync Shopify VIP orders to Airtable..." className={`w-full bg-slate-50 border rounded-3xl px-8 py-6 min-h-[180px] text-sm focus:ring-4 outline-none transition-all ${touched && !validation.isValid ? 'border-orange-200' : 'border-slate-100 focus:border-indigo-500'}`} />
            </div>
            <div className="flex gap-4">
              <button onClick={handleGenerate} disabled={state.loading || !validation.isValid} className={`flex-1 py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-4 transition-all ${state.loading || !validation.isValid ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 hover-lift'}`}>
                {state.loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                <span>{state.loading ? 'Synthesizing...' : 'Architect Automation'}</span>
              </button>
              <button 
                onClick={() => setShowChat(!showChat)}
                className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${showChat ? 'bg-indigo-50 text-indigo-600' : 'bg-white border border-slate-100 text-slate-400 hover:text-indigo-600'}`}
              >
                <MessageCircle size={24} />
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="xl:col-span-8 space-y-8 animate-in relative">
        {state.data ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in">
            <Card 
              title="Strategy Manifest" 
              subtitle={state.data.platform.toUpperCase()}
              headerAction={
                <button 
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                >
                  <Save size={14} /> Save to Vault
                </button>
              }
            >
              <div className="mb-10 p-8 bg-indigo-50/30 rounded-[2.5rem] italic text-slate-700 font-semibold leading-relaxed">"{state.data.explanation}"</div>
              <div className="space-y-12 relative pl-6 mb-8">
                <div className="absolute left-[41px] top-8 bottom-8 w-1 bg-gradient-to-b from-orange-400 via-indigo-500 to-indigo-50 opacity-10" />
                {state.data.steps.map((step, idx) => <StepItem key={step.id} step={step} index={idx} />)}
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => onNavigate?.(AppView.DEPLOYMENT, state.data!)} className="flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"><Rocket size={18} /> Configure for Deployment</button>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => onNavigate?.(AppView.AUDIT, state.data!)} className="flex items-center justify-center gap-2 py-4 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-100 transition-all"><ShieldAlert size={16} /> Audit</button>
                  <button onClick={() => onNavigate?.(AppView.LOGIC_SANDBOX, state.data!)} className="flex items-center justify-center gap-2 py-4 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all"><FlaskConical size={16} /> Sandbox</button>
                </div>
              </div>
            </Card>
            <Card 
              title="Execution Config"
              headerAction={
                <button 
                  onClick={() => {
                    const blob = new Blob([state.data?.codeSnippet || ''], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `config_${state.data?.platform}_${Date.now()}.txt`;
                    link.click();
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-all"
                  title="Download Raw Config"
                >
                  <Rocket size={18} />
                </button>
              }
            >
              <div className="bg-[#0d0f14] rounded-[3rem] overflow-hidden shadow-3xl border border-white/5">
                <div className="px-8 py-5 border-b border-white/5 bg-white/[0.03] flex justify-between"><div className="flex gap-2"><div className="w-2 h-2 rounded-full bg-red-500/30" /><div className="w-2 h-2 rounded-full bg-yellow-500/30" /></div></div>
                <pre className="p-10 text-indigo-300 font-mono text-xs overflow-x-auto custom-scrollbar"><code>{state.data.codeSnippet}</code></pre>
              </div>
            </Card>
          </div>
        ) : (
          <div className="h-full min-h-[600px] border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center p-12 text-center bg-white/40">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-200 rounded-[3rem] flex items-center justify-center mb-10 border border-indigo-100"><Zap size={48} /></div>
            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Awaiting Protocol</h3>
            <p className="text-slate-400 text-sm max-w-xs mt-3 font-bold opacity-60 leading-relaxed">Synthesis of logic requires description parameters and platform selection.</p>
          </div>
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <Card 
            title="Save to Vault" 
            subtitle="Secure Blueprint Archiving"
            className="w-full max-w-md animate-in zoom-in-95"
            headerAction={<button onClick={() => setShowSaveModal(false)}><X size={20} className="text-slate-400" /></button>}
          >
            <div className="space-y-6">
              {saveSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">Archived Successfully</h4>
                  <p className="text-sm text-slate-500 font-semibold">Blueprint is now persisted in your local vault.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blueprint Name</label>
                    <input 
                      type="text" 
                      value={saveName} 
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="e.g. Lead Sync v1"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Version Control</label>
                    <input 
                      type="text" 
                      value={saveVersion} 
                      onChange={(e) => setSaveVersion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleSaveToVault}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
                  >
                    Confirm Persist
                  </button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Side Chat Sidebar */}
      {showChat && (
        <div className="fixed top-24 right-8 bottom-8 w-96 z-[80] animate-in-right">
          <Card 
            title="Assistant AI" 
            subtitle="Logic Refinement Stream"
            className="h-full flex flex-col p-0 border-indigo-100 shadow-3xl"
            headerAction={<button onClick={() => setShowChat(false)} className="p-2 text-slate-400"><X size={18} /></button>}
          >
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20 custom-scrollbar">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40 space-y-4">
                  <Bot size={40} className="text-indigo-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Ready for queries</p>
                </div>
              )}
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-semibold leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="p-4 bg-white border border-slate-100 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-white border-t border-slate-50">
               <div className="relative">
                 <input 
                   type="text" 
                   value={chatInput} 
                   onChange={(e) => setChatInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                   placeholder="Refine logic..." 
                   className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-6 pr-14 py-3 text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                 />
                 <button 
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || chatLoading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-indigo-600 text-white w-10 rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-30"
                 >
                   <Send size={14} />
                 </button>
               </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AutomationGeneratorView;
