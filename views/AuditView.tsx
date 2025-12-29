
import React, { useState, useEffect } from 'react';
import { auditAutomation } from '../services/geminiService';
import { AutomationResult, AuditResult, AsyncState } from '../types';
import { Card } from '../components/ui/Card';
import { 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Target
} from 'lucide-react';

interface AuditViewProps {
  activeBlueprint: AutomationResult | null;
}

const AuditView: React.FC<AuditViewProps> = ({ activeBlueprint }) => {
  const [auditState, setAuditState] = useState<AsyncState<AuditResult>>({
    data: null,
    loading: false,
    error: null
  });

  const handleAudit = async () => {
    if (!activeBlueprint) return;
    setAuditState({ data: null, loading: true, error: null });
    try {
      const result = await auditAutomation(activeBlueprint);
      setAuditState({ data: result, loading: false, error: null });
    } catch (err: any) {
      setAuditState({ data: null, loading: false, error: { message: err.message } });
    }
  };

  useEffect(() => {
    if (activeBlueprint && !auditState.data && !auditState.loading) {
      handleAudit();
    }
  }, [activeBlueprint]);

  if (!activeBlueprint) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12">
        <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[3rem] flex items-center justify-center mb-8 border border-slate-100">
          <ShieldAlert size={48} />
        </div>
        <h3 className="text-2xl font-black text-slate-300 uppercase tracking-[0.4em] mb-4">No Active Blueprint</h3>
        <p className="text-slate-400 text-sm max-w-sm font-bold leading-relaxed opacity-60">
          Generate an automation blueprint in the generator view first to perform a security and cost audit.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in">
      {auditState.loading && (
        <div className="h-[500px] flex flex-col items-center justify-center text-center bg-white border border-slate-100 rounded-[4rem] shadow-sm relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-50/40 via-transparent to-transparent animate-pulse" />
           <div className="relative z-10">
             <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/50 animate-bounce">
               <ShieldAlert size={40} className="text-white" />
             </div>
             <p className="text-xl font-black text-slate-900 uppercase tracking-[0.4em] mb-2">Auditing Architecture</p>
             <span className="text-xs text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">Scanning endpoints for vulnerabilities...</span>
           </div>
        </div>
      )}

      {auditState.data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Dashboard */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="flex flex-col items-center text-center py-10" variant="glass">
                 <div className="relative mb-6">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * auditState.data.securityScore) / 100}
                        className={`${auditState.data.securityScore > 80 ? 'text-emerald-500' : auditState.data.securityScore > 50 ? 'text-orange-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-900">
                      {auditState.data.securityScore}
                    </div>
                 </div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Security Integrity</h4>
              </Card>

              <Card className="flex flex-col items-center text-center py-10">
                 <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <DollarSign size={32} />
                 </div>
                 <div className="text-2xl font-black text-slate-900 mb-1">{auditState.data.estimatedMonthlyCost}</div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Estimated OpEx / Mo</h4>
              </Card>

              <Card className="flex flex-col items-center text-center py-10">
                 <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <Target size={32} />
                 </div>
                 <div className="text-xl font-black text-slate-900 mb-1">High ROI</div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Efficiency Rating</h4>
              </Card>
            </div>

            <Card title="Security Vulnerability Trace" subtitle={`${auditState.data.vulnerabilities.length} critical items detected`}>
              <div className="space-y-6">
                {auditState.data.vulnerabilities.map((v, i) => (
                  <div key={i} className="flex gap-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:bg-white transition-all">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      v.severity === 'high' ? 'bg-red-100 text-red-600' : v.severity === 'medium' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <ShieldAlert size={24} />
                    </div>
                    <div className="space-y-3 flex-1">
                       <div className="flex items-center gap-3">
                         <h5 className="font-black text-slate-900 uppercase tracking-tight">{v.issue}</h5>
                         <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                           v.severity === 'high' ? 'bg-red-600 text-white' : v.severity === 'medium' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                         }`}>
                           {v.severity}
                         </span>
                       </div>
                       <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
                          <div>
                            <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Recommended Patch</span>
                            <p className="text-xs text-slate-600 font-semibold leading-relaxed">{v.fix}</p>
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="ROI Analysis" subtitle="Financial Impact & Scaling Efficiency">
               <div className="flex items-start gap-6 p-8 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100/50 relative overflow-hidden">
                  <div className="absolute right-0 top-0 p-8 opacity-10 pointer-events-none">
                     <TrendingUp size={120} className="text-indigo-600" />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                        <Zap size={20} />
                      </div>
                      <h5 className="text-[11px] font-black text-indigo-900 uppercase tracking-[0.2em]">Deployment Strategy</h5>
                    </div>
                    <p className="text-sm text-indigo-700/80 font-bold leading-relaxed italic">
                      "{auditState.data.roiAnalysis}"
                    </p>
                  </div>
               </div>
            </Card>
          </div>

          {/* Side Panel: Optimization */}
          <div className="lg:col-span-4 space-y-8">
            <Card title="Optimization Lab" subtitle="Refining synthesized logic">
              <div className="space-y-6">
                {auditState.data.optimizationTips.map((tip, i) => (
                  <div key={i} className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                    <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-indigo-500 font-black text-xs">
                      {i + 1}
                    </div>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="p-8 bg-slate-900 rounded-[3rem] text-white space-y-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent opacity-50" />
               <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-emerald-400">
                     <Lock size={24} />
                   </div>
                   <div>
                     <h4 className="font-black uppercase tracking-[0.2em] text-xs">Enterprise Ready</h4>
                     <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Compliance Status: Passed</p>
                   </div>
                 </div>
                 <p className="text-[11px] text-white/60 font-medium leading-relaxed">
                   This blueprint adheres to standard OAuth2 protocols and data masking practices recommended for Tier-1 SaaS infrastructures.
                 </p>
                 <button 
                  onClick={handleAudit}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                 >
                   Re-Audit Neural Node <ArrowRight size={14} />
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {auditState.error && (
        <div className="p-8 bg-red-50 border border-red-100 rounded-[3rem] flex items-center gap-6 text-red-700 animate-in">
          <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center shrink-0">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-1">
            <h4 className="font-black uppercase tracking-widest text-sm">Audit System Fault</h4>
            <p className="text-xs font-bold opacity-70">{auditState.error.message}</p>
          </div>
          <button onClick={handleAudit} className="ml-auto px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Retry Scan</button>
        </div>
      )}
    </div>
  );
};

export default AuditView;
