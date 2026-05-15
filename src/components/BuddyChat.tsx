import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, MessageCircle, Paperclip as PaperclipIcon } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  imageUrl?: string;
}

interface BuddyChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage?: File | null;
}

const BuddyChat: React.FC<BuddyChatProps> = ({ isOpen, onClose, initialImage }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      parts: [{ text: "Hi there! I'm Lingo, your magical dragon teacher! Roar! 🐉 I can answer any question you have. What's on your mind? ✨" }] 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialImage) {
      setSelectedImage(initialImage);
      handleImageAnalysis(initialImage);
    }
  }, [initialImage]);

  const handleImageAnalysis = async (file: File) => {
    setIsTyping(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fullDataUrl = reader.result as string;
        const base64 = fullDataUrl.split(',')[1];
        
        // Add user message with image first
        setMessages(prev => [
          ...prev, 
          { role: 'user', parts: [{ text: "[Shared a picture]" }], imageUrl: fullDataUrl }
        ]);

        const response = await geminiService.analyzeImageToAnswerQuestion(base64, "Can you tell me what's in this picture and explain it to me?");
        
        setMessages(prev => [
          ...prev, 
          { role: 'model', parts: [{ text: response || "I see your picture! It's very interesting! 🐉" }] }
        ]);
        setIsTyping(false);
        setSelectedImage(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageAnalysis(file);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await geminiService.chatWithBuddy(messages, userMessage);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response || "Something went wrong! But I'm still here! 🐉" }] }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Oh no, my magic is fizzling a bit! Can you try again? 💫" }] }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          className="fixed bottom-4 right-4 md:bottom-24 md:right-6 w-[calc(100vw-2rem)] md:w-[350px] max-w-[400px] bg-white rounded-[2rem] shadow-2xl overflow-hidden z-[100] border-4 md:border-8 border-yellow-200"
        >
          {/* Header */}
          <div className="bg-yellow-400 p-3 md:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
               <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-lg md:text-xl">🐲</div>
               <span className="font-chunky text-white uppercase tracking-wider text-xs md:text-base">Lingo Chat</span>
            </div>
            <button onClick={onClose} className="p-1.5 md:p-2 hover:bg-yellow-500 rounded-full text-white transition-colors">
              <X size={18} md:size={20} />
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="h-[300px] md:h-[400px] overflow-y-auto p-3 md:p-4 space-y-3 md:y-4 bg-yellow-50/30 font-medium"
          >
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.5, y: 20, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25,
                  delay: 0.05 
                }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[85%] p-3 md:p-4 rounded-xl md:rounded-2xl text-xs md:text-sm leading-relaxed overflow-hidden
                  ${msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-tr-none' 
                    : 'bg-white text-blue-900 border-2 border-yellow-100 rounded-tl-none shadow-sm'
                  }
                `}>
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="Shared content" 
                      className="w-full h-auto rounded-lg mb-2 border-2 border-white/20"
                    />
                  )}
                  {msg.parts[0].text}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl rounded-tl-none shadow-sm border-2 border-yellow-100 flex gap-1">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 border-t-2 md:border-t-4 border-yellow-100 flex gap-2 items-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors"
              title="Attach a picture"
            >
              <PaperclipIcon size={20} />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Lingo anything..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 md:w-10 md:h-10 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95"
            >
              <Send size={16} md:size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BuddyChat;
