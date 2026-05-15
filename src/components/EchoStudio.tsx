import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { auth, db } from '../lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { speechService } from '../services/SpeechService';
import { useAuth } from '../context/AuthContext';

interface EchoStudioProps {
  word: string;
  onSuccess: (score: number, feedback: string) => void;
}

export default function EchoStudio({ word, onSuccess }: EchoStudioProps) {
  const { profile } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  useEffect(() => {
    speechService.speak(`Say the word: ${word}`, profile?.voiceType || 'female');
  }, [word]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      processAudio(blob);
    };

    recorder.start();
    setIsRecording(true);
    setFeedback(null);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const result = await geminiService.getPronunciationFeedback(word, base64data);
        setFeedback(result);
        
        // Log progress if user is signed in
        if (auth.currentUser) {
           const path = `users/${auth.currentUser.uid}/progress`;
           try {
             await addDoc(collection(db, 'users', auth.currentUser.uid, 'progress'), {
               userId: auth.currentUser.uid,
               lessonId: 'echo-' + word,
               type: 'reading',
               score: result.score,
               feedback: result.feedback,
               word,
               timestamp: new Date().toISOString()
             });
           } catch (error) {
             handleFirestoreError(error, OperationType.WRITE, path);
           }
        }

        if (result.score > 0.7) {
          setTimeout(() => onSuccess(result.score, result.feedback), 2000);
        }
      };
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 md:gap-8 p-4 md:p-8 max-w-4xl mx-auto w-full">
      <div className="text-center w-full">
        <h2 className="text-3xl md:text-5xl font-chunky text-blue-600 mb-2 uppercase tracking-tighter transform -rotate-1">Echo Lab</h2>
        <p className="text-navy font-bold uppercase tracking-widest text-[10px] md:text-xs opacity-60">Say the word clear and loud:</p>
      </div>

      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white/50 backdrop-blur-sm p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] shadow-2xl border-4 md:border-8 border-white flex flex-col items-center w-full overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-6 md:mb-8 w-full">
          <div className="flex-1 flex justify-center overflow-hidden w-full">
            <span className="text-4xl sm:text-6xl md:text-8xl font-chunky text-navy select-none flex flex-wrap justify-center gap-1 leading-tight break-all">
              {word.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 0 }}
                  animate={feedback?.highlightedWords?.[0]?.accuracy === 'correct' ? { 
                    y: [0, -10, 0],
                    color: '#4CAF50'
                  } : {}}
                  transition={{ delay: i * 0.05, duration: 0.5, repeat: feedback ? Infinity : 0 }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </div>
          <button 
            onClick={() => speechService.speak(word, profile?.voiceType || 'female')}
            className="p-3 md:p-4 bg-blue-100 text-blue-500 rounded-full hover:bg-blue-200 transition-colors shadow-sm shrink-0"
          >
            <Volume2 size={24} md:size={32} />
          </button>
        </div>

        <div className="flex gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isProcessing}
              className="w-16 h-16 md:w-24 md:h-24 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg transition-all group border-b-4 border-red-700"
            >
              {isProcessing ? (
                <RotateCcw className="animate-spin" size={24} md:size={32} />
              ) : (
                <Mic size={30} md:size={40} className="group-hover:scale-110 transition-transform" />
              )}
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-16 h-16 md:w-24 md:h-24 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg animate-pulse border-b-4 border-black"
            >
              <Square size={24} md:size={32} fill="currentColor" />
            </button>
          )}
        </div>

        {isRecording && (
          <div className="mt-4 flex gap-1 items-center">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [8, 24, 8] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 bg-red-500 rounded-full"
              />
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full p-6 rounded-3xl border-2 flex items-center gap-4 ${
              feedback.score > 0.7 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
            }`}
          >
            <div className={`p-3 rounded-2xl ${
              feedback.score > 0.7 ? 'bg-green-200 text-green-700' : 'bg-orange-200 text-orange-700'
            }`}>
              {feedback.score > 0.7 ? <Sparkles size={32} /> : <RotateCcw size={32} />}
            </div>
            <div>
              <p className="font-bold text-lg text-gray-800">{feedback.feedback}</p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.round(feedback.score * 5) ? (feedback.score > 0.7 ? '#22c55e' : '#f97316') : 'none'}
                    className={i < Math.round(feedback.score * 5) ? '' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Star({ size, fill, className }: { size: number, fill: string, className: string, key?: any }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={fill} 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
