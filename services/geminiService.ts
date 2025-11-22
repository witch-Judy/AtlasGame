
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

// Helper to generate an image using Imagen model
const generateSceneImage = async (prompt: string): Promise<string | undefined> => {
  try {
    // Using Imagen 3 model (as per SDK best practices for generation)
    // Or imagen-4.0-generate-001 if available in the specific environment
    const model = 'imagen-3.0-generate-001'; 
    
    const response = await ai.models.generateImages({
      model,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9', // Cinematic aspect ratio for story scenes
      },
    });

    const base64String = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64String) {
      return `data:image/png;base64,${base64String}`;
    }
    return undefined;
  } catch (e) {
    console.warn("Image generation failed:", e);
    return undefined;
  }
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
      visualStyle: data.visualStyle || "Fantasy art", // Capture style
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

    const styleContext = currentWorld.visualStyle 
      ? `Visual Style Constraint: Keep images in the style of "${currentWorld.visualStyle}".` 
      : "";

    const prompt = `
      ${SYSTEM_INSTRUCTION}

      **Current World:** ${currentWorld.name}
      **User:** ${currentWorld.identity.title}
      ${styleContext}
      
      **Current Plot Status:**
      ${plotStatus}

      **Task:**
      1. Advance the story based on User Input: "${userMessage}".
      2. Check if plot nodes update.
      3. **Decide if an image is needed.** If yes, provide "imagePrompt".
      
      **Return strictly JSON:**
      {
        "content": "Narrative...",
        "choices": [ ... ],
        "plotUpdates": { "completedNodeId": "...", "activatedNodeId": "..." },
        "imagePrompt": "Optional: Description of the scene for the illustrator."
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

    // Handle Image Generation (If prompt exists)
    let generatedImageUrl = undefined;
    if (parsed.imagePrompt) {
       // Combine the specific prompt with the world's visual style to enforce consistency
       const fullImagePrompt = `${parsed.imagePrompt}, art style: ${currentWorld.visualStyle || 'cinematic fantasy'}, high quality, detailed`;
       generatedImageUrl = await generateSceneImage(fullImagePrompt);
    }

    return {
      message: {
        role: 'model',
        content: parsed.content,
        choices: parsed.choices,
        timestamp: Date.now(),
        imageUrl: generatedImageUrl // Attach the image if generated
      },
      updatedPlotTree: newPlotTree
    };

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return {
      message: {
        role: 'model',
        content: "The mists of the multiverse obscure my vision...",
        choices: [{ id: 'retry', text: "Try again", intent: 'resolve' }],
        timestamp: Date.now()
      }
    };
  }
};
