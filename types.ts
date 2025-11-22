
export interface Identity {
  title: string;
  role: string;
  ability: string;
  weakness: string;
  outfit: string;
}

export interface Companion {
  name: string;
  relationship: string; // e.g., "A rival from reality", "A lost love"
  roleInWorld: string;
  description: string;
}

export interface NarrativeChoice {
  id: string;
  text: string;
  intent: 'explore' | 'connect' | 'remember' | 'resolve' | 'fate';
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  choices?: NarrativeChoice[]; 
  imageUrl?: string; // New: Image generated for this turn
}

export interface StoryNode {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'active' | 'completed';
  type: 'arrival' | 'encounter' | 'conflict' | 'revelation' | 'ending';
}

export interface WorldState {
  id: string;
  name: string;
  imageUrl: string;
  era: string;
  mood: string;
  identity: Identity;
  companion: Companion | null;
  chatHistory: Message[];
  plotTree: StoryNode[]; // The dynamic plot structure
  isCustom: boolean;
  lastActive?: number;
  visualStyle?: string; // New: Store the art style keywords for consistency
}

export interface WorldTemplate {
  id: string;
  imageUrl: string;
  name: string;
  shortDesc: string;
  isCustom?: boolean;
  savedState?: WorldState; // For resuming sessions
}

export interface UserProfile {
  name: string;
  description: string; // MBTI, Astrology, or self-analysis
}
