import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant, resetChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Card } from '../components/ui/Card';
import { Send, User, Sparkles, Loader2, Bot, Trash2, RefreshCw } from 'lucide-react';

const ChatbotView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const MAX_HISTORY = 30;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage].slice(-MAX_HISTORY));
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithAssistant(trimmedInput);
      const assistantMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'model',
        content: response,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage].slice(-MAX_HISTORY));
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`,
        role: 'model',
        content: err.message || "Advisor link interrupted.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-220px)] animate-in">
      <Card 
        className="h-full flex flex-col p-0 overflow-hidden rounded-[3rem] shadow-2xl border-slate-100" 
        title="Advisor AI"
        subtitle="Conversational API Strategy"
        headerAction={
          <div className="flex gap-4">
            <button 
              onClick={() => { resetChat(); setMessages([]); }} 
              className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-100"
            >
              <RefreshCw size={14} /> Reset Session
            </button>
          </div>
        }
      >
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20 custom-scrollbar"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-1000">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-[3rem] flex items-center justify-center shadow-inner relative">
                <div className="absolute inset-0 bg-indigo-400/5 rounded-[3rem] animate-ping" />
                <Bot size={48} />
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-black text-slate-800 tracking-tight">System Ready</h4>
                <p className="text-sm text-slate-400 max-w-sm mx-auto font-bold leading-relaxed uppercase tracking-widest">
                  Consult on OAuth flows, webhook security, or advanced LangChain patterns.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
              <div className={`flex gap-5 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100 text-slate-600'
                }`}>
                  {msg.role === 'user' ? <User size={22} /> : <Bot size={22} />}
                </div>
                <div className={`p-6 rounded-[2.5rem] text-sm font-semibold leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  <div className="whitespace-pre-wrap prose prose-slate max-w-none prose-sm font-semibold">{msg.content}</div>
                  <div className={`mt-4 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] rounded-tl-none shadow-lg flex items-center gap-5">
                <div className="flex gap-1.5">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Architecting Response...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-slate-100">
          <div className="flex gap-4 relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query the Advisor AI network..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-5 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 outline-none transition-all pr-20 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-2xl hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-xl shadow-indigo-500/30 active:scale-95 flex items-center justify-center ${loading ? 'cursor-not-allowed' : 'hover-lift'}`}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <div className="flex justify-center mt-5">
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em] flex items-center gap-2">
              <Sparkles size={12} className="text-indigo-400" />
              Gemini 3 Pro • Enterprise Neural Node
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatbotView;