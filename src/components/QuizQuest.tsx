import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Sparkles, Volume2, Timer, RotateCcw } from 'lucide-react';
import { speechService } from '../services/SpeechService';
import { useAuth } from '../context/AuthContext';

interface QuizQuestProps {
  content: string;
  onSuccess: (score: number, feedback: string) => void;
}

export default function QuizQuest({ content, onSuccess }: QuizQuestProps) {
  const { profile } = useAuth();
  
  // Parse content: Question | Option A | Option B | Option C | Correct Answer
  const [question, optA, optB, optC, answer] = content.split(' | ').map(s => s.trim());
  const options = [
    { label: 'A', text: optA.replace('A) ', '') },
    { label: 'B', text: optB.replace('B) ', '') },
    { label: 'C', text: optC.replace('C) ', '') }
  ];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && selectedOption === null && !isTimeUp) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && selectedOption === null) {
      setIsTimeUp(true);
      speechService.speak("Oh no! Time is up. Let's try again!", profile?.voiceType || 'female');
    }
  }, [timeLeft, selectedOption, isTimeUp, profile]);

  const handleSelect = (label: string) => {
    if (isCorrect !== null || isTimeUp) return;
    
    setSelectedOption(label);
    const correct = label === answer;
    setIsCorrect(correct);

    if (correct) {
      speechService.speak("Correct! You're a genius!", profile?.voiceType || 'female');
      setTimeout(() => onSuccess(1, "Perfect answer!"), 1500);
    } else {
      speechService.speak("Not quite. Let's try again!", profile?.voiceType || 'female');
      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
        setTimeLeft(30);
      }, 1500);
    }
  };

  const handleReset = () => {
    setTimeLeft(30);
    setIsTimeUp(false);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  if (isTimeUp) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 p-12 text-center animate-in zoom-in duration-300">
        <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center text-6xl shadow-xl">⏰</div>
        <div>
          <h2 className="text-4xl font-chunky text-red-500 mb-2">TIME IS UP!</h2>
          <p className="font-bold text-navy text-xl">Don't worry, you can do it!</p>
        </div>
        <button
          onClick={handleReset}
          className="bg-red-500 hover:bg-red-600 text-white font-chunky py-6 px-12 rounded-[2rem] text-3xl shadow-xl transition-all active:scale-95 border-b-[8px] border-red-700 flex items-center gap-4"
        >
          <RotateCcw size={32} /> TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 md:gap-8 p-4 md:p-8 max-w-2xl mx-auto w-full">
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-4 border-blue-100 shadow-sm">
          <Timer size={20} className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-blue-500'} />
          <span className={`font-chunky text-lg ${timeLeft <= 5 ? 'text-red-500' : 'text-navy'}`}>{timeLeft}s</span>
        </div>
        <div className="h-3 flex-1 mx-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 30) * 100}%` }}
            className={`h-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-blue-500'}`}
          />
        </div>
      </div>

      <div className="text-center w-full">
        <h2 className="text-3xl md:text-4xl font-chunky text-blue-600 mb-4 md:mb-6 uppercase tracking-tighter transform -rotate-1">QUIZ QUEST!</h2>
        
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-[6px] md:border-8 border-blue-50 shadow-2xl relative mb-6 md:mb-8">
           <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 md:px-6 py-1 md:py-2 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest border-2 md:border-4 border-white shadow-lg whitespace-nowrap">
             Challenge!
           </div>
           <p className="text-xl md:text-2xl font-bold text-navy leading-relaxed mb-4">{question}</p>
           <button 
             onClick={() => speechService.speak(question, profile?.voiceType || 'female')}
             className="p-2 md:p-3 bg-blue-100 text-blue-500 rounded-full hover:bg-blue-200 transition-colors shadow-sm"
           >
             <Volume2 size={20} md:size={24} />
           </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4 w-full">
          {options.map((opt) => (
            <motion.button
              key={opt.label}
              whileHover={isCorrect === null ? { scale: 1.01 } : {}}
              whileTap={isCorrect === null ? { scale: 0.99 } : {}}
              onClick={() => handleSelect(opt.label)}
              className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-left flex items-center justify-between border-2 md:border-4 transition-all shadow-md relative overflow-hidden ${
                selectedOption === opt.label
                  ? isCorrect 
                    ? 'bg-green-500 border-green-300 text-white shadow-green-200' 
                    : 'bg-red-500 border-red-300 text-white shadow-red-200'
                  : 'bg-white border-blue-100 text-navy hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-4 md:gap-6">
                <span className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-xl shadow-inner ${
                   selectedOption === opt.label ? 'bg-white/20' : 'bg-blue-50 text-blue-500'
                }`}>
                  {opt.label}
                </span>
                <span className="text-base md:text-xl font-bold leading-tight line-clamp-2">{opt.text}</span>
              </div>

              <AnimatePresence>
                {selectedOption === opt.label && (
                   <motion.div
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="bg-white/20 p-1 md:p-2 rounded-full"
                   >
                     {isCorrect ? <Check size={20} md:size={24} /> : <X size={20} md:size={24} />}
                   </motion.div>
                )}
              </AnimatePresence>

              {selectedOption === opt.label && isCorrect && (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute -right-4 -bottom-4 text-white/20"
                >
                  <Sparkles size={100} />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
