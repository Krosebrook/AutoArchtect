
import React, { useState, Suspense, useEffect } from 'react';
import { AppView, AutomationResult } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AutomationGeneratorView from './views/AutomationGeneratorView';
import ChatbotView from './views/ChatbotView';
import ImageAnalysisView from './views/ImageAnalysisView';
import TTSView from './views/TTSView';
import LiveArchitectView from './views/LiveArchitectView';
import LogicSandboxView from './views/LogicSandboxView';
import AuditView from './views/AuditView';
import DeploymentHubView from './views/DeploymentHubView';
import VaultView from './views/VaultView';
import ComparatorView from './views/ComparatorView';
import TerminalView from './views/TerminalView';
import ProfileView from './views/ProfileView';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.GENERATOR);
  const [activeBlueprint, setActiveBlueprint] = useState<AutomationResult | null>(null);

  useEffect(() => {
    // Initialize Theme
    const saved = localStorage.getItem('aa_user_profile');
    if (saved) {
      const { preferences } = JSON.parse(saved);
      const root = window.document.documentElement;
      root.classList.remove('dark');
      if (preferences.theme === 'dark' || (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      }
    }
  }, []);

  const handleNavigateWithBlueprint = (view: AppView, blueprint?: AutomationResult) => {
    if (blueprint) setActiveBlueprint(blueprint);
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.GENERATOR: 
        return <AutomationGeneratorView 
          onBlueprintGenerated={(b) => setActiveBlueprint(b)}
          onNavigate={handleNavigateWithBlueprint}
        />;
      case AppView.CHATBOT: return <ChatbotView />;
      case AppView.IMAGE_ANALYSIS: return <ImageAnalysisView />;
      case AppView.TTS: return <TTSView />;
      case AppView.LIVE_CONSULTANT: return <LiveArchitectView />;
      case AppView.LOGIC_SANDBOX: return <LogicSandboxView activeBlueprint={activeBlueprint} />;
      case AppView.AUDIT: return <AuditView activeBlueprint={activeBlueprint} />;
      case AppView.DEPLOYMENT: return <DeploymentHubView activeBlueprint={activeBlueprint} />;
      case AppView.VAULT: return <VaultView onNavigate={handleNavigateWithBlueprint} />;
      case AppView.COMPARATOR: return <ComparatorView />;
      case AppView.TERMINAL: return <TerminalView />;
      case AppView.PROFILE: return <ProfileView />;
      default: return <AutomationGeneratorView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFDFF] text-gray-900 overflow-hidden selection:bg-indigo-100 dark:bg-slate-950 dark:text-gray-100 transition-colors duration-500">
      <Sidebar activeView={currentView} onNavigate={setCurrentView} />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header activeView={currentView} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-12 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto h-full relative">
            <Suspense fallback={<div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>}>
              {renderView()}
            </Suspense>
          </div>
        </main>
        <footer className="px-10 py-3 border-t border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] hidden sm:flex shrink-0">
          <div className="flex items-center gap-4"><span>AutoArchitect Enterprise v2.5</span><div className="h-3 w-[1px] bg-gray-200 dark:bg-gray-700" /><span className="text-indigo-500">Gemini 3 Pro Cluster</span></div>
          <div className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Engine: Nominal</div>
        </footer>
      </div>
    </div>
  );
};

export default App;
