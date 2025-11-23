
import React, { useState, useEffect } from 'react';
import { PRESET_WORLDS, TRANSLATIONS } from './constants';
import { WorldTemplate, WorldState, UserProfile } from './types';
import UploadPortal from './components/UploadPortal';
import WorldView from './components/WorldView';
import SoulProfile from './components/SoulProfile';
import { generateWorldFromImage, fileToGenerativePart, urlToGenerativePart } from './services/geminiService';
import { Compass, Sparkles, Trash2, Play, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'atlas' | 'world'>('atlas');
  const [currentWorld, setCurrentWorld] = useState<WorldState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [customWorlds, setCustomWorlds] = useState<WorldTemplate[]>([]);
  const [language, setLanguage] = useState<'en' | 'zh'>('zh');

  const t = TRANSLATIONS[language];

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
    
    // Default to Chinese if browser is Chinese, otherwise check local storage or default to en
    const savedLang = localStorage.getItem('cross_realm_lang');
    if (savedLang === 'en' || savedLang === 'zh') {
        setLanguage(savedLang);
    } 
  }, []);

  const toggleLanguage = () => {
      const newLang = language === 'en' ? 'zh' : 'en';
      setLanguage(newLang);
      localStorage.setItem('cross_realm_lang', newLang);
  };

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
  const handleWorldUpdate = (updatedWorld: WorldState) => {
    setCurrentWorld(updatedWorld);
    
    if (updatedWorld.isCustom) {
      const updatedTemplates = customWorlds.map(w => {
        if (w.id === updatedWorld.id) {
          return { ...w, savedState: updatedWorld };
        }
        return w;
      });
      persistCustomWorlds(updatedTemplates);
    }
  };

  // ENTER WORLD
  const enterWorld = async (template: WorldTemplate) => {
    if (template.isCustom && template.savedState) {
      setCurrentWorld(template.savedState);
      setView('world');
      return;
    }

    setIsGenerating(true);
    try {
      let base64: string = await urlToGenerativePart(template.imageUrl);

      const generatedData = await generateWorldFromImage(base64, userProfile, language);
      
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
          
          const generatedData = await generateWorldFromImage(base64Data, userProfile, language, file.type);
          
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
        language={language}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[url('https://images.unsplash.com/photo-1506318137071-a8bcbf7fe655?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-fixed bg-center">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm z-0"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Header & Lang Switcher */}
        <div className="flex justify-between items-start mb-12">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-amber-200/80 border border-amber-200/20 rounded-full px-4 py-1 mb-4 backdrop-blur-md">
                    <Compass className="w-4 h-4 animate-spin-slow" />
                    <span className="text-xs uppercase tracking-widest">{t.navSystem}</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 drop-shadow-lg">
                    {t.appTitle}
                </h1>
                <p className="text-slate-400 max-w-lg">{t.subtitle}</p>
             </div>
             
             <button 
               onClick={toggleLanguage}
               className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 backdrop-blur border border-slate-600 rounded-full text-slate-300 text-sm transition-colors"
             >
                <Globe className="w-4 h-4" />
                {language === 'en' ? 'CN' : 'EN'}
             </button>
        </div>

        <SoulProfile existingProfile={userProfile} onSave={handleSaveProfile} language={language} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <UploadPortal onUpload={handleUpload} isProcessing={isGenerating} language={language} />

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
                        {world.isCustom ? t.archivedMemory : t.worldShard}
                      </span>
                      {world.savedState && (
                        <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          <Play className="w-2 h-2" /> {t.resume}
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

        {/* --- STARDUST PORTAL EFFECT --- */}
        {isGenerating && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-fade-in overflow-hidden">
             {/* Background Nebulas */}
             <div className="absolute inset-0 bg-black">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[80px] animate-pulse delay-75"></div>
             </div>

             {/* Particle Tunnel - Simulated with Rings */}
             <div className="absolute inset-0 flex items-center justify-center">
                 {[...Array(5)].map((_, i) => (
                    <div 
                       key={i}
                       className="absolute rounded-full border border-blue-100/30 opacity-0"
                       style={{
                          width: `${(i+1) * 200}px`,
                          height: `${(i+1) * 200}px`,
                          animation: `ping 3s cubic-bezier(0, 0, 0.2, 1) infinite`,
                          animationDelay: `${i * 0.4}s`
                       }}
                    />
                 ))}
                 {[...Array(12)].map((_, i) => (
                    <div
                      key={`star-${i}`}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${i * 30}deg) translate(100px)`,
                        animation: `spin 3s linear infinite reverse`, // Use a defined spin or standard transform for better performance, but here utilizing ping logic visual for simplicity
                        boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.8)'
                      }}
                    />
                 ))}
             </div>

             {/* Center Glow */}
             <div className="relative z-10 text-center scale-110">
                <div className="relative w-32 h-32 mx-auto mb-8">
                   <div className="absolute inset-0 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                   <img 
                     src="https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=200&auto=format&fit=crop" 
                     className="w-full h-full object-cover rounded-full border-2 border-white/50 animate-[spin_10s_linear_infinite]"
                     style={{ maskImage: 'radial-gradient(circle, black 40%, transparent 70%)' }}
                     alt="Portal"
                   />
                </div>
                
                <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-purple-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse">
                   {t.portalLoading}
                </h2>
                <p className="text-blue-200/60 mt-4 text-sm tracking-widest uppercase font-mono">
                   {t.portalSub}
                </p>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default App;
