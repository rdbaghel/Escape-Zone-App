
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiService } from '../services/geminiService';

const topics = [
  { id: 'tech-career', title: 'Technical Career Paths', icon: '💻', color: 'indigo', description: 'Roadmaps for Software, AI, Data Science, and DevOps.' },
  { id: 'study-abroad', title: 'Study Abroad Guide', icon: '✈️', color: 'cyan', description: 'Process, scholarships, and best universities globally.' },
  { id: 'learning-strategies', title: 'Smart Learning', icon: '🧠', color: 'rose', description: 'How to learn complex technical subjects efficiently.' },
  { id: 'interview-prep', title: 'Interview Mastery', icon: '👔', color: 'emerald', description: 'Cracking technical interviews at top tech firms.' },
  { id: 'freelancing', title: 'Freelancing in Tech', icon: '🚀', color: 'amber', description: 'How to start, find clients, and scale your freelance technical business.' },
  { id: 'portfolio', title: 'Building a Portfolio', icon: '📁', color: 'violet', description: 'Crafting projects that stand out to recruiters and demonstrate real skills.' },
];

const AdviceSection: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [adviceContent, setAdviceContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFetchAdvice = async (topicTitle: string) => {
    setLoading(true);
    setAdviceContent(null);
    try {
      const result = await geminiService.getAdvice(topicTitle);
      setAdviceContent(result);
    } catch (err: any) {
      console.error(err);
      if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        setAdviceContent("AI Quota Exceeded. The service is currently at its limit. Please try again in a few minutes.");
      } else {
        setAdviceContent("Failed to load advice. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (adviceContent) {
      navigator.clipboard.writeText(adviceContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getColorClass = (color: string) => {
    const maps: any = {
      indigo: 'border-indigo-500/30 hover:border-indigo-500 hover:shadow-indigo-500/10',
      cyan: 'border-cyan-500/30 hover:border-cyan-500 hover:shadow-cyan-500/10',
      rose: 'border-rose-500/30 hover:border-rose-500 hover:shadow-rose-500/10',
      emerald: 'border-emerald-500/30 hover:border-emerald-500 hover:shadow-emerald-500/10',
      amber: 'border-amber-500/30 hover:border-amber-500 hover:shadow-amber-500/10',
      violet: 'border-violet-500/30 hover:border-violet-500 hover:shadow-violet-500/10',
    };
    return maps[color] || 'border-slate-700';
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {!selectedTopic ? (
          <motion.div 
            key="topics-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {topics.map((topic, index) => (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedTopic(topic.id);
                  handleFetchAdvice(topic.title);
                }}
                className={`bg-slate-900/40 border p-6 rounded-[2rem] text-left transition-all group relative overflow-hidden active:scale-95 hover:scale-[1.02] ${getColorClass(topic.color)}`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-500"></div>
                <div className="text-5xl mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 inline-block drop-shadow-2xl">{topic.icon}</div>
                <h3 className="text-xl font-extrabold text-white mb-3 group-hover:text-indigo-400 transition-colors">{topic.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{topic.description}</p>
                <div className="mt-6 flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">
                  Explore Roadmap <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="topic-detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 md:p-14 shadow-2xl relative overflow-hidden animate-scaleUp"
          >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <button 
              onClick={() => setSelectedTopic(null)}
              className="text-slate-400 hover:text-white flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] transition-all group active:scale-95"
            >
              <span className="bg-slate-800 p-2.5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">←</span> 
              <span>Back to Topics</span>
            </button>
            
            <div className="flex items-center gap-4">
               <div className="hidden md:flex flex-col text-right">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Curated Roadmap</span>
                  <span className="text-white font-bold text-sm">{topics.find(t => t.id === selectedTopic)?.title}</span>
               </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-10">
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-12px] border border-cyan-500/5 border-b-cyan-500/30 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="text-center">
                <motion.p 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-white font-black text-xl mb-2 tracking-tight"
                >
                  AI Neural Synthesis
                </motion.p>
                <p className="text-slate-500 text-sm font-medium">Drafting your personalized career path...</p>
              </div>
            </div>
          ) : (
            <div className="relative group/advice">
              {/* Contextual Copy Button positioned "next to" content */}
              <div className="absolute -top-6 right-0 z-20 flex items-center justify-end w-full sm:w-auto">
                <button 
                  onClick={copyToClipboard}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-500 font-black uppercase tracking-widest text-[10px] shadow-2xl backdrop-blur-xl border ${
                    copied 
                      ? 'bg-emerald-600 border-emerald-400 text-white translate-y-[-4px]' 
                      : 'bg-indigo-600 border-indigo-400 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                      <span>Copy Roadmap Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-medium text-lg antialiased selection:bg-indigo-500/30 p-8 rounded-[2rem] bg-slate-950/30 border border-white/5 shadow-inner">
                  {adviceContent}
                </div>
              </div>
              
              <div className="mt-12 flex justify-center">
                <button 
                  onClick={copyToClipboard}
                  className="text-slate-500 hover:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3"
                >
                  <div className="h-[1px] w-8 bg-slate-800"></div>
                  {copied ? 'Success' : 'Copy Content'}
                  <div className="h-[1px] w-8 bg-slate-800"></div>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default AdviceSection;
