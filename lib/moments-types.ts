// Unified Data Models and Types for Sanctum Moments

/**
 * Strips leading student ID, employee roll, or system code prefixes
 * (e.g. "204_ Vivek Kumar Verma" -> "Vivek Kumar Verma")
 * often introduced from institutional Google Workspace SSO display names.
 */
export function cleanSenderName(rawName?: string | null): string {
  if (!rawName) return "";
  const trimmed = rawName.trim();
  const cleaned = trimmed.replace(/^[\w\d]+[_\-:]\s*/i, "").trim();
  return cleaned || trimmed;
}

export type MomentOccasion = 
  | "love" 
  | "birthday" 
  | "apology" 
  | "family" 
  | "missing";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface SanctumMoment {
  id: string;
  ownerUid: string;
  sourceChapterId?: string;
  occasion: MomentOccasion;
  recipientName: string;
  senderName: string;
  rawMessage: string;
  polishedMessage?: string;
  usePolished: boolean;
  photoPaths: string[]; // Firebase Storage or data URLs
  quizzes: QuizQuestion[];
  ambientAudioTrack?: string;
  createdAt: string;
  viewCount: number;
  accentColor?: string;
  waxSealColor?: string;
  isPasswordProtected?: boolean;
  passwordHash?: string;
  passwordSalt?: string;
  passwordHint?: string;
}

export interface PublicSanctumMoment {
  id: string;
  occasion: MomentOccasion;
  recipientName: string;
  senderName: string;
  displayMessage?: string;
  hasPolishedOption?: boolean;
  photoPaths: string[];
  quizzes: {
    id: string;
    question: string;
    options: string[];
  }[];
  createdAt: string;
  viewCount: number;
  ambientAudioTrack?: string;
  accentColor?: string;
  waxSealColor?: string;
  isPasswordProtected?: boolean;
  isUnlocked?: boolean;
  passwordHint?: string;
}

export interface MomentRenderableData {
  id?: string;
  occasion: MomentOccasion;
  recipientName: string;
  senderName: string;
  displayMessage?: string;
  rawMessage?: string;
  polishedMessage?: string;
  usePolished?: boolean;
  photoPaths?: string[];
  quizzes?: {
    id: string;
    question: string;
    options: string[];
    correctIndex?: number;
  }[];
  createdAt?: string;
  ambientAudioTrack?: string;
  accentColor?: string;
  waxSealColor?: string;
  isPasswordProtected?: boolean;
  isUnlocked?: boolean;
  passwordHint?: string;
}

export interface OccasionPalette {
  primaryBg: string;
  cardBase: string;
  cardBorder: string;
  textHeading: string;
  textBody: string;
  accent: string;
  highlight: string;
}

export interface OccasionConfig {
  id: MomentOccasion;
  title: string;
  emoji: string;
  icon?: string;
  themeName: string;
  subtitle: string;
  description: string;
  palette: OccasionPalette;
  defaultAccent: string;
  defaultSecondary: string;
  bgGradient: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  borderAccent: string;
  glowColor: string;
  sealLabel: string;
  sealIconName: string;
  fontFamily: "serif" | "sans" | "mono";
  defaultPromptStarter: string;
  defaultQuizExample: QuizQuestion[];
}

export const OCCASION_CONFIGS: Record<MomentOccasion, OccasionConfig> = {
  love: {
    id: "love",
    title: "Love & Romance",
    emoji: "💖",
    icon: "💖",
    themeName: "Wax-Sealed Love Letter",
    subtitle: "A wax-sealed vintage envelope revealing floating glowing hearts",
    description: "Ideal for anniversaries, confessions of devotion, and heartfelt romance.",
    palette: {
      primaryBg: "#2b0314",
      cardBase: "#3d061c",
      cardBorder: "#800f2f",
      textHeading: "#FFF1F2",
      textBody: "#FECDD3",
      accent: "#FB7185",
      highlight: "#F43F5E",
    },
    defaultAccent: "#FB7185",
    defaultSecondary: "#FFF1F2",
    bgGradient: "from-[#2b0314] via-[#4d0722] to-[#1a010c]",
    cardBg: "bg-[#3d061c]/95",
    textPrimary: "text-[#FFF1F2]",
    textSecondary: "text-[#FECDD3]/90",
    borderAccent: "border-[#800f2f]",
    glowColor: "rgba(244, 63, 94, 0.55)",
    sealLabel: "💖 Love Letter",
    sealIconName: "Heart",
    fontFamily: "serif",
    defaultPromptStarter: "From the first day you walked into my life, every quiet ordinary evening has felt richer and warmer with you beside me...",
    defaultQuizExample: [
      {
        id: "q1",
        question: "Where did we share our most unforgettable quiet evening together?",
        options: ["Under the city starlight", "By the warm cafe corner", "At the seaside pier"],
        correctIndex: 0,
      },
    ],
  },
  birthday: {
    id: "birthday",
    title: "Birthday Celebration",
    emoji: "🎂",
    icon: "🎂",
    themeName: "Birthday Gift & Celebration",
    subtitle: "A festive gift box unwrapping with birthday candles, confetti, and cheer",
    description: "Celebrate milestones, laughter, and another brilliant trip around the sun.",
    palette: {
      primaryBg: "#1e0538",
      cardBase: "#2e0854",
      cardBorder: "#7b2cbf",
      textHeading: "#FFFDF0",
      textBody: "#FDE68A",
      accent: "#FBBF24",
      highlight: "#EC4899",
    },
    defaultAccent: "#FBBF24",
    defaultSecondary: "#FFFDF0",
    bgGradient: "from-[#1e0538] via-[#3c096c] to-[#10002b]",
    cardBg: "bg-[#2e0854]/95",
    textPrimary: "text-[#FFFDF0]",
    textSecondary: "text-[#FDE68A]/90",
    borderAccent: "border-[#7b2cbf]",
    glowColor: "rgba(245, 158, 11, 0.6)",
    sealLabel: "🎂 Birthday Celebration",
    sealIconName: "Gift",
    fontFamily: "serif",
    defaultPromptStarter: "It is wild to think about how much life we have packed into these past years and how you still bring that same brilliant spark to every room...",
    defaultQuizExample: [
      {
        id: "q1",
        question: "What is the funniest memory we shared over this past year?",
        options: ["The road trip spontaneous detour", "The kitchen cooking experiment", "The late-night laughing fit"],
        correctIndex: 2,
      },
    ],
  },
  apology: {
    id: "apology",
    title: "Heartfelt Apology",
    emoji: "🕯️",
    icon: "🕯️",
    themeName: "Tranquil Water & Blooming Lotus",
    subtitle: "Gentle ripples, soothing mist, and an open heart of sincere amends",
    description: "When words matter most—say 'I am sorry' with dignity, vulnerability, and stillness.",
    palette: {
      primaryBg: "#061826",
      cardBase: "#0a2540",
      cardBorder: "#1e537d",
      textHeading: "#F0FDF4",
      textBody: "#BAE6FD",
      accent: "#38BDF8",
      highlight: "#A78BFA",
    },
    defaultAccent: "#38BDF8",
    defaultSecondary: "#F0FDF4",
    bgGradient: "from-[#061826] via-[#0d3b66] to-[#040f1a]",
    cardBg: "bg-[#0a2540]/95",
    textPrimary: "text-[#F0FDF4]",
    textSecondary: "text-[#BAE6FD]/90",
    borderAccent: "border-[#1e537d]",
    glowColor: "rgba(56, 189, 248, 0.5)",
    sealLabel: "🕊️ Sincere Apology",
    sealIconName: "Feather",
    fontFamily: "serif",
    defaultPromptStarter: "I wanted to take a moment of quiet honesty to say how much I regret how things played out between us, because our bond means far too much to leave unspoken...",
    defaultQuizExample: [
      {
        id: "q1",
        question: "What is the one thing I promise to always cherish and protect between us?",
        options: ["Our mutual trust", "Our honest laughter", "Our shared sanctuary"],
        correctIndex: 0,
      },
    ],
  },
  family: {
    id: "family",
    title: "Family Milestones",
    emoji: "🏡",
    icon: "🏡",
    themeName: "Warm Hearth & Memory Chest",
    subtitle: "Heirloom memories, crackling hearth embers, and timeless family roots",
    description: "Honoring parents, siblings, children, and heritage through tactile keepsakes.",
    palette: {
      primaryBg: "#261005",
      cardBase: "#361607",
      cardBorder: "#78350f",
      textHeading: "#FEF3C7",
      textBody: "#FDE68A",
      accent: "#F59E0B",
      highlight: "#D97706",
    },
    defaultAccent: "#F59E0B",
    defaultSecondary: "#FEF3C7",
    bgGradient: "from-[#261005] via-[#471d07] to-[#140802]",
    cardBg: "bg-[#361607]/95",
    textPrimary: "text-[#FEF3C7]",
    textSecondary: "text-[#FDE68A]/90",
    borderAccent: "border-[#78350f]",
    glowColor: "rgba(245, 158, 11, 0.55)",
    sealLabel: "🏡 Family Milestone",
    sealIconName: "Home",
    fontFamily: "serif",
    defaultPromptStarter: "Looking back across all the years and memories we have built together, you have always been the anchor that keeps our family steady...",
    defaultQuizExample: [
      {
        id: "q1",
        question: "Which family tradition or gathering always brings the warmest smile?",
        options: ["The holiday feast table", "Summer backyard stories", "Sunday morning breakfasts"],
        correctIndex: 0,
      },
    ],
  },
  missing: {
    id: "missing",
    title: "Thinking of You",
    emoji: "🌙",
    icon: "🌙",
    themeName: "Cosmic Starlight & Distant Skies",
    subtitle: "A message across the miles floating in a sea of glowing stars",
    description: "For long-distance bonds, friends afar, and thoughts held under the stars.",
    palette: {
      primaryBg: "#050b2c",
      cardBase: "#0c154a",
      cardBorder: "#27348b",
      textHeading: "#F8FAFC",
      textBody: "#C7D2FE",
      accent: "#818CF8",
      highlight: "#38BDF8",
    },
    defaultAccent: "#818CF8",
    defaultSecondary: "#F8FAFC",
    bgGradient: "from-[#050b2c] via-[#0f1754] to-[#020517]",
    cardBg: "bg-[#0c154a]/95",
    textPrimary: "text-[#F8FAFC]",
    textSecondary: "text-[#C7D2FE]/90",
    borderAccent: "border-[#27348b]",
    glowColor: "rgba(129, 140, 248, 0.55)",
    sealLabel: "🌙 Thinking of You",
    sealIconName: "Moon",
    fontFamily: "serif",
    defaultPromptStarter: "No matter how many miles or weeks sit between where we are right now, you are still the first person I want to tell every time something happens...",
    defaultQuizExample: [
      {
        id: "q1",
        question: "What is the first thing we are doing the moment we see each other next?",
        options: ["The longest embrace", "Going to our favorite dinner spot", "Talking until 3 in the morning"],
        correctIndex: 0,
      },
    ],
  },
};
