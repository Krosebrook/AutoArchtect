
import React, { useState } from 'react';
import { benchmarkPlatforms } from '../services/geminiService';
import { ComparisonResult, Platform, AsyncState, SavedBlueprint } from '../types';
import { Card } from '../components/ui/Card';
import { Scale, Zap, Loader2, ArrowRight, ShieldCheck, AlertCircle, TrendingUp, Terminal, Save, CheckCircle2, X } from 'lucide-react';

const ComparatorView: React.FC = () => {
  const [description, setDescription] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['zapier', 'n8n', 'make']);
  const [state, setState] = useState<AsyncState<ComparisonResult>>({ data: null, loading: false, error: null });
  
  // Save State
  const [saveTarget, setSaveTarget] = useState<{ p: any, name: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleBenchmark = async () => {
    if (!description.trim() || state.loading) return;
    setState({ data: null, loading: true, error: null });
    try {
      const data = await benchmarkPlatforms(description, selectedPlatforms);
      setState({ data, loading: false, error: null });
    } catch (err: any) {
      setState({ data: null, loading: false, error: { message: err.message } });
    }
  };

  const handleSaveResult = (p: any) => {
    const vault = JSON.parse(localStorage.getItem('auto_architect_vault') || '[]');
    const newSaved: SavedBlueprint = {
      platform: p.platform as Platform,
      explanation: `Benchmarked: ${state.data?.task}`,
      codeSnippet: p.config,
      steps: [{ id: 1, title: 'Implementation', description: p.pros.join('. '), type: 'logic' }],
      id: crypto.randomUUID(),
      name: `Benchmark - ${p.platform.toUpperCase()}`,
      version: '1.0.0',
      timestamp: Date.now()
    };
    
    vault.push(newSaved);
    localStorage.setItem('auto_architect_vault', JSON.stringify(vault));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-10 animate-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <Card title="Benchmarker" subtitle="Compare ecosystem logic">
            <div className="space-y-8">
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 min-h-[160px] text-sm font-semibold focus:ring-4 focus:ring-emerald-500/10 outline-none" 
                placeholder="Ex: Sync customer leads from Google Sheets to HubSpot with custom logic..." 
              />
              <button onClick={handleBenchmark} disabled={state.loading || !description.trim()} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover-lift">
                {state.loading ? <Loader2 className="animate-spin" /> : <Scale size={18} />}
                {state.loading ? 'Analyzing...' : 'Execute Benchmark'}
              </button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {!state.data && !state.loading && (
            <div className="h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center p-12 text-center bg-white/40">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-200 rounded-[3rem] flex items-center justify-center mb-10 border border-emerald-100"><TrendingUp size={48} /></div>
              <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Multi-Platform Strategy</h3>
            </div>
          )}

          {state.loading && (
             <div className="h-full min-h-[500px] bg-white border border-slate-100 rounded-[4rem] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-transparent animate-pulse" />
                <Loader2 className="animate-spin text-emerald-600 mb-6" size={48} />
                <p className="text-xl font-black text-slate-900 uppercase tracking-widest">Differential Synthesis</p>
             </div>
          )}

          {state.data && (
            <div className="space-y-10 animate-in">
              <Card title="Expert Recommendation" variant="glass">
                 <p className="text-lg font-bold text-slate-800 leading-relaxed italic">"{state.data.recommendation}"</p>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {state.data.platforms.map((p, i) => (
                  <Card key={i} title={p.platform.toUpperCase()} subtitle={`Complexity: ${p.complexity}`}>
                    <div className="space-y-6">
                       <div className="space-y-2">
                         <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Pros</span>
                         <ul className="space-y-1">
                           {p.pros.map((pro, j) => <li key={j} className="text-[11px] font-bold text-slate-500 flex items-center gap-2"><ShieldCheck size={12} className="text-emerald-500" /> {pro}</li>)}
                         </ul>
                       </div>
                       <div className="space-y-2">
                         <span className="text-[9px] font-black uppercase text-red-600 tracking-widest">Cons</span>
                         <ul className="space-y-1">
                           {p.cons.map((con, j) => <li key={j} className="text-[11px] font-bold text-slate-500 flex items-center gap-2"><AlertCircle size={12} className="text-red-400" /> {con}</li>)}
                         </ul>
                       </div>
                       <div className="pt-4 border-t border-slate-50 flex gap-2">
                          <button 
                            onClick={() => handleSaveResult(p)}
                            className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
                          >
                             {saveSuccess ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Save size={14} />} 
                             {saveSuccess ? 'Saved' : 'Save Config'}
                          </button>
                       </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparatorView;
