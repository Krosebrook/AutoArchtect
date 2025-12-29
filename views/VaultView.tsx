
import React, { useState, useEffect, useRef } from 'react';
import { SavedBlueprint, AppView, AutomationResult } from '../types';
import { Card } from '../components/ui/Card';
import { Library, Search, Trash2, Rocket, Clock, Zap, Layers, ArrowRight, Download, Upload as UploadIcon, FileJson, AlertCircle } from 'lucide-react';

interface Props { onNavigate: (v: AppView, b?: AutomationResult) => void; }

const VaultView: React.FC<Props> = ({ onNavigate }) => {
  const [blueprints, setBlueprints] = useState<SavedBlueprint[]>([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('auto_architect_vault');
    if (saved) setBlueprints(JSON.parse(saved));
  }, []);

  const saveToStorage = (data: SavedBlueprint[]) => {
    setBlueprints(data);
    localStorage.setItem('auto_architect_vault', JSON.stringify(data));
  };

  const deleteBlueprint = (id: string) => {
    const updated = blueprints.filter(b => b.id !== id);
    saveToStorage(updated);
  };

  const exportVault = () => {
    const blob = new Blob([JSON.stringify(blueprints, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auto_architect_vault_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importVault = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          // Merge or overwrite? Let's merge by ID to prevent duplicates
          const merged = [...blueprints];
          json.forEach((item: any) => {
            if (item.id && !merged.find(b => b.id === item.id)) {
              merged.push(item);
            }
          });
          saveToStorage(merged);
          setError(null);
        } else {
          throw new Error("Invalid format: Expected an array of blueprints.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filtered = blueprints.filter(b => 
    b.name.toLowerCase().includes(filter.toLowerCase()) || 
    b.platform.includes(filter.toLowerCase()) ||
    b.explanation.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search vault..." 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-sm transition-all"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm shrink-0"
           >
             <UploadIcon size={16} /> Import JSON
           </button>
           <button 
             onClick={exportVault}
             className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm shrink-0"
           >
             <Download size={16} /> Export Vault
           </button>
           <div className="h-10 w-[1px] bg-slate-100 mx-2 shrink-0 hidden md:block" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm whitespace-nowrap">
             {blueprints.length} Artifacts Stored
           </span>
           <input type="file" ref={fileInputRef} onChange={importVault} className="hidden" accept=".json" />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold animate-in">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {blueprints.length === 0 ? (
        <div className="h-[600px] border-2 border-dashed border-slate-200 rounded-[4rem] flex flex-col items-center justify-center p-12 text-center bg-white/40">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-200 rounded-[3rem] flex items-center justify-center mb-8 border border-indigo-100"><Library size={48} /></div>
          <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Vault Empty</h3>
          <p className="text-slate-400 text-sm max-w-sm mt-3 font-bold opacity-60 leading-relaxed uppercase tracking-widest">Generate and save blueprints or import a JSON manifest to populate your vault.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((b) => (
            <Card 
              key={b.id} 
              title={b.name} 
              subtitle={`v${b.version} • ${b.platform.toUpperCase()}`}
              headerAction={
                <button onClick={() => deleteBlueprint(b.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                  <Trash2 size={16} />
                </button>
              }
            >
              <div className="space-y-8">
                <p className="text-xs text-slate-500 font-semibold line-clamp-2 leading-relaxed opacity-80">"{b.explanation}"</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <div className="flex flex-col">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <Clock size={14} /> {new Date(b.timestamp || 0).toLocaleDateString()}
                     </div>
                     <div className="flex items-center gap-2 text-[9px] font-bold text-indigo-400 mt-1">
                       <FileJson size={12} /> ID: {b.id.split('-')[0]}
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <button 
                      onClick={() => onNavigate(AppView.DEPLOYMENT, b)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                     >
                       Launch <ArrowRight size={14} />
                     </button>
                   </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VaultView;
