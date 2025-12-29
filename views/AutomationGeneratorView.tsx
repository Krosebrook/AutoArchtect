
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { generateAutomation, chatWithAssistant, generateWorkflowDocs } from '../services/geminiService';
import { AutomationResult, Platform, AsyncState, AutomationStep, AppView, SavedBlueprint, ChatMessage, WorkflowDocumentation } from '../types';
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
  History,
  FileText,
  Code2
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
  { id: 'openai', label: 'OpenAI', tagline: 'Generative AI infrastructure', logo: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/openai.com', color: 'bg-[#10a37f]', tier: 'Native AI', tooltip: 'Deploy custom GPTs and fine-tuned models into workflows.' },
  { id: 'anthropic', label: 'Anthropic', tagline: 'Reliable AI logic', logo: 'https://images.unsplash.com/photo-1620712943543-bcc4628c71d5?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/anthropic.com', color: 'bg-[#cc9b7a]', tier: 'Secure AI', tooltip: 'Advanced Claude-powered reasoning for high-trust workflows.' },
  { id: 'langchain', label: 'LangChain', tagline: 'AI Agent infrastructure', logo: 'https://images.unsplash.com/photo-1677442135121-6b199920b784?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://avatars.githubusercontent.com/u/126733545?s=200&v=4', color: 'bg-[#00A67E]', tier: 'AI Native', tooltip: 'Framework for developing applications powered by language models.' },
  { id: 'zapier', label: 'Zapier', tagline: 'Standard connector ecosystem', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/zapier.com', color: 'bg-[#FF4A00]', tier: 'Essential', tooltip: 'Global standard for simple SaaS integrations.' },
  { id: 'n8n', label: 'n8n.io', tagline: 'Complex node-based logic', logo: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/n8n.io', color: 'bg-[#FF6D5A]', tier: 'Advanced', tooltip: 'Fair-code workflow automation with deep technical control.' },
  { id: 'make', label: 'Make', tagline: 'Visual workflow builder', logo: 'https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/make.com', color: 'bg-[#8A2BE2]', tier: 'Pro-Visual', tooltip: 'Powerful visual platform to design, build, and automate.' },
  { id: 'shopify', label: 'Shopify', tagline: 'Merchant-first operations', logo: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/shopify.com', color: 'bg-[#95BF47]', tier: 'Enterprise', tooltip: 'Robust commerce platform for managing product lifecycles.' },
  { id: 'google-sheets', label: 'Google Sheets', tagline: 'Legacy data orchestration', logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png', color: 'bg-[#0F9D58]', tier: 'Hybrid', tooltip: 'Cloud-based spreadsheet tool as a universal data bridge.' },
  { id: 'airtable', label: 'Airtable', tagline: 'Modern data modeling', logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/airtable.com', color: 'bg-[#18BFFF]', tier: 'Relational', tooltip: 'Hybrid spreadsheet-database for sophisticated data modeling.' },
  { id: 'pipedream', label: 'Pipedream', tagline: 'Engineer-centric control', logo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&q=80&w=400&h=250', brandIcon: 'https://logo.clearbit.com/pipedream.com', color: 'bg-[#191970]', tier: 'Developer', tooltip: 'Integration platform for developers to connect APIs fast.' },
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
  const [platform, setPlatform] = useState<Platform>('openai');
  const [description, setDescription] = useState('');
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<AsyncState<AutomationResult>>({ data: null, loading: false, error: null });
  const [docsState, setDocsState] = useState<AsyncState<WorkflowDocumentation>>({ data: null, loading: false, error: null });
  const [activeTab, setActiveTab] = useState<'blueprint' | 'docs'>('blueprint');

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveVersion, setSaveVersion] = useState('1.0.0');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const validation = useMemo(() => ({ isValid: description.trim().length >= 20, progress: Math.min(100, (description.trim().length / 20) * 100) }), [description]);

  const handleGenerate = async () => {
    if (!validation.isValid) return;
    setState({ ...state, loading: true, error: null });
    setDocsState({ data: null, loading: false, error: null });
    setActiveTab('blueprint');
    
    try {
      const data = await generateAutomation(platform, description);
      setState({ data, loading: false, error: null });
      if (onBlueprintGenerated) onBlueprintGenerated(data);
      
      // Auto-generate documentation in the background
      setDocsState(prev => ({ ...prev, loading: true }));
      const docs = await generateWorkflowDocs(data);
      setDocsState({ data: docs, loading: false, error: null });
    } catch (err: any) {
      setState({ data: null, loading: false, error: { message: err.message } });
      setDocsState({ data: null, loading: false, error: null });
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start pb-20 animate-in">
      <div className="xl:col-span-4 space-y-8">
        <Card title="Blueprint Architect" subtitle="Configure target infrastructure">
          <div className="space-y-8">
            <div className="space-y-5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Ecosystem</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar p-1">
                {PLATFORMS.map((p) => (
                   <button 
                     key={p.id} 
                     onClick={() => setPlatform(p.id)} 
                     className={`relative group w-full flex flex-col items-start p-0 rounded-3xl border transition-all duration-300 overflow-hidden ${platform === p.id ? 'bg-white border-indigo-600 ring-2 ring-indigo-50 shadow-lg scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                     title={p.tooltip}
                   >
                     <div className="w-full h-24 relative overflow-hidden">
                       <img src={p.logo} alt={p.label} className="w-full h-full object-cover opacity-80" />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                       <div className="absolute bottom-2 left-3 flex items-center gap-2">
                         <img src={p.brandIcon} alt="" className="w-5 h-5 object-contain bg-white rounded-md p-0.5" />
                         <span className="text-[10px] font-black uppercase text-white tracking-widest">{p.label}</span>
                       </div>
                       <div className="absolute top-2 right-3">
                         <span className="text-[8px] font-black uppercase text-white/70 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm tracking-widest">{p.tier}</span>
                       </div>
                     </div>
                   </button>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Scope</label>
                <div className="h-1.5 w-20 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${validation.isValid ? 'bg-indigo-600' : 'bg-orange-400'}`} style={{ width: `${validation.progress}%` }} />
                </div>
              </div>
              <textarea value={description} onBlur={() => setTouched(true)} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Lead sync from Shopify to Slack..." className={`w-full bg-slate-50 border rounded-3xl px-8 py-6 min-h-[160px] text-sm focus:ring-4 outline-none transition-all ${touched && !validation.isValid ? 'border-orange-200' : 'border-slate-100 focus:border-indigo-500'}`} />
            </div>
            <button onClick={handleGenerate} disabled={state.loading || !validation.isValid} className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-4 transition-all ${state.loading || !validation.isValid ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 hover-lift'}`}>
              {state.loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
              <span>{state.loading ? 'Synthesizing...' : 'Architect Automation'}</span>
            </button>
          </div>
        </Card>
      </div>

      <div className="xl:col-span-8 space-y-8 relative">
        {state.data ? (
          <div className="space-y-6 animate-in">
            {/* Tab Controls */}
            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit">
              <button 
                onClick={() => setActiveTab('blueprint')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'blueprint' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <Zap size={14} /> Blueprint
              </button>
              <button 
                onClick={() => setActiveTab('docs')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'docs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <FileText size={14} /> AI Docs
              </button>
            </div>

            {activeTab === 'blueprint' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in">
                <Card 
                  title="Strategy Manifest" 
                  subtitle={state.data.platform.toUpperCase()}
                  headerAction={
                    <button 
                      onClick={() => setShowSaveModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100"
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
                  </div>
                </Card>
                <Card title="Execution Config">
                  <div className="bg-[#0d0f14] rounded-[3rem] overflow-hidden shadow-3xl border border-white/5">
                    <pre className="p-10 text-indigo-300 font-mono text-xs overflow-x-auto custom-scrollbar"><code>{state.data.codeSnippet}</code></pre>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4">
                {docsState.loading ? (
                  <div className="h-[500px] flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-slate-100">
                    <Loader2 className="animate-spin text-indigo-600 mb-6" size={48} />
                    <p className="text-xl font-black text-slate-900 uppercase tracking-widest">Generating AI Documentation</p>
                    <span className="text-[10px] text-slate-400 font-black tracking-[0.2em] mt-2">Writing human-readable protocols...</span>
                  </div>
                ) : docsState.data ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <Card className="lg:col-span-2" title="Functional Specification" subtitle="System Behavior & Purpose">
                        <div className="space-y-8">
                          <div className="p-8 bg-indigo-50/30 rounded-[2rem] border border-indigo-100/50">
                            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Core Purpose</h5>
                            <p className="text-sm text-slate-700 font-semibold leading-relaxed">{docsState.data.purpose}</p>
                          </div>
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logic Flow Sequence</h5>
                            <div className="space-y-3">
                              {docsState.data.logicFlow.map((flow, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
                                  <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black">{i+1}</div>
                                  <p className="text-xs text-slate-600 font-semibold">{flow}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                      <Card title="Operations Guide" subtitle="Lifecycle & Scaling">
                        <div className="space-y-6">
                           <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                             <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Maintenance</h5>
                             <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">{docsState.data.maintenanceGuide}</p>
                           </div>
                           <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                             <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Layers size={14} className="text-indigo-500" /> Infrastructure</h5>
                             <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">Tier-1 logic mapping for {state.data.platform.toUpperCase()} clusters.</p>
                           </div>
                        </div>
                      </Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       <Card title="Input Schema" subtitle="Request / Trigger Parameters">
                         <div className="bg-[#0b0c10] p-6 rounded-3xl border border-white/5">
                           <pre className="text-[10px] text-emerald-400 font-mono overflow-x-auto custom-scrollbar"><code>{JSON.stringify(docsState.data.inputSchema, null, 2)}</code></pre>
                         </div>
                       </Card>
                       <Card title="Output Schema" subtitle="Action / Response Payloads">
                         <div className="bg-[#0b0c10] p-6 rounded-3xl border border-white/5">
                           <pre className="text-[10px] text-indigo-300 font-mono overflow-x-auto custom-scrollbar"><code>{JSON.stringify(docsState.data.outputSchema, null, 2)}</code></pre>
                         </div>
                       </Card>
                    </div>
                  </div>
                ) : (
                  <div className="h-[500px] flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-slate-100 opacity-50">
                    <FileText size={48} className="text-slate-200 mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Documentation Unavailable</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full min-h-[600px] border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center p-12 text-center bg-white/40">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-200 rounded-[3rem] flex items-center justify-center mb-10 border border-indigo-100"><Zap size={48} /></div>
            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Awaiting Blueprint</h3>
            <p className="text-slate-400 text-sm max-w-xs mt-3 font-bold opacity-60 leading-relaxed uppercase tracking-widest">Logic synthesis requires scope parameters.</p>
          </div>
        )}
      </div>

      {/* Save Modal (Simplified for brevity) */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <Card 
            title="Save to Vault" 
            className="w-full max-w-md"
            headerAction={<button onClick={() => setShowSaveModal(false)}><X size={20} className="text-slate-400" /></button>}
          >
            <div className="space-y-6">
              {saveSuccess ? <div className="text-center font-black text-emerald-600 py-8">Archived!</div> : (
                <>
                  <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Blueprint Name..." className="w-full bg-slate-50 border rounded-2xl px-6 py-4" />
                  <button onClick={handleSaveToVault} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase">Confirm Persist</button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AutomationGeneratorView;
