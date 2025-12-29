
import React, { useState, useEffect } from 'react';
import { simulateAutomation } from '../services/geminiService';
import { AutomationResult, SimulationResponse, AsyncState } from '../types';
import { Card } from '../components/ui/Card';
import { 
  FlaskConical, 
  Play, 
  Loader2, 
  Code, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Database,
  Search,
  ArrowRightCircle,
  Bug,
  Zap,
  Cpu
} from 'lucide-react';

interface LogicSandboxViewProps {
  activeBlueprint: AutomationResult | null;
}

const LogicSandboxView: React.FC<LogicSandboxViewProps> = ({ activeBlueprint }) => {
  const [inputData, setInputData] = useState<string>(JSON.stringify({
    event: "new_payment",
    customer: {
      id: "cust_99",
      email: "jane@example.com",
      status: "active"
    },
    amount: 1500,
    currency: "USD"
  }, null, 2));

  const [automationSpec, setAutomationSpec] = useState<string>('');
  const [simState, setSimState] = useState<AsyncState<SimulationResponse>>({
    data: null,
    loading: false,
    error: null
  });

  useEffect(() => {
    if (activeBlueprint) {
      setAutomationSpec(JSON.stringify(activeBlueprint, null, 2));
    }
  }, [activeBlueprint]);

  const handleSimulate = async () => {
    let targetBlueprint: AutomationResult;

    if (activeBlueprint) {
      targetBlueprint = activeBlueprint;
    } else {
      if (!automationSpec.trim()) {
        setSimState(prev => ({ ...prev, error: { message: "Please provide an automation blueprint or description first." } }));
        return;
      }
      try {
        // Attempt to parse manually entered blueprint if JSON, otherwise mock
        targetBlueprint = JSON.parse(automationSpec);
      } catch (e) {
        // Fallback for text descriptions in sandbox
        targetBlueprint = {
          platform: 'zapier',
          explanation: 'Simulated from manual sandbox input',
          steps: [
            { id: 1, title: 'Input Parse', description: automationSpec, type: 'trigger' },
            { id: 2, title: 'Logic Simulation', description: 'Heuristic evaluation of requirements', type: 'logic' }
          ]
        };
      }
    }

    setSimState({ data: null, loading: true, error: null });
    try {
      const result = await simulateAutomation(targetBlueprint, inputData);
      setSimState({ data: result, loading: false, error: null });
    } catch (err: any) {
      setSimState({ data: null, loading: false, error: { message: err.message } });
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Simulation Setup */}
      <div className="xl:col-span-5 space-y-6">
        <Card title="Simulation Controller" subtitle="Stress-test active architecture">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Database size={14} className="text-indigo-400" />
                Mock Payload (JSON)
              </label>
              <div className="relative group">
                <textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  className="w-full h-48 bg-[#0d0e12] text-green-400 font-mono text-xs p-5 rounded-3xl border border-gray-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all custom-scrollbar"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Code size={14} className="text-indigo-400" />
                Active Blueprint Source
              </label>
              <div className="relative">
                <textarea
                  value={automationSpec}
                  onChange={(e) => setAutomationSpec(e.target.value)}
                  readOnly={!!activeBlueprint}
                  placeholder="Blueprint data will populate automatically from Generator..."
                  className={`w-full h-40 bg-gray-50 border border-gray-100 rounded-3xl p-5 text-xs font-mono focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300 ${activeBlueprint ? 'opacity-70' : ''}`}
                />
                {activeBlueprint && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl flex items-center gap-2">
                       <Zap size={12} fill="currentColor" /> Active Linked State
                     </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={simState.loading}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all duration-300 ${
                simState.loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 active:scale-95'
              }`}
            >
              {simState.loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
              {simState.loading ? 'Running Trace...' : 'Execute Logic Simulation'}
            </button>
            
            {simState.error && (
              <div className="p-5 bg-red-50 border border-red-100 rounded-3xl text-[10px] font-bold text-red-600 flex items-center gap-3 animate-in">
                <AlertTriangle size={18} />
                {simState.error.message}
              </div>
            )}
          </div>
        </Card>

        <div className="p-8 bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] flex items-start gap-4">
           <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
             <Bug size={20} />
           </div>
           <div className="space-y-1">
             <h5 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Edge Case Engine</h5>
             <p className="text-[11px] text-indigo-700 font-medium leading-relaxed opacity-80">
               Automatically detects type mismatches and potential logic loops within your synthesized branches.
             </p>
           </div>
        </div>
      </div>

      {/* Simulation Output */}
      <div className="xl:col-span-7 space-y-6">
        {!simState.data && !simState.loading && (
          <div className="h-[700px] border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center p-12 text-center bg-white/40">
            <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[3rem] flex items-center justify-center mb-10 border border-slate-100">
              <FlaskConical size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-[0.4em]">Sandbox Nominal</h3>
            <p className="text-slate-400 text-sm max-w-xs mt-3 font-bold opacity-60 leading-relaxed uppercase tracking-widest">Ready for input data injection.</p>
          </div>
        )}

        {simState.loading && (
          <div className="h-[700px] bg-white border border-slate-100 rounded-[4rem] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl shadow-slate-200/50">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent animate-pulse-soft" />
             <div className="relative flex flex-col items-center z-10 text-center">
               <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl animate-spin-slow">
                 <Cpu size={32} className="text-white" />
               </div>
               <div className="space-y-3">
                 <p className="text-xl font-black text-slate-900 uppercase tracking-[0.4em]">Tracing Neural Path</p>
                 <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Calculating conditional probability...</span>
                 </div>
               </div>
             </div>
          </div>
        )}

        {simState.data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <Card 
              title="Execution Trace" 
              subtitle={`Final Protocol Status: ${simState.data.overallStatus.toUpperCase()}`}
              headerAction={
                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${
                  simState.data.overallStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {simState.data.overallStatus === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {simState.data.overallStatus}
                </span>
              }
            >
              <div className="mb-10 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50 italic text-slate-600 font-semibold leading-relaxed text-sm">
                "{simState.data.summary}"
              </div>

              <div className="space-y-6 relative pl-6">
                <div className="absolute left-[34px] top-6 bottom-6 w-1 bg-slate-100 rounded-full" />
                {simState.data.stepResults.map((step, idx) => (
                  <div key={idx} className="group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <div className="flex items-start gap-8">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-lg transition-transform group-hover:scale-110 ${
                        step.status === 'success' ? 'bg-emerald-500' : step.status === 'failure' ? 'bg-red-500' : 'bg-slate-400'
                      }`}>
                        {step.status === 'success' ? <CheckCircle2 size={20} /> : step.status === 'failure' ? <XCircle size={20} /> : <ArrowRightCircle size={20} />}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-slate-900 text-lg tracking-tight">Step {step.stepId} Node Verification</h4>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                            step.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-semibold leading-relaxed group-hover:text-slate-800 transition-colors">
                          {step.reasoning}
                        </p>
                        <div className="bg-[#0b0c10] p-6 rounded-[2rem] border border-white/5 shadow-inner">
                           <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                             <Terminal size={12} className="text-indigo-400" /> Trace State Output
                           </div>
                           <pre className="text-[11px] text-emerald-400 font-mono overflow-x-auto custom-scrollbar whitespace-pre-wrap leading-relaxed">
                             {step.output}
                           </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogicSandboxView;
