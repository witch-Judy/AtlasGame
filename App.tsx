
import React, { useState, useEffect } from 'react';
import { PRESET_WORLDS } from './constants';
import { WorldTemplate, WorldState, UserProfile } from './types';
import UploadPortal from './components/UploadPortal';
import WorldView from './components/WorldView';
import SoulProfile from './components/SoulProfile';
import { generateWorldFromImage, fileToGenerativePart, urlToGenerativePart } from './services/geminiService';
import { Compass, Sparkles, Trash2, Play } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'atlas' | 'world'>('atlas');
  const [currentWorld, setCurrentWorld] = useState<WorldState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [customWorlds, setCustomWorlds] = useState<WorldTemplate[]>([]);

  // Load Data
  useEffect(() => {
    const savedWorlds = localStorage.getItem('cross_realm_archives');
    if (savedWorlds) {
      try {
        setCustomWorlds(JSON.parse(savedWorlds));
      } catch (e) { console.error("Archive load error", e); }
    }

    const savedProfile = localStorage.getItem('cross_realm_profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) { console.error("Profile load error", e); }
    }
  }, []);

  // Save Profile
  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('cross_realm_profile', JSON.stringify(profile));
  };

  // Save Custom World List
  const persistCustomWorlds = (worlds: WorldTemplate[]) => {
    setCustomWorlds(worlds);
    localStorage.setItem('cross_realm_archives', JSON.stringify(worlds));
  };

  // Delete Custom World
  const deleteCustomWorld = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = customWorlds.filter(w => w.id !== id);
    persistCustomWorlds(updated);
  };

  // UPDATE WORLD STATE (Auto-Save Logic)
  // This is called by WorldView whenever a message is sent/received
  const handleWorldUpdate = (updatedWorld: WorldState) => {
    setCurrentWorld(updatedWorld);
    
    if (updatedWorld.isCustom) {
      // Find the template in customWorlds and update its internal state
      const updatedTemplates = customWorlds.map(w => {
        if (w.id === updatedWorld.id) {
          return { ...w, savedState: updatedWorld }; // Save the full state into the template list
        }
        return w;
      });
      persistCustomWorlds(updatedTemplates);
    }
  };

  // ENTER WORLD
  const enterWorld = async (template: WorldTemplate) => {
    // 1. Check if we have a saved state to resume
    if (template.isCustom && template.savedState) {
      setCurrentWorld(template.savedState);
      setView('world');
      return;
    }

    // 2. If no saved state, generate new (for Presets or fresh Custom)
    // Note: Presets currently don't persist across reloads in this simple version 
    // unless we converted them to custom. For now, Presets regenerate each time 
    // to allow different outcomes, unless we add logic to clone them.
    
    setIsGenerating(true);
    try {
      let base64: string = await urlToGenerativePart(template.imageUrl);

      const generatedData = await generateWorldFromImage(base64, userProfile);
      
      const newWorld: WorldState = {
        id: template.isCustom ? template.id : `preset-instance-${Date.now()}`,
        name: generatedData.name || template.name,
        imageUrl: template.imageUrl,
        era: generatedData.era || "Unknown Era",
        mood: generatedData.mood || "Mysterious",
        identity: generatedData.identity as any,
        companion: generatedData.companion || null,
        chatHistory: [{
          role: 'model',
          content: generatedData.openingNarrative || "You arrive...",
          choices: generatedData.initialChoices || [],
          timestamp: Date.now()
        }],
        plotTree: generatedData.plotTree || [],
        isCustom: template.isCustom || false
      };

      // If it's custom, save this initial state immediately
      if (template.isCustom) {
        const updatedTemplates = customWorlds.map(w => 
          w.id === template.id ? { ...w, savedState: newWorld, name: newWorld.name } : w
        );
        persistCustomWorlds(updatedTemplates);
      }

      setCurrentWorld(newWorld);
      setView('world');
    } catch (e) {
      console.error(e);
      alert("The portal refused to open. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // UPLOAD NEW WORLD
  const handleUpload = async (file: File) => {
    setIsGenerating(true);
    try {
      const base64Data = await fileToGenerativePart(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      await new Promise<void>((resolve) => {
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          
          const generatedData = await generateWorldFromImage(base64Data, userProfile, file.type);
          
          const newId = `custom-${Date.now()}`;
          const worldName = generatedData.name || "New Realm";
          
          const newWorldState: WorldState = {
            id: newId,
            name: worldName,
            imageUrl: dataUrl,
            era: generatedData.era || "Unknown",
            mood: generatedData.mood || "Unknown",
            identity: generatedData.identity as any,
            companion: generatedData.companion as any,
            chatHistory: [{
              role: 'model',
              content: generatedData.openingNarrative || "You step into the frame...",
              choices: generatedData.initialChoices || [],
              timestamp: Date.now()
            }],
            plotTree: generatedData.plotTree || [],
            isCustom: true
          };

          // Create Template with Saved State
          const newTemplate: WorldTemplate = {
            id: newId,
            imageUrl: dataUrl,
            name: worldName,
            shortDesc: `A captured memory from ${generatedData.era}.`,
            isCustom: true,
            savedState: newWorldState
          };
          
          persistCustomWorlds([newTemplate, ...customWorlds]);
          setCurrentWorld(newWorldState);
          setView('world');
          resolve();
        };
      });

    } catch (e) {
      console.error(e);
      alert("The universe is cloudy today. Could not interpret the shard.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (view === 'world' && currentWorld) {
    return (
      <WorldView 
        world={currentWorld} 
        onBack={() => setView('atlas')} 
        onUpdateWorld={handleWorldUpdate} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[url('https://images.unsplash.com/photo-1506318137071-a8bcbf7fe655?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-fixed bg-center">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm z-0"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 text-amber-200/80 border border-amber-200/20 rounded-full px-4 py-1 mb-4 backdrop-blur-md">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span className="text-xs uppercase tracking-widest">Multiverse Navigation System</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 drop-shadow-lg">
            The Cross-Realm Atlas
          </h1>
        </div>

        <SoulProfile existingProfile={userProfile} onSave={handleSaveProfile} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <UploadPortal onUpload={handleUpload} isProcessing={isGenerating} />

          {[...customWorlds, ...PRESET_WORLDS].map((world, index) => (
            <div 
              key={world.id} 
              onClick={() => !isGenerating && enterWorld(world)}
              className={`group relative h-72 rounded-xl overflow-hidden border border-slate-700 hover:border-amber-200/50 transition-all duration-500 cursor-pointer ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img 
                src={world.imageUrl} 
                alt={world.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-amber-200/80 uppercase tracking-wider block">
                        {world.isCustom ? 'Archived Memory' : 'World Shard'}
                      </span>
                      {world.savedState && (
                        <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          <Play className="w-2 h-2" /> RESUME
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-serif text-white mb-1 group-hover:text-amber-100 transition-colors line-clamp-1">
                      {world.name}
                    </h3>
                    <p className="text-sm text-slate-300 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                      {world.shortDesc}
                    </p>
                  </div>
                </div>
              </div>

              {world.isCustom && (
                <button
                  onClick={(e) => deleteCustomWorld(e, world.id)}
                  className="absolute top-2 right-2 p-2 bg-slate-900/60 hover:bg-red-900/80 text-slate-400 hover:text-red-200 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 z-20"
                  title="Forget this memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {isGenerating && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
             <div className="text-center">
                <div className="w-16 h-16 border-4 border-amber-200 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-2xl font-serif text-amber-100 animate-pulse">Synchronizing Soul Frequency...</h2>
                <p className="text-slate-400 mt-2">Weaving your profile into the narrative loom.</p>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default App;
