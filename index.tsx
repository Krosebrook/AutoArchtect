
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Rocket, X, Download } from 'lucide-react';

/**
 * PWAInstaller Component
 * Manages the "beforeinstallprompt" event and displays a custom installation banner.
 */
const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [swReady, setSwReady] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Standalone detection
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // 2. SW readiness monitoring
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        setSwReady(true);
      } else {
        navigator.serviceWorker.ready.then(() => {
          setSwReady(true);
        });
      }

      // Initial registration
      const registerSW = () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          console.log('[Architect] SW Registered');
          if (registration.active) setSwReady(true);
        }).catch(err => {
          console.warn('[Architect] SW Registration failed:', err);
        });
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    // 3. Install event handling
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Ensure the prompt only shows after a slight delay for better UX
      setTimeout(() => setIsVisible(true), 2000);
    };

    const handleAppInstalled = () => {
      console.log('[Architect] Installed Successfully');
      setDeferredPrompt(null);
      setIsStandalone(true);
      setIsVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[Architect] Install Outcome: ${outcome}`);
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const dismiss = () => {
    setIsVisible(false);
    // Suppress for this session
    setDeferredPrompt(null);
  };

  // Rendering constraints: SW active, prompt caught, not standalone, visible state
  if (!swReady || !deferredPrompt || isStandalone || !isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] w-[calc(100%-2rem)] max-w-lg animate-in slide-in-from-bottom-12 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <div className="bg-[#0f111a] border border-white/10 rounded-[2.5rem] p-6 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden group">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/15 to-transparent pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
        
        {/* App Icon */}
        <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-500 relative z-10">
          <Rocket size={32} strokeWidth={2.5} />
        </div>

        {/* Messaging */}
        <div className="flex-1 text-center sm:text-left relative z-10">
          <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-1">Architect Native</h4>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-70">
            Install the suite for offline logic vaults and ultra-low latency synthesis.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={dismiss}
            className="p-3 text-gray-500 hover:text-white transition-colors active:scale-90"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
          <button 
            onClick={handleInstall}
            className="px-6 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-50 transition-all shadow-xl active:scale-95 whitespace-nowrap flex items-center gap-2"
          >
            <Download size={14} /> Install Now
          </button>
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
    <PWAInstaller />
  </React.StrictMode>
);
