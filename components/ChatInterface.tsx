
import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I am **Escape Zone Assistant**. I'm here to provide precise guidance on your career, study abroad plans, or help you find your next favorite movie or anime. \n\nHow can I assist you today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    const currentHistory = [...messages];
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Pass history to maintain context
      const responseText = await geminiService.chat(input, currentHistory);
      const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      let errorMsg = "I'm having trouble connecting right now.";
      if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = "AI Quota Exceeded. I'm currently at my limit. Please try again in a few minutes.";
      }
      const aiMsg: ChatMessage = { role: 'model', text: errorMsg, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-slate-950/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="bg-slate-900/80 p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-white text-sm tracking-tight">Escape Zone Assistant</h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Neural Engine Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Smart Mode</span>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-xl ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-br-none' 
                : 'bg-slate-900/80 text-slate-200 rounded-bl-none border border-white/5'
            }`}>
              <div className="markdown-body text-sm leading-relaxed">
                <Markdown>{msg.text}</Markdown>
              </div>
              <div className={`text-[9px] mt-2 font-bold uppercase tracking-tighter opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-4 h-4 text-indigo-400" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start items-end gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl rounded-bl-none p-4 flex items-center gap-4">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Analyzing your request...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-900/50 border-t border-white/5">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a specific question about your career or entertainment..."
            className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-5 pr-16 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-600 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-30 disabled:grayscale text-white w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg active:scale-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[9px] text-center mt-3 text-slate-600 font-bold uppercase tracking-[0.2em]">
          Powered by Gemini 3.0 Pro Neural Engine
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
