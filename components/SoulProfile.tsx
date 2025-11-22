
import React, { useState } from 'react';
import { Sparkles, Save } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  existingProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

const SoulProfile: React.FC<Props> = ({ existingProfile, onSave }) => {
  const [name, setName] = useState(existingProfile?.name || '');
  const [desc, setDesc] = useState(existingProfile?.description || '');
  const [isOpen, setIsOpen] = useState(!existingProfile);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name, description: desc });
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="bg-slate-900/50 backdrop-blur border border-slate-700 rounded-xl p-4 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-amber-900/20 flex items-center justify-center border border-amber-200/30">
             <Sparkles className="w-5 h-5 text-amber-200" />
           </div>
           <div>
             <h3 className="text-amber-100 font-serif">Soul Signature: {name}</h3>
             <p className="text-xs text-slate-400 truncate max-w-xs">{desc || "No analysis provided"}</p>
           </div>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="text-xs text-slate-400 hover:text-amber-200 underline"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-amber-200/30 rounded-xl p-6 mb-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent"></div>
      
      <div className="flex items-center gap-2 mb-4 text-amber-200">
        <Sparkles className="w-5 h-5" />
        <h2 className="font-serif text-xl">Identity Calibration</h2>
      </div>
      
      <p className="text-sm text-slate-300 mb-6">
        Before you travel, tell the universe who you are. 
        <span className="opacity-50 block mt-1 text-xs">Your MBTI, Astrology, or a simple self-reflection. This shapes your destiny in every world.</span>
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Traveler Name / Alias</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-200/50 outline-none transition-colors"
            placeholder="e.g. The Dreamer"
          />
        </div>
        
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Soul Analysis (Optional)</label>
          <textarea 
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-200/50 outline-none transition-colors h-24 resize-none"
            placeholder="e.g. INFP, Scorpio sun, I feel lost in modern cities but at home in forests..."
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full bg-gradient-to-r from-amber-700/50 to-amber-600/50 hover:from-amber-600 hover:to-amber-500 text-amber-100 py-2 rounded-lg border border-amber-200/20 transition-all flex items-center justify-center gap-2 font-serif"
        >
          <Save className="w-4 h-4" />
          Calibrate & Save
        </button>
      </div>
    </div>
  );
};

export default SoulProfile;
