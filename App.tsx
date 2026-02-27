
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSection, Recommendation } from './types';
import { geminiService } from './services/geminiService';
import RecommendationCard from './components/RecommendationCard';
import AdviceSection from './components/AdviceSection';
import ChatInterface from './components/ChatInterface';

const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance', 'Thriller', 'Animation'];
const YEARS = ['All', '2025', '2024', '2023', '2022', '2021', '2020', '2010s', '2000s'];

const Logo = ({ size = "md" }: { size?: "xs" | "sm" | "md" | "lg" }) => {
  const dimensions = size === "xs" ? "w-8 h-8" : size === "sm" ? "w-10 h-10" : size === "md" ? "w-14 h-14" : "w-32 h-32";
  const fontSize = size === "xs" ? "text-sm" : size === "sm" ? "text-xl" : size === "md" ? "text-3xl" : "text-7xl";
  
  return (
    <div className={`${dimensions} bg-gradient-to-br from-slate-50 via-slate-300 to-slate-400 rounded-[22%] flex items-center justify-center shadow-2xl relative overflow-hidden border border-white/40 group`}>
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
      
      <div className="relative flex items-center justify-center w-full h-full">
        <span className={`${fontSize} font-black text-blue-600 absolute -translate-x-[15%] -translate-y-[10%] drop-shadow-md transition-transform duration-500 group-hover:scale-110`}>E</span>
        <span className={`${fontSize} font-black text-blue-800 absolute translate-x-[15%] translate-y-[10%] drop-shadow-md transition-transform duration-500 group-hover:scale-110`}>Z</span>
      </div>
      
      {/* Shine effect */}
      <motion.div 
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
        className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
      />
    </div>
  );
};

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>(AppSection.RECOMMENDATIONS);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('Movies');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Extended loading for aesthetic intro sequence
    const timer = setTimeout(() => setIsInitialLoading(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  const fetchRecommendations = async (cat: string, query?: string, genre?: string, year?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await geminiService.getRecommendations(cat, query, genre, year);
      setRecommendations(data);
    } catch (err: any) {
      console.error("Error fetching recommendations", err);
      if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        setError("AI Quota Exceeded. Please try again in a few minutes.");
      } else {
        setError("Failed to fetch recommendations. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === AppSection.RECOMMENDATIONS) {
      fetchRecommendations(category, searchQuery, selectedGenre, selectedYear);
    }
  }, [category, activeSection, selectedGenre, selectedYear]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations(category, searchQuery, selectedGenre, selectedYear);
  };

  const NavItem = ({ icon, label, section }: { icon: string, label: string, section: AppSection }) => {
    const isActive = activeSection === section;
    return (
      <button 
        onClick={() => setActiveSection(section)}
        className="relative group w-full flex flex-col items-center py-6 gap-2"
      >
        {isActive && (
          <motion.div 
            layoutId="activeNavIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-r-full shadow-[0_0_20px_rgba(99,102,241,0.8)]" 
          />
        )}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${
          isActive 
            ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white scale-110 shadow-[0_10px_30px_rgba(99,102,241,0.5)]' 
            : 'bg-slate-800/50 text-slate-500 group-hover:bg-slate-700/80 group-hover:text-slate-300 group-hover:scale-105'
        }`}>
          {icon}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${
          isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'
        }`}>
          {label}
        </span>
      </button>
    );
  };

  const MobileQuickAction = ({ icon, label, section }: { icon: string, label: string, section: AppSection }) => (
    <button 
      onClick={() => setActiveSection(section)}
      className="flex flex-col items-center gap-1 group"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 shadow-xl ${
        activeSection === section 
          ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white scale-110 shadow-indigo-500/40' 
          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
      }`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-tighter ${activeSection === section ? 'text-indigo-400' : 'text-slate-500'}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Animated Background Elements */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]"
            />

            <div className="relative flex flex-col items-center">
              {/* Letter by Letter Animation */}
              <div className="flex mb-12">
                {"ESCAPE ZONE".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ 
                      delay: 1.5 + (i * 0.25), 
                      duration: 1.2,
                      ease: [0.2, 0.65, 0.3, 0.9]
                    }}
                    className={`text-5xl md:text-7xl font-black text-white tracking-tighter inline-block ${char === ' ' ? 'mx-4' : ''}`}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* Final Logo Reveal */}
              <motion.div 
                initial={{ scale: 0, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ 
                  delay: 6.5, 
                  duration: 1.5, 
                  type: "spring", 
                  damping: 15 
                }}
                className="relative flex items-center justify-center"
              >
                {/* Main Logo Container */}
                <motion.div 
                  animate={{ 
                    boxShadow: ["0 0 20px rgba(148,163,184,0.3)", "0 0 60px rgba(148,163,184,0.6)", "0 0 20px rgba(148,163,184,0.3)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="z-10 relative"
                >
                  <Logo size="lg" />
                </motion.div>
                
                {/* Orbital Rings */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-8 border-2 border-indigo-500/10 border-t-indigo-500/40 rounded-full"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-14 border border-cyan-500/5 border-b-cyan-500/20 rounded-full"
                />

                {/* Cinema Icons floating around the logo - Positioned carefully to not overlap */}
                <motion.div 
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    x: -120, 
                    y: -100, 
                    scale: 1,
                    translateY: [0, -10, 0]
                  }}
                  transition={{ 
                    opacity: { delay: 8, duration: 1 },
                    x: { delay: 8, duration: 1.5, type: "spring" },
                    y: { delay: 8, duration: 1.5, type: "spring" },
                    scale: { delay: 8, duration: 1.5, type: "spring" },
                    translateY: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] z-20"
                >🎬</motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    x: 120, 
                    y: -100, 
                    scale: 1,
                    translateY: [0, 10, 0]
                  }}
                  transition={{ 
                    opacity: { delay: 8.3, duration: 1 },
                    x: { delay: 8.3, duration: 1.5, type: "spring" },
                    y: { delay: 8.3, duration: 1.5, type: "spring" },
                    scale: { delay: 8.3, duration: 1.5, type: "spring" },
                    translateY: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] z-20"
                >🎥</motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    x: -120, 
                    y: 100, 
                    scale: 1,
                    translateY: [0, -15, 0]
                  }}
                  transition={{ 
                    opacity: { delay: 8.6, duration: 1 },
                    x: { delay: 8.6, duration: 1.5, type: "spring" },
                    y: { delay: 8.6, duration: 1.5, type: "spring" },
                    scale: { delay: 8.6, duration: 1.5, type: "spring" },
                    translateY: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] z-20"
                >🍿</motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    x: 120, 
                    y: 100, 
                    scale: 1,
                    translateY: [0, 15, 0]
                  }}
                  transition={{ 
                    opacity: { delay: 8.9, duration: 1 },
                    x: { delay: 8.9, duration: 1.5, type: "spring" },
                    y: { delay: 8.9, duration: 1.5, type: "spring" },
                    scale: { delay: 8.9, duration: 1.5, type: "spring" },
                    translateY: { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="absolute text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] z-20"
                >🎞️</motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 10, duration: 1.5 }}
                className="mt-16 text-center space-y-4"
              >
                <div className="flex flex-col items-center gap-2 justify-center">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 11, duration: 1 }}
                    className="px-6 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full backdrop-blur-md"
                  >
                    <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.4em]">Created by <span className="text-white">Dev Baghel</span></p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 12, duration: 1.5, type: "spring" }}
                    className="relative"
                  >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-serif italic text-2xl tracking-widest">for Cinephile</span>
                    <motion.div 
                      animate={{ scaleX: [0, 1, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                    />
                  </motion.div>
                </div>
                
                <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden mx-auto mt-8">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ delay: 10, duration: 5, ease: "easeInOut" }}
                    className="w-full h-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                  />
                </div>
              </motion.div>
            </div>

            {/* Aesthetic Floating Particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: Math.random() * window.innerHeight,
                  opacity: 0 
                }}
                animate={{ 
                  y: [null, Math.random() * -100],
                  opacity: [0, 0.3, 0]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 4, 
                  repeat: Infinity, 
                  delay: Math.random() * 5 
                }}
                className="absolute w-1 h-1 bg-indigo-400 rounded-full pointer-events-none"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Orbs */}
      <div className="fixed top-0 -left-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="fixed top-0 -right-4 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed -bottom-8 left-20 w-72 h-72 bg-rose-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>

      {/* Desktop Left Sidebar Navigation */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-28 bg-slate-950/80 backdrop-blur-2xl border-r border-white/5 flex-col py-8 z-[70] items-center">
        <div 
          className="mb-12 cursor-pointer hover:rotate-6 transition-transform"
          onClick={() => setActiveSection(AppSection.RECOMMENDATIONS)}
        >
          <Logo size="md" />
        </div>

        <div className="flex-1 w-full space-y-4">
          <NavItem icon="🎬" label="Ent" section={AppSection.RECOMMENDATIONS} />
          <NavItem icon="🎓" label="Career" section={AppSection.ADVICE} />
          <NavItem icon="💬" label="Chat" section={AppSection.CHAT} />
        </div>

        <div className="mt-auto pt-8 flex flex-col gap-4 items-center">
          <div className="flex flex-col items-center gap-2 mb-4">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">Developed by</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter [writing-mode:vertical-rl] rotate-180">Dev Baghel</span>
          </div>
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
        </div>
      </aside>

      {/* Main Container Adjustment for Sidebar */}
      <div className="flex-1 md:pl-28 flex flex-col">
        {/* Header (Branding & Status Only) */}
        <header className="sticky top-0 z-[60] bg-slate-950/70 backdrop-blur-xl border-b border-white/5">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 md:hidden">
              <Logo size="sm" />
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-white tracking-tight leading-none">Escape Zone</span>
                <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">by Dev Baghel</span>
              </div>
            </div>

            <div className="hidden md:flex flex-col">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Module</span>
              <span className="text-white font-bold text-sm">
                {activeSection === AppSection.RECOMMENDATIONS ? 'Entertainment Explorer' : 
                 activeSection === AppSection.ADVICE ? 'Career Strategist' : 'Assistant Terminal'}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">Gemini 3.0 Pro</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Neural Engine Engaged</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Floating Bottom Nav */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-slate-900/90 backdrop-blur-2xl px-6 py-3 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-8">
          <MobileQuickAction icon="🎬" label="Ent" section={AppSection.RECOMMENDATIONS} />
          <MobileQuickAction icon="🎓" label="Career" section={AppSection.ADVICE} />
          <MobileQuickAction icon="💬" label="Chat" section={AppSection.CHAT} />
        </div>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-6 py-10 pb-24 md:pb-10 z-10">
          <AnimatePresence mode="wait">
            {activeSection === AppSection.RECOMMENDATIONS && (
              <motion.div 
                key="recommendations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-10"
              >
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                  <div className="max-w-xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                      <span className="text-indigo-500">Binge-worthy</span><br />Masterpieces
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">A curated sanctuary for the modern connoisseur. Escape reality through elite cinema, series, and anime, while future-proofing your professional path with intelligent AI career assistance.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 shadow-xl">
                      {['Movies', 'Web-Series', 'Anime'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => { setCategory(cat); setSelectedGenre('All'); setSelectedYear('All'); }}
                          className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                            category === cat 
                              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_5px_20px_rgba(99,102,241,0.4)] scale-105' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <form onSubmit={handleSearch} className="relative flex-1 sm:w-80">
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${category}...`}
                        className="bg-slate-900/80 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-white shadow-xl backdrop-blur-sm"
                      />
                      <button type="submit" className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg active:scale-90">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Filter Section */}
                <div className="p-6 bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Genre</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map((g) => (
                        <button
                          key={g}
                          onClick={() => setSelectedGenre(g)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
                            selectedGenre === g 
                              ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                              : 'bg-slate-800/50 border-white/10 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Era</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {YEARS.map((y) => (
                        <button
                          key={y}
                          onClick={() => setSelectedYear(y)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
                            selectedYear === y 
                              ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                              : 'bg-slate-800/50 border-white/10 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-center">
                    <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{error}</h3>
                    <p className="text-slate-400 mb-6">The AI service is currently under heavy load or has reached its free tier limit.</p>
                    <button 
                      onClick={() => fetchRecommendations(category, searchQuery, selectedGenre, selectedYear)}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {loading && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 z-[100] origin-left"
                  />
                )}

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] h-[450px] overflow-hidden relative"
                      >
                        <div className="h-64 bg-slate-800/50 relative overflow-hidden">
                          <div className="absolute inset-0 skeleton-shimmer"></div>
                        </div>
                        <div className="p-8 space-y-4">
                          <div className="h-8 w-3/4 bg-slate-800/50 rounded-xl relative overflow-hidden">
                            <div className="absolute inset-0 skeleton-shimmer"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 w-full bg-slate-800/50 rounded-lg relative overflow-hidden">
                              <div className="absolute inset-0 skeleton-shimmer"></div>
                            </div>
                            <div className="h-4 w-5/6 bg-slate-800/50 rounded-lg relative overflow-hidden">
                              <div className="absolute inset-0 skeleton-shimmer"></div>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <div className="h-10 w-24 bg-slate-800/50 rounded-2xl relative overflow-hidden">
                              <div className="absolute inset-0 skeleton-shimmer"></div>
                            </div>
                            <div className="h-10 w-24 bg-slate-800/50 rounded-2xl relative overflow-hidden">
                              <div className="absolute inset-0 skeleton-shimmer"></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recommendations.map((item) => (
                      <RecommendationCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
                
                {!loading && recommendations.length === 0 && (
                  <div className="text-center py-32 bg-slate-900/20 rounded-3xl border-2 border-dashed border-white/10">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
                    <p className="text-slate-500">Try broadening your search or clearing filters.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeSection === AppSection.ADVICE && (
              <motion.div 
                key="advice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="mb-12 text-center max-w-3xl mx-auto">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-600/10 text-indigo-400 text-xs font-black uppercase tracking-widest mb-4 border border-indigo-500/20">Career & Knowledge</span>
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">Future-Proof Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Career</span></h1>
                  <p className="text-slate-400 text-lg leading-relaxed">Deep-dive into technical roadmaps, scholarship strategies, and high-performance learning tactics.</p>
                </div>
                <AdviceSection />
              </motion.div>
            )}

            {activeSection === AppSection.CHAT && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-10 text-center">
                   <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-600/10 text-emerald-400 text-xs font-black uppercase tracking-widest mb-4 border border-emerald-500/20">AI Support</span>
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Personal <span className="text-emerald-500">Concierge</span></h1>
                  <p className="text-slate-400 text-lg">Discuss your career plans or ask for quick media ratings in real-time.</p>
                </div>
                <ChatInterface />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-white/5 py-12 relative z-10 overflow-hidden mt-auto">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
               <Logo size="xs" />
               <span className="text-slate-400 font-bold text-sm">Escape Zone Guide</span>
            </div>
            <div className="text-slate-500 text-xs font-medium">
              &copy; 2025 Escape Zone Ecosystem &bull; Copyright belong to Rahul Dev Bagel
            </div>
            <div className="flex gap-4">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
