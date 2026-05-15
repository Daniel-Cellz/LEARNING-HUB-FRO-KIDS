import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Match, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Timer, Star, Check, X, ArrowRight, LogOut, Sparkles, AlertCircle } from 'lucide-react';
import { speechService } from '../services/SpeechService';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

interface CompetitionMatchProps {
  matchId: string;
  onExit: () => void;
}

export default function CompetitionMatch({ matchId, onExit }: CompetitionMatchProps) {
  const { user, profile, updateProfile, isLocalGuest } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !profile || isLocalGuest) return;

    const matchRef = doc(db, 'matches', matchId);
    
    // Initial join logic
    const joinMatch = async () => {
      try {
        const snap = await getDoc(matchRef);
        if (snap.exists()) {
          const data = snap.data() as Match;
          if (data.status === 'waiting' && !data.players[user.uid]) {
            await updateDoc(matchRef, {
              [`players.${user.uid}`]: {
                name: profile.name,
                buddyType: profile.buddyType,
                score: 0
              },
              status: 'playing'
            });
          }
          setIsJoining(false);
        } else {
          setError("Match not found!");
          setIsJoining(false);
        }
      } catch (err: any) {
        if (err.code === 'permission-denied') {
          setError("Arena access denied. Are you signed in?");
        }
        handleFirestoreError(err, OperationType.WRITE, `matches/${matchId}`);
        setIsJoining(false);
      }
    };

    joinMatch();

    const unsubscribe = onSnapshot(matchRef, (snapshot) => {
      if (snapshot.exists()) {
        setMatch({ id: snapshot.id, ...snapshot.data() } as Match);
        setError(null);
      } else {
        setError("Match has been closed.");
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `matches/${matchId}`);
    });

    return () => unsubscribe();
  }, [matchId, user, isLocalGuest]);

  const targetWord = match?.questions[match.currentQuestionIndex];
  const letters = targetWord?.toUpperCase().split('') || [];

  useEffect(() => {
    if (targetWord) {
      // Shuffle with extra letters
      let pool = [...letters];
      const extras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').filter(l => !letters.includes(l));
      while (pool.length < 12) {
        pool.push(extras[Math.floor(Math.random() * extras.length)]);
      }
      setShuffledLetters(pool.sort(() => Math.random() - 0.5));
      setUserInput([]);
      speechService.speak(`Quick! Spell: ${targetWord}`, profile?.voiceType || 'female');
    }
  }, [targetWord]);

  const handleLetterClick = async (letter: string) => {
    if (!match || !user || !targetWord) return;
    
    const nextInput = [...userInput, letter];
    setUserInput(nextInput);

    if (nextInput.join('') === targetWord.toUpperCase()) {
      // CORRECT!
      const path = `matches/${matchId}`;
      const matchRef = doc(db, 'matches', matchId);
      
      try {
        // Atomic check if question is still open
        const freshSnap = await getDoc(matchRef);
        const freshData = freshSnap.data() as Match;
        
        if (freshData.currentQuestionIndex === match.currentQuestionIndex) {
          // We won this question!
          speechService.speak("You got it first!", profile?.voiceType || 'female');
          
          const isLastQuestion = match.currentQuestionIndex === match.config.questionCount - 1;
          const newScore = (freshData.players[user.uid].score || 0) + 1;
          
          await updateDoc(matchRef, {
            [`players.${user.uid}.score`]: newScore,
            currentQuestionIndex: freshData.currentQuestionIndex + 1,
            status: isLastQuestion ? 'finished' : 'playing',
            winnerId: isLastQuestion ? (newScore > (Object.values(freshData.players).find(p => (p as any).name !== profile.name) as any)?.score ? user.uid : 'draw') : null
          });
        } else {
          // Someone else was faster
          speechService.speak("Too slow! Player 2 got it!", profile?.voiceType || 'female');
          setUserInput([]);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else if (nextInput.length >= letters.length) {
      // Wrong spelling
      speechService.speak("Try again!", profile?.voiceType || 'female');
      setUserInput([]);
    }
  };

  if (error || !user || isLocalGuest) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[3rem] p-12 shadow-2xl text-center border-b-[12px] border-red-100">
        <div className="text-8xl mb-6">🚫</div>
        <h2 className="text-4xl font-chunky text-red-600 mb-2">Arena Error</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest mb-8">{error || "Competition mode requires a real connection!"}</p>
        <button 
          onClick={onExit}
          className="bg-blue-500 hover:bg-blue-600 text-white font-chunky px-8 py-4 rounded-2xl shadow-lg transition-all"
        >
          EXIT ARENA
        </button>
      </div>
    );
  }

  if (!match || isJoining) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-white font-chunky">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl mb-4">🚀</motion.div>
        <h2 className="text-3xl">Joining Arena...</h2>
      </div>
    );
  }

  if (match.status === 'waiting') {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-[3rem] p-12 shadow-2xl text-center border-b-[12px] border-blue-100">
        <div className="text-8xl mb-6 animate-bounce">⏳</div>
        <h2 className="text-4xl font-chunky text-blue-600 mb-2">Waiting for Player 2...</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest mb-8">Share your arena with a friend!</p>
        <div className="flex justify-center items-center gap-4 bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200">
           <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-blue-400">
             <p className="text-xs text-gray-400 mb-1">YOU</p>
             <p className="font-chunky text-navy">{profile?.name}</p>
           </div>
           <div className="text-2xl opacity-30">VS</div>
           <div className="w-24 h-24 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center text-gray-300 font-bold">?</div>
        </div>
        <button onClick={onExit} className="mt-8 text-red-400 font-bold uppercase tracking-widest hover:text-red-600 transition-colors">Cancel Match</button>
      </div>
    );
  }

  if (match.status === 'finished') {
    const oppUid = Object.keys(match.players).find(id => id !== user.uid);
    const opp = (oppUid ? match.players[oppUid] : null) as any;
    const myScore = (match.players[user.uid] as any).score;
    const oppScore = opp ? opp.score : 0;
    const iWon = myScore > oppScore;

    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-3xl mx-auto bg-white rounded-[4rem] p-8 md:p-16 shadow-2xl text-center relative overflow-hidden">
        {iWon && <div className="absolute inset-0 pointer-events-none overflow-hidden"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10 }} className="absolute -top-20 -right-20 text-yellow-100"><Star size={400} /></motion.div></div>}
        
        <h2 className="text-3xl md:text-5xl font-chunky text-navy mb-8 uppercase tracking-tighter">Match Results</h2>
        
        <div className="grid grid-cols-2 gap-8 mb-12 relative z-10">
           <div className={`p-8 rounded-[3rem] border-4 ${iWon ? 'bg-yellow-50 border-yellow-400 shadow-xl' : 'bg-gray-50 border-gray-200 opacity-80'}`}>
              <div className="text-6xl mb-2">{(match.players[user.uid] as any).buddyType === 'robot' ? '🤖' : (match.players[user.uid] as any).buddyType === 'puppy' ? '🐶' : '🐲'}</div>
              <h4 className="font-chunky text-navy text-xl">{profile?.name} (YOU)</h4>
              <p className="text-4xl md:text-6xl font-black text-blue-500 mt-2">{myScore}</p>
              {iWon && <div className="bg-yellow-400 text-white py-1 px-4 rounded-full text-xs font-black uppercase tracking-widest mt-4">Winner!</div>}
           </div>
           
           <div className={`p-8 rounded-[3rem] border-4 ${!iWon && oppScore > myScore ? 'bg-yellow-50 border-yellow-400 shadow-xl' : 'bg-gray-50 border-gray-200 opacity-80'}`}>
              <div className="text-6xl mb-2">{opp && (opp as any).buddyType === 'robot' ? '🤖' : opp && (opp as any).buddyType === 'puppy' ? '🐶' : '🐲'}</div>
              <h4 className="font-chunky text-navy text-xl">{opp ? (opp as any).name : 'Opponent'}</h4>
              <p className="text-4xl md:text-6xl font-black text-red-500 mt-2">{oppScore}</p>
              {!iWon && oppScore > myScore && <div className="bg-yellow-400 text-white py-1 px-4 rounded-full text-xs font-black uppercase tracking-widest mt-4">Winner!</div>}
           </div>
        </div>

        <button 
          onClick={onExit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-chunky py-6 rounded-[2.5rem] text-3xl shadow-xl transition-all active:scale-95 border-b-[10px] border-blue-700"
        >
          BACK TO LOBBY
        </button>
      </motion.div>
    );
  }

  const otherPlayer = Object.values(match.players).find(p => (p as any).name !== profile?.name) as any;
  const myPlayer = match.players[user.uid] as any;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 font-chunky">
       {/* Scoreboard */}
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-4 flex items-center justify-between shadow-xl border-4 border-blue-400">
             <div className="flex items-center gap-3">
                <div className="text-4xl">{myPlayer.buddyType === 'robot' ? '🤖' : myPlayer.buddyType === 'puppy' ? '🐶' : '🐲'}</div>
                <div className="text-left">
                   <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">YOU</p>
                   <p className="text-xl md:text-2xl text-navy">{profile?.name}</p>
                </div>
             </div>
             <p className="text-4xl md:text-5xl text-blue-500 mr-2">{myPlayer.score}</p>
          </div>
          
          <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-4 flex items-center justify-between shadow-xl border-4 border-red-400 text-right">
             <p className="text-4xl md:text-5xl text-red-500 ml-2">{otherPlayer ? otherPlayer.score : 0}</p>
             <div className="flex items-center gap-3 text-right">
                <div className="text-right">
                   <p className="text-[10px] text-red-400 uppercase font-bold tracking-widest">CHALLENGER</p>
                   <p className="text-xl md:text-2xl text-navy">{otherPlayer ? otherPlayer.name : 'Waiting...'}</p>
                </div>
                <div className="text-4xl">{otherPlayer ? (otherPlayer.buddyType === 'robot' ? '🤖' : otherPlayer.buddyType === 'puppy' ? '🐶' : '🐲') : '❓'}</div>
             </div>
          </div>
       </div>

       {/* Battle Arena */}
       <div className="bg-white rounded-[3rem] md:rounded-[5rem] p-4 md:p-12 shadow-2xl border-[10px] md:border-[16px] border-white relative min-h-[500px] flex flex-col items-center justify-center">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-50 px-6 py-2 rounded-full border-4 border-white shadow-sm">
             <span className="text-blue-500 font-black">QUESTION</span>
             <span className="text-2xl text-navy">{match.currentQuestionIndex + 1} / {match.config.questionCount}</span>
          </div>

          <div className="text-center mb-12">
             <h2 className="text-5xl md:text-8xl font-black text-gray-800 tracking-tighter uppercase mb-4">SPELL IT!</h2>
             
             <div className="flex flex-wrap gap-2 md:gap-4 justify-center py-6">
                {letters.map((char, i) => (
                  <motion.div
                    key={i}
                    animate={userInput[i] ? { y: [-5, 0], scale: [1.1, 1] } : {}}
                    className={`w-12 h-16 md:w-20 md:h-28 rounded-2xl md:rounded-[2rem] border-4 md:border-8 flex items-center justify-center text-3xl md:text-6xl transition-all ${
                      userInput[i] 
                        ? 'bg-blue-500 border-blue-300 text-white shadow-xl' 
                        : 'bg-gray-100 border-gray-200 text-transparent'
                    }`}
                  >
                    {userInput[i]}
                  </motion.div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-5 w-full">
             {shuffledLetters.map((letter, idx) => (
               <motion.button
                 key={`${letter}-${idx}`}
                 whileHover={{ scale: 1.05, y: -2 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => handleLetterClick(letter)}
                 className="h-14 md:h-20 bg-white rounded-2xl md:rounded-[2rem] shadow-xl flex items-center justify-center text-2xl md:text-3xl font-black text-gray-700 border-b-8 border-gray-100 hover:border-gray-50 transition-all uppercase"
               >
                 {letter}
               </motion.button>
             ))}
          </div>
       </div>

       <button 
         onClick={onExit}
         className="self-center flex items-center gap-2 text-white/50 hover:text-white uppercase tracking-widest font-bold text-xs"
       >
         <LogOut size={16} /> Quit Match
       </button>
    </div>
  );
}
