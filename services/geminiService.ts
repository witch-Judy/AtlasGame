
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION, GEN_WORLD_PROMPT } from "../constants";
import { Message, WorldState, UserProfile, StoryNode } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const urlToGenerativePart = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper to generate an image strictly when requested
// Returns undefined on failure instead of throwing, to avoid UI errors
export const generateImageForScene = async (
  sceneDescription: string,
  visualStyle: string
): Promise<string | undefined> => {
  // Updated Aesthetic based on user request
  const aestheticStyle = "New Chinese style digital illustration, Guofeng, ethereal and dreamy atmosphere, semi-impasto style with watercolor textures, delicate brushstrokes. Lighting & Color: Soft cinematic lighting, volumetric lighting (sun rays), dappled light (komorebi), light and airy composition, muted pastel color palette, elegant aesthetic, high definition, 8k resolution, anime-influenced semi-realism.";

  const prompt = `Scene Description: ${sceneDescription}. \n\nWorld Context: ${visualStyle}. \n\nArt Style & Aesthetic: ${aestheticStyle}`;
  
  // Increased length limit to accommodate the detailed style description
  const safePrompt = prompt.substring(0, 1500);

  // Strategy 1: Try Imagen 3.0
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: safePrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg'
      }
    });
    const base64Data = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64Data) return `data:image/jpeg;base64,${base64Data}`;
  } catch (e) {
    console.warn("Imagen 3.0 failed, falling back...", e);
  }

  // Strategy 2: Fallback to Gemini 2.5 Flash Image
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: safePrompt }] }
    });
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
             return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (e) {
    console.error("Image generation failed silently:", e);
  }
  return undefined;
};


export const generateWorldFromImage = async (
  imageBase64: string, 
  userProfile: UserProfile | null,
  mimeType: string = 'image/jpeg'
): Promise<Partial<WorldState> & { openingNarrative: string, initialChoices: any[], plotTree: StoryNode[] }> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Inject User Profile into prompt
    let profileText = "Generic Traveler";
    if (userProfile) {
      profileText = `Name: ${userProfile.name}, Analysis: ${userProfile.description}`;
    }
    const specificPrompt = GEN_WORLD_PROMPT.replace('{{USER_PROFILE}}', profileText);

    const response = await ai.models.generateContent({
      model,
      contents: {
        role: 'user',
        parts: [
          { text: SYSTEM_INSTRUCTION },
          { text: specificPrompt },
          {
            inlineData: {
              mimeType,
              data: imageBase64
            }
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    const data = JSON.parse(text);

    return {
      name: data.name,
      era: data.era,
      mood: data.mood,
      visualStyle: data.visualStyle || "Fantasy art",
      identity: data.identity,
      companion: data.companion,
      openingNarrative: data.openingNarrative,
      initialChoices: data.initialChoices || data.choices,
      plotTree: data.plotTree || []
    };

  } catch (error) {
    console.error("Gemini World Gen Error:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  currentWorld: WorldState, 
  userMessage: string
): Promise<{ message: Message, updatedPlotTree?: StoryNode[] }> => {
  try {
    const model = 'gemini-2.5-flash';

    const memoryContext = currentWorld.chatHistory.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Atlas Keeper'}: ${msg.content}`
    ).join("\n\n");

    const plotStatus = currentWorld.plotTree.map(node => 
      `- [${node.status.toUpperCase()}] ${node.title}: ${node.description}`
    ).join("\n");

    const prompt = `
      ${SYSTEM_INSTRUCTION}

      **Current World:** ${currentWorld.name}
      **User:** ${currentWorld.identity.title}
      
      **Current Plot Status:**
      ${plotStatus}

      **Task:**
      1. Advance the story based on User Input: "${userMessage}".
      2. Check if plot nodes update.
      3. Do NOT generate an imagePrompt.
      
      **Return strictly JSON:**
      {
        "content": "Narrative...",
        "choices": [ ... ],
        "plotUpdates": { "completedNodeId": "...", "activatedNodeId": "..." }
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        role: 'user',
        parts: [
           { text: `History:\n${memoryContext}` },
           { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const parsed = JSON.parse(text);

    // Handle Plot Updates
    let newPlotTree = undefined;
    if (parsed.plotUpdates && currentWorld.plotTree) {
       newPlotTree = currentWorld.plotTree.map(node => {
          if (node.id === parsed.plotUpdates.completedNodeId) return { ...node, status: 'completed' };
          if (node.id === parsed.plotUpdates.activatedNodeId) return { ...node, status: 'active' };
          return node;
       }) as StoryNode[];
    }

    return {
      message: {
        role: 'model',
        content: parsed.content,
        choices: parsed.choices,
        timestamp: Date.now(),
        // No automatic imageUrl anymore
      },
      updatedPlotTree: newPlotTree
    };

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return {
      message: {
        role: 'model',
        content: "The mists of the multiverse obscure my vision... (Connection error, please try again)",
        choices: [{ id: 'retry', text: "Try again", intent: 'resolve' }],
        timestamp: Date.now()
      }
    };
  }
};
