
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recommendation } from '../types';
import { Play, X, Star, Info } from 'lucide-react';

interface Props {
  item: Recommendation;
}

const RecommendationCard: React.FC<Props> = ({ item }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleTrailer = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsTrailerOpen(!isTrailerOpen);
  };

  const getFallbackImage = () => {
    return `https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop`; 
  };

  const imageUrl = item.imageUrl && item.imageUrl.startsWith('http') 
    ? `${item.imageUrl}${item.imageUrl.includes('?') ? '&' : '?'}auto=format&fit=crop&w=1200&q=80` 
    : getFallbackImage();

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        onClick={imageLoaded ? toggleModal : undefined}
        className={`bg-slate-900/40 border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 group relative flex flex-col h-full shadow-2xl ${
          imageLoaded ? 'hover:border-indigo-500/50 cursor-pointer active:scale-[0.98]' : 'cursor-default'
        }`}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 z-20 flex flex-col pointer-events-none">
            <div className="h-64 shimmer relative overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin"></div>
               </div>
            </div>
            <div className="p-8 flex-1 space-y-4 bg-slate-900/40">
              <div className="h-8 w-3/4 shimmer rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 w-full shimmer rounded-lg"></div>
                <div className="h-4 w-5/6 shimmer rounded-lg"></div>
              </div>
              <div className="flex gap-2 pt-4">
                <div className="h-6 w-16 shimmer rounded-lg"></div>
                <div className="h-6 w-20 shimmer rounded-lg"></div>
              </div>
            </div>
          </div>
        )}

        <div className={`flex flex-col h-full transition-all duration-500 ease-out ${
          imageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <div className="relative h-64 overflow-hidden bg-slate-800">
            <img 
              src={imageUrl} 
              alt={item.title}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                imageLoaded ? 'group-hover:scale-105' : ''
              }`}
            />
            
            {/* Overlay Controls */}
            <div className="absolute top-5 right-5 flex flex-col gap-2 items-end z-30">
              <div className="flex gap-2">
                <div className="glass text-white text-[11px] font-black px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {item.ratingIMDb}
                </div>
                <div className="glass text-white text-[11px] font-black px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
                  <span className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">🍅</span> {item.ratingRottenTomatoes}
                </div>
              </div>
              <span className="bg-slate-950/80 text-slate-400 text-[10px] font-black px-3 py-1.5 rounded-xl shadow-xl uppercase tracking-widest border border-white/5">
                {item.releaseYear}
              </span>
            </div>

            <div className="absolute bottom-5 left-5 z-30">
              <span className="bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] uppercase font-black px-4 py-2 rounded-full shadow-lg tracking-widest">
                {item.type}
              </span>
            </div>

            {/* Central Play Button - Always visible but subtle, pops on hover */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <button 
                onClick={toggleTrailer}
                className="group/play-btn relative flex items-center justify-center transition-all duration-500 hover:scale-110"
                aria-label={`Play trailer for ${item.title}`}
              >
                <div className="absolute inset-0 bg-indigo-600 rounded-full blur-2xl opacity-0 group-hover/play-btn:opacity-40 transition-opacity duration-500"></div>
                <div className="w-16 h-16 bg-white/10 hover:bg-indigo-600 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-2xl transition-colors duration-300">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/play-btn:opacity-100 transition-all duration-300 translate-y-2 group-hover/play-btn:translate-y-0">
                  <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-2xl whitespace-nowrap">
                    Play Trailer
                  </span>
                </div>
              </button>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
          </div>

          <div className="p-8 flex-1 flex flex-col">
            <h3 className="text-2xl font-black text-white mb-4 line-clamp-1 group-hover:text-indigo-400 transition-colors duration-500 tracking-tight leading-tight">
              {item.title}
            </h3>
            <p className="text-slate-400 text-sm line-clamp-2 mb-8 h-10 leading-relaxed font-medium">
              {item.description}
            </p>
            
            <div className="mt-auto flex items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {item.genres.slice(0, 2).map((genre, idx) => (
                  <span key={idx} className="text-[9px] font-black bg-slate-800/80 text-slate-300 border border-white/5 px-3 py-1.5 rounded-xl uppercase tracking-tighter">
                    {genre}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleModal}
                  className="p-2.5 rounded-2xl bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/5 transition-all"
                  aria-label="View Details"
                >
                  <Info className="w-5 h-5" />
                </button>
                <a 
                  href={item.trailerUrl.replace('/embed/', '/watch?v=')}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2.5 rounded-2xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/20 transition-all flex items-center justify-center"
                  aria-label="Watch on YouTube"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
                <button 
                  onClick={toggleTrailer}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 group/trailer-btn"
                  aria-label={`Play trailer for ${item.title}`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Trailer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isModalOpen && !isTrailerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl"
            onClick={toggleModal}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-slate-900 border border-white/10 w-full max-w-3xl rounded-[3.5rem] overflow-hidden shadow-[0_0_120px_rgba(99,102,241,0.15)] relative"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="relative h-[24rem] sm:h-[30rem] bg-slate-800">
              <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent"></div>
              <button 
                onClick={toggleModal}
                className="absolute top-8 right-8 bg-slate-950/80 hover:bg-white hover:text-slate-950 text-white p-4 rounded-[1.5rem] transition-all duration-500 border border-white/10 shadow-2xl z-20"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center">
                 <button 
                    onClick={toggleTrailer}
                    className="w-24 h-24 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-90 group/bigplay"
                  >
                    <Play className="w-10 h-10 fill-current ml-1 group-hover/bigplay:scale-110 transition-transform" />
                 </button>
              </div>
              <div className="absolute bottom-10 left-10 right-10 space-y-4">
                <span className="bg-indigo-600 text-white text-[11px] uppercase font-black px-6 py-2 rounded-full w-fit shadow-2xl tracking-[0.2em]">
                  {item.type}
                </span>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none drop-shadow-2xl">{item.title}</h2>
              </div>
            </div>
            
            <div className="p-10 md:p-14 space-y-10">
              <div className="grid grid-cols-3 gap-8 bg-slate-950/40 p-8 rounded-[2rem] border border-white/5">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">IMDb</span>
                  <span className="text-3xl font-black text-yellow-500 flex items-center gap-2"><Star className="w-5 h-5 fill-yellow-500" />{item.ratingIMDb}</span>
                </div>
                <div className="flex flex-col items-center border-x border-white/5 px-8">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Rotten</span>
                  <span className="text-3xl font-black text-red-500 flex items-center gap-2"><span className="text-xl">🍅</span>{item.ratingRottenTomatoes}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Year</span>
                  <span className="text-3xl font-black text-white">{item.releaseYear}</span>
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3"><div className="w-8 h-[2px] bg-indigo-500 rounded-full"></div> THE STORY</h4>
                <p className="text-slate-300 leading-relaxed text-xl font-medium antialiased">{item.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {item.genres.map((genre, idx) => (
                  <span key={idx} className="text-[11px] font-black bg-slate-800 text-slate-400 border border-white/5 px-6 py-3 rounded-2xl uppercase tracking-widest">{genre}</span>
                ))}
              </div>
              <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button 
                    onClick={toggleTrailer}
                    className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-3"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    In-App Trailer
                  </button>
                  <a 
                    href={item.trailerUrl.replace('/embed/', '/watch?v=')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-red-500/30 flex items-center justify-center gap-3"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                    YouTube
                  </a>
                </div>
                <button 
                  onClick={toggleModal}
                  className="w-full sm:w-auto bg-white hover:bg-slate-200 text-slate-950 px-8 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Trailer Video Player Modal */}
      <AnimatePresence>
        {isTrailerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-0 bg-black/95 backdrop-blur-3xl"
            onClick={toggleTrailer}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="w-full max-w-6xl aspect-video relative rounded-none sm:rounded-[2rem] overflow-hidden bg-black shadow-[0_0_150px_rgba(99,102,241,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
            <button 
              onClick={toggleTrailer}
              className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 text-white p-4 rounded-2xl transition-all duration-300 border border-white/10 backdrop-blur-xl"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe 
              src={`${item.trailerUrl}?autoplay=1`}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`${item.title} Trailer`}
            ></iframe>
            <div className="absolute bottom-6 left-6 pointer-events-none">
              <h2 className="text-white font-black text-2xl tracking-tighter drop-shadow-lg">{item.title} Official Trailer</h2>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
};

export default RecommendationCard;
