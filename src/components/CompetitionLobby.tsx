import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Match, BuddyType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Play, Trophy, ChevronRight, Hash, WifiOff, AlertTriangle } from 'lucide-react';
import { WORD_POOLS } from '../data/lessons';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

interface CompetitionLobbyProps {
  onJoinMatch: (matchId: string) => void;
}

export default function CompetitionLobby({ onJoinMatch }: CompetitionLobbyProps) {
  const { user, profile, isLocalGuest, isOnline } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [qCount, setQCount] = useState(5);
  const [grade, setGrade] = useState(profile?.gradeLevel || 1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // DO NOT listen if local guest or offline
    if (!user || isLocalGuest || !isOnline) return;

    const path = 'matches';
    const q = query(
      collection(db, path),
      where('status', '==', 'waiting'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
      setMatches(matchData);
      setError(null);
    }, (err) => {
      // HANDLE PERMISSION DENIED OR OTHER ERRORS
      if (err.code === 'permission-denied') {
        setError("Missing permissions. The Arena requires a valid sign-in!");
      }
      handleFirestoreError(err, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user, isLocalGuest, isOnline]);

  const handleCreateMatch = async () => {
    if (!user || !profile || isLocalGuest) return;
    setIsCreating(true);
    const path = 'matches';

    // Generate random questions for the match
    const pool = WORD_POOLS[grade] || WORD_POOLS[1];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, qCount);

    const newMatch = {
      status: 'waiting',
      players: {
        [user.uid]: {
          name: profile.name,
          buddyType: profile.buddyType,
          score: 0
        }
      },
      questions: selectedQuestions,
      currentQuestionIndex: 0,
      config: {
        questionCount: qCount,
        gradeLevel: grade
      },
      createdAt: Date.now()
    };

    try {
      const docRef = await addDoc(collection(db, path), newMatch);
      onJoinMatch(docRef.id);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLocalGuest || !isOnline) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl text-center border-4 border-white">
        <div className="text-8xl mb-6">🏜️</div>
        <h2 className="text-4xl font-chunky text-navy mb-4">Arena is Offline</h2>
        <p className="text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
          The Competition Arena needs a real internet connection and a signed-in profile to work! 
          {isLocalGuest && <><br/><span className="text-red-500">Sign in with Google to play with friends!</span></>}
        </p>
        <div className="mt-8 p-6 bg-yellow-50 rounded-2xl border-2 border-dashed border-yellow-200">
           <p className="text-yellow-700 text-sm">Guest mode is great for practice, but for real battles against other players, you'll need to join the community!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
      {error && (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-red-500 text-white p-4 rounded-2xl font-chunky flex items-center gap-3 shadow-lg">
          <AlertTriangle /> {error}
        </motion.div>
      )}
      <div className="text-center">
        <h2 className="text-4xl md:text-6xl font-chunky text-white drop-shadow-lg mb-2 uppercase">Lobby</h2>
        <p className="text-red-600 font-bold uppercase tracking-[0.3em] bg-white/50 backdrop-blur px-4 py-1 rounded-full text-xs md:text-sm inline-block">Find a challenge!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create Match Panel */}
        <div className="md:col-span-1 bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl border-4 border-white h-fit">
          <h3 className="text-2xl font-chunky text-navy mb-6 flex items-center gap-2">
            <Plus className="text-red-500" /> Host Match
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Hash size={14} /> Questions
              </label>
              <div className="flex gap-2">
                {[5, 10, 15].map(n => (
                  <button
                    key={n}
                    onClick={() => setQCount(n)}
                    className={`flex-1 py-3 rounded-2xl font-chunky text-lg transition-all border-2 ${
                      qCount === n ? 'bg-red-500 border-red-300 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Grade Difficulty</label>
              <select 
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-3 font-chunky text-navy outline-none focus:border-red-400"
              >
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateMatch}
              disabled={isCreating}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-chunky py-5 rounded-[1.5rem] text-xl shadow-xl transition-all active:scale-95 border-b-8 border-red-700 disabled:opacity-50"
            >
              {isCreating ? 'CREATING...' : 'START HOSTING'}
            </button>
          </div>
        </div>

        {/* Available Matches */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-chunky text-white uppercase tracking-tight flex items-center gap-2">
              <Users /> Active Waiting Rooms
            </h3>
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{matches.length} FOUND</span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {matches.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/10 backdrop-blur-sm border-4 border-dashed border-white/20 rounded-[2.5rem] p-12 text-center"
                >
                  <p className="text-white/60 font-chunky text-2xl uppercase">No matches yet!<br/>Be the first to host!</p>
                </motion.div>
              ) : (
                matches.map(match => (
                  <motion.div
                    key={match.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white/95 backdrop-blur-md rounded-[2rem] p-4 md:p-6 shadow-xl border-4 border-white flex items-center justify-between group hover:border-red-400 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {(() => {
                        const host = Object.values(match.players)[0] as any;
                        return (
                          <>
                            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                              {host.buddyType === 'robot' ? '🤖' : host.buddyType === 'puppy' ? '🐶' : '🐲'}
                            </div>
                            <div className="text-left">
                              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Host: {host.name}</p>
                              <h4 className="text-xl md:text-2xl font-chunky text-navy">{match.config.questionCount} Questions Challenge</h4>
                              <div className="flex gap-2 mt-1">
                                <span className="bg-blue-50 text-blue-500 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-100">Grade {match.config.gradeLevel}</span>
                                <span className="bg-emerald-50 text-emerald-500 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-emerald-100">Ready</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    
                    <button
                      onClick={() => onJoinMatch(match.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-2xl shadow-lg transition-all active:scale-90 flex items-center gap-2 group-hover:px-6"
                    >
                      <Play fill="currentColor" size={20} />
                      <span className="font-chunky hidden group-hover:block">JOIN</span>
                      <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
