
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Rocket, X, Download } from 'lucide-react';

/**
 * PWAInstaller Component
 * Manages the "beforeinstallprompt" lifecycle with strict readiness checks.
 */
const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [swReady, setSwReady] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isVisible, setIsVisible] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);

  // 1. Initial State & Event Listeners
  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
    };

    checkStandalone();
    
    // Listen for changes in display mode (e.g., if app is launched from home screen after being open in browser)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);

    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Capture browser's install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('[Architect] PWA Install Prompt Captured');
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      console.log('[Architect] PWA Localized Successfully');
      setDeferredPrompt(null);
      setIsStandalone(true);
      setIsVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 2. Service Worker Lifecycle Monitoring
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          setSwReady(true);
        }
      });

      /**
       * RESOLUTION: Explicit path construction
       * We calculate the absolute path based on window.location.href to ensure
       * the origin matches the document context, bypassing potential sandbox
       * origin spoofing or misconfiguration (e.g. ai.studio vs googleusercontent).
       */
      let swUrl = 'sw.js';
      try {
        swUrl = new URL('sw.js', window.location.href).href;
        console.log('[Architect] Initializing SW at:', swUrl);
      } catch (e) {
        console.warn('[Architect] SW URL construction failed, falling back to relative path.');
        swUrl = './sw.js';
      }

      // Handle the first-time registration case
      navigator.serviceWorker.register(swUrl).then(registration => {
        const sw = registration.installing || registration.waiting || registration.active;
        if (sw) {
          if (sw.state === 'activated') {
            setSwReady(true);
          } else {
            sw.addEventListener('statechange', (e: any) => {
              if (e.target.state === 'activated') setSwReady(true);
            });
          }
        }
      }).catch(err => {
        // Log detailed error but don't crash the app
        console.warn('[Architect] SW Registration Error:', err.message);
      });
    }

    return () => {
      mediaQuery.removeEventListener('change', checkStandalone);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 3. Visibility Delay Logic
  // Only start the 3s delay once ALL prerequisites are met.
  useEffect(() => {
    let timer: number;
    
    const isReadyForPrompt = 
      swReady && 
      deferredPrompt && 
      !isStandalone && 
      isOnline && 
      !userDismissed;

    if (isReadyForPrompt) {
      // Delay visibility to ensure user has landed and is engaged (UX refinement)
      timer = window.setTimeout(() => {
        setIsVisible(true);
      }, 3500);
    } else {
      setIsVisible(false);
    }

    return () => clearTimeout(timer);
  }, [swReady, deferredPrompt, isStandalone, isOnline, userDismissed]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[Architect] PWA Protocol Outcome: ${outcome}`);
    setDeferredPrompt(null);
    setIsVisible(false);
  }, [deferredPrompt]);

  const dismiss = () => {
    setIsVisible(false);
    setUserDismissed(true); // Don't show again in this session
    setDeferredPrompt(null);
  };

  // STRICT RENDERING: Return null if any technical or UX condition is not met
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] w-[calc(100%-2rem)] max-w-lg animate-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <div className="bg-[#0d0e12] border border-white/10 rounded-[2.5rem] p-6 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden group">
        {/* Decorative background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />
        
        {/* Native App Icon Wrapper */}
        <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 relative z-10 border border-white/20">
          <Rocket size={32} strokeWidth={2.5} />
        </div>

        {/* Messaging Stack */}
        <div className="flex-1 text-center sm:text-left relative z-10">
          <h4 className="text-white font-black text-xs uppercase tracking-[0.25em] mb-1">Architect Desktop</h4>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-80">
            Localize your workflow suite for offline synthesis & zero-latency audit logs.
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={dismiss}
            className="p-3 text-gray-500 hover:text-white transition-colors active:scale-90"
            aria-label="Dismiss Installation"
          >
            <X size={20} />
          </button>
          <button 
            onClick={handleInstall}
            className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl active:scale-95 whitespace-nowrap flex items-center gap-2 border border-white/10"
          >
            <Download size={14} /> Install Suite
          </button>
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Critical Failure: Root mount point missing.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
    <PWAInstaller />
  </React.StrictMode>
);
