import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, Sparkles, Loader2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { speechService } from '../services/SpeechService';
import { useAuth } from '../context/AuthContext';
import { ISLANDS } from '../constants';

export default function ReportCardScanner({ onComplete }: { onComplete: () => void }) {
  const { profile, updateProfile } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const base64 = image.split(',')[1];
      const result = await geminiService.analyzeReportCard(base64);
      setAnalysis(result.analysis);
      
      await updateProfile({
        reportCardAnalysis: result.analysis,
        focusArea: result.focusArea
      });

      speechService.speak(result.analysis, profile?.voiceType || 'female');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-[3rem] p-8 shadow-2xl border-b-[12px] border-blue-100 flex flex-col items-center">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-chunky text-blue-600 mb-2 uppercase transform -rotate-1">Report Card Lab</h2>
        <p className="text-navy font-bold opacity-60 uppercase tracking-widest text-xs">Let's see how much you've grown!</p>
      </div>

      <AnimatePresence mode="wait">
        {!image ? (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6"
          >
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-64 h-64 border-8 border-dashed border-blue-100 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors group"
            >
              <div className="bg-blue-100 p-6 rounded-full group-hover:scale-110 transition-transform">
                <Upload size={48} className="text-blue-500" />
              </div>
              <p className="mt-4 font-chunky text-blue-400">UPLOAD PHOTO</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </motion.div>
        ) : !analysis ? (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <img src={image} alt="Report Card" className="w-64 h-64 object-cover rounded-[3rem] border-8 border-white shadow-xl" />
              <button 
                onClick={() => setImage(null)}
                className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full border-4 border-white shadow-lg"
              >
                ✕
              </button>
            </div>
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-chunky py-5 px-10 rounded-[2rem] text-2xl shadow-xl transition-all border-b-[8px] border-blue-700 active:scale-95 flex items-center justify-center gap-3"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles />}
              {isProcessing ? 'SCANNING...' : 'ANALYZE NOW'}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-6 mt-4 w-full"
          >
            <div className="bg-emerald-100 p-8 rounded-[3rem] border-8 border-white shadow-inner relative overflow-hidden w-full">
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Check size={32} className="text-emerald-500" />
                 </div>
                 <h3 className="text-2xl font-chunky text-emerald-700 mb-2">SCAN COMPLETE!</h3>
                 <p className="text-navy font-bold text-lg leading-relaxed mb-4">{analysis}</p>
                 
                 <div className="bg-white/60 backdrop-blur p-4 rounded-2xl border-2 border-white inline-block">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Your Growth Mission</p>
                    <p className="text-2xl font-chunky text-navy uppercase drop-shadow-sm">
                      {profile?.focusArea || 'General Expert'}
                    </p>
                 </div>
               </div>
               
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                 className="absolute -bottom-10 -right-10 text-emerald-200/50"
               >
                 <Sparkles size={120} />
               </motion.div>
            </div>

            <div className="w-full text-left">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
                <Star size={14} className="text-yellow-400" fill="currentColor" />
                Recommended Missions for You
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ISLANDS.find(i => i.id === `grade${profile?.gradeLevel || 1}`)?.lessons
                  .filter(l => {
                    const area = (profile?.focusArea || '').toLowerCase();
                    if (area.includes('spell')) return l.type === 'spelling' || l.type === 'writing';
                    if (area.includes('read')) return l.type === 'reading';
                    if (area.includes('write')) return l.type === 'writing';
                    return l.type === 'quiz';
                  })
                  .slice(0, 4)
                  .map(lesson => (
                    <div key={lesson.id} className="bg-white p-4 rounded-2xl border-4 border-gray-100 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                        {lesson.type === 'reading' ? '📖' : lesson.type === 'writing' ? '✍️' : '🧠'}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-tight">{lesson.type}</p>
                        <p className="font-bold text-navy truncate w-32">{lesson.title}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
            
            <button 
              onClick={onComplete}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-chunky py-5 rounded-[2rem] text-2xl shadow-xl transition-all border-b-[8px] border-emerald-700 active:scale-95 mt-4"
            >
              ACCEPT MISSION!
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
