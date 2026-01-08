
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { TerminalEntry } from '../types';
import { GoogleGenAI } from '@google/genai';
import { storage } from '../services/storageService';
import { 
  Terminal as TerminalIcon, 
  Send, 
  Trash2, 
  ChevronRight, 
  Cpu, 
  Clock, 
  ShieldCheck, 
  Database,
  Loader2,
  Lock,
  Key
} from 'lucide-react';

const TerminalView: React.FC = () => {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries]);

  const addEntry = (type: TerminalEntry['type'], content: string) => {
    setEntries(prev => [...prev, { id: crypto.randomUUID(), type, content, timestamp: Date.now() }]);
  };

  const processCommand = async (cmd: string) => {
    const [action, ...args] = cmd.split(' ');
    
    switch (action.toLowerCase()) {
      case 'help':
        addEntry('info', 'Available Commands:\n  help - Show this menu\n  clear - Wipe terminal history\n  set-key <provider> <key> - Store API key (e.g., set-key gemini YOUR_KEY)\n  test-key <provider> - Test stored API key\n  list-keys - Show configured providers\n  delete-key <provider> - Remove stored API key\n  exec <prompt> - Direct model execution');
        break;
      case 'clear':
        setEntries([]);
        break;
      case 'set-key':
        await handleSetKey(args);
        break;
      case 'test-key':
        await handleTestKey(args);
        break;
      case 'list-keys':
        await handleListKeys();
        break;
      case 'delete-key':
        await handleDeleteKey(args);
        break;
      case 'exec':
        await executeAI(args.join(' '));
        break;
      default:
        await executeAI(cmd); // Default to direct execution
    }
  };

  const executeAI = async (prompt: string) => {
    setIsExecuting(true);
    try {
      // First check for locally stored key
      let apiKey = await storage.getSecureKey('gemini');
      
      // Fallback to environment variable
      if (!apiKey) {
        apiKey = process.env.API_KEY || null;
      }

      if (!apiKey) {
        throw new Error("No API key configured. Use 'set-key gemini YOUR_KEY' to configure.");
      }

      // Direct usage of GoogleGenAI per guidelines
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      addEntry('response', response.text || "Execution complete. No output payload.");
    } catch (err: any) {
      addEntry('error', `Kernel Panic: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSetKey = async (args: string[]) => {
    if (args.length < 2) {
      addEntry('error', 'Usage: set-key <provider> <api_key>\nExample: set-key gemini AIza...');
      return;
    }

    const [provider, ...keyParts] = args;
    const apiKey = keyParts.join(' ').trim();

    try {
      await storage.saveSecureKey(provider, apiKey);
      const masked = maskKey(apiKey);
      addEntry('response', `✓ API key for '${provider}' stored securely.\nKey: ${masked}\nUse 'test-key ${provider}' to verify.`);
    } catch (err: any) {
      addEntry('error', `Failed to store key: ${err.message}`);
    }
  };

  const handleTestKey = async (args: string[]) => {
    if (args.length < 1) {
      addEntry('error', 'Usage: test-key <provider>\nExample: test-key gemini');
      return;
    }

    const provider = args[0].toLowerCase();
    setIsExecuting(true);

    try {
      const apiKey = await storage.getSecureKey(provider);
      if (!apiKey) {
        addEntry('error', `No API key found for provider '${provider}'.\nUse 'set-key ${provider} YOUR_KEY' first.`);
        return;
      }

      // Test the key with a simple API call
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Respond with: OK'
      });

      if (response.text) {
        addEntry('response', `✓ API key for '${provider}' is valid and working.\nTest response: ${response.text}`);
      } else {
        addEntry('error', `API key for '${provider}' returned empty response.`);
      }
    } catch (err: any) {
      addEntry('error', `API key test failed for '${provider}': ${err.message}\nVerify your key and try again.`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleListKeys = async () => {
    try {
      const providers = await storage.listSecureKeys();
      if (providers.length === 0) {
        addEntry('info', 'No API keys stored.\nUse \'set-key <provider> <key>\' to add one.');
      } else {
        const list = providers.map(p => `  • ${p}`).join('\n');
        addEntry('info', `Configured Providers:\n${list}\n\nUse 'test-key <provider>' to verify.`);
      }
    } catch (err: any) {
      addEntry('error', `Failed to list keys: ${err.message}`);
    }
  };

  const handleDeleteKey = async (args: string[]) => {
    if (args.length < 1) {
      addEntry('error', 'Usage: delete-key <provider>\nExample: delete-key gemini');
      return;
    }

    const provider = args[0].toLowerCase();

    try {
      const deleted = await storage.deleteSecureKey(provider);
      if (deleted) {
        addEntry('response', `✓ API key for '${provider}' removed successfully.`);
      } else {
        addEntry('info', `No API key found for provider '${provider}'.`);
      }
    } catch (err: any) {
      addEntry('error', `Failed to delete key: ${err.message}`);
    }
  };

  const maskKey = (key: string): string => {
    if (key.length <= 8) return '****';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

  const handleSubmit = async () => {
    if (!input.trim() || isExecuting) return;
    const cmd = input.trim();
    addEntry('command', cmd);
    setInput('');
    await processCommand(cmd);
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in">
      <div className="flex-1 flex flex-col bg-[#0d0e12] rounded-[3rem] border border-gray-800 shadow-2xl overflow-hidden relative">
        <div className="px-8 py-5 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            </div>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">API Terminal Kernel v2.5</span>
          </div>
          <div className="flex items-center gap-3 text-white/20">
            <Lock size={14} />
            <span className="text-[9px] font-bold uppercase">Secured Environment Execution</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 font-mono text-xs custom-scrollbar space-y-6">
          {entries.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-indigo-400 gap-4">
              <TerminalIcon size={64} strokeWidth={1} />
              <p className="uppercase tracking-[0.5em] text-[10px] font-black">Type 'help' to begin session</p>
            </div>
          )}
          {entries.map(entry => (
            <div key={entry.id} className={`flex gap-4 animate-in ${
              entry.type === 'error' ? 'text-red-400' : 
              entry.type === 'command' ? 'text-indigo-400' : 
              entry.type === 'response' ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              <div className="shrink-0 pt-1">
                {entry.type === 'command' ? <ChevronRight size={14} /> : 
                 entry.type === 'response' ? <Cpu size={14} /> : <Clock size={14} />}
              </div>
              <div className="flex-1 whitespace-pre-wrap leading-relaxed">
                {entry.type === 'command' && <span className="text-white/20 mr-2">arch@vault:~$</span>}
                {entry.content}
              </div>
            </div>
          ))}
          {isExecuting && (
             <div className="flex items-center gap-3 text-indigo-400/60 font-mono">
               <Loader2 className="animate-spin" size={14} />
               <span className="animate-pulse">Fetching Neural Context...</span>
             </div>
          )}
        </div>

        <div className="p-8 bg-black/40 border-t border-white/5">
          <div className="relative group">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="arch@vault:~$ help"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-indigo-300 font-mono text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all"
            />
            <button 
              onClick={handleSubmit}
              className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white px-6 rounded-xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalView;
