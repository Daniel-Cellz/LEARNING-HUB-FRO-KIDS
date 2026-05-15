import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Volume2, Timer, RotateCcw } from 'lucide-react';
import { speechService } from '../services/SpeechService';
import { useAuth } from '../context/AuthContext';

interface SpellQuestProps {
  targetWord: string;
  onSuccess: () => void;
}

export default function SpellQuest({ targetWord, onSuccess }: SpellQuestProps) {
  const { profile } = useAuth();
  const letters = targetWord.toUpperCase().split('');
  
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    speechService.speak(`Spell the word: ${targetWord}`, profile?.voiceType || 'female');
  }, [targetWord]);

  useEffect(() => {
    if (timeLeft > 0 && !isCorrect && !isTimeUp) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isCorrect) {
      setIsTimeUp(true);
      speechService.speak("Time is up! Let's try spelling that again!", profile?.voiceType || 'female');
    }
  }, [timeLeft, isCorrect, isTimeUp, profile]);

  useEffect(() => {
    // Shuffle with some extra random letters if short
    let pool = [...letters];
    const extraLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').filter(l => !letters.includes(l));
    while (pool.length < 8) {
      pool.push(extraLetters[Math.floor(Math.random() * extraLetters.length)]);
    }
    setShuffledLetters(pool.sort(() => Math.random() - 0.5));
  }, [targetWord]);

  const handleLetterClick = (letter: string) => {
    if (userInput.length < letters.length && !isCorrect && !isTimeUp) {
      const nextInput = [...userInput, letter];
      setUserInput(nextInput);
      
      if (nextInput.length === letters.length) {
        if (nextInput.join('') === targetWord.toUpperCase()) {
          setIsCorrect(true);
          speechService.speak("Perfect spelling!", profile?.voiceType || 'female');
          setTimeout(onSuccess, 1500);
        } else {
          speechService.speak("Oops! Not quite.", profile?.voiceType || 'female');
          setTimeout(() => setUserInput([]), 500);
        }
      }
    }
  };

  const handleReset = () => {
    setTimeLeft(30);
    setIsTimeUp(false);
    setUserInput([]);
    setIsCorrect(false);
  };

  if (isTimeUp) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 p-12 text-center animate-in zoom-in duration-300">
        <div className="w-32 h-32 bg-orange-100 rounded-full flex items-center justify-center text-6xl shadow-xl">⏰</div>
        <div>
          <h2 className="text-4xl font-chunky text-orange-500 mb-2 uppercase">Time is up!</h2>
          <p className="font-bold text-navy text-xl">Let's try spelling it again!</p>
        </div>
        <button
          onClick={handleReset}
          className="bg-orange-500 hover:bg-orange-600 text-white font-chunky py-6 px-12 rounded-[2rem] text-3xl shadow-xl transition-all active:scale-95 border-b-[8px] border-orange-700 flex items-center gap-4"
        >
          <RotateCcw size={32} /> TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 md:gap-12 p-4 md:p-8 max-w-xl mx-auto overflow-hidden">
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-4 border-orange-100 shadow-sm">
          <Timer size={20} className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-orange-500'} />
          <span className={`font-chunky text-lg ${timeLeft <= 5 ? 'text-red-500' : 'text-navy'}`}>{timeLeft}s</span>
        </div>
        <div className="h-3 flex-1 mx-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 30) * 100}%` }}
            className={`h-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-orange-500'}`}
          />
        </div>
      </div>

      <div className="text-center relative flex flex-col items-center">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-4xl md:text-6xl font-chunky text-orange-500 italic drop-shadow-xl tracking-tighter transform -rotate-1">SPELL QUEST!</h2>
          <button 
            onClick={() => speechService.speak(targetWord, profile?.voiceType || 'female')}
            className="p-2 md:p-3 bg-orange-100 text-orange-500 rounded-full hover:bg-orange-200 transition-colors shadow-sm"
          >
            <Volume2 size={24} md:size={32} />
          </button>
        </div>
        
        {/* The target display */}
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center items-center py-4">
          {letters.map((char, i) => (
            <motion.div
              key={i}
              animate={userInput[i] ? { scale: [1, 1.25, 1], rotate: [0, 5, 0] } : {}}
              className={`w-10 h-14 sm:w-12 sm:h-16 md:w-16 md:h-20 rounded-lg sm:rounded-xl md:rounded-[1.5rem] border-2 md:border-8 flex items-center justify-center text-xl sm:text-2xl md:text-4xl font-chunky transition-all ${
                userInput[i] 
                  ? 'bg-white border-orange-400 text-orange-600 scale-110 shadow-2xl' 
                  : 'bg-orange-100 border-orange-200 text-transparent opacity-40'
              }`}
            >
              {userInput[i] || '_'}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 md:gap-6 w-full font-chunky">
        <AnimatePresence>
          {shuffledLetters.map((letter, idx) => (
            <motion.button
              key={`${letter}-${idx}`}
              whileHover={{ scale: 1.1, rotate: Math.random() * 10 - 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleLetterClick(letter)}
              className="h-12 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl flex items-center justify-center text-xl md:text-2xl font-black text-gray-700 border-b-4 md:border-b-8 border-gray-100 hover:border-gray-50 active:border-b-0 active:translate-y-2 transition-all"
            >
              {letter}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {isCorrect && (
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1.5, rotate: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className="bg-yellow-400 text-white p-8 md:p-12 rounded-full shadow-2xl flex flex-col items-center">
            <Star size={48} md:size={80} fill="currentColor" />
            <span className="text-2xl md:text-4xl font-black">AMAZING!</span>
          </div>
        </motion.div>
      )}

      {/* Hero Animation Background - simplified for performance */}
      <div className="fixed bottom-0 left-0 w-full h-24 md:h-32 bg-gray-200 -z-10 flex items-end opacity-50">
         <motion.div 
           animate={{ x: [0, 100, 0] }}
           transition={{ duration: 10, repeat: Infinity }}
           className="w-12 h-12 md:w-16 md:h-16 bg-orange-400 rounded-xl mb-4 ml-4"
         />
         <div className="h-4 md:h-8 w-full bg-gray-400" />
      </div>
    </div>
  );
}
