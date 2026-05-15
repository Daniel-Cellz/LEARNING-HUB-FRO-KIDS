import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import WorldMap from './components/WorldMap';
import AIBuddy from './components/AIBuddy';
import EchoStudio from './components/EchoStudio';
import MagicInk from './components/MagicInk';
import SpellQuest from './components/SpellQuest';
import QuizQuest from './components/QuizQuest';
import CompetitionLobby from './components/CompetitionLobby';
import CompetitionMatch from './components/CompetitionMatch';
import BuddyChat from './components/BuddyChat';
import ReportCardScanner from './components/ReportCardScanner';
import { ISLANDS } from './constants';
import { UserProfile, BuddyType, VoiceType } from './types';
import { LogOut, Map as MapIcon, ChevronLeft, Star, Cloud, Settings, Wifi, WifiOff, Save, FileText, Sparkles as SparklesIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { speechService } from './services/SpeechService';

export default function App() {
  const { user, profile, loading, isOnline, signIn, signInGuest, signOut, updateProfile } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState<{ islandId: string, lessonId: string } | null>(null);
  const [currentView, setCurrentView] = useState<'map' | 'settings' | 'report-card' | 'mode-select' | 'competition-lobby' | 'competition-match'>('map');
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<'reading' | 'writing' | 'spelling' | 'competition' | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeGrade, setWelcomeGrade] = useState(1);
  const [buddyChatOpen, setBuddyChatOpen] = useState(false);
  const [initialImage, setInitialImage] = useState<File | null>(null);
  
  // Registration State
  const [nameInput, setNameInput] = useState('');
  const [buddyInput, setBuddyInput] = useState<BuddyType>('robot');
  const [voiceInput, setVoiceInput] = useState<VoiceType>('female');
  const [gradeInput, setGradeInput] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && profile && !selectedMode && currentView === 'map') {
      setCurrentView('mode-select');
    }
  }, [user, profile, selectedMode, currentView]);

  const handleModeSelect = (mode: 'reading' | 'writing' | 'spelling' | 'competition') => {
    setSelectedMode(mode);
    setCurrentView(mode === 'competition' ? 'competition-lobby' : 'map');
    speechService.speak(`Ready for your ${mode} classes! Let's go!`, profile?.voiceType || 'female');
  };

  // Settings State (cloned from profile)
  const [editName, setEditName] = useState('');
  const [editGrade, setEditGrade] = useState(1);
  const [editVoice, setEditVoice] = useState<VoiceType>('female');
  const [editBuddy, setEditBuddy] = useState<BuddyType>('robot');

  useEffect(() => {
    if (profile) {
      setEditName(profile.name);
      setEditGrade(profile.gradeLevel);
      setEditVoice(profile.voiceType);
      setEditBuddy(profile.buddyType);
    }
  }, [profile]);

  const [lastGradeSpoken, setLastGradeSpoken] = useState<number | null>(null);

  const pointsToNextLevel = 1000;
  const currentLevel = Math.floor((profile?.totalPoints || 0) / pointsToNextLevel) + 1;
  const pointsInCurrentLevel = (profile?.totalPoints || 0) % pointsToNextLevel;
  const progressPercent = (pointsInCurrentLevel / pointsToNextLevel) * 100;

  useEffect(() => {
    if (profile && profile.gradeLevel !== lastGradeSpoken) {
      speechService.speak(`Welcome to Grade ${profile.gradeLevel}! Adventure awaits!`, profile.voiceType);
      setLastGradeSpoken(profile.gradeLevel);
    }
  }, [profile, lastGradeSpoken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-light flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-8 border-white border-t-blue-500 rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-sky-light relative overflow-hidden flex items-center justify-center p-6">
        {/* Background elements */}
        <div className="absolute inset-x-0 bottom-0 h-[30vh] md:h-64 bg-emerald-500 rounded-t-[50px] md:rounded-t-[100px] z-0" />
        <motion.div className="absolute top-10 left-4 md:top-20 md:left-10 text-white/40 animate-floating"><Cloud size={60} md:size={100} fill="currentColor" /></motion.div>
        <motion.div className="absolute top-20 right-6 md:top-40 md:right-20 text-white/30 animate-floating" style={{ animationDelay: '-3s' }}><Cloud size={80} md:size={140} fill="currentColor" /></motion.div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-4xl w-full bg-[#FFF9E6]/95 backdrop-blur-md rounded-[3rem] md:rounded-[5rem] p-8 md:p-16 shadow-2xl text-center border-4 md:border-8 border-white relative z-10 flex flex-col items-center gap-8 md:gap-12"
        >
          {/* Bear Mascot */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <motion.div 
                animate={{ rotate: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="text-8xl md:text-[12rem] leading-none select-none drop-shadow-xl"
              >
                🐻
              </motion.div>
              <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-yellow-400 p-2 md:p-4 rounded-xl md:rounded-3xl border-2 md:border-4 border-white shadow-lg -rotate-12">
                 <span className="text-xl md:text-4xl text-white font-chunky">GUEST</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-8xl font-chunky text-navy tracking-tighter drop-shadow-lg transform -rotate-2">LingoLeap</h1>
            <p className="text-blue-500 font-bold uppercase tracking-widest text-[10px] md:text-sm mt-2 opacity-80 decoration-wavy underline-offset-4 mb-8">Unlock the Wonders of Words</p>
          </div>

          {/* Play Button */}
          <div className="w-full max-w-sm">
            <button
              onClick={signInGuest}
              className="w-full bg-red-400 hover:bg-red-500 text-white font-chunky py-6 md:py-8 rounded-[2rem] md:rounded-[3rem] text-3xl md:text-5xl shadow-2xl transition-all active:scale-95 border-b-[10px] md:border-b-[16px] border-red-700 flex items-center justify-center gap-4 group"
            >
              PLAY NOW
              <motion.span 
                animate={{ x: [0, 5, 0] }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="group-hover:translate-x-2 transition-transform"
              >
                🚀
              </motion.span>
            </button>
            <p className="mt-6 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.3em] opacity-60">Ready to learn, explorer?</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-sky-light flex items-center justify-center p-4 md:p-8 overflow-y-auto">
        <motion.div 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="max-w-2xl w-full bg-white rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 shadow-2xl border-b-[10px] md:border-b-[16px] border-blue-100"
        >
          <h2 className="text-2xl md:text-4xl font-chunky text-blue-600 mb-6 md:mb-8 uppercase text-center transform -rotate-1 tracking-tight">Create Your Hero!</h2>
          
          <div className="space-y-4 md:space-y-6 font-sans">
            <div>
              <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-2">My Name is...</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Type name here..."
                className="w-full bg-gray-50 border-2 md:border-4 border-gray-100 rounded-2xl md:rounded-3xl p-3 md:p-4 text-xl md:text-2xl font-bold focus:border-blue-400 outline-none transition-all font-chunky"
              />
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4">My Grade</label>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <button
                        key={g}
                        onClick={() => setGradeInput(g)}
                        className={`py-3 md:py-4 rounded-xl md:rounded-3xl font-chunky text-lg md:text-xl transition-all border-2 md:border-4 shadow-sm ${
                          gradeInput === g 
                            ? 'bg-blue-500 border-blue-300 text-white scale-105 shadow-lg' 
                            : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
               </div>
               
               <div className="mt-2 md:mt-4">
                  <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Buddy Voice</label>
                  <div className="flex bg-gray-100 rounded-2xl md:rounded-3xl p-1 border-2 md:border-4 border-white shadow-inner">
                     <button 
                       onClick={() => { setVoiceInput('female'); speechService.speak("Hello! I am your teacher.", "female"); }}
                       className={`flex-1 py-2 md:py-3 rounded-xl md:rounded-2xl font-chunky text-xs md:text-sm ${voiceInput === 'female' ? 'bg-white shadow-md text-blue-500' : 'text-gray-400'}`}
                     >
                       Female 👩‍🏫
                     </button>
                     <button 
                       onClick={() => { setVoiceInput('male'); speechService.speak("Hello! I am your teacher.", "male"); }}
                       className={`flex-1 py-2 md:py-3 rounded-xl md:rounded-2xl font-chunky text-xs md:text-sm ${voiceInput === 'male' ? 'bg-white shadow-md text-blue-500' : 'text-gray-400'}`}
                     >
                       Male 👨‍🏫
                     </button>
                  </div>
               </div>
            </div>

            <div>
              <label className="block text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4">Choose Your Buddy!</label>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {(['robot', 'puppy', 'dragon'] as BuddyType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setBuddyInput(type)}
                    className={`aspect-square rounded-[1.5rem] md:rounded-[2.5rem] p-2 md:p-4 transition-all border-2 md:border-4 flex flex-col items-center justify-center gap-1 md:gap-2 ${
                      buddyInput === type 
                        ? 'bg-blue-50 border-blue-400 shadow-xl scale-105' 
                        : 'bg-white border-gray-100 grayscale'
                    }`}
                  >
                    <span className="text-3xl md:text-5xl">
                      {type === 'robot' ? '🤖' : type === 'puppy' ? '🐶' : '🐲'}
                    </span>
                    <span className="font-chunky text-[8px] md:text-sm uppercase text-gray-600">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setIsSubmitting(true);
                updateProfile({
                  name: nameInput,
                  buddyType: buddyInput,
                  voiceType: voiceInput,
                  gradeLevel: gradeInput,
                  starCoins: 10,
                  totalPoints: 0,
                  cloudEnergy: 0,
                  unlockedIslands: ['starter'],
                  createdAt: new Date().toISOString()
                }).then(() => {
                  setWelcomeGrade(gradeInput);
                  setShowWelcome(true);
                  speechService.speak(`Welcome to Grade ${gradeInput}! I am so happy you are here!`, voiceInput);
                }).finally(() => setIsSubmitting(false));
              }}
              disabled={!nameInput.trim() || isSubmitting}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-chunky py-4 md:py-6 rounded-2xl md:rounded-[2rem] text-xl md:text-3xl shadow-xl transition-all border-b-[6px] md:border-b-[10px] border-green-700 disabled:opacity-50 disabled:grayscale mt-2"
            >
              START ADVENTURE!
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleUpdateSettings = async () => {
    setIsSubmitting(true);
    await updateProfile({
      name: editName,
      gradeLevel: editGrade,
      voiceType: editVoice,
      buddyType: editBuddy
    });
    setIsSubmitting(false);
    
    if (profile?.gradeLevel !== editGrade) {
      setWelcomeGrade(editGrade);
      setShowWelcome(true);
      speechService.speak(`Welcome to Grade ${editGrade}! Adventure awaits!`, editVoice);
    } else {
      setCurrentView('map');
      speechService.speak("Changes saved! Looking good!", editVoice);
    }
  };

  const lessonConfig = selectedLesson 
    ? ISLANDS.find(i => i.id === selectedLesson.islandId)?.lessons.find(l => l.id === selectedLesson.lessonId) 
    : null;

  const handleLessonSuccess = async (score: number, feedback: string) => {
    // Speak feedback
    speechService.speak(feedback, profile.voiceType);

    // Reward player
    await updateProfile({
      starCoins: (profile.starCoins || 0) + Math.round(score * 10),
      cloudEnergy: (profile.cloudEnergy || 0) + Math.round(score * 5),
      totalPoints: (profile.totalPoints || 0) + Math.round(score * 100)
    });

    // Check unlocks
    const nextIsland = ISLANDS.find(is => !profile.unlockedIslands.includes(is.id) && (profile.cloudEnergy + Math.round(score * 5)) >= is.energyRequired);
    if (nextIsland) {
      await updateProfile({
        unlockedIslands: [...profile.unlockedIslands, nextIsland.id]
      });
      speechService.speak(`New island unlocked! ${nextIsland.name}`, profile.voiceType);
    }

    // Automatic Progression
    if (selectedLesson) {
      setTimeout(() => {
        const island = ISLANDS.find(i => i.id === selectedLesson.islandId);
        if (island) {
          const lessons = island.lessons;
          const currentIndex = lessons.findIndex(l => l.id === selectedLesson.lessonId);
          const currentType = lessons[currentIndex].type;
          
          // Find the next lesson of the SAME TYPE
          const nextLesson = lessons.slice(currentIndex + 1).find(l => l.type === currentType);

          if (nextLesson) {
             // Reset state immediately by changing the lesson
             setSelectedLesson({ islandId: island.id, lessonId: nextLesson.id });
          } else {
            // End of island for this specific mode
            setSelectedLesson(null);
            setCurrentView('map');
            speechService.speak(`You finished all ${currentType} adventures on this island! Awesome!`, profile.voiceType);
          }
        }
      }, 2000); // Shorter delay for automatic progression
    }
  };

  return (
    <div className="min-h-screen bg-sky-light flex flex-col font-sans text-navy relative">
      {/* Network Status Indicator */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-4 py-1 rounded-b-xl text-[10px] font-black uppercase tracking-widest border-x-2 border-b-2 shadow-sm transition-all duration-500 ${
        isOnline ? 'bg-green-400 border-green-500 text-white -translate-y-full opacity-0' : 'bg-orange-500 border-orange-600 text-white translate-y-0 opacity-100'
      }`}>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          {isOnline ? 'Online' : 'Offline Mode Enabled'}
        </div>
      </div>

      {/* Top Navigation Bar */}
      <header className="bg-white/90 backdrop-blur-md border-b-4 md:border-b-8 border-blue-50 p-3 md:p-4 sticky top-0 z-[60] shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
             {(selectedLesson || currentView !== 'map') ? (
               <button 
                 onClick={() => { setSelectedLesson(null); setCurrentView('map'); }}
                 className="p-2 md:p-3 bg-white border-2 md:border-4 border-blue-100 hover:bg-blue-50 rounded-xl md:rounded-2xl text-blue-500 transition-colors shadow-sm"
               >
                 <ChevronLeft size={24} md:size={32} />
               </button>
             ) : (
               <div className="bg-blue-500 p-1.5 md:p-2 rounded-xl md:rounded-2xl text-white shadow-xl border-2 md:border-4 border-blue-400 transform -rotate-3">
                 <MapIcon size={20} md:size={32} />
               </div>
             )}
             <div className="flex flex-col">
               <h1 className="text-xl md:text-3xl font-chunky text-blue-600 tracking-tighter transform -rotate-1 leading-none">LingoLeap</h1>
               <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">For bright kids</p>
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 font-chunky">
            {/* Point Bar */}
            <div className="hidden md:flex flex-col items-end gap-1 min-w-[150px]">
              <div className="flex items-center gap-2 text-xs text-blue-500 font-black uppercase tracking-widest">
                <span>Level {currentLevel}</span>
                <span className="text-gray-300">|</span>
                <span>{profile.totalPoints || 0} pts</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full border-2 border-white shadow-inner overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-white px-3 md:px-5 py-1.5 md:py-3 rounded-full border-2 md:border-4 border-yellow-400 shadow-lg">
               <Star size={18} md:size={24} fill="#FFD600" className="text-yellow-400" />
               <span className="text-sm md:text-xl text-navy">{profile.starCoins}</span>
            </div>
            
            <button 
              onClick={() => setCurrentView('settings')}
              className={`p-2.5 md:p-4 rounded-full border-2 md:border-4 shadow-lg transition-all ${
                currentView === 'settings' ? 'bg-blue-500 border-blue-300 text-white scale-110' : 'bg-white border-pink-400 text-pink-500'
              }`}
            >
              <Settings size={20} md:size={28} />
            </button>

            <button 
              onClick={signOut}
              className="p-2 md:p-3 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl md:rounded-2xl transition-all"
            >
              <LogOut size={20} md:size={28} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col items-center">
        {currentView === 'settings' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-white rounded-[3rem] p-12 shadow-2xl border-b-[12px] border-pink-100"
          >
            <h2 className="text-4xl font-chunky text-pink-500 mb-8 uppercase text-center transform rotate-1">Profile Shop!</h2>
            
            <div className="space-y-8">
               <div className="bg-yellow-50 p-6 rounded-[2rem] border-4 border-yellow-200 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm text-yellow-500">
                       <FileText size={32} />
                    </div>
                    <div className="text-left">
                       <h4 className="font-chunky text-navy">REPORT CARD LAB</h4>
                       <p className="text-xs font-bold text-gray-500 opacity-70">Analyze your progress with AI!</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setCurrentView('report-card')}
                   className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-2xl font-chunky shadow-lg transition-transform active:scale-95 border-b-4 border-yellow-600"
                 >
                   SCAN NOW
                 </button>
               </div>

               <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">My Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl p-4 text-xl font-bold font-chunky outline-none focus:border-pink-300"
                  />
               </div>

               <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Buddy Voice</label>
                  <div className="flex bg-gray-100 rounded-3xl p-1 border-4 border-white shadow-inner">
                     <button 
                       onClick={() => setEditVoice('female')}
                       className={`flex-1 py-4 rounded-2xl font-chunky ${editVoice === 'female' ? 'bg-white shadow-md text-pink-500' : 'text-gray-400'}`}
                     >
                       Female 👩‍🏫
                     </button>
                     <button 
                       onClick={() => setEditVoice('male')}
                       className={`flex-1 py-4 rounded-2xl font-chunky ${editVoice === 'male' ? 'bg-white shadow-md text-pink-500' : 'text-gray-400'}`}
                     >
                       Male 👨‍🏫
                     </button>
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Choose Your Buddy!</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['robot', 'puppy', 'dragon'] as BuddyType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => setEditBuddy(type)}
                        className={`aspect-square rounded-[2rem] p-3 transition-all border-4 flex flex-col items-center justify-center gap-2 ${
                          editBuddy === type 
                            ? 'bg-pink-50 border-pink-400 shadow-xl scale-105' 
                            : 'bg-white border-gray-100 grayscale'
                        }`}
                      >
                        <span className="text-4xl">
                          {type === 'robot' ? '🤖' : type === 'puppy' ? '🐶' : '🐲'}
                        </span>
                        <span className="font-chunky text-[10px] uppercase text-gray-600">{type}</span>
                      </button>
                    ))}
                  </div>
               </div>

               <button
                 onClick={handleUpdateSettings}
                 disabled={isSubmitting}
                 className="w-full bg-pink-500 hover:bg-pink-600 text-white font-chunky py-6 rounded-[2rem] text-2xl shadow-xl transition-all border-b-[10px] border-pink-700 active:scale-95 flex items-center justify-center gap-3"
               >
                 <Save size={28} /> SAVE CHANGES
               </button>
            </div>
          </motion.div>
        ) : currentView === 'report-card' ? (
          <ReportCardScanner onComplete={() => setCurrentView('settings')} />
        ) : currentView === 'competition-lobby' ? (
          <CompetitionLobby 
            onJoinMatch={(matchId) => {
              setActiveMatchId(matchId);
              setCurrentView('competition-match');
            }} 
          />
        ) : currentView === 'competition-match' ? (
          activeMatchId ? (
            <CompetitionMatch 
              matchId={activeMatchId} 
              onExit={() => {
                setActiveMatchId(null);
                setCurrentView('competition-lobby');
              }} 
            />
          ) : (
             <div className="text-white font-chunky text-3xl">No Match Found!</div>
          )
        ) : currentView === 'mode-select' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8 md:gap-12 py-8"
          >
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-chunky text-white drop-shadow-lg mb-2 uppercase tracking-tight">CHOOSE YOUR MISSION!</h2>
              <p className="text-blue-600 font-bold uppercase tracking-[0.3em] bg-white/50 backdrop-blur px-4 py-1 rounded-full text-xs md:text-sm">What do you want to master today?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {[
                { id: 'reading', title: 'Reading', color: 'bg-emerald-400', border: 'border-emerald-600', icon: '📖', desc: 'Unlock stories and worlds!' },
                { id: 'writing', title: 'Writing', color: 'bg-purple-500', border: 'border-purple-700', icon: '✍️', desc: 'Master the magic of ink!' },
                { id: 'spelling', title: 'Spelling', color: 'bg-orange-500', border: 'border-orange-700', icon: '🧠', desc: 'Build powerful words!' },
                { id: 'competition', title: 'Competition', color: 'bg-red-500', border: 'border-red-700', icon: '🏆', desc: 'Face off with others!' },
              ].map((mode) => (
                <motion.button
                  key={mode.id}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleModeSelect(mode.id as any)}
                  className={`relative group bg-white rounded-[3rem] p-8 shadow-2xl border-4 md:border-8 border-white overflow-hidden text-center flex flex-col items-center gap-4 transition-all`}
                >
                  <div className={`w-24 h-24 md:w-32 md:h-32 ${mode.color} rounded-full flex items-center justify-center text-5xl md:text-7xl shadow-inner mb-2 border-4 border-white`}>
                    {mode.icon}
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-chunky text-navy mb-1 uppercase">{mode.title}</h3>
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest leading-tight">{mode.desc}</p>
                  </div>
                  <div className={`absolute bottom-0 inset-x-0 h-4 md:h-6 ${mode.color} transition-transform group-hover:h-full group-hover:opacity-10 opacity-50`} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : !selectedLesson ? (
          <div className="w-full animate-in fade-in zoom-in duration-500">
            <div className="mb-6 md:mb-12 text-center">
               <motion.h2 
                 initial={{ y: -20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="text-2xl md:text-6xl font-chunky text-white drop-shadow-lg mb-4"
               >
                 HEY, {profile.name.toUpperCase()}! 👋
               </motion.h2>
               
               {/* Grade Mission Control */}
               <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-[1.5rem] md:rounded-[3rem] border-4 md:border-8 border-white shadow-2xl mb-6 md:mb-12">
                 <p className="text-[8px] md:text-xs font-black text-blue-400 uppercase tracking-widest mb-3 md:mb-4">Select Adventure Grade</p>
                 <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <button
                        key={g}
                        onClick={async () => {
                          if (g !== profile.gradeLevel) {
                            await updateProfile({ gradeLevel: g });
                            setWelcomeGrade(g);
                            setShowWelcome(true);
                            speechService.speak(`Switching to Grade ${g}! Let's go, ${profile.name}!`, profile.voiceType);
                          }
                        }}
                        className={`aspect-square rounded-xl md:rounded-2xl font-chunky text-lg md:text-2xl transition-all border-2 md:border-4 shadow-sm flex items-center justify-center ${
                          profile.gradeLevel === g 
                            ? 'bg-blue-500 border-blue-300 text-white scale-110 shadow-lg' 
                            : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                 </div>
               </div>
            </div>
            <WorldMap 
              selectedMode={selectedMode}
              onSelectLesson={(islandId, lessonId) => setSelectedLesson({ islandId, lessonId })} 
            />
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4 md:gap-8 transition-all">
            {/* The Lesson Header */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
               <div className="bg-white/95 backdrop-blur-md p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 md:border-8 border-white flex-1 w-full">
                  <h3 className="text-[8px] md:text-xs font-black text-blue-400 uppercase tracking-[0.4em] mb-1 md:mb-2">Adventure time</h3>
                  <p className="text-xl md:text-4xl font-chunky text-navy leading-tight">{lessonConfig?.title}</p>
               </div>
               <AIBuddy 
                 type={profile.buddyType} 
                 isOffline={!isOnline} 
                 message={lessonConfig ? `You can do it, ${profile.name}! Let's learn ${lessonConfig.content}!` : ''} 
                 onClick={() => {
                   setInitialImage(null);
                   setBuddyChatOpen(true);
                 }}
                 onImageSelect={(file) => {
                   setInitialImage(file);
                   setBuddyChatOpen(true);
                 }}
               />
            </div>

            {/* The Activity Content */}
            <div 
              key={selectedLesson.lessonId}
              className="bg-white/95 backdrop-blur-lg rounded-[2rem] md:rounded-[4rem] p-4 md:p-12 shadow-2xl border-4 md:border-8 border-white min-h-[400px] md:min-h-[550px] flex flex-col justify-center"
            >
               {lessonConfig?.type === 'reading' && (
                 <EchoStudio word={lessonConfig.content} onSuccess={handleLessonSuccess} />
               )}
               {lessonConfig?.type === 'writing' && (
                 <MagicInk targetWord={lessonConfig.content} onSuccess={handleLessonSuccess} />
               )}
               {lessonConfig?.type === 'spelling' && (
                 <SpellQuest targetWord={lessonConfig.content} onSuccess={() => handleLessonSuccess(1, "Perfect Spelling!")} />
               )}
               {lessonConfig?.type === 'quiz' && (
                 <QuizQuest content={lessonConfig.content} onSuccess={handleLessonSuccess} />
               )}
            </div>
          </div>
        )}
      </main>

      {/* Welcome Screen Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-sky-light/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-md w-full bg-white rounded-[4rem] p-12 shadow-2xl border-8 border-white text-center flex flex-col items-center gap-8"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                  className="absolute inset-0 text-yellow-200"
                >
                  <SparklesIcon size={200} />
                </motion.div>
                <div className="relative text-[10rem] leading-none mb-4 select-none">
                  🎓
                </div>
              </div>
              
              <div>
                <h2 className="text-4xl font-chunky text-navy mb-2 uppercase tracking-tighter">Welcome to</h2>
                <h1 className="text-7xl font-chunky text-blue-500 transform -rotate-2 drop-shadow-xl">GRADE {welcomeGrade}</h1>
              </div>

              <p className="text-gray-500 font-bold text-xl leading-relaxed">
                You're officially part of the Grade {welcomeGrade} explorers! Let's unlock new words and win stars together.
              </p>

              <button 
                onClick={() => { setShowWelcome(false); setCurrentView('map'); }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-chunky py-6 rounded-[2.5rem] text-3xl shadow-xl transition-all active:scale-95 border-b-[10px] border-blue-700 mt-4"
              >
                LET'S GO!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Footer Buddy if not in lesson */}
      {!selectedLesson && currentView === 'map' && (
        <div className="fixed bottom-4 left-4 z-[40]">
           <AIBuddy 
             type={profile.buddyType} 
             isOffline={!isOnline} 
             message={`Ready for your next star? Try an island!`} 
             onClick={() => {
               setInitialImage(null);
               setBuddyChatOpen(true);
             }}
             onImageSelect={(file) => {
               setInitialImage(file);
               setBuddyChatOpen(true);
             }}
           />
        </div>
      )}

      <BuddyChat 
        isOpen={buddyChatOpen} 
        onClose={() => {
          setBuddyChatOpen(false);
          setInitialImage(null);
        }} 
        initialImage={initialImage}
      />
    </div>
  );
}
