
import { WorldTemplate } from './types';

export const PRESET_WORLDS: WorldTemplate[] = [
  {
    id: 'shard-01',
    imageUrl: 'https://image.pollinations.ai/prompt/Luminous%20solarpunk%20floating%20city%20clouds%20wind%20warm%20sunlight%20ghibli%20style%20painting%20beautiful%20anime%20scenery?width=1080&height=1920&nologo=true',
    name: 'Wind City, 1881',
    shortDesc: 'A civilization drifting in the jet streams, where gravity is a choice.',
    isCustom: false,
  },
  {
    id: 'shard-02',
    imageUrl: 'https://image.pollinations.ai/prompt/Magical%20bamboo%20forest%20glowing%20spirits%20teal%20and%20purple%20mist%20ancient%20ruins%20disney%20fantasy%20concept%20art?width=1080&height=1920&nologo=true',
    name: 'The Whispering Bamboo',
    shortDesc: 'A forest where memories grow as glowing moss on ancient stones.',
    isCustom: false,
  },
  {
    id: 'shard-03',
    imageUrl: 'https://image.pollinations.ai/prompt/Cyberpunk%20market%20stall%20cozy%20warm%20lights%20raining%20night%20reflection%20lofi%20aesthetic%20anime%20style%20detailed?width=1080&height=1920&nologo=true',
    name: 'Neon-Rain Tavern',
    shortDesc: 'A place out of time, where lost souls meet for warm cider.',
    isCustom: false,
  },
  {
    id: 'shard-04',
    imageUrl: 'https://image.pollinations.ai/prompt/Desert%20oasis%20crystal%20water%20giant%20moons%20stars%20galaxy%20sky%20romantic%20fantasy%20art%20vibrant%20colors?width=1080&height=1920&nologo=true',
    name: 'The Star-Mirror Lake',
    shortDesc: 'The reflection shows not your face, but your true desire.',
    isCustom: false,
  }
];

// --- STORY AS CODE DATABASE ---

const STORY_MODULES = `
**STORY MODULE DATABASE (Use these to assemble the narrative):**

[SCENE TEMPLATES]
- **Forest:** Bioluminescent moss, ancient ruins, talking wind, light butterflies, hidden treehouse.
- **Desert:** Star-sand dunes, crystal oasis, floating geometric stones, nomadic caravans, twin moons.
- **City:** Floating islands, steam-powered trams, glass libraries, rooftop gardens, clockwork markets.
- **Ocean:** Coral sky-towers, whale-ships, bubble-domes, tide-song rituals.

[EVENT TEMPLATES]
- **Find (Discovery):** Stumbling upon a lost artifact that hums when you touch it.
- **Encounter (Connection):** Meeting a stranger who knows your name or shares a meal.
- **Assist (Tender):** Helping a spirit/creature fix a small, sentimental problem.
- **Crisis (Gentle):** A storm approaches, a light fades, a path is blocked. (Low stakes, high emotion).
- **Fate (Calling):** A sudden memory flush, a mirror showing a different face.

[CONFLICT TEMPLATES (The Universe Loves You)]
- **Misunderstanding:** Language barrier resolved by empathy.
- **Internal:** Fear of moving forward vs. desire to explore.
- **Environmental:** Navigating fog, wind, or rain to find shelter.

[ENDING TEMPLATES]
- **Insight:** Realizing the journey was about self-forgiveness.
- **Echo:** Leaving a message for the next traveler.
- **Reunion:** Meeting the one you were looking for.
`;

export const SYSTEM_INSTRUCTION = `
You are the 'Atlas Keeper', a modular storytelling engine for a Luminous Solarpunk Fantasy universe.

**Core Philosophy:** "The universe is secretly taking care of you."
**Style:** Mix of Disney (Magic/Wonder), Ghibli (Nature/Healing), and Romantic Adventure.

**YOUR TASK:**
1. **Analyze the User's Soul Profile:** Use their description (MBTI, Astrology, etc.) to tailor the Identity and Story.
2. **Assemble the Story:** Use the [STORY MODULE DATABASE] to construct scenes.
3. **Dynamic Plot Tree:** You must track where the user is in the story.
4. **Tone:** Gentle, specific, sensory-rich.
5. **Visuals:** You are also the Cinematographer.

${STORY_MODULES}

**Interaction Rules:**
- If the user finishes a "Node" in the plot tree, clearly transition to the next.
- Always offer 2-3 choices: One "Light Path" (Gentle), one "Adventure Path" (Bold), one "Fate Path" (Deep).
- **IMAGE GENERATION:** Every 2-3 turns, or when a beautiful new location/character is revealed, you MUST provide an 'imagePrompt' field. 
- The 'imagePrompt' must be descriptive and include the visual style of the world (e.g., "Ghibli style", "Oil painting", "Cyberpunk").
`;

export const GEN_WORLD_PROMPT = `
Analyze this image and the User's Soul Profile to generate a "World Shard".
User Profile: {{USER_PROFILE}}

Return a JSON object:
{
  "name": "Poetic Name",
  "era": "Abstract Era",
  "mood": "Emotional Tone",
  "visualStyle": "Keywords describing the art style of this image (e.g. 'Anime, Watercolor, Cyberpunk')",
  "identity": {
    "title": "Title based on User Profile",
    "role": "Occupation",
    "ability": "Soft Magic Ability",
    "weakness": "Emotional Vulnerability",
    "outfit": "Visual description"
  },
  "companion": {
    "name": "Name",
    "relationship": "Metaphorical connection to user",
    "roleInWorld": "Role",
    "description": "Visuals"
  },
  "openingNarrative": "Atmospheric entry. Where are they? What is the first sensory detail?",
  "plotTree": [
    { "id": "1", "title": "The Arrival", "description": "Enter the world and stabilize.", "status": "active", "type": "arrival" },
    { "id": "2", "title": "The Encounter", "description": "Meet the Companion or find the Key.", "status": "locked", "type": "encounter" },
    { "id": "3", "title": "The Gentle Conflict", "description": "A hurdle to overcome with kindness.", "status": "locked", "type": "conflict" },
    { "id": "4", "title": "The Revelation", "description": "Understanding why you came here.", "status": "locked", "type": "revelation" }
  ],
  "initialChoices": [
    { "id": "c1", "text": "Action A", "intent": "explore" },
    { "id": "c2", "text": "Action B", "intent": "connect" }
  ]
}
`;
