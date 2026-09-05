export type MomentOccasion = "love" | "birthday" | "apology" | "family" | "missing";

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
  photoPaths: string[];
  quizzes: QuizQuestion[];
  createdAt: string;
  viewCount: number;
  isPasswordProtected?: boolean;
  passwordHash?: string;
  passwordSalt?: string;
  passwordHint?: string;
}

/** Public sanitised representation sent to unauthenticated recipients */
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
  isPasswordProtected?: boolean;
  isUnlocked?: boolean;
  passwordHint?: string;
}

export interface MomentThemeConfig {
  id: MomentOccasion;
  title: string;
  subtitle: string;
  icon: string;
  colorName: string;
  bgGradient: string;
  envelopeBg: string;
  letterBg: string;
  letterText: string;
  accentColor: string;
  accentBorder: string;
  glowColor: string;
  badgeBg: string;
  sealColor: string;
  fontFamily: "serif" | "sans";
  ambientDescription: string;
}

export const MOMENT_THEMES: Record<MomentOccasion, MomentThemeConfig> = {
  love: {
    id: "love",
    title: "Love & Romance",
    subtitle: "A heartfelt declaration sealed in rose and eternal parchment",
    icon: "💖",
    colorName: "Rose & Parchment",
    bgGradient: "linear-gradient(135deg, #1C0A14 0%, #2E0F23 50%, #170710 100%)",
    envelopeBg: "linear-gradient(145deg, #881337 0%, #4C0519 100%)",
    letterBg: "#FFF1F2",
    letterText: "#4C0519",
    accentColor: "#F43F5E",
    accentBorder: "border-rose-500/40",
    glowColor: "rgba(244, 63, 94, 0.35)",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    sealColor: "#E11D48",
    fontFamily: "serif",
    ambientDescription: "Floating soft crimson rose petals drifting in twilight",
  },
  birthday: {
    id: "birthday",
    title: "Birthday Celebration",
    subtitle: "A joyous tribute filled with golden light and warm memories",
    icon: "🎂",
    colorName: "Warm Amber & Gold",
    bgGradient: "linear-gradient(135deg, #1A1204 0%, #2E1F07 50%, #140E02 100%)",
    envelopeBg: "linear-gradient(145deg, #B45309 0%, #78350F 100%)",
    letterBg: "#FFFBEB",
    letterText: "#78350F",
    accentColor: "#F59E0B",
    accentBorder: "border-amber-500/40",
    glowColor: "rgba(245, 158, 11, 0.35)",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    sealColor: "#D97706",
    fontFamily: "sans",
    ambientDescription: "Golden spark confetti drifting across an illuminated horizon",
  },
  apology: {
    id: "apology",
    title: "Apology & Reconciliation",
    subtitle: "An honest, quiet peace offering written with humility",
    icon: "🕯️",
    colorName: "Slate & Soft Lilac",
    bgGradient: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #090D16 100%)",
    envelopeBg: "linear-gradient(145deg, #334155 0%, #1E293B 100%)",
    letterBg: "#F8FAFC",
    letterText: "#1E293B",
    accentColor: "#818CF8",
    accentBorder: "border-indigo-500/40",
    glowColor: "rgba(129, 140, 248, 0.3)",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    sealColor: "#6366F1",
    fontFamily: "serif",
    ambientDescription: "Quiet lavender mist clearing into open skies",
  },
  family: {
    id: "family",
    title: "Family Moments & Roots",
    subtitle: "Honoring the unconditional bonds and milestones that anchor us",
    icon: "🏡",
    colorName: "Honey & Olive",
    bgGradient: "linear-gradient(135deg, #141A0E 0%, #202914 50%, #0F140A 100%)",
    envelopeBg: "linear-gradient(145deg, #3F6212 0%, #1A2E05 100%)",
    letterBg: "#FEFCE8",
    letterText: "#365314",
    accentColor: "#84CC16",
    accentBorder: "border-lime-500/40",
    glowColor: "rgba(132, 204, 22, 0.3)",
    badgeBg: "bg-lime-500/20 text-lime-300 border-lime-500/30",
    sealColor: "#65A30D",
    fontFamily: "sans",
    ambientDescription: "Warm morning sunlight filtering through ancient branches",
  },
  missing: {
    id: "missing",
    title: "Missing You & Nostalgia",
    subtitle: "Bridging the distance with longing thoughts across the miles",
    icon: "🌙",
    colorName: "Midnight & Celestial Blue",
    bgGradient: "linear-gradient(135deg, #030712 0%, #0C1E3D 50%, #020617 100%)",
    envelopeBg: "linear-gradient(145deg, #1E3A8A 0%, #0F172A 100%)",
    letterBg: "#F0F9FF",
    letterText: "#0C4A6E",
    accentColor: "#38BDF8",
    accentBorder: "border-sky-500/40",
    glowColor: "rgba(56, 189, 248, 0.35)",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    sealColor: "#0284C7",
    fontFamily: "serif",
    ambientDescription: "A gentle celestial starlight canopy breathing softly",
  },
};
