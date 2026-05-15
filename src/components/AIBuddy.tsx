import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BuddyType } from '../types';
import { Mic, Check, RotateCcw, Paperclip } from 'lucide-react';

interface AIBuddyProps {
  type: BuddyType;
  message?: string;
  isThinking?: boolean;
  isOffline?: boolean;
  onClick?: () => void;
  onImageSelect?: (file: File) => void;
}

export default function AIBuddy({ type, message, isThinking, isOffline, onClick, onImageSelect }: AIBuddyProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
  };

  const getAvatar = () => {
    switch (type) {
      case 'robot': return '🤖';
      case 'puppy': return '🐶';
      case 'dragon': return '🐲';
      default: return '🤖';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'robot': return 'bg-blue-400';
      case 'puppy': return 'bg-orange-400';
      case 'dragon': return 'bg-green-400';
      default: return 'bg-blue-400';
    }
  };

  return (
    <motion.div 
      drag
      dragMomentum={true}
      dragElastic={0.1}
      whileDrag={{ scale: 1.1, zIndex: 100 }}
      className="flex items-end gap-3 md:gap-4 p-2 md:p-4 cursor-grab active:cursor-grabbing pointer-events-auto"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        animate={isThinking ? { y: [0, -10, 0] } : { scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: isThinking ? 0.6 : 3 }}
        className={`w-16 h-16 md:w-24 md:h-24 ${getColor()} rounded-2xl md:rounded-3xl flex items-center justify-center text-3xl md:text-5xl shadow-xl border-4 border-white relative cursor-pointer`}
      >
        <span>{getAvatar()}</span>
        
        {/* Attachment Button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleImageClick}
          className="absolute -bottom-2 -right-2 bg-yellow-400 p-2 rounded-full border-4 border-white shadow-xl text-navy hover:bg-yellow-500 transition-colors z-20"
          title="Attach a picture"
        >
          <Paperclip size={16} md:size={20} />
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </motion.button>

        {isOffline && (
          <div className="absolute -top-2 -left-2 bg-orange-500 text-white p-1 rounded-lg border-2 border-white shadow-md">
            <div className="flex items-center gap-1 px-1">
              <span className="text-[8px] font-black uppercase tracking-widest">Off</span>
            </div>
          </div>
        )}
        {isThinking && (
          <div className="absolute top-0 right-0 -mr-2 -mt-2">
             <div className="flex gap-1 bg-white p-1 rounded-full shadow-sm">
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
             </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white p-3 md:p-5 rounded-2xl md:rounded-[2rem] rounded-bl-none shadow-2xl border-2 md:border-4 border-blue-400 max-w-[150px] md:max-w-xs relative mb-4 md:mb-10 backdrop-blur-md"
          >
            <p className="text-navy font-bold leading-snug text-[10px] md:text-base">{message}</p>
            {/* Speech bubble tail */}
            <div className="absolute bottom-[-4px] left-0 -ml-2 w-4 h-4 md:w-6 md:h-6 bg-white border-l-2 md:border-l-4 border-b-2 md:border-b-4 border-blue-400 rotate-45 transform origin-top-right -z-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
