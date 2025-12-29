
import React, { useState, useEffect } from 'react';
import { identifySecrets } from '../services/geminiService';
import { AutomationResult, DeploymentConfig, AsyncState, PipelineStage } from '../types';
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
  AlertTriangle,
  GitBranch,
  Play,
  Activity,
  Box,
  Server
} from 'lucide-react';

interface Props { activeBlueprint: AutomationResult | null; }

const DeploymentHubView: React.FC<Props> = ({ activeBlueprint }) => {
  const [configState, setConfigState] = useState<AsyncState<DeploymentConfig>>({ data: null, loading: false, error: null });
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [activeFormat, setActiveFormat] = useState<string>('');
  
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

  if (!activeBlueprint) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12">
        <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[3rem] flex items-center justify-center mb-8 border border-slate-100"><Rocket size={48} /></div>
        <h3 className="text-2xl font-black text-slate-300 uppercase tracking-[0.4em] mb-4">No Active Payload</h3>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in">
      {configState.loading && (
        <div className="h-[400px] flex flex-col items-center justify-center bg-white border border-slate-100 rounded-[3rem]">
           <Loader2 className="animate-spin text-indigo-600 mb-6" size={48} />
           <p className="text-xl font-black text-slate-900 uppercase tracking-widest">Identifying Deployment Paths</p>
        </div>
      )}

      {configState.data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-8">
            <Card title="Environment Config" subtitle="Production Secret Mapping">
              <div className="space-y-6">
                {configState.data.secrets.map((s, i) => (
                  <div key={i} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Key size={14} className="text-indigo-400" /> {s.key}
                    </label>
                    <input 
                      type="text" 
                      placeholder={`Enter ${s.description.toLowerCase()}...`}
                      value={envVars[s.key] || ''}
                      onChange={(e) => setEnvVars({...envVars, [s.key]: e.target.value})}
                      className="w-full bg-slate-50 border rounded-2xl px-6 py-4 text-sm font-semibold border-slate-100 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                ))}
                <div className="p-6 bg-[#0a0b0e] rounded-[2rem] text-white space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Readiness: {configState.data.readinessCheck}</h4>
                  <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                    <Download size={14} /> Download Bundle
                  </button>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            {/* Visual CI/CD Pipeline Editor */}
            <Card 
              title="Visual CI/CD Pipeline" 
              subtitle="AI-Suggested Orchestration Path"
              headerAction={
                <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                  <GitBranch size={16} className="text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Branch: production</span>
                </div>
              }
            >
              <div className="p-8 bg-slate-50/50 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent pointer-events-none" />
                
                {/* Pipeline Flow Visualization */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                  {configState.data.suggestedPipeline?.map((stage, i) => (
                    <React.Fragment key={stage.id}>
                      <div className="group relative w-full sm:w-auto">
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm group-hover:shadow-md group-hover:border-indigo-200 transition-all min-w-[200px]">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{stage.name}</h5>
                            <Activity size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                          </div>
                          <div className="space-y-3">
                            {stage.steps.map(step => (
                              <div key={step.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white transition-all cursor-pointer">
                                <div className={`w-2 h-2 rounded-full ${step.status === 'success' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                <span className="text-[10px] font-bold text-slate-600">{step.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Decorative progress line */}
                        <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500 w-[60%] animate-pulse" />
                        </div>
                      </div>
                      
                      {i < (configState.data.suggestedPipeline?.length || 0) - 1 && (
                        <div className="hidden sm:flex items-center justify-center text-slate-200">
                          <ChevronRight size={32} strokeWidth={1} className="animate-pulse" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Pipeline Actions */}
                <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-between pt-8 border-t border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                      <Settings2 size={20} />
                    </div>
                    <div>
                      <h6 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Pipeline Orchestrator</h6>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status: Standby • 0/4 Active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all">
                       <Play size={14} /> Trigger Deployment
                     </button>
                     <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                       Modify Logic
                     </button>
                  </div>
                </div>
              </div>

              {/* Deployment Targets Section */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] flex items-center gap-4 group hover:bg-indigo-50 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-white border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-105 transition-transform">
                    <Server size={24} />
                  </div>
                  <div>
                    <h6 className="text-[11px] font-black text-indigo-900 uppercase tracking-widest">AWS Staging Cluster</h6>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Region: us-east-1</p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] flex items-center gap-4 grayscale opacity-60">
                   <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                    <Box size={24} />
                  </div>
                  <div>
                    <h6 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">DigitalOcean Production</h6>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status: Locked</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentHubView;
