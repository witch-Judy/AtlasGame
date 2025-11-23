
import { WorldTemplate } from './types';

// --- LOCALIZATION DICTIONARY ---

export const TRANSLATIONS = {
  en: {
    appTitle: "The Cross-Realm Atlas",
    subtitle: "A multiverse life simulator based on art, memory, and emotional resonance.",
    navSystem: "Multiverse Navigation System",
    openShard: "Open a New Shard",
    openShardDesc: "Upload an image to let the universe generate a new world, identity, and destiny for you.",
    openingRift: "Opening the Rift...",
    resume: "RESUME",
    worldShard: "World Shard",
    archivedMemory: "Archived Memory",
    saveReturn: "Save & Return",
    visualize: "Visualize",
    animate: "Animate",
    painting: "Painting...",
    animating: "Animating...",
    placeholder: "What do you want to do or say?",
    footer: "You have free will. The choices above are merely whispers of fate.",
    role: "ROLE",
    ability: "ABILITY",
    vulnerability: "VULNERABILITY",
    currentChapter: "Current Chapter",
    soulSignature: "Soul Signature",
    edit: "Edit",
    calibrateSave: "Calibrate & Save",
    identityTitle: "Identity Calibration",
    identityDesc: "Before you travel, tell the universe who you are. Your MBTI, Astrology, or a simple self-reflection.",
    nameLabel: "Traveler Name / Alias",
    analysisLabel: "Soul Analysis (Optional)",
    portalLoading: "Synchronizing Soul Frequency...",
    portalSub: "Weaving your profile into the narrative loom."
  },
  zh: {
    appTitle: "多重人生地图",
    subtitle: "基于艺术、记忆与情感共鸣的多元宇宙模拟器。",
    navSystem: "多元宇宙导航系统",
    openShard: "开启新界",
    openShardDesc: "上传一张图片，让宇宙为你生成一个新的世界、身份与命运。",
    openingRift: "正在撕裂时空...",
    resume: "继续旅程",
    worldShard: "世界碎片",
    archivedMemory: "尘封记忆",
    saveReturn: "保存并返回",
    visualize: "绘制场景",
    animate: "生成动态",
    painting: "绘图中...",
    animating: "生成中...",
    placeholder: "你想做什么或说什么？",
    footer: "你拥有自由意志。以上选择只是命运的低语。",
    role: "身份",
    ability: "能力",
    vulnerability: "弱点",
    currentChapter: "当前篇章",
    soulSignature: "灵魂刻印",
    edit: "编辑",
    calibrateSave: "校准并保存",
    identityTitle: "身份校准",
    identityDesc: "在穿越之前，告诉宇宙你是谁。你的 MBTI、星座或简单的自我独白。这将决定你在每个世界的命运。",
    nameLabel: "行者代号",
    analysisLabel: "灵魂解析 (选填)",
    portalLoading: "正在同频灵魂波长...",
    portalSub: "正在将你的意识编织进叙事织机中。"
  }
};

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

// --- DYNAMIC PROMPTS BASED ON LANGUAGE ---

export const GET_SYSTEM_INSTRUCTION = (lang: 'en' | 'zh') => {
  if (lang === 'zh') {
    return `
你是一个“万界图谱”的守护者，一个基于“新中式国风”与“唯美幻想”风格的模块化叙事引擎。

**核心哲学：** “宇宙在秘密地爱着你。”
**文风要求：** 
1. **新中式/国风/唯美：** 使用优美、有画面感、略带诗意的中文。避免翻译腔。
2. **沉浸感：** 多描写光影、气味、声音和触感。
3. **称呼：** 根据世界观调整对用户的称呼（如：少侠、旅人、阁下、织梦者）。

**你的任务：**
1. **分析用户灵魂：** 根据用户的描述（MBTI、星座等）定制他们在该世界中的身份（Identity）和命运。
2. **构建故事：** 使用经典的英雄之旅结构，但更侧重情感体验而非暴力战斗。
3. **动态剧情树：** 追踪用户在剧情中的位置（Story Node）。
4. **语气：** 温柔、神秘、感性。

**交互规则：**
- 如果用户完成了剧情节点，平滑过渡到下一个。
- 总是提供 2-3 个选择：一个“温和路径”（探索/对话），一个“果敢路径”（行动/冒险），一个“命运路径”（深层连接）。
- **视觉：** 不要自动生成图片。专注于文字描述。
    `;
  }

  return `
You are the 'Atlas Keeper', a modular storytelling engine for a Luminous Solarpunk Fantasy universe.

**Core Philosophy:** "The universe is secretly taking care of you."
**Style:** Mix of Disney (Magic/Wonder), Ghibli (Nature/Healing), and Romantic Adventure.

**YOUR TASK:**
1. **Analyze the User's Soul Profile:** Use their description (MBTI, Astrology, etc.) to tailor the Identity and Story.
2. **Assemble the Story:** Use the [STORY MODULE DATABASE] to construct scenes.
3. **Dynamic Plot Tree:** You must track where the user is in the story.
4. **Tone:** Gentle, specific, sensory-rich.
5. **Visuals:** You are also the Cinematographer.

**Interaction Rules:**
- If the user finishes a "Node" in the plot tree, clearly transition to the next.
- Always offer 2-3 choices: One "Light Path" (Gentle), one "Adventure Path" (Bold), one "Fate Path" (Deep).
- **VISUALS:** Do not automatically generate images. Focus on the narrative text.
  `;
};

export const GET_GEN_WORLD_PROMPT = (lang: 'en' | 'zh') => {
  const outputLang = lang === 'zh' ? "Chinese (Simplified)" : "English";
  
  return `
Analyze this image and the User's Soul Profile to generate a "World Shard".
User Profile: {{USER_PROFILE}}
**IMPORTANT: Output JSON content in ${outputLang}.**

Return a JSON object:
{
  "name": "Poetic Name",
  "era": "Abstract Era",
  "mood": "Emotional Tone",
  "visualStyle": "Keywords describing the art style of this image (e.g. 'New Chinese style, Watercolor, Cyberpunk')",
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
};
