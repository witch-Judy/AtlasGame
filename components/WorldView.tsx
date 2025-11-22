
import React, { useEffect, useRef, useState } from 'react';
import { WorldState, Message, StoryNode } from '../types';
import IdentityCard from './IdentityCard';
import { sendChatMessage } from '../services/geminiService';
import { ArrowLeft, Clock, Stars, Send, Sparkles, Map, BookOpen, Image as ImageIcon } from 'lucide-react';

interface Props {
  world: WorldState;
  onBack: () => void;
  onUpdateWorld: (updated: WorldState) => void;
}

const WorldView: React.FC<Props> = ({ world, onBack, onUpdateWorld }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [world.chatHistory]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    
    const userMsg: Message = {
        role: 'user',
        content: text,
        timestamp: Date.now()
    };
    
    // 1. Immediate local update
    const tempHistory = [...world.chatHistory, userMsg];
    const tempWorld = { ...world, chatHistory: tempHistory };
    onUpdateWorld(tempWorld); // Triggers App save
    setInputText('');

    try {
      // 2. Get AI Response
      const { message: aiMsg, updatedPlotTree } = await sendChatMessage(tempWorld, text);
      
      const finalWorld = {
        ...world,
        chatHistory: [...tempHistory, aiMsg],
        plotTree: updatedPlotTree || world.plotTree,
        lastActive: Date.now()
      };
      
      onUpdateWorld(finalWorld); // Triggers App save
    } catch (error) {
      console.error("Failed to continue story", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  };

  const lastModelMessage = [...world.chatHistory].reverse().find(m => m.role === 'model');
  
  // Find current chapter for subtle display (Hidden logic)
  const currentChapter = world.plotTree?.find(n => n.status === 'active');

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 flex flex-col md:flex-row">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
         <img 
           src={world.imageUrl} 
           alt={world.name} 
           className="w-full h-full object-cover opacity-20 blur-sm scale-105 transition-transform duration-[20s] ease-linear" 
         />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent" />
      </div>

      {/* Left Col: Meta Info (Plot Tree is now HIDDEN) */}
      <div className="relative z-10 w-full md:w-1/3 p-6 flex flex-col h-full border-r border-white/5 bg-slate-900/60 backdrop-blur-md">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <button 
              onClick={onBack} 
              className="flex items-center text-slate-400 hover:text-white transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Save & Return
            </button>

            <div className="space-y-1 mb-6">
              <span className="text-xs tracking-[0.2em] text-amber-200/70 uppercase">World Shard</span>
              <h1 className="text-3xl md:text-4xl font-serif text-white leading-tight">{world.name}</h1>
            </div>

            <div className="flex gap-4 text-xs text-slate-300 mb-8 font-mono">
              <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                <Clock className="w-3 h-3" /> {world.era}
              </span>
              <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                <Stars className="w-3 h-3" /> {world.mood}
              </span>
            </div>

            <div className="mb-8">
               <IdentityCard identity={world.identity} />
            </div>

            {/* CURRENT CHAPTER INDICATOR (Subtle, hides the full tree) */}
            {currentChapter && (
              <div className="mb-8 border-t border-white/5 pt-6">
                <div className="flex items-center gap-2 mb-2 text-amber-200/60">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-serif uppercase tracking-widest text-xs">Current Chapter</span>
                </div>
                <h3 className="text-xl font-serif text-amber-100 italic">
                  "{currentChapter.title}"
                </h3>
                {/* Description is HIDDEN to prevent spoilers */}
              </div>
            )}

            {world.companion && (
               <div className="mt-auto p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                 <h4 className="text-amber-100 font-serif text-lg mb-1">{world.companion.name}</h4>
                 <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">{world.companion.roleInWorld}</p>
                 <div className="mt-2 text-xs text-amber-200/50 italic">"{world.companion.relationship}"</div>
               </div>
            )}
        </div>
      </div>

      {/* Right Col: Chat */}
      <div className="relative z-10 w-full md:w-2/3 h-full flex flex-col">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth custom-scrollbar"
        >
          {world.chatHistory.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Message Bubble */}
              <div 
                className={`max-w-[90%] md:max-w-[80%] rounded-2xl p-5 md:p-6 ${
                  msg.role === 'user' 
                    ? 'bg-slate-800/80 border border-slate-600/50 text-slate-100 rounded-tr-none' 
                    : 'bg-amber-950/20 border border-amber-200/10 text-slate-200 rounded-tl-none shadow-[0_0_30px_rgba(251,191,36,0.05)]'
                }`}
              >
                 {msg.role === 'model' && (
                    <Sparkles className="w-4 h-4 text-amber-200/50 mb-2" />
                 )}
                 <div className="font-serif text-lg leading-relaxed whitespace-pre-wrap">
                   {msg.content}
                 </div>
              </div>

              {/* Generated Image (If exists) */}
              {msg.imageUrl && (
                <div className={`mt-4 max-w-[90%] md:max-w-[80%] rounded-xl overflow-hidden border border-white/10 shadow-2xl animate-fade-in ${msg.role === 'user' ? 'mr-0' : 'ml-0'}`}>
                  <div className="relative group">
                     <img 
                       src={msg.imageUrl} 
                       alt="Scene visualization" 
                       className="w-full h-auto hover:scale-105 transition-transform duration-700 ease-in-out"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                       <span className="text-xs text-amber-100/80 uppercase tracking-widest flex items-center gap-2">
                         <ImageIcon className="w-3 h-3" /> Generated Memory
                       </span>
                     </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
             <div className="flex justify-start">
               <div className="bg-amber-900/5 border border-amber-200/5 rounded-2xl rounded-tl-none p-6 flex items-center gap-3">
                  <Stars className="w-4 h-4 text-amber-200 animate-spin" />
                  <span className="text-slate-400 font-serif italic text-sm">The universe is weaving reality...</span>
               </div>
             </div>
          )}
          <div className="h-4"></div>
        </div>

        {/* Input Area */}
        <div className="bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent p-6 md:p-8 border-t border-white/5">
          
          {!isLoading && lastModelMessage?.choices && (
            <div className="flex flex-wrap gap-3 mb-4 justify-center md:justify-start">
               {lastModelMessage.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleSend(choice.text)}
                    className={`px-4 py-2 rounded-full border text-sm font-serif transition-all hover:scale-105
                      ${choice.intent === 'connect' ? 'border-pink-500/30 bg-pink-900/10 text-pink-100 hover:border-pink-400' : 
                        choice.intent === 'explore' ? 'border-emerald-500/30 bg-emerald-900/10 text-emerald-100 hover:border-emerald-400' :
                        'border-amber-200/20 bg-amber-900/10 text-amber-100 hover:border-amber-200/40'
                      }`}
                  >
                    {choice.text}
                  </button>
               ))}
            </div>
          )}

          <div className="relative max-w-4xl mx-auto">
            <div className="relative flex items-end bg-slate-900/80 border border-slate-700 rounded-xl focus-within:border-amber-200/50 transition-colors p-2">
               <textarea
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyDown={handleKeyPress}
                 placeholder="What do you want to do?"
                 className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 focus:ring-0 resize-none p-3 max-h-32 min-h-[50px] font-serif text-lg"
                 rows={1}
               />
               <button 
                 onClick={() => handleSend(inputText)}
                 disabled={!inputText.trim() || isLoading}
                 className="p-3 mb-1 rounded-lg bg-amber-200/10 hover:bg-amber-200/20 text-amber-200 disabled:opacity-30 transition-all"
               >
                 <Send className="w-5 h-5" />
               </button>
            </div>
            <p className="text-center text-xs text-slate-600 mt-2 font-mono">
               Progress is saved automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldView;
