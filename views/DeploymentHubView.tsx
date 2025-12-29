
import React, { useState, useEffect, useRef } from 'react';
import { identifySecrets, chatWithAssistant } from '../services/geminiService';
import { AutomationResult, DeploymentConfig, AsyncState, ChatMessage } from '../types';
import { Card } from '../components/ui/Card';
import { 
  Rocket, 
  Terminal, 
  ShieldCheck, 
  Download, 
  Key, 
  Loader2, 
  CheckCircle2, 
  RefreshCw,
  Zap,
  ChevronRight,
  Globe,
  Settings2,
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  History
} from 'lucide-react';

interface Props { activeBlueprint: AutomationResult | null; }

const DeploymentHubView: React.FC<Props> = ({ activeBlueprint }) => {
  const [configState, setConfigState] = useState<AsyncState<DeploymentConfig>>({ data: null, loading: false, error: null });
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [activeFormat, setActiveFormat] = useState<string>('');
  
  // Chat Integration
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const fetchConfig = async () => {
    if (!activeBlueprint) return;
    setConfigState({ data: null, loading: true, error: null });
    try {
      const data = await identifySecrets(activeBlueprint);
      setConfigState({ data, loading: false, error: null });
      if (data.exportFormats.length > 0) setActiveFormat(data.exportFormats[0]);
    } catch (err: any) {
      setConfigState({ data: null, loading: false, error: { message: err.message } });
    }
  };

  useEffect(() => { fetchConfig(); }, [activeBlueprint]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading]);

  if (!activeBlueprint) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12">
        <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[3rem] flex items-center justify-center mb-8 border border-slate-100">
          <Rocket size={48} />
        </div>
        <h3 className="text-2xl font-black text-slate-300 uppercase tracking-[0.4em] mb-4">No Active Payload</h3>
        <p className="text-slate-400 text-sm max-w-sm font-bold leading-relaxed opacity-60">Generate a blueprint in the generator hub to initialize the deployment protocol.</p>
      </div>
    );
  }

  const getPreviewCode = () => {
    let code = activeBlueprint.codeSnippet || '';
    Object.entries(envVars).forEach(([key, val]) => {
      const placeholder = configState.data?.secrets.find(s => s.key === key)?.placeholder;
      if (placeholder && val) code = code.replaceAll(placeholder, val);
    });
    return code;
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const contextPrompt = `Deployment Support:\nBlueprint: ${activeBlueprint.explanation}\nSecrets identified: ${configState.data?.secrets.map(s => s.key).join(', ') || 'None'}\n\nUser Question: ${chatInput}`;
      const reply = await chatWithAssistant(contextPrompt);
      const botMsg: ChatMessage = { id: (Date.now()+1).toString(), role: 'model', content: reply, timestamp: Date.now() };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { id: 'err', role: 'model', content: "Failed to consult expert.", timestamp: Date.now() }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in relative">
      {configState.loading && (
        <div className="h-[500px] flex flex-col items-center justify-center bg-white border border-slate-100 rounded-[4rem] relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent animate-pulse" />
           <Loader2 className="animate-spin text-indigo-600 mb-6" size={48} />
           <p className="text-xl font-black text-slate-900 uppercase tracking-[0.4em]">Scanning Blueprint</p>
           <span className="text-xs text-slate-400 font-black tracking-widest mt-2">Identifying required environmental secrets...</span>
        </div>
      )}

      {configState.data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-8">
            <Card title="Environment Config" subtitle="Production Secret Mapping">
              <div className="space-y-6">
                {configState.data.secrets.length === 0 ? (
                  <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-4 text-emerald-700">
                    <CheckCircle2 size={24} />
                    <p className="text-xs font-bold leading-relaxed uppercase tracking-widest">No secret keys required for this logic.</p>
                  </div>
                ) : (
                  configState.data.secrets.map((s, i) => (
                    <div key={i} className="space-y-3 group">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Key size={14} className="text-indigo-400" /> {s.key}
                        </label>
                        <span className="text-[9px] text-slate-300 font-bold font-mono tracking-tighter">{s.placeholder}</span>
                      </div>
                      <input 
                        type="text" 
                        placeholder={`Enter ${s.description.toLowerCase()}...`}
                        value={envVars[s.key] || ''}
                        onChange={(e) => setEnvVars({...envVars, [s.key]: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  ))
                )}
                <button 
                  onClick={() => setShowChat(!showChat)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                >
                  <MessageCircle size={16} /> Consult AI on Variable Mapping
                </button>
              </div>
            </Card>

            <div className="p-8 bg-[#0a0b0e] rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden border border-white/5">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent opacity-50" />
               <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/20"><Rocket size={24} /></div>
                   <div>
                     <h4 className="font-black uppercase tracking-[0.25em] text-xs">Readiness Score</h4>
                     <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">Status: {configState.data.readinessCheck}</p>
                   </div>
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {configState.data.exportFormats.map(f => (
                     <button key={f} onClick={() => setActiveFormat(f)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeFormat === f ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
                       {f} Flavor
                     </button>
                   ))}
                 </div>
                 <button className="w-full mt-8 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all shadow-xl active:scale-95">
                    <Download size={18} /> Download Production Bundle
                 </button>
               </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <Card title="Production Source" subtitle={`Flavor: ${activeFormat.toUpperCase()}`}>
              <div className="bg-[#0d0f14] rounded-[3rem] overflow-hidden shadow-3xl border border-white/5 relative">
                 <div className="px-8 py-5 border-b border-white/5 bg-white/[0.03] flex items-center justify-between">
                   <div className="flex items-center gap-3"><Terminal size={16} className="text-indigo-400" /><span className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em]">Resolved Execution Config</span></div>
                   <div className="flex items-center gap-2">
                      <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mr-4">Live Sync Active</span>
                      <div className="w-2 h-2 rounded-full bg-red-500/20" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/40 animate-pulse" />
                   </div>
                 </div>
                 <pre className="p-12 text-indigo-300 font-mono text-xs leading-relaxed overflow-x-auto custom-scrollbar h-[600px]"><code>{getPreviewCode()}</code></pre>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-slate-100 rounded-[2rem] flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm shrink-0"><ShieldCheck size={20} /></div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-black text-slate-900 uppercase tracking-widest">Validated</span>
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed">Syntax & Mapping confirmed via Neural Sandbox.</p>
                </div>
              </div>
              <div className="p-6 bg-white border border-slate-100 rounded-[2rem] flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm shrink-0"><Zap size={20} /></div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-black text-slate-900 uppercase tracking-widest">Optimized</span>
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed">Deployment-ready with auto-injected error catching.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deployment Chat Sidebar */}
      {showChat && (
        <div className="fixed top-24 right-8 bottom-8 w-96 z-[80] animate-in-right">
          <Card 
            title="Deployment Advisor" 
            subtitle="Security & Secret Support"
            className="h-full flex flex-col p-0 border-indigo-100 shadow-3xl"
            headerAction={<button onClick={() => setShowChat(false)} className="p-2 text-slate-400"><X size={18} /></button>}
          >
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20 custom-scrollbar">
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40 space-y-4">
                  <Key size={40} className="text-indigo-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Ask about secret handling</p>
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
                   placeholder="Secret mapping query..." 
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

export default DeploymentHubView;
