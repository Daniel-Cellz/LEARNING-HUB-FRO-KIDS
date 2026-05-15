import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { ISLANDS } from '../constants';
import { Cloud, Star, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface WorldMapProps {
  onSelectLesson: (islandId: string, lessonId: string) => void;
  selectedMode?: 'reading' | 'writing' | 'spelling' | null;
}

const LESSONS_PER_PAGE = 8;

export default function WorldMap({ onSelectLesson, selectedMode }: WorldMapProps) {
  const { profile } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const currentIsland = ISLANDS.find(i => i.id === `grade${profile?.gradeLevel || 1}`) || ISLANDS[0];

  const lessons = currentIsland.lessons.filter(l => {
    if (!selectedMode) return true;
    if (selectedMode === 'reading') return l.type === 'reading' || l.type === 'quiz';
    if (selectedMode === 'writing') return l.type === 'writing';
    if (selectedMode === 'spelling') return l.type === 'spelling';
    return true;
  });

  const totalPages = Math.ceil(lessons.length / LESSONS_PER_PAGE);
  const startIndex = currentPage * LESSONS_PER_PAGE;
  const currentLessons = lessons.slice(startIndex, startIndex + LESSONS_PER_PAGE);

  // Reset page if mode changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [selectedMode]);

  return (
    <div className="relative w-full min-h-[500px] lg:h-[650px] overflow-hidden bg-sky-light rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-white shadow-2xl flex flex-col items-center p-4 md:p-8">
      {/* Background Clouds */}
      <motion.div 
        className="absolute top-10 left-10 text-white/50 animate-floating hidden sm:block"
      >
        <Cloud size={80} />
      </motion.div>
      <motion.div 
        className="absolute top-40 right-20 text-white/50 animate-floating hidden md:block"
        style={{ animationDelay: '-2s' }}
      >
        <Cloud size={100} />
      </motion.div>

      {/* Island Info */}
      <div className="relative z-10 flex flex-col items-center mb-4 md:mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={`w-20 h-20 md:w-32 md:h-32 ${currentIsland.color} rounded-t-full rounded-b-[1rem] md:rounded-b-[2rem] flex items-center justify-center text-3xl md:text-6xl shadow-xl border-2 md:border-4 border-white mb-2 md:mb-4`}
          >
            <span>{currentIsland.icon}</span>
          </motion.div>
          <div className="bg-white px-3 md:px-6 py-1 md:py-2 rounded-xl md:rounded-2xl shadow-lg font-chunky text-sm md:text-xl text-navy border-2 md:border-4 border-gray-100 uppercase">
            {currentIsland.name}
          </div>
          {selectedMode && (
            <div className="mt-2 bg-blue-500 text-white px-4 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-md">
              Mode: {selectedMode}
            </div>
          )}
      </div>

      {/* Lesson Grid with Pagination */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center gap-4 md:gap-6">
        <div className="w-full max-w-[900px] min-h-[220px] md:min-h-[350px]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${currentPage}-${selectedMode}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 w-full"
            >
              {currentLessons.map((lesson, idx) => {
                const isRecommended = (() => {
                  if (!profile?.focusArea) return false;
                  const area = profile.focusArea.toLowerCase();
                  if (area.includes('spell')) return lesson.type === 'spelling';
                  if (area.includes('read')) return lesson.type === 'reading';
                  if (area.includes('write')) return lesson.type === 'writing';
                  return false;
                })();

                return (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(currentIsland.id, lesson.id)}
                    className={`bg-white hover:bg-yellow-50 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-md border-2 md:border-4 transition-all hover:-translate-y-1 uppercase flex flex-col items-center justify-center text-center gap-2 min-h-[90px] md:min-h-[140px] relative overflow-hidden ${
                      isRecommended ? 'border-emerald-400 ring-2 ring-emerald-100 ring-offset-2' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1 md:gap-2">
                       <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-black">LVL {startIndex + idx + 1}</span>
                       <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-50 rounded-lg md:rounded-xl flex items-center justify-center text-xl md:text-3xl">
                          {lesson.type === 'reading' ? '📖' : lesson.type === 'writing' ? '✍️' : lesson.type === 'spelling' ? '🧠' : '❓'}
                       </div>
                    </div>
                    <span className="line-clamp-2 text-navy text-[10px] md:text-sm font-chunky leading-tight max-w-[120px]">{lesson.title}</span>
                    
                    {isRecommended && (
                      <div className="absolute top-0 right-0 p-1 md:p-2">
                        <Sparkles size={12} className="text-emerald-500" />
                      </div>
                    )}
                  </button>
                );
              })}
              {currentLessons.length === 0 && (
                <div className="col-span-full flex flex-col items-center gap-4 py-12">
                   <div className="text-6xl">🐢</div>
                   <p className="font-chunky text-gray-400 uppercase">No lessons in this mode yet!</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3 md:gap-6 mt-2 md:mt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 md:p-3 bg-white hover:bg-blue-50 rounded-full shadow-lg border-2 md:border-4 border-white disabled:opacity-30 transition-all active:scale-90"
            >
              <ChevronLeft size={24} md:size={32} className="text-blue-500" />
            </button>
            
            <div className="bg-white px-4 md:px-6 py-1 md:py-2 rounded-full shadow-inner border-2 md:border-4 border-white font-chunky text-blue-400 text-[10px] md:text-sm">
              PAGE {currentPage + 1} OF {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-2 md:p-3 bg-white hover:bg-blue-50 rounded-full shadow-lg border-2 md:border-4 border-white disabled:opacity-30 transition-all active:scale-90"
            >
              <ChevronRight size={24} md:size={32} className="text-blue-500" />
            </button>
          </div>
        )}
      </div>

      {/* HUD Info */}
      <div className="relative mt-8 md:absolute md:bottom-6 md:left-6 flex flex-wrap gap-2 md:gap-4 font-chunky">
        <div className="bg-white/90 backdrop-blur rounded-2xl md:rounded-3xl p-2 md:p-4 flex items-center gap-2 md:gap-3 border-2 md:border-4 border-white shadow-xl md:shadow-2xl">
          <div className="bg-yellow-400 p-1 md:p-2 rounded-full text-white shadow-inner">
            <Star size={14} md:size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-[6px] md:text-[8px] text-gray-400 uppercase tracking-widest leading-none mb-1">Stars</p>
            <p className="text-sm md:text-xl text-navy tabular-nums">{profile?.starCoins || 0}</p>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-2xl md:rounded-3xl p-2 md:p-4 flex items-center gap-2 md:gap-3 border-2 md:border-4 border-white shadow-xl md:shadow-2xl">
          <div className="bg-blue-500 p-1 md:p-2 rounded-full text-white shadow-inner">
            <Cloud size={14} md:size={20} fill="currentColor" />
          </div>
          <div>
            <p className="text-[6px] md:text-[8px] text-gray-400 uppercase tracking-widest leading-none mb-1">Energy</p>
            <p className="text-sm md:text-xl text-navy tabular-nums">{profile?.cloudEnergy || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
