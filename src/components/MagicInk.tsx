import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eraser, Check, Sparkles, Pencil, Volume2, Timer, RotateCcw } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { auth, db } from '../lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { speechService } from '../services/SpeechService';
import { useAuth } from '../context/AuthContext';

interface MagicInkProps {
  targetWord: string;
  onSuccess: (score: number, feedback: string) => void;
}

export default function MagicInk({ targetWord, onSuccess }: MagicInkProps) {
  const { profile } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    speechService.speak(`Write the word: ${targetWord}`, profile?.voiceType || 'female');
  }, [targetWord]);

  useEffect(() => {
    if (timeLeft > 0 && !feedback && !isTimeUp && !isProcessing) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !feedback) {
      setIsTimeUp(true);
      speechService.speak("Time is up! Let's try writing that again!", profile?.voiceType || 'female');
    }
  }, [timeLeft, feedback, isTimeUp, isProcessing, profile]);

  // Handle canvas sizing and responsiveness
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#3b82f6';
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isTimeUp]); // Re-initialize if view changes

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isTimeUp || isProcessing) return;
    setIsDrawing(true);
    setHasDrawn(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isTimeUp) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setFeedback(null);
    setHasDrawn(false);
  };

  const handleFinish = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        tCtx.fillStyle = 'white';
        tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tCtx.drawImage(canvas, 0, 0);
      }

      const dataUrl = tempCanvas.toDataURL('image/png');
      const base64data = dataUrl.split(',')[1];
      const cleanTarget = targetWord.includes('|') ? targetWord.split('|')[1].trim() : targetWord;

      const result = await geminiService.analyzeHandwriting(cleanTarget, base64data);
      setFeedback(result);

      if (auth.currentUser) {
        const path = `users/${auth.currentUser.uid}/progress`;
        try {
          await addDoc(collection(db, 'users', auth.currentUser.uid, 'progress'), {
            userId: auth.currentUser.uid,
            lessonId: 'writing-' + targetWord,
            type: 'writing',
            score: result.score,
            feedback: result.feedback,
            word: targetWord,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
      }

      if (result.score > 0.7) {
        setTimeout(() => onSuccess(result.score, result.feedback), 2000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setTimeLeft(30);
    setIsTimeUp(false);
    setHasDrawn(false);
    setFeedback(null);
  };

  const displayWord = targetWord.includes('|') ? targetWord.split('|')[0].trim() : "Trace the word:";
  const traceWord = targetWord.includes('"') 
    ? targetWord.split('"')[1].trim() 
    : targetWord;

  if (isTimeUp) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 p-12 text-center animate-in zoom-in duration-300">
        <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center text-6xl shadow-xl">⏰</div>
        <div>
          <h2 className="text-4xl font-chunky text-purple-600 mb-2 uppercase tracking-tight">Time is up!</h2>
          <p className="font-bold text-navy text-xl">Let's try writing it again!</p>
        </div>
        <button
          onClick={handleReset}
          className="bg-purple-500 hover:bg-purple-600 text-white font-chunky py-6 px-12 rounded-[2rem] text-3xl shadow-xl transition-all active:scale-95 border-b-[8px] border-purple-700 flex items-center gap-4"
        >
          <RotateCcw className="w-8 h-8" /> TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 p-4 md:p-6 w-full max-w-4xl mx-auto">
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-4 border-purple-100 shadow-sm">
          <Timer size={20} className={timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-purple-500'} />
          <span className={`font-chunky text-lg ${timeLeft <= 5 ? 'text-red-500' : 'text-navy'}`}>{timeLeft}s</span>
        </div>
        <div className="h-3 flex-1 mx-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 30) * 100}%` }}
            className={`h-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-purple-500'}`}
          />
        </div>
      </div>

      <div className="text-center w-full">
        <h2 className="text-3xl md:text-4xl font-chunky text-purple-600 mb-2 uppercase tracking-tighter transform -rotate-1">Magic Ink Lab</h2>
        <div className="bg-purple-100 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-4 md:border-8 border-white shadow-inner mb-4 transition-transform hover:scale-[1.01] flex items-center justify-between">
          <div className="text-left">
            <p className="text-navy font-bold uppercase tracking-widest text-[8px] md:text-[10px] opacity-60 mb-1 lg:mb-2">{displayWord}</p>
            <span className="text-2xl md:text-5xl font-chunky text-purple-800 tracking-widest uppercase sparkle">{traceWord}</span>
          </div>
          <button 
            onClick={() => speechService.speak(traceWord, profile?.voiceType || 'female')}
            className="p-3 md:p-4 bg-purple-200 text-purple-600 rounded-full hover:bg-purple-300 transition-colors shadow-sm h-min"
          >
            <Volume2 size={24} md:size={32} />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative group bg-white border-4 md:border-8 border-purple-200 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden w-full aspect-auto md:aspect-[2/1] min-h-[250px] md:min-h-[350px]"
      >
        {/* Tracing Layer (Transparent Text) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none p-4 md:p-8 text-center overflow-hidden">
          <span 
            className="font-chunky text-gray-200 uppercase tracking-widest opacity-30 select-none text-center"
            style={{ 
              fontSize: `calc(${Math.min(12, 85 / (traceWord.length || 1))}vw)`,
              lineHeight: 0.8,
              whiteSpace: 'nowrap',
              maxWidth: '90%',
              userSelect: 'none'
            }}
          >
            {traceWord}
          </span>
        </div>

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="relative z-10 cursor-crosshair touch-none w-full h-full"
        />
        
        {/* Visual Guides */}
        <div className="absolute inset-x-0 top-1/2 h-px border-t-2 border-dashed border-gray-100 pointer-events-none z-0" />
      </div>

      <div className="flex gap-4 w-full max-w-2xl px-2">
        <button
          onClick={clearCanvas}
          className="flex-1 py-3 md:py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl md:rounded-2xl flex items-center justify-center gap-2 transition-colors border-b-4 border-gray-300 text-sm md:text-base"
        >
          <Eraser size={20} md:size={24} /> Clear
        </button>
        <button
          onClick={handleFinish}
          disabled={!hasDrawn || isProcessing}
          className={`flex-[2] py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-lg md:text-xl flex items-center justify-center gap-2 transition-all border-b-4 shadow-lg ${
            !hasDrawn || isProcessing
              ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
              : 'bg-purple-500 hover:bg-purple-600 text-white border-purple-700 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          ) : (
            <><Pencil size={20} md:size={24} /> Finish Writing!</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-2xl p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 flex items-center gap-4 ${
              feedback.score > 0.7 ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'
            }`}
          >
            <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${
              feedback.score > 0.7 ? 'bg-green-200 text-green-700' : 'bg-purple-200 text-purple-700'
            }`}>
              <Sparkles size={24} md:size={32} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm md:text-lg text-gray-800 leading-tight">{feedback.feedback}</p>
              <div className="flex items-center gap-2 mt-2">
                 <div className="h-2 md:h-3 flex-1 max-w-[200px] bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${feedback.score * 100}%` }}
                      className={`h-full ${feedback.score > 0.7 ? 'bg-green-500' : 'bg-purple-500'}`}
                    />
                 </div>
                 <span className="text-[10px] md:text-xs font-black text-gray-500">{Math.round(feedback.score * 100)}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
