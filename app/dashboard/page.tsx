"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Palette,
  Feather,
  X,
  Search,
  ChevronRight,
  Database,
  Cpu,
  Wand2,
  Volume2,
  VolumeX,
  Trash2,
  Quote,
  Flame,
  TrendingUp,
  Plus,
  Layers,
  BarChart2,
  LayoutDashboard,
  Lock,
  Unlock,
  Hourglass,
  Clock,
  Key,
  Info,
  Calendar,
  Shield,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  HelpCircle,
  Heart,
  Share2,
} from "lucide-react";
import MomentCreator from "@/components/moments/moment-creator";
import { getAllStoredMoments } from "@/lib/moments-service";
import { fetchUserMoments } from "@/lib/moment-service";
import { type SanctumMoment, OCCASION_CONFIGS } from "@/lib/moments-types";
import { fetchUserProfile, saveUserTheme, type ChronicleTheme } from "@/lib/user-service";
import {
  fetchUserChapters,
  saveChapter,
  deleteChapter,
  type LifeChapter,
} from "@/lib/chapter-service";
import {
  fetchUserProphecies,
  sealProphecy,
  updateProphecyFulfilled,
  deleteProphecy,
  decryptReflection,
  type TimeCapsule,
} from "@/lib/prophecy-service";
import { ambientAudioEngine } from "@/lib/ambient-audio";
import { calculateDailyStreak, parseMoodScore } from "@/lib/stats-service";
import BookOpeningLoader from "@/components/BookOpeningLoader";
import BookClosingLoader from "@/components/BookClosingLoader";

// Recharts components for mood trajectory
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface WhoAmIResponse {
  uid?: string;
  email?: string | null;
  emailVerified?: boolean;
  verifiedAt?: string;
  error?: string;
  message?: string;
}

const CONTEXT_TAGS = [
  { label: "Milestone", icon: "🏆", desc: "Key achievement or turning point" },
  { label: "Venting", icon: "🌧️", desc: "Unfiltered release of thoughts" },
  { label: "Creative Idea", icon: "💡", desc: "Spark of imagination or art" },
  { label: "Code Bug", icon: "⚙️", desc: "Technical hurdle or system puzzle" },
  { label: "Daily Reverie", icon: "☕", desc: "Quiet daily reflection" },
];

const ORIGINAL_QUOTES = [
  "The page remembers what the mind surrenders to quiet hours.",
  "Ink is memory rendered visible before the dawning of another day.",
  "A single unvoiced truth held upon paper becomes a compass for years to come.",
  "We do not write to escape time, but to preserve the stillness within it.",
  "Every line recorded is a quiet doorway back to the person you once were.",
];

const THEME_OPTIONS: {
  id: ChronicleTheme;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  accentColor: string;
  badgeBg: string;
}[] = [
  {
    id: "grimoire",
    title: "Vintage Grimoire",
    subtitle: "Parchment, Sepia Ink & Gold Leaf",
    icon: Feather,
    accentColor: "#D97706",
    badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
  },
  {
    id: "fairytale",
    title: "Fairy Tale Sanctuary",
    subtitle: "Lavender Mist & Stardust Blossom",
    icon: Wand2,
    accentColor: "#EC4899",
    badgeBg: "bg-pink-100 text-pink-900 border-pink-300",
  },
  {
    id: "cyber",
    title: "Cyber-Mechanical",
    subtitle: "Slate, Neon Cyan & Brushed Steel",
    icon: Cpu,
    accentColor: "#06B6D4",
    badgeBg: "bg-cyan-950 text-cyan-200 border-cyan-800",
  },
];

// Feature 1: Memory Echo Matcher Logic (Timeline Convergence)
function findMemoryEcho(currentPrompt: string, chapters: LifeChapter[]) {
  if (!currentPrompt || currentPrompt.trim().length < 12 || chapters.length === 0) return null;
  const words = currentPrompt
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  if (words.length === 0) return null;

  return (
    chapters.find((chap) => {
      const text = `${chap.title} ${chap.prompt} ${chap.summary || ""} ${chap.contextTag || ""}`.toLowerCase();
      return words.some((word) => text.includes(word));
    }) || null
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [userTheme, setUserTheme] = React.useState<ChronicleTheme>("grimoire");
  const [loadingUser, setLoadingUser] = React.useState<boolean>(true);
  const [signingOut, setSigningOut] = React.useState<boolean>(false);
  const signingOutRef = React.useRef<boolean>(false);
  signingOutRef.current = signingOut;

  // Server verification state
  const [serverAuthData, setServerAuthData] = React.useState<WhoAmIResponse | null>(null);
  const [verifyingServer, setVerifyingServer] = React.useState<boolean>(false);

  // Theme modal state
  const [showThemeModal, setShowThemeModal] = React.useState<boolean>(false);
  const [updatingTheme, setUpdatingTheme] = React.useState<boolean>(false);

  // Book Opening & Page Flipping Loader states (for dashboard loading & theme switching)
  const [initialLoading, setInitialLoading] = React.useState<boolean>(true);
  const [applyingThemeTarget, setApplyingThemeTarget] = React.useState<ChronicleTheme | null>(null);

  // Ambient Audio state
  const [audioPlaying, setAudioPlaying] = React.useState<boolean>(false);

  // Navigation Active View Mode ('workspace' | 'chapters' | 'prophecies' | 'analytics' | 'moments')
  const [activeTab, setActiveTab] = React.useState<"workspace" | "chapters" | "prophecies" | "analytics" | "moments">("workspace");

  // Sanctum Moments State
  const [userMoments, setUserMoments] = React.useState<SanctumMoment[]>([]);
  const [showMomentWizard, setShowMomentWizard] = React.useState<boolean>(false);
  const [editingMoment, setEditingMoment] = React.useState<SanctumMoment | null>(null);
  const [momentFilter, setMomentFilter] = React.useState<string>("all");

  // Load moments on mount, user sign-in & tab change (both local cache & Firestore)
  React.useEffect(() => {
    const local = getAllStoredMoments();
    setUserMoments(local);

    if (user?.uid) {
      fetchUserMoments(user.uid)
        .then((cloud) => {
          if (cloud && cloud.length > 0) {
            const map = new Map<string, SanctumMoment>();
            cloud.forEach((m) => map.set(m.id, m));
            local.forEach((m) => {
              if (!map.has(m.id)) map.set(m.id, m);
            });
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setUserMoments(merged);
          }
        })
        .catch((err) => {
          console.warn("Moment sync warning:", err);
        });
    }
  }, [user?.uid, showMomentWizard, activeTab]);

  // Auto-scroll ref for synthesized output
  const synthesisRef = React.useRef<HTMLDivElement>(null);

  // Cryptographic Time Capsules ("Sealed Prophecies") State
  const [prophecies, setProphecies] = React.useState<TimeCapsule[]>([]);
  const [loadingProphecies, setLoadingProphecies] = React.useState<boolean>(true);
  const [showSealModal, setShowSealModal] = React.useState<boolean>(false);
  const [sealTitle, setSealTitle] = React.useState<string>("");
  const [sealContent, setSealContent] = React.useState<string>("");
  const [sealMonthsAhead, setSealMonthsAhead] = React.useState<number>(6);
  const [sealUnlockDate, setSealUnlockDate] = React.useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split("T")[0];
  });
  const [sealPassphrase, setSealPassphrase] = React.useState<string>("");
  const [showSealPassphrase, setShowSealPassphrase] = React.useState<boolean>(false);
  const [sealTouched, setSealTouched] = React.useState<{
    title: boolean;
    content: boolean;
    date: boolean;
    passphrase: boolean;
  }>({
    title: false,
    content: false,
    date: false,
    passphrase: false,
  });
  const [sealingCapsule, setSealingCapsule] = React.useState<boolean>(false);
  const [sealValidationSummary, setSealValidationSummary] = React.useState<string | null>(null);
  const [unsealingId, setUnsealingId] = React.useState<string | null>(null);
  const [fulfilledModalCapsule, setFulfilledModalCapsule] = React.useState<TimeCapsule | null>(null);
  const [prophecyFilter, setProphecyFilter] = React.useState<"all" | "sealed" | "unlocked">("all");
  const [showSignOutConfirmModal, setShowSignOutConfirmModal] = React.useState<boolean>(false);

  // Tomorrow minimum date string for validation
  const tomorrowMinDate = React.useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }, []);

  // Real-time Seal Form Validation
  const sealValidation = React.useMemo(() => {
    const contentTrimmed = sealContent.trim();
    const isContentEmpty = contentTrimmed.length === 0;
    const isContentTooShort = contentTrimmed.length > 0 && contentTrimmed.length < 10;
    const isContentTooLong = contentTrimmed.length > 4000;
    const isContentValid = !isContentEmpty && !isContentTooShort && !isContentTooLong;

    const isTitleTooLong = sealTitle.length > 100;
    const isTitleValid = !isTitleTooLong;

    let isDateValid = false;
    let dateErrorMessage: string | null = null;
    let unlockDateObj: Date | null = null;
    let daysAhead = 0;
    let humanFormattedDate = "";

    if (!sealUnlockDate) {
      dateErrorMessage = "Please select an unlock date.";
    } else {
      unlockDateObj = new Date(sealUnlockDate + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(unlockDateObj.getTime())) {
        dateErrorMessage = "Invalid date format.";
      } else if (unlockDateObj.getTime() <= today.getTime()) {
        dateErrorMessage = "Unlock date must be strictly in the future (at least 24 hours ahead).";
      } else {
        isDateValid = true;
        daysAhead = Math.ceil((unlockDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        humanFormattedDate = unlockDateObj.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    }

    const isPassphraseValid = sealPassphrase.length === 0 || sealPassphrase.length >= 4;
    const passphraseError =
      sealPassphrase.length > 0 && sealPassphrase.length < 4
        ? "Passphrase must be at least 4 characters long."
        : null;

    const isValid = isContentValid && isTitleValid && isDateValid && isPassphraseValid;

    return {
      isValid,
      isContentEmpty,
      isContentTooShort,
      isContentTooLong,
      isContentValid,
      isTitleTooLong,
      isTitleValid,
      isDateValid,
      dateErrorMessage,
      unlockDateObj,
      daysAhead,
      humanFormattedDate,
      isPassphraseValid,
      passphraseError,
      charCount: sealContent.length,
      wordCount: contentTrimmed ? contentTrimmed.split(/\s+/).length : 0,
    };
  }, [sealContent, sealTitle, sealUnlockDate, sealPassphrase]);

  // Open the seal modal cleanly with pre-filled content and reset states
  const handleOpenSealModal = (initialContent: string = "", initialTitle: string = "") => {
    setSealContent(initialContent);
    setSealTitle(initialTitle);
    setSealPassphrase("");
    setShowSealPassphrase(false);
    setSealValidationSummary(null);
    setSealTouched({
      title: false,
      content: false,
      date: false,
      passphrase: false,
    });
    // Default to 6 months ahead
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setSealUnlockDate(d.toISOString().split("T")[0]);
    setShowSealModal(true);
  };

  // Local State Draft Buffer
  const [draftPrompt, setDraftPrompt] = React.useState<string>("");
  const [selectedTag, setSelectedTag] = React.useState<string>("Daily Reverie");
  const [generating, setGenerating] = React.useState<boolean>(false);
  const [activeSynthesis, setActiveSynthesis] = React.useState<{
    title: string;
    reflection: string;
    summary: string;
    moodScore: string;
    moodLabel: string;
    lifeChapter: string;
    prompt: string;
  } | null>(null);

  // Feature 2: Arcana Quests State
  const [quests, setQuests] = React.useState<{ id: string; task: string; completed: boolean }[]>([]);

  // Feature 3: The Shadow Weaver State
  const [shadowQuestion, setShadowQuestion] = React.useState<string | null>(null);
  const [shadowReply, setShadowReply] = React.useState<string>("");
  const [shadowThread, setShadowThread] = React.useState<{ role: "shadow" | "user"; text: string }[]>([]);
  const [showShadowModal, setShowShadowModal] = React.useState<boolean>(false);

  const [savingChapterState, setSavingChapterState] = React.useState<boolean>(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = React.useState<boolean>(false);

  // Life Chapters state
  const [chapters, setChapters] = React.useState<LifeChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [inspectedChapter, setInspectedChapter] = React.useState<LifeChapter | null>(null);

  // Feature 1: Memory Echo detection on draft buffer
  const memoryEcho = React.useMemo(
    () => findMemoryEcho(draftPrompt, chapters),
    [draftPrompt, chapters]
  );

  const handleToggleQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, completed: !q.completed } : q))
    );
  };

  // Rotating Empty State Quote Index
  const [quoteIndex, setQuoteIndex] = React.useState<number>(0);

  // Calculate streak from chapters
  const dailyStreak = React.useMemo(() => calculateDailyStreak(chapters), [chapters]);

  // Comprehensive Emotional Resonance Statistics
  const resonanceStats = React.useMemo(() => {
    if (chapters.length === 0) {
      return {
        latestScore: 0.50,
        latestLabel: "Neutral Baseline",
        avgScore: 0.50,
        highestScore: 0.50,
        trend: "none" as "none" | "rising" | "steady" | "falling",
        trendDiff: 0,
        totalCount: 0,
      };
    }

    const sorted = [...chapters].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const scores = sorted.map((c) => parseMoodScore(c.moodScore));
    const latestScore = scores[scores.length - 1];
    const latestLabel = sorted[sorted.length - 1].moodLabel;
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const highestScore = Math.max(...scores);

    let trend: "none" | "rising" | "steady" | "falling" = "steady";
    let trendDiff = 0;
    if (scores.length >= 2) {
      const prevScore = scores[scores.length - 2];
      trendDiff = latestScore - prevScore;
      if (trendDiff > 0.03) trend = "rising";
      else if (trendDiff < -0.03) trend = "falling";
    }

    return {
      latestScore,
      latestLabel,
      avgScore,
      highestScore,
      trend,
      trendDiff,
      totalCount: chapters.length,
    };
  }, [chapters]);

  // Format Recharts data (Chronological Order)
  const chartData = React.useMemo(() => {
    return [...chapters]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((chap) => ({
        id: chap.id,
        date: new Date(chap.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        score: parseMoodScore(chap.moodScore),
        title: chap.title,
        moodLabel: chap.moodLabel,
      }));
  }, [chapters]);

  // Rotating quote interval for empty state
  React.useEffect(() => {
    if (chapters.length === 0 && !loadingChapters) {
      const timer = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % ORIGINAL_QUOTES.length);
      }, 7000);
      return () => clearInterval(timer);
    }
  }, [chapters.length, loadingChapters]);

  // Handle New Chapter Creation Action
  const handleStartNewChapter = () => {
    setDraftPrompt("");
    setActiveSynthesis(null);
    setQuests([]);
    setShadowQuestion(null);
    setShadowThread([]);
    setShadowReply("");
    setShowShadowModal(false);
    setSaveError(null);
    setActiveTab("workspace");
  };

  // 1. Verify bearer token via server-side /api/whoami
  const fetchWhoAmI = React.useCallback(async (currentUser: User) => {
    setVerifyingServer(true);
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch("/api/whoami", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
      const data: WhoAmIResponse = await res.json();
      if (res.ok) {
        setServerAuthData(data);
      }
    } catch (err) {
      console.warn("Handshake token check warning:", err);
    } finally {
      setVerifyingServer(false);
    }
  }, []);

  // 2. Fetch User Profile & Saved Chapters on Auth Change
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);

      if (currentUser) {
        fetchWhoAmI(currentUser);

        try {
          const profile = await fetchUserProfile(currentUser.uid);
          if (profile?.theme) {
            setUserTheme(profile.theme);
          }
        } catch (e) {
          console.warn("Could not load user profile theme:", e);
        }

        try {
          setLoadingChapters(true);
          const fetchedChapters = await fetchUserChapters(currentUser.uid);
          setChapters(fetchedChapters);
        } catch (err) {
          console.warn("Error fetching user chapters:", err);
          setChapters([]);
        } finally {
          setLoadingChapters(false);
        }

        try {
          setLoadingProphecies(true);
          const fetchedProphecies = await fetchUserProphecies(currentUser.uid);
          setProphecies(fetchedProphecies);
        } catch (err) {
          console.warn("Error fetching user prophecies:", err);
          setProphecies([]);
        } finally {
          setLoadingProphecies(false);
        }
      } else {
        if (!signingOutRef.current) {
          router.push("/login");
        }
      }
    });

    return () => unsubscribe();
  }, [router, fetchWhoAmI]);

  // Ambient Audio Toggle Handler
  const handleToggleAmbientAudio = async () => {
    const isNowPlaying = await ambientAudioEngine.toggle();
    setAudioPlaying(isNowPlaying);
  };

  // Handle Theme Switching with 3D Book Opening Loader
  const handleSelectTheme = (newTheme: ChronicleTheme) => {
    if (newTheme === userTheme) {
      setShowThemeModal(false);
      return;
    }

    setShowThemeModal(false);
    setApplyingThemeTarget(newTheme);
  };

  // Called when the book enters inside: seamless transmutation
  const handleThemeEnterInside = React.useCallback(() => {
    if (applyingThemeTarget) {
      setUserTheme(applyingThemeTarget);
    }
  }, [applyingThemeTarget]);

  // Called when book transition finishes
  const handleThemeApplyComplete = React.useCallback(async () => {
    if (applyingThemeTarget) {
      const targetTheme = applyingThemeTarget;
      setUserTheme(targetTheme);
      setApplyingThemeTarget(null);

      if (user) {
        try {
          await saveUserTheme(user.uid, targetTheme);
        } catch (err) {
          console.error("Failed to save theme to Firestore:", err);
        }
      }
    }
  }, [applyingThemeTarget, user]);

  // Handle Sign Out confirmation modal and closing flow
  const handleRequestSignOut = () => {
    setShowSignOutConfirmModal(true);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutConfirmModal(false);
    try {
      ambientAudioEngine.stop();
      setAudioPlaying(false);
    } catch (err) {
      console.warn("Audio stop error:", err);
    }
    setSigningOut(true);
  };

  // Handle Reflection Generation
  const handleGenerateReflection = async () => {
    if (!draftPrompt.trim() || !user) return;

    setGenerating(true);
    setActiveSynthesis(null);
    setQuests([]);
    setShadowQuestion(null);
    setSaveError(null);

    const nextChapterNum = chapters.length + 1;
    const existingTitles = chapters.map((c) => c.title);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: draftPrompt,
          contextTag: selectedTag,
          chapterNumber: nextChapterNum,
          existingTitles,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setActiveSynthesis({
          title: data.lifeChapter || `Chapter ${nextChapterNum}: The Awakening Horizon`,
          reflection: data.reflection,
          summary: data.summary,
          moodScore: data.moodScore || "+0.85",
          moodLabel: data.moodLabel || "Quiet Defiance",
          lifeChapter: data.lifeChapter || `Chapter ${nextChapterNum}: The Awakening Horizon`,
          prompt: draftPrompt,
        });

        // Feature 2: Arcana Quests
        if (Array.isArray(data.quests) && data.quests.length > 0) {
          setQuests(data.quests);
        } else {
          setQuests([
            { id: "q1", task: "Step away from the screen for a 10-minute walk.", completed: false },
            { id: "q2", task: "Write down the single highest-priority outcome on paper.", completed: false },
            { id: "q3", task: "Acknowledge one small win from earlier today.", completed: false },
          ]);
        }

        // Feature 3: The Shadow Weaver
        if (data.shadowQuestion) {
          setShadowQuestion(data.shadowQuestion);
        } else {
          setShadowQuestion("What is the unvoiced fear underlying this entry that you haven't explicitly written down yet?");
        }

        // Auto-scroll to the synthesized chapter output
        setTimeout(() => {
          synthesisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 180);
      } else {
        throw new Error(data.message || "Failed to synthesize reflection.");
      }
    } catch (err) {
      console.error("Reflection synthesis error:", err);
      const fallbackTitle = `Chapter ${nextChapterNum}: The Horizon of ${selectedTag}`;
      setActiveSynthesis({
        title: fallbackTitle,
        reflection: `Beneath your entry—"${draftPrompt.slice(0, 80)}..."—the quiet subtext lingers. You recorded the visible surface, yet the underlying instinct remains sharp and clear.\n\nThis hour anchors a distinct turn in your personal trajectory.`,
        summary: `Grounded synthesis recorded under ${selectedTag.toLowerCase()}.`,
        moodScore: "+0.82",
        moodLabel: "Subterranean Tension",
        lifeChapter: fallbackTitle,
        prompt: draftPrompt,
      });

      setQuests([
        { id: "q1", task: "Step away from the screen for a 10-minute walk.", completed: false },
        { id: "q2", task: "Write down the single highest-priority outcome on paper.", completed: false },
        { id: "q3", task: "Acknowledge one small win from earlier today.", completed: false },
      ]);
      setShadowQuestion("What is the unvoiced fear underlying this entry that you haven't explicitly written down yet?");

      setTimeout(() => {
        synthesisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 180);
    } finally {
      setGenerating(false);
    }
  };

  // Cryptographic Time Capsule Actions with Robust Validation
  const handleSealProphecy = async () => {
    // Touch all fields to reveal validation state immediately
    setSealTouched({
      title: true,
      content: true,
      date: true,
      passphrase: true,
    });

    if (!sealValidation.isValid || !user) {
      if (sealValidation.isContentEmpty) {
        setSealValidationSummary("Please write your secret reflection before sealing.");
      } else if (sealValidation.isContentTooShort) {
        setSealValidationSummary("Prophecy content must contain at least 10 characters.");
      } else if (!sealValidation.isDateValid) {
        setSealValidationSummary(sealValidation.dateErrorMessage || "Please choose a valid future unlock date.");
      } else if (!sealValidation.isPassphraseValid) {
        setSealValidationSummary(sealValidation.passphraseError || "Passphrase is too short.");
      }
      return;
    }

    setSealingCapsule(true);
    setSaveError(null);
    setSealValidationSummary(null);

    try {
      const unlockDate = sealValidation.unlockDateObj || new Date();
      const title =
        sealTitle.trim() ||
        `Prophecy for ${unlockDate.toLocaleDateString(undefined, { month: "short", year: "numeric" })}`;

      const newCapsule = await sealProphecy(user.uid, {
        title,
        content: sealContent,
        unlockDate: unlockDate.toISOString(),
        passphrase: sealPassphrase.trim() || undefined,
      });

      setProphecies((prev) => [newCapsule, ...prev]);
      setShowSealModal(false);
      setSealTitle("");
      setSealContent("");
      setSealPassphrase("");
      setShowSealPassphrase(false);
      setSealValidationSummary(null);

      // Reset default date for next seal
      const nextDefault = new Date();
      nextDefault.setMonth(nextDefault.getMonth() + 6);
      setSealUnlockDate(nextDefault.toISOString().split("T")[0]);
      setSaveSuccessToast(true);
      setTimeout(() => setSaveSuccessToast(false), 3500);
      setActiveTab("prophecies");
    } catch (err) {
      console.error("Failed to seal prophecy:", err);
      setSaveError("Failed to cryptographically seal time capsule.");
    } finally {
      setSealingCapsule(false);
    }
  };

  // Unseal & Fulfill Prophecy with AI
  const handleUnsealProphecy = async (capsule: TimeCapsule, bypassLockDate: boolean = false) => {
    if (!user) return;
    setUnsealingId(capsule.id);
    setSaveError(null);

    try {
      // 1. Decrypt AES-GCM ciphertext on client
      const plainText = await decryptReflection(
        capsule.ciphertext,
        capsule.iv,
        capsule.salt,
        sealPassphrase.trim() || undefined
      );

      // 2. Fetch server-side fulfillment comparing past vision with current mood trends
      const idToken = await user.getIdToken();
      const moodTrends = chapters.slice(0, 5).map((c) => `${c.moodLabel} (${c.moodScore})`);
      const nextChapNum = chapters.length + 1;

      const res = await fetch("/api/prophecy/fulfill", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pastEntry: plainText,
          pastDate: capsule.createdAt,
          currentMoodTrends: moodTrends,
          chapterNumber: nextChapNum,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const fulfilledChapter = {
          fulfilledTitle: data.fulfilledTitle,
          pastPerspective: data.pastPerspective,
          presentReality: data.presentReality,
          fulfilledSynthesis: data.fulfilledSynthesis,
          transformationScore: data.transformationScore,
          transformationLabel: data.transformationLabel,
          unlockedAt: new Date().toISOString(),
        };

        // Update database
        await updateProphecyFulfilled(user.uid, capsule.id, fulfilledChapter);

        // Update local state
        setProphecies((prev) =>
          prev.map((c) =>
            c.id === capsule.id
              ? { ...c, isUnlocked: true, fulfilledChapter }
              : c
          )
        );

        setFulfilledModalCapsule({
          ...capsule,
          isUnlocked: true,
          fulfilledChapter,
        });
      } else {
        throw new Error(data.message || "Failed to synthesize fulfilled chapter.");
      }
    } catch (err) {
      console.error("Error unsealing prophecy:", err);
      setSaveError("Failed to decrypt or synthesize prophecy. Ensure the passphrase is correct if one was set.");
    } finally {
      setUnsealingId(null);
    }
  };

  // Transmute Fulfilled Prophecy into a Permanent Life Chapter
  const handleTransmuteToChapter = async (capsule: TimeCapsule) => {
    if (!capsule.fulfilledChapter || !user) return;
    try {
      setSavingChapterState(true);
      const newChapter = await saveChapter(user.uid, {
        title: capsule.fulfilledChapter.fulfilledTitle,
        prompt: `[Fulfilled Prophecy originally sealed on ${new Date(capsule.createdAt).toLocaleDateString()}]:\n${capsule.previewSnippet}`,
        reflection: capsule.fulfilledChapter.fulfilledSynthesis,
        summary: `Prophecy unsealed: ${capsule.fulfilledChapter.transformationLabel}. Transformed through temporal reflection.`,
        contextTag: "Milestone",
        moodScore: capsule.fulfilledChapter.transformationScore,
        moodLabel: capsule.fulfilledChapter.transformationLabel,
      });

      setChapters((prev) => [newChapter, ...prev]);
      setFulfilledModalCapsule(null);
      setSaveSuccessToast(true);
      setTimeout(() => setSaveSuccessToast(false), 3500);
      setActiveTab("chapters");
    } catch (err) {
      console.error("Transmute error:", err);
      setSaveError("Failed to save fulfilled prophecy to life chapters.");
    } finally {
      setSavingChapterState(false);
    }
  };

  // Delete Prophecy
  const handleDeleteProphecy = async (capsuleId: string) => {
    if (!user) return;
    const target = prophecies.find((p) => p.id === capsuleId);
    if (!target) return;

    setProphecies((prev) => prev.filter((p) => p.id !== capsuleId));
    try {
      await deleteProphecy(user.uid, capsuleId);
    } catch (err) {
      console.error("Failed to delete prophecy:", err);
      setProphecies((prev) => [target, ...prev]);
      setSaveError("Failed to delete time capsule.");
    }
  };

  // Explicit Save Chapter Action
  const handleSaveChapter = async () => {
    if (!activeSynthesis || !user) return;

    setSavingChapterState(true);
    setSaveError(null);

    try {
      const newChapter = await saveChapter(user.uid, {
        title: activeSynthesis.title,
        prompt: activeSynthesis.prompt,
        reflection: activeSynthesis.reflection,
        summary: activeSynthesis.summary,
        contextTag: selectedTag,
        moodScore: activeSynthesis.moodScore,
        moodLabel: activeSynthesis.moodLabel,
      });

      setChapters((prev) => [newChapter, ...prev]);
      setDraftPrompt("");
      setActiveSynthesis(null);
      setQuests([]);
      setShadowQuestion(null);
      setSaveSuccessToast(true);
      setTimeout(() => setSaveSuccessToast(false), 3500);
    } catch (err) {
      console.error("Error saving chapter:", err);
      setSaveError("Failed to save chapter to Cloud Vault. Your draft remains safe locally.");
    } finally {
      setSavingChapterState(false);
    }
  };

  // Delete Chapter Action
  const handleConfirmDeleteChapter = async (chapterId: string) => {
    if (!user) return;

    const targetChapter = chapters.find((c) => c.id === chapterId);
    if (!targetChapter) return;

    setChapters((prev) => prev.filter((c) => c.id !== chapterId));

    try {
      await deleteChapter(user.uid, chapterId);
    } catch (err) {
      console.error("Failed to delete chapter:", err);
      setChapters((prev) => [targetChapter, ...prev]);
      setSaveError("Failed to delete chapter from Firestore. Action rolled back.");
    }
  };

  // Harmonized Theme Tokens (Parchment surfaces, high contrast, no dark box clashes)
  const themeStyles = {
    grimoire: {
      wrapperBg: "bg-[#F7F2EB] text-[#3D2C2E]",
      bgGradient: "radial-gradient(circle at top right, #FDF8F6 0%, #F3EAE0 100%)",
      sidebarBg: "bg-[#EFE6DC] border-[#D4AF37]/30 text-[#3D2C2E]",
      deskPaperBg: "bg-[#FAF6F0] border-[#D4AF37]/25 shadow-sm text-[#3D2C2E]",
      cardInnerBg: "bg-[#F3EAE0] border-[#D4AF37]/20 text-[#3D2C2E]",
      accentBg: "bg-[#5C3317] hover:bg-[#43220F] text-[#FAF6F0]",
      accentText: "text-[#8C4A1B]",
      fontHead: "font-serif",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      buttonBg: "bg-[#5C3317] hover:bg-[#43220F] text-[#FAF6F0]",
      subtleText: "text-[#7C5C5E]",
      tagActive: "bg-[#5C3317] text-white border-[#5C3317]",
      tagInactive: "bg-[#FAF6F0] text-[#7C5C5E] border-[#D4AF37]/30 hover:bg-white",
      strokeColor: "#D97706",
      fillGradient: "#F59E0B",
    },
    fairytale: {
      wrapperBg: "bg-[#FDF2F8] text-[#3B0764]",
      bgGradient: "radial-gradient(circle at top right, #FDF2F8 0%, #FCE7F3 100%)",
      sidebarBg: "bg-[#FCE7F3] border-[#EC4899]/30 text-[#3B0764]",
      deskPaperBg: "bg-[#FFF9FC] border-[#EC4899]/25 shadow-sm text-[#3B0764]",
      cardInnerBg: "bg-[#FCE7F3]/60 border-[#EC4899]/20 text-[#3B0764]",
      accentBg: "bg-[#EC4899] hover:bg-[#D946EF] text-white",
      accentText: "text-[#BE185D]",
      fontHead: "font-serif",
      badgeClass: "bg-pink-100 text-pink-900 border-pink-300",
      buttonBg: "bg-[#D946EF] hover:bg-[#C026D3] text-white",
      subtleText: "text-[#701A75]",
      tagActive: "bg-[#EC4899] text-white border-[#EC4899]",
      tagInactive: "bg-[#FFF9FC] text-[#701A75] border-[#EC4899]/30 hover:bg-white",
      strokeColor: "#EC4899",
      fillGradient: "#F472B6",
    },
    cyber: {
      wrapperBg: "bg-[#0B0F19] text-[#F8FAFC]",
      bgGradient: "radial-gradient(circle at top right, #0F172A 0%, #0B0F19 100%)",
      sidebarBg: "bg-[#111827] border-[#06B6D4]/30 text-[#F8FAFC]",
      deskPaperBg: "bg-[#161F2E] border-[#06B6D4]/30 shadow-lg text-[#F8FAFC]",
      cardInnerBg: "bg-[#1E293B] border-[#06B6D4]/20 text-[#F8FAFC]",
      accentBg: "bg-[#06B6D4] hover:bg-[#0891B2] text-black font-bold",
      accentText: "text-[#38BDF8]",
      fontHead: "font-mono",
      badgeClass: "bg-cyan-950 text-cyan-200 border-cyan-800",
      buttonBg: "bg-[#0891B2] hover:bg-[#0E7490] text-white",
      subtleText: "text-[#94A3B8]",
      tagActive: "bg-[#06B6D4] text-black border-[#06B6D4] font-bold",
      tagInactive: "bg-[#1E293B] text-[#94A3B8] border-[#06B6D4]/30 hover:bg-[#1E293B]",
      strokeColor: "#06B6D4",
      fillGradient: "#22D3EE",
    },
  };

  const theme = themeStyles[userTheme] || themeStyles.grimoire;

  const filteredChapters = chapters.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.prompt.toLowerCase().includes(q) ||
      c.reflection.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.contextTag.toLowerCase().includes(q)
    );
  });

  const filteredProphecies = React.useMemo(() => {
    return prophecies.filter((p) => {
      if (prophecyFilter === "sealed") return !p.isUnlocked;
      if (prophecyFilter === "unlocked") return p.isUnlocked;
      return true;
    });
  }, [prophecies, prophecyFilter]);

  function formatTimeRemaining(unlockDateStr: string): { text: string; isPast: boolean } {
    const target = new Date(unlockDateStr).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { text: "Unlocked • Seal ready to break", isPast: true };
    }

    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;

    if (months > 0) {
      return { text: `Sealed for ${months} mo, ${remainingDays} days`, isPast: false };
    }
    return { text: `Sealed for ${days} days`, isPast: false };
  }

  return (
    <div
      className={`h-screen h-[100dvh] w-full flex font-sans transition-colors duration-500 relative overflow-hidden ${theme.wrapperBg}`}
      style={{ background: theme.bgGradient }}
    >
      {/* 1. LEFT VERTICAL NAVIGATION STRIP (Matching reference dashboard structure) */}
      <aside className={`w-16 lg:w-20 h-full border-r flex flex-col items-center justify-between py-6 pb-14 lg:pb-16 shrink-0 z-30 ${theme.sidebarBg}`}>
        <div className="flex flex-col items-center gap-8">
          {/* EchoTale Brand Icon */}
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-md ${theme.accentBg}`}>
            <BookOpen className="w-5 h-5" />
          </div>

          {/* Vertical Navigation Bar */}
          <nav className="flex flex-col gap-4">
            <button
              onClick={() => setActiveTab("workspace")}
              className={`p-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === "workspace" ? theme.accentBg : "opacity-60 hover:opacity-100"
              }`}
              title="Journal Desk"
            >
              <Feather className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab("chapters")}
              className={`p-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === "chapters" ? theme.accentBg : "opacity-60 hover:opacity-100"
              }`}
              title="The Life Chapters"
            >
              <Layers className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab("prophecies")}
              className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
                activeTab === "prophecies" ? theme.accentBg : "opacity-60 hover:opacity-100"
              }`}
              title="Sealed Prophecies (Time Capsules)"
            >
              <Hourglass className="w-5 h-5" />
              {prophecies.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {prophecies.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`p-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === "analytics" ? theme.accentBg : "opacity-60 hover:opacity-100"
              }`}
              title="Resonance Trajectory"
            >
              <TrendingUp className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab("moments")}
              className={`p-3 rounded-2xl transition-all cursor-pointer relative ${
                activeTab === "moments" ? theme.accentBg : "opacity-60 hover:opacity-100"
              }`}
              title="Sanctum Moments (Keepsakes)"
            >
              <Heart className="w-5 h-5 text-rose-400" />
              {userMoments.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                  {userMoments.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* User Profile & Sign Out Controls */}
        <div className="flex flex-col items-center gap-4">
          <Avatar className="w-9 h-9 border shadow-sm">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className={`text-xs font-bold ${theme.buttonBg}`}>
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : "ET"}
            </AvatarFallback>
          </Avatar>

          <button
            onClick={handleRequestSignOut}
            disabled={signingOut}
            className="p-2 rounded-xl opacity-60 hover:opacity-100 transition-all text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
            title="Sign Out of Chronicle"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* 2. CENTER MAIN WORKSPACE PANEL (Laptop-contained viewport with fluid inner width) */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10">
        <div className="w-full max-w-4xl lg:max-w-5xl mx-auto space-y-6">
        {/* Workspace Top Bar */}
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-black/10 dark:border-white/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              Welcome back, {user?.displayName?.split(" ")[0] || "Seeker"}
            </h1>
            <p className="text-xs opacity-75 mt-1 font-serif italic">
              Your quiet sanctuary for reflection, insights, and preserving life&apos;s chapters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleStartNewChapter}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md cursor-pointer flex items-center gap-2 ${theme.buttonBg}`}
            >
              <Plus className="w-4 h-4" />
              <span>New Chapter</span>
            </Button>
          </div>
        </header>

        {/* JOURNAL EDITOR WORKSPACE */}
        {activeTab === "workspace" && (
          <div className={`rounded-3xl p-6 sm:p-8 border transition-all ${theme.deskPaperBg}`}>
            <div className="flex items-center justify-between mb-6 border-b pb-4 border-black/10 dark:border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
                <Feather className={`w-4 h-4 ${theme.accentText}`} />
                <span>The Quiet Desk &bull; Draft Space</span>
              </span>
              <span className="text-xs font-mono opacity-50">Local Buffer</span>
            </div>

            {/* Context Tag Buttons */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-3">
                Select Context Tag
              </label>
              <div className="flex flex-wrap gap-2">
                {CONTEXT_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => setSelectedTag(tag.label)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                      selectedTag === tag.label ? theme.tagActive : theme.tagInactive
                    }`}
                  >
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MEMORY ECHO DETECTOR ALERT (Timeline Convergence) */}
            <AnimatePresence>
              {memoryEcho && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  onClick={() => setInspectedChapter(memoryEcho)}
                  className="mb-5 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-950 dark:text-amber-100 flex items-center justify-between text-xs cursor-pointer hover:bg-amber-500/25 hover:border-amber-500/50 shadow-sm transition-all group"
                  title="Click to inspect the connected past chapter"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <div className="font-bold font-serif text-sm">
                        Timeline Convergence &bull; Memory Echo Detected
                      </div>
                      <div className="opacity-80 text-[11px] font-sans">
                        Resonates with past chapter: &ldquo;{memoryEcho.title}&rdquo; &bull; Click to open
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-200 group-hover:translate-x-0.5 transition-transform">
                    <span>Recall</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Entry Text Input */}
            <div className="mb-6">
              <textarea
                value={draftPrompt}
                onChange={(e) => setDraftPrompt(e.target.value)}
                placeholder="Write your entry here... Describe what happened, what was said, or what quiet realization took hold today."
                rows={8}
                className={`w-full p-5 rounded-2xl border text-sm sm:text-base leading-relaxed focus:outline-none transition-all resize-none ${theme.cardInnerBg}`}
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs opacity-50 font-mono">{draftPrompt.length} characters</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpenSealModal(draftPrompt)}
                  disabled={!draftPrompt.trim()}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 border transition-all ${theme.cardInnerBg}`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Seal as Time Capsule</span>
                </Button>
                <Button
                  onClick={handleGenerateReflection}
                  disabled={generating || !draftPrompt.trim()}
                  className={`px-6 py-2.5 rounded-2xl font-bold text-xs shadow-md cursor-pointer flex items-center gap-2 ${theme.buttonBg}`}
                >
                  {generating ? (
                    <span>Synthesizing Chapter...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Commune & Synthesize</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Active Synthesis Confirmation Panel */}
            <AnimatePresence>
              {activeSynthesis && (
                <motion.div
                  ref={synthesisRef}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-8 p-6 rounded-2xl border scroll-mt-6 ${theme.cardInnerBg}`}
                >
                  <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-100 text-xs font-semibold">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-300 animate-spin" />
                    <span>Chapter Synthesized! Review the insight below, test your shadow question, or seal into your chronicle.</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif font-bold text-lg">{activeSynthesis.title}</h3>
                    <Badge className="text-xs font-mono">{activeSynthesis.moodLabel} ({activeSynthesis.moodScore})</Badge>
                  </div>
                  <p className="text-sm leading-relaxed mb-6 opacity-90 whitespace-pre-line">
                    {activeSynthesis.reflection}
                  </p>

                  {/* FEATURE 2: ARCANA QUESTS */}
                  {quests.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10">
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-85 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Arcana Quests &bull; Real-World Actions</span>
                      </h4>
                      <div className="space-y-2.5">
                        {quests.map((q) => (
                          <div
                            key={q.id}
                            onClick={() => handleToggleQuest(q.id)}
                            className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-3 cursor-pointer transition-all ${
                              q.completed
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 line-through opacity-75"
                                : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                q.completed
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-black/40 dark:border-white/40"
                              }`}
                            >
                              {q.completed && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <span className="flex-1 leading-snug">{q.task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FEATURE 3: THE SHADOW WEAVER INQUIRY TRIGGER */}
                  {shadowQuestion && (
                    <div className="mt-6 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          <span>The Shadow Weaver Inquiry</span>
                        </span>
                        <p className="text-xs font-serif italic mt-1 text-[#3D2C2E] dark:text-slate-100">
                          &ldquo;{shadowQuestion}&rdquo;
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setShadowThread([{ role: "shadow", text: shadowQuestion }]);
                          setShadowReply("");
                          setShowShadowModal(true);
                        }}
                        className="bg-purple-700 hover:bg-purple-800 text-white text-xs rounded-xl shrink-0 cursor-pointer shadow-sm"
                      >
                        Summon Shadow
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-2.5 mt-6 pt-4 border-t border-black/10 dark:border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setActiveSynthesis(null)}>
                      Discard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSealContent(activeSynthesis.reflection);
                        setSealTitle(activeSynthesis.title);
                        setShowSealModal(true);
                      }}
                      className={`text-xs rounded-xl flex items-center gap-1.5 border cursor-pointer ${theme.cardInnerBg}`}
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Seal as Time Capsule</span>
                    </Button>
                    <Button
                      onClick={handleSaveChapter}
                      disabled={savingChapterState}
                      className={`px-6 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer ${theme.buttonBg}`}
                    >
                      <Database className="w-3.5 h-3.5 mr-1.5" />
                      <span>Save Chapter</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* LIFE CHAPTERS TAB */}
        {activeTab === "chapters" && (
          <div className="space-y-4">
            <div className="relative mb-6">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 opacity-40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chapters..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border focus:outline-none ${theme.cardInnerBg}`}
              />
            </div>

            {filteredChapters.length === 0 ? (
              <div className={`p-8 rounded-3xl border text-center ${theme.deskPaperBg}`}>
                <BookOpen className="w-8 h-8 opacity-40 mx-auto mb-2" />
                <p className="font-serif text-sm font-semibold opacity-80">
                  {searchQuery ? "No chapters match your search query." : "No saved chapters found in your sanctuary."}
                </p>
                <p className="text-xs opacity-60 mt-1 mb-4">
                  {searchQuery ? "Try a different search term or clear the filter." : "Write a reflection at the Quiet Desk to weave your first chapter."}
                </p>
                <Button
                  size="sm"
                  onClick={handleStartNewChapter}
                  className={`text-xs rounded-xl font-bold shadow-sm ${theme.buttonBg}`}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Weave New Chapter</span>
                </Button>
              </div>
            ) : (
              filteredChapters.map((chap) => (
                <div
                  key={chap.id}
                  onClick={() => setInspectedChapter(chap)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] hover:shadow-lg hover:border-amber-500/50 group ${theme.deskPaperBg}`}
                  title="Click to read full chapter"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="text-[10px] font-mono">{chap.contextTag}</Badge>
                      <Badge className="text-[10px] font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                        {chap.moodLabel}
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmDeleteChapter(chap.id);
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
                      title="Delete Chapter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-serif font-bold text-base mb-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
                    <span>{chap.title}</span>
                    <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </h4>
                  <p className="text-xs leading-relaxed opacity-80 mb-3 line-clamp-2">
                    {chap.summary || chap.reflection}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono opacity-60 border-t border-black/5 dark:border-white/5 pt-2">
                    <span>Score: {chap.moodScore}</span>
                    <span>{new Date(chap.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TIME CAPSULES & SEALED PROPHECIES TAB */}
        {activeTab === "prophecies" && (
          <div className="space-y-6">
            <div className={`p-6 sm:p-8 rounded-3xl border ${theme.deskPaperBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-black/10 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      <Hourglass className="w-5 h-5 animate-pulse" />
                    </span>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl">Cryptographic Time Capsules</h3>
                  </div>
                  <p className="text-xs opacity-75 mt-1 font-serif">
                    &ldquo;Sealed Prophecies&rdquo; &bull; Client-side AES-GCM encrypted reflections strictly preserved for the future.
                  </p>
                </div>

                <Button
                  onClick={() => handleOpenSealModal(draftPrompt || "")}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md cursor-pointer flex items-center gap-2 ${theme.buttonBg}`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Seal New Prophecy</span>
                </Button>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setProphecyFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                    prophecyFilter === "all" ? theme.tagActive : theme.tagInactive
                  }`}
                >
                  All Capsules ({prophecies.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProphecyFilter("sealed")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                    prophecyFilter === "sealed" ? theme.tagActive : theme.tagInactive
                  }`}
                >
                  Sealed ({prophecies.filter((p) => !p.isUnlocked).length})
                </button>
                <button
                  type="button"
                  onClick={() => setProphecyFilter("unlocked")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                    prophecyFilter === "unlocked" ? theme.tagActive : theme.tagInactive
                  }`}
                >
                  Fulfilled Chapters ({prophecies.filter((p) => p.isUnlocked).length})
                </button>
              </div>
            </div>

            {/* Capsules Grid */}
            {loadingProphecies ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-28 w-full rounded-2xl" />
              </div>
            ) : filteredProphecies.length === 0 ? (
              <div className={`p-10 rounded-3xl border text-center ${theme.deskPaperBg}`}>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <Hourglass className="w-6 h-6 opacity-60" />
                </div>
                <h4 className="font-serif font-bold text-base mb-1">No Time Capsules Sealed Yet</h4>
                <p className="text-xs opacity-60 max-w-md mx-auto mb-5 leading-relaxed">
                  Write a letter, conviction, or prophecy strictly meant for your future self. It is sealed with 256-bit AES-GCM encryption and remains unreadable until your chosen unlock date arrives.
                </p>
                <Button
                  onClick={() => handleOpenSealModal(draftPrompt || "")}
                  className={`text-xs rounded-xl font-bold cursor-pointer ${theme.buttonBg}`}
                >
                  <Lock className="w-3.5 h-3.5 mr-1.5" />
                  <span>Seal Your First Prophecy</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProphecies.map((capsule) => {
                  const timeStatus = formatTimeRemaining(capsule.unlockDate);
                  const isReady = capsule.isUnlocked || timeStatus.isPast;

                  return (
                    <div
                      key={capsule.id}
                      className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between group ${theme.deskPaperBg} ${
                        capsule.isUnlocked
                          ? "border-amber-500/50 shadow-md bg-amber-500/5"
                          : "border-black/10 dark:border-white/10 hover:border-amber-500/40"
                      }`}
                    >
                      <div>
                        {/* Header Status Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          {capsule.isUnlocked ? (
                            <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40 text-[10px] font-mono flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>FULFILLED CHAPTER</span>
                            </Badge>
                          ) : (
                            <Badge className="bg-black/10 dark:bg-white/10 text-[10px] font-mono flex items-center gap-1 border-black/20 dark:border-white/20">
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>SEALED CRYPTOGRAPHY</span>
                            </Badge>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteProphecy(capsule.id)}
                            className="p-1 text-red-500/60 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Capsule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="font-serif font-bold text-base mb-1">
                          {capsule.title}
                        </h4>

                        {/* Unlock Date & Countdown */}
                        <div className="flex items-center gap-1.5 text-xs opacity-75 font-mono mb-3">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Unlocks: {new Date(capsule.unlockDate).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                          <span className="opacity-40">&bull;</span>
                          <span className={`font-semibold ${timeStatus.isPast ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                            {timeStatus.text}
                          </span>
                        </div>

                        {/* Encrypted / Content Preview */}
                        {capsule.isUnlocked && capsule.fulfilledChapter ? (
                          <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 mb-4 text-xs space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-amber-600 dark:text-amber-400 font-bold">
                                {capsule.fulfilledChapter.transformationLabel}
                              </span>
                              <span>Score: {capsule.fulfilledChapter.transformationScore}</span>
                            </div>
                            <p className="line-clamp-3 opacity-90 leading-relaxed font-serif italic">
                              &ldquo;{capsule.fulfilledChapter.fulfilledSynthesis}&rdquo;
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 mb-4 text-[11px] font-mono opacity-70">
                            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
                              <Shield className="w-3 h-3" />
                              <span>AES-256-GCM Ciphertext</span>
                            </div>
                            <p className="truncate opacity-50 font-mono">
                              {capsule.ciphertext.slice(0, 48)}... [CIPHERTEXT SEALED]
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-2">
                        {capsule.isUnlocked ? (
                          <div className="flex items-center gap-2 w-full">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setFulfilledModalCapsule(capsule)}
                              className="text-xs flex-1 rounded-xl cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5 mr-1" />
                              <span>View Fulfillment</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleTransmuteToChapter(capsule)}
                              disabled={savingChapterState}
                              className={`text-xs flex-1 rounded-xl font-bold cursor-pointer ${theme.buttonBg}`}
                            >
                              <Database className="w-3.5 h-3.5 mr-1" />
                              <span>Save to Chronicle</span>
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            {isReady ? (
                              <Button
                                size="sm"
                                onClick={() => handleUnsealProphecy(capsule)}
                                disabled={unsealingId === capsule.id}
                                className={`w-full text-xs rounded-xl font-bold shadow-sm cursor-pointer flex items-center justify-center gap-1.5 ${theme.buttonBg}`}
                              >
                                {unsealingId === capsule.id ? (
                                  <span>Unsealing & Synthesizing...</span>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Unseal & Fulfill Prophecy</span>
                                  </>
                                )}
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2 w-full">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnsealProphecy(capsule, true)}
                                  disabled={unsealingId === capsule.id}
                                  className="text-xs flex-1 rounded-xl cursor-pointer opacity-85 hover:opacity-100"
                                  title="Test unsealing now without waiting months"
                                >
                                  {unsealingId === capsule.id ? (
                                    <span>Unsealing...</span>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3 h-3 text-amber-500 mr-1" />
                                      <span>Test Unlock Now</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* COMPREHENSIVE RESONANCE ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Explanatory Banner */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${theme.deskPaperBg}`}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl mb-1">Understanding Emotional Resonance</h3>
                  <p className="text-xs opacity-80 leading-relaxed font-sans max-w-3xl">
                    Emotional Resonance is an algorithmic and literary index from <strong>0.00 to 1.00</strong> assessing the depth, poise, and contemplative clarity in your writing. A score of <strong>0.50</strong> represents a calm sanctuary baseline, while higher scores indicate profound self-awareness and transcendent perspective.
                  </p>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-black/10 dark:border-white/10">
                <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <div className="text-[10px] font-mono uppercase tracking-wider opacity-60">Latest Score</div>
                  <div className="text-xl font-serif font-bold mt-0.5 text-amber-600 dark:text-amber-400">
                    +{resonanceStats.latestScore.toFixed(2)}
                  </div>
                  <div className="text-[10px] opacity-75 truncate">{resonanceStats.latestLabel}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <div className="text-[10px] font-mono uppercase tracking-wider opacity-60">Average Depth</div>
                  <div className="text-xl font-serif font-bold mt-0.5">
                    +{resonanceStats.avgScore.toFixed(2)}
                  </div>
                  <div className="text-[10px] opacity-75">Across {resonanceStats.totalCount} Chapters</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <div className="text-[10px] font-mono uppercase tracking-wider opacity-60">Peak Resonance</div>
                  <div className="text-xl font-serif font-bold mt-0.5 text-emerald-600 dark:text-emerald-400">
                    +{resonanceStats.highestScore.toFixed(2)}
                  </div>
                  <div className="text-[10px] opacity-75">Highest Clarity Peak</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <div className="text-[10px] font-mono uppercase tracking-wider opacity-60">Trajectory</div>
                  <div className="text-xl font-serif font-bold mt-0.5 capitalize">
                    {resonanceStats.trend === "rising" ? "▲ Rising" : resonanceStats.trend === "falling" ? "▼ Softening" : "● Steady"}
                  </div>
                  <div className="text-[10px] opacity-75">
                    {resonanceStats.trendDiff !== 0 ? `${(resonanceStats.trendDiff > 0 ? "+" : "")}${resonanceStats.trendDiff.toFixed(2)} delta` : "Equilibrium"}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Resonance Graph */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${theme.deskPaperBg}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-serif font-bold text-lg">Chronological Resonance Curve</h4>
                  <p className="text-xs opacity-60 font-serif">Visual trajectory tracking emotional clarity over time</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono opacity-60">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Resonance Index (0.0 - 1.0)</span>
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-60">
                  <Sparkles className="w-8 h-8 mb-2 text-amber-500 opacity-40" />
                  <p className="text-xs font-medium">Record reflections at the Quiet Desk to plot your emotional trajectory.</p>
                </div>
              ) : chartData.length === 1 ? (
                <div className="h-64 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 max-w-sm w-full">
                    <div className="flex justify-between text-xs font-mono mb-2">
                      <span className="opacity-70">Chapter 1 Baseline</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">+{chartData[0].score.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(10, chartData[0].score * 100))}%` }}
                      />
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black/40 dark:bg-white/40" title="Sanctuary Baseline (0.50)" />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono opacity-50 mt-1">
                      <span>0.0 (Friction)</span>
                      <span>0.5 (Sanctuary)</span>
                      <span>1.0 (Transcendent)</span>
                    </div>
                  </div>
                  <p className="text-xs opacity-75 max-w-sm leading-relaxed">
                    1 chapter established: &ldquo;{chartData[0].title}&rdquo; ({chartData[0].moodLabel}). Weave a second chapter to render the multi-point chronological wave.
                  </p>
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="analyticsResonanceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.strokeColor} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={theme.strokeColor} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 1]} stroke="#888888" fontSize={11} tickLine={false} axisLine={false} ticks={[0, 0.25, 0.5, 0.75, 1.0]} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                                <div className="font-serif font-bold text-sm text-amber-300">{data.title}</div>
                                <div className="font-mono text-emerald-400 font-semibold">{data.moodLabel} &bull; +{data.score.toFixed(2)}</div>
                                <div className="text-slate-400 text-[10px] font-mono">{data.date}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke={theme.strokeColor}
                        fill="url(#analyticsResonanceGrad)"
                        fillOpacity={1}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SANCTUM MOMENTS & INTERACTIVE KEEPSAKES TAB */}
        {activeTab === "moments" && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className={`p-6 sm:p-8 rounded-3xl border ${theme.deskPaperBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-black/10 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-rose-500/15 text-rose-500">
                      <Heart className="w-5 h-5 fill-rose-500 animate-pulse" />
                    </span>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl">Sanctum Keepsakes & Moments</h3>
                  </div>
                  <p className="text-xs opacity-75 mt-1 font-serif">
                    Interactive digital keepsakes crafted for love, birthdays, reconciliations, family milestones, and cherished memories.
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setEditingMoment(null);
                    setShowMomentWizard(true);
                  }}
                  className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Craft New Keepsake</span>
                </Button>
              </div>

              {/* Occasion Filter Pills */}
              <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-2 -mx-1 px-1">
                {[
                  { id: "all", label: "All Keepsakes", icon: "✨" },
                  { id: "love", label: "Love & Romance", icon: "💖" },
                  { id: "birthday", label: "Birthday", icon: "🎂" },
                  { id: "apology", label: "Apology", icon: "🕯️" },
                  { id: "family", label: "Family Milestone", icon: "🌿" },
                  { id: "missing", label: "Missing Someone", icon: "🌌" },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setMomentFilter(pill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                      momentFilter === pill.id ? theme.tagActive : theme.tagInactive
                    }`}
                  >
                    <span>{pill.icon}</span>
                    <span>{pill.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Keepsakes List */}
            {userMoments.filter(m => momentFilter === "all" || m.occasion === momentFilter).length === 0 ? (
              <div className={`p-8 sm:p-12 rounded-3xl border text-center ${theme.deskPaperBg}`}>
                <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-lg mb-1">
                  {momentFilter === "all" ? "No Keepsakes Crafted Yet" : "No Keepsakes In This Category"}
                </h4>
                <p className="text-xs opacity-70 max-w-md mx-auto mb-6 leading-relaxed font-serif">
                  Craft an unsealable digital keepsake with wax seal animations, ambient generative audio, polaroid memories, and an interactive quiz.
                </p>

                {/* Quick start occasion grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-6 text-left">
                  {[
                    { id: "love", title: "Love Letter", desc: "Rose petal rain & wax seal", icon: "💖" },
                    { id: "birthday", title: "Birthday Card", desc: "Confetti burst & polaroids", icon: "🎂" },
                    { id: "apology", title: "Peace Offering", desc: "Quiet slate & soft amends", icon: "🕯️" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setEditingMoment(null);
                        setShowMomentWizard(true);
                      }}
                      className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all text-left group cursor-pointer"
                    >
                      <div className="text-xl mb-1">{item.icon}</div>
                      <div className="font-serif font-bold text-xs group-hover:text-rose-400">{item.title}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    setEditingMoment(null);
                    setShowMomentWizard(true);
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Begin 3-Step Wizard</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userMoments
                  .filter(m => momentFilter === "all" || m.occasion === momentFilter)
                  .map((m) => {
                    const occ = OCCASION_CONFIGS[m.occasion] || OCCASION_CONFIGS.love;
                    return (
                      <div
                        key={m.id}
                        className={`p-6 rounded-3xl border transition-all hover:scale-[1.01] hover:shadow-lg flex flex-col justify-between overflow-hidden relative ${theme.deskPaperBg}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border bg-black/5 dark:bg-white/5">
                              <span>{occ.icon || occ.emoji}</span>
                              <span>{occ.title}</span>
                            </span>
                            <span className="text-[10px] font-mono opacity-50">
                              {new Date(m.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </span>
                          </div>

                          <h4 className="font-serif font-bold text-lg mb-1">{occ.title} Keepsake</h4>
                          <p className="text-xs text-rose-500 font-serif italic mb-2">
                            For: {m.recipientName || "Beloved Soul"} &bull; From: {m.senderName || "Sanctuary Seeker"}
                          </p>
                          <p className="text-xs opacity-75 line-clamp-3 font-serif leading-relaxed mb-4">
                            {m.usePolished && m.polishedMessage ? m.polishedMessage : m.rawMessage}
                          </p>

                          {/* Attributes */}
                          <div className="flex flex-wrap gap-2 text-[10px] font-mono opacity-70 mb-2">
                            {m.isPasswordProtected && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                                <Lock className="w-3 h-3" />
                                <span>Passcode Locked</span>
                              </span>
                            )}
                            {m.photoPaths && m.photoPaths.length > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                                📷 {m.photoPaths.length} Photo{m.photoPaths.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {m.quizzes && m.quizzes.length > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                                🎯 {m.quizzes.length} Quiz Question{m.quizzes.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {m.ambientAudioTrack && (
                              <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                                🎵 Ambient Audio
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-2.5 pt-4 mt-3 border-t border-black/10 dark:border-white/10">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              window.open(`/m/${m.id}`, "_blank");
                            }}
                            className="text-xs rounded-xl py-2 px-3 h-auto cursor-pointer flex items-center gap-1.5 flex-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">View Keepsake</span>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingMoment(m);
                              setShowMomentWizard(true);
                            }}
                            className={`text-xs rounded-xl font-bold py-2 px-3 h-auto cursor-pointer flex items-center gap-1.5 ${theme.buttonBg}`}
                          >
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Edit & Share</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
        </div>
      </main>

      {/* 3. RIGHT PANEL (Streak, Audio & Analytics Summary Column - laptop contained) */}
      <aside className={`w-72 xl:w-80 h-full border-l p-4 sm:p-5 lg:p-6 flex flex-col gap-4 lg:gap-5 shrink-0 overflow-y-auto z-20 ${theme.sidebarBg}`}>
        {/* Streak Counter Box */}
        <div className={`p-4 sm:p-5 rounded-2xl border text-center ${theme.deskPaperBg}`}>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-5 h-5 fill-amber-500 animate-pulse" />
          </div>
          <h3 className="font-bold text-2xl">{dailyStreak} Days</h3>
          <p className="text-xs opacity-60 font-serif">Active Reflection Streak</p>
        </div>

        {/* Atmosphere & Audio Controls */}
        <div className="space-y-2.5 sm:space-y-3">
          <Button
            variant="outline"
            onClick={handleToggleAmbientAudio}
            className={`w-full py-2.5 rounded-2xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 border ${theme.cardInnerBg}`}
          >
            {audioPlaying ? <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" /> : <VolumeX className="w-4 h-4 opacity-60" />}
            <span>{audioPlaying ? "Ambient On" : "Ambient Muted"}</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowThemeModal(true)}
            className={`w-full py-2.5 rounded-2xl text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 border ${theme.cardInnerBg}`}
          >
            <Palette className={`w-4 h-4 ${theme.accentText}`} />
            <span>Atmosphere Theme</span>
          </Button>
        </div>

        {/* Right Panel Enhanced Mini Chart & Meter */}
        <div className={`p-4 sm:p-5 rounded-2xl border flex-1 flex flex-col justify-between ${theme.deskPaperBg}`}>
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">Emotional Resonance</h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
                {resonanceStats.totalCount > 0 ? `+${resonanceStats.latestScore.toFixed(2)}` : "0.50"}
              </span>
            </div>
            <p className="text-[11px] opacity-70 mt-0.5 font-serif">
              {resonanceStats.totalCount > 0 ? `${resonanceStats.latestLabel} (${Math.round(resonanceStats.latestScore * 100)}% Depth)` : "Contemplative Depth"}
            </p>
          </div>

          {/* Visual Presentation based on chapter count */}
          {resonanceStats.totalCount === 0 ? (
            <div className="my-auto py-4 text-center">
              <Sparkles className="w-6 h-6 mx-auto mb-1.5 opacity-30 text-amber-500" />
              <p className="text-xs opacity-60">Weave your first reflection to initialize your emotional resonance timeline.</p>
            </div>
          ) : resonanceStats.totalCount === 1 ? (
            <div className="my-auto py-2 space-y-2.5">
              <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-medium opacity-75">Resonance Score</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    +{resonanceStats.latestScore.toFixed(2)}
                  </span>
                </div>
                {/* Visual meter */}
                <div className="w-full bg-black/10 dark:bg-white/10 h-2.5 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 to-cyan-500"
                    style={{ width: `${Math.min(100, Math.max(10, resonanceStats.latestScore * 100))}%` }}
                  />
                  {/* Sanctuary baseline marker at 50% */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black/40 dark:bg-white/40" title="Baseline: 0.50" />
                </div>
                <div className="flex justify-between text-[9px] font-mono opacity-50 mt-1">
                  <span>0.0 (Friction)</span>
                  <span>0.5 (Sanctuary)</span>
                  <span>1.0 (Transcendent)</span>
                </div>
              </div>
              <p className="text-[10px] opacity-60 text-center italic">
                1 chapter recorded. Add 2nd chapter to plot chronological curve.
              </p>
            </div>
          ) : (
            <div className="h-28 sm:h-32 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="miniResonanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.strokeColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={theme.strokeColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, 1]} hide />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-[11px] p-2 rounded-lg shadow-lg border border-slate-700">
                            <div className="font-bold">{data.title}</div>
                            <div className="text-amber-300 font-mono">{data.moodLabel} (+{data.score.toFixed(2)})</div>
                            <div className="text-slate-400 text-[10px]">{data.date}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={theme.strokeColor}
                    fill="url(#miniResonanceGrad)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-between text-[10px] font-mono opacity-60 pt-1">
                <span>Latest: +{resonanceStats.latestScore.toFixed(2)}</span>
                <span className="capitalize">{resonanceStats.trend === "rising" ? "▲ Rising" : resonanceStats.trend === "falling" ? "▼ Softening" : "● Steady"}</span>
              </div>
            </div>
          )}

          <div className="border-t pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("chapters")}
              className="text-[11px] font-mono opacity-60 hover:opacity-100 hover:text-amber-600 dark:hover:text-amber-400 text-center transition-all cursor-pointer flex items-center gap-1"
            >
              <span>{chapters.length} Saved Chapters</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className="text-[11px] font-mono text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Full Analytics
            </button>
          </div>
        </div>
      </aside>

      {/* INSPECTED CHAPTER DETAIL MODAL (Fixed Chapter Opening) */}
      <AnimatePresence>
        {inspectedChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-[#FAF6F0] text-[#3D2C2E] dark:bg-[#0F172A] dark:text-slate-100 border border-[#D4AF37]/40 dark:border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto z-50"
            >
              <button
                type="button"
                onClick={() => setInspectedChapter(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer text-current"
                title="Close Chapter"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className={`text-xs ${theme.badgeClass}`}>
                  {inspectedChapter.contextTag}
                </Badge>
                <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                  {inspectedChapter.moodLabel} ({inspectedChapter.moodScore})
                </Badge>
                <span className="text-xs opacity-60 ml-auto font-mono">
                  {new Date(inspectedChapter.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4 tracking-tight">
                {inspectedChapter.title}
              </h3>

              {/* Original Draft Prompt Quote */}
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 mb-5 text-xs font-serif italic opacity-90">
                <span className="font-sans font-bold text-[10px] uppercase tracking-wider block mb-1 opacity-70 not-italic">
                  Original Journal Prompt
                </span>
                &ldquo;{inspectedChapter.prompt}&rdquo;
              </div>

              {/* Literary Reflection */}
              <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/80 border border-black/10 dark:border-slate-700/80 mb-5 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans shadow-sm">
                <span className="font-serif font-bold text-xs uppercase tracking-wider block mb-2 text-amber-700 dark:text-amber-400">
                  Synthesized Literary Reflection
                </span>
                {inspectedChapter.reflection}
              </div>

              {/* Summary */}
              {inspectedChapter.summary && (
                <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-sans opacity-85 mb-6">
                  <strong>Summary:</strong> {inspectedChapter.summary}
                </div>
              )}

              <div className="flex items-center justify-between text-xs opacity-70 border-t border-black/10 dark:border-white/10 pt-4">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Sealed in Cloud Vault
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInspectedChapter(null)}
                  className="text-xs rounded-xl cursor-pointer"
                >
                  Close Chapter
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHADOW WEAVER DIALOG MODAL (Feature 3) */}
      <AnimatePresence>
        {showShadowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#181124] text-slate-100 border border-purple-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-4 z-50"
            >
              <button
                type="button"
                onClick={() => setShowShadowModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 text-purple-300 font-serif">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-xl">The Shadow Weaver</h3>
              </div>
              <p className="text-xs text-purple-200/80 font-sans">
                A compassionate, probing mirror to uncover the truth held quietly beneath the page.
              </p>

              <div className="space-y-3 max-h-72 overflow-y-auto p-2 border border-purple-500/20 rounded-2xl bg-[#110B1B]">
                {shadowThread.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl text-xs font-sans leading-relaxed ${
                      msg.role === "shadow"
                        ? "bg-purple-950/70 border border-purple-500/30 text-purple-100"
                        : "bg-amber-950/70 border border-amber-500/30 text-amber-100 ml-auto max-w-[85%]"
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
                      {msg.role === "shadow" ? "The Shadow" : "Your Truth"}
                    </div>
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={shadowReply}
                  onChange={(e) => setShadowReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && shadowReply.trim()) {
                      const userText = shadowReply.trim();
                      setShadowThread((prev) => [
                        ...prev,
                        { role: "user", text: userText },
                        { role: "shadow", text: "Your honesty seals this inquiry. The grimoire honors your courage to speak what was unvoiced." },
                      ]);
                      setShadowReply("");
                    }
                  }}
                  placeholder="Answer the shadow..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/30 text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-purple-400"
                />
                <Button
                  onClick={() => {
                    if (!shadowReply.trim()) return;
                    const userText = shadowReply.trim();
                    setShadowThread((prev) => [
                      ...prev,
                      { role: "user", text: userText },
                      { role: "shadow", text: "Your honesty seals this inquiry. The grimoire honors your courage to speak what was unvoiced." },
                    ]);
                    setShadowReply("");
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-5 rounded-xl font-bold cursor-pointer"
                >
                  Unveil
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ATMOSPHERE SWITCHER MODAL */}
      <AnimatePresence>
        {showThemeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F172A] text-slate-100 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative z-50"
            >
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Atmosphere Switcher</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white">Select Visual Realm</h3>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Choose your preferred aesthetic. Your theme choice is instantly saved.
                </p>
              </div>

              <div className="space-y-4 mb-2">
                {THEME_OPTIONS.map((opt) => {
                  const isCurrent = userTheme === opt.id;
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectTheme(opt.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isCurrent
                          ? "border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.01]"
                          : "border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-800/90"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shrink-0"
                          style={{ backgroundColor: opt.accentColor }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-serif font-bold text-base text-slate-100">{opt.title}</div>
                          <div className="text-xs text-slate-300 font-sans">{opt.subtitle}</div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <Badge className="bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider px-3 py-1">
                          ACTIVE
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-semibold cursor-pointer border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SEAL TIME CAPSULE MODAL (Cryptographic Prophecy with Real-Time Validation) */}
      <AnimatePresence>
        {showSealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#18151D] text-slate-100 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto z-50 space-y-5"
            >
              <button
                type="button"
                onClick={() => setShowSealModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-amber-200">Seal a Time Capsule</h3>
                  <p className="text-xs text-amber-200/70 font-sans">
                    Client-side AES-GCM 256-bit encryption. Unreadable in the UI until unlock date.
                  </p>
                </div>
              </div>

              {/* Validation Summary Alert if form has errors */}
              {sealValidationSummary && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{sealValidationSummary}</span>
                </div>
              )}

              {/* Title Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    Prophecy Title <span className="opacity-40 font-sans normal-case">(Optional)</span>
                  </label>
                  <span className={`text-[10px] font-mono ${sealTitle.length > 100 ? "text-red-400 font-bold" : "text-slate-400"}`}>
                    {sealTitle.length}/100
                  </span>
                </div>
                <input
                  type="text"
                  value={sealTitle}
                  onChange={(e) => {
                    setSealTitle(e.target.value);
                    setSealTouched((prev) => ({ ...prev, title: true }));
                  }}
                  placeholder="e.g., Letter to Who I Become Next Winter"
                  maxLength={110}
                  className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-sm text-white focus:outline-none transition-all ${
                    sealTouched.title && !sealValidation.isTitleValid
                      ? "border-red-500/80 focus:border-red-400 bg-red-500/5"
                      : "border-white/15 focus:border-amber-400"
                  }`}
                />
                {sealTouched.title && !sealValidation.isTitleValid && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Title cannot exceed 100 characters.</span>
                  </p>
                )}
              </div>

              {/* Content Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    Prophecy Content (Secret to the Future) <span className="text-amber-400">*</span>
                  </label>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-slate-400">{sealValidation.wordCount} words</span>
                    <span className="text-slate-500">&bull;</span>
                    <span className={
                      sealTouched.content && !sealValidation.isContentValid
                        ? "text-red-400 font-bold"
                        : sealValidation.charCount >= 10
                        ? "text-emerald-400 font-semibold"
                        : "text-slate-400"
                    }>
                      {sealValidation.charCount}/4000
                    </span>
                  </div>
                </div>

                <textarea
                  value={sealContent}
                  onChange={(e) => {
                    setSealContent(e.target.value);
                    setSealTouched((prev) => ({ ...prev, content: true }));
                    if (sealValidationSummary) setSealValidationSummary(null);
                  }}
                  onBlur={() => setSealTouched((prev) => ({ ...prev, content: true }))}
                  placeholder="Write your vulnerable truth, your promises, or what you hope will hold true when this seal breaks..."
                  rows={6}
                  className={`w-full p-4 rounded-xl bg-white/5 border text-sm text-white focus:outline-none resize-none leading-relaxed transition-all ${
                    sealTouched.content && !sealValidation.isContentValid
                      ? "border-red-500/80 focus:border-red-400 bg-red-500/5"
                      : sealValidation.charCount >= 10
                      ? "border-amber-500/40 focus:border-amber-400"
                      : "border-white/15 focus:border-amber-400"
                  }`}
                />

                {/* Content Validation Inline Feedback */}
                {sealTouched.content && sealValidation.isContentEmpty && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Prophecy content is required to seal a time capsule.</span>
                  </p>
                )}
                {sealTouched.content && sealValidation.isContentTooShort && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Must be at least 10 characters long to generate AES ciphertext ({sealValidation.charCount}/10 chars).</span>
                  </p>
                )}
                {sealTouched.content && sealValidation.isContentTooLong && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Content exceeds maximum limit of 4,000 characters.</span>
                  </p>
                )}
                {sealValidation.isContentValid && (
                  <p className="text-[11px] text-emerald-400/90 flex items-center gap-1 mt-0.5">
                    <Check className="w-3 h-3" />
                    <span>Valid prophecy body ready for cryptographic ciphering.</span>
                  </p>
                )}
              </div>

              {/* Unlock Timeline Presets & Custom Date */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    Unlock Timeline <span className="text-amber-400">*</span>
                  </label>
                  {sealValidation.isDateValid && (
                    <span className="text-[10px] font-mono text-amber-300/90">
                      Unlocks in {sealValidation.daysAhead} day{sealValidation.daysAhead === 1 ? "" : "s"}
                    </span>
                  )}
                </div>

                {/* Preset Duration Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "1 Month", months: 1 },
                    { label: "3 Months", months: 3 },
                    { label: "6 Months", months: 6 },
                    { label: "1 Year", months: 12 },
                  ].map((preset) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + preset.months);
                    const isoDate = d.toISOString().split("T")[0];
                    const isSelected = sealUnlockDate === isoDate;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setSealUnlockDate(isoDate);
                          setSealTouched((prev) => ({ ...prev, date: true }));
                          if (sealValidationSummary) setSealValidationSummary(null);
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-black border-amber-400 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                            : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Date Input */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  <span className="text-xs text-slate-400 font-mono shrink-0">Custom Unlock Date:</span>
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={sealUnlockDate}
                      onChange={(e) => {
                        setSealUnlockDate(e.target.value);
                        setSealTouched((prev) => ({ ...prev, date: true }));
                        if (sealValidationSummary) setSealValidationSummary(null);
                      }}
                      min={tomorrowMinDate}
                      className={`w-full px-3.5 py-2 rounded-xl bg-white/5 border text-xs text-white focus:outline-none transition-all ${
                        sealTouched.date && !sealValidation.isDateValid
                          ? "border-red-500/80 focus:border-red-400 bg-red-500/5"
                          : "border-white/15 focus:border-amber-400"
                      }`}
                    />
                  </div>
                </div>

                {/* Date Validation or Relative Countdown Pill */}
                {sealTouched.date && !sealValidation.isDateValid ? (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{sealValidation.dateErrorMessage || "Date must be at least 1 day in the future."}</span>
                  </p>
                ) : (
                  sealValidation.isDateValid && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        ⏱ Unlocks on <strong className="text-amber-100">{sealValidation.humanFormattedDate}</strong> ({sealValidation.daysAhead} days from now).
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Optional Passphrase Field */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                    Optional Security Passphrase (AES Salt)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Zero-Knowledge</span>
                </div>

                <div className="relative">
                  <input
                    type={showSealPassphrase ? "text" : "password"}
                    value={sealPassphrase}
                    onChange={(e) => {
                      setSealPassphrase(e.target.value);
                      setSealTouched((prev) => ({ ...prev, passphrase: true }));
                      if (sealValidationSummary) setSealValidationSummary(null);
                    }}
                    placeholder="Leave empty to use device session key"
                    className={`w-full px-4 py-2.5 pr-10 rounded-xl bg-white/5 border text-xs text-white focus:outline-none font-mono transition-all ${
                      sealTouched.passphrase && !sealValidation.isPassphraseValid
                        ? "border-red-500/80 focus:border-red-400 bg-red-500/5"
                        : "border-white/15 focus:border-amber-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSealPassphrase(!showSealPassphrase)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
                    title={showSealPassphrase ? "Hide passphrase" : "Show passphrase"}
                  >
                    {showSealPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {sealTouched.passphrase && !sealValidation.isPassphraseValid && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Passphrase must be at least 4 characters long if set.</span>
                  </p>
                )}

                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  If set, you will be required to input this exact passphrase to decrypt your prophecy upon unlock.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSealModal(false)}
                  className="text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSealProphecy}
                    disabled={sealingCapsule || !sealValidation.isValid}
                    className={`font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                      !sealValidation.isValid || sealingCapsule
                        ? "bg-amber-500/40 text-black/50 cursor-not-allowed border border-amber-500/20"
                        : "bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    }`}
                  >
                    {sealingCapsule ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Encrypting & Sealing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Seal Cryptographically</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULFILLED CHAPTER MODAL (Time Capsule Comparison) */}
      <AnimatePresence>
        {fulfilledModalCapsule && fulfilledModalCapsule.fulfilledChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#191622] text-slate-100 border border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[85vh] overflow-y-auto z-50 space-y-5"
            >
              <button
                type="button"
                onClick={() => setFulfilledModalCapsule(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>FULFILLED CHAPTER &bull; TIME CONVERGENCE</span>
                </Badge>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-mono ml-auto">
                  {fulfilledModalCapsule.fulfilledChapter.transformationLabel} (+{fulfilledModalCapsule.fulfilledChapter.transformationScore})
                </Badge>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold text-amber-200">
                  {fulfilledModalCapsule.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Sealed on {new Date(fulfilledModalCapsule.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })} &bull; Unlocked for Present Reality
                </p>
              </div>

              {/* Fulfilled Literary Synthesis */}
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-100/95 text-sm sm:text-base leading-relaxed whitespace-pre-line font-serif">
                <span className="font-sans font-bold text-xs uppercase tracking-wider block mb-2 text-amber-400">
                  The Fulfilled Convergence &bull; AI Synthesis
                </span>
                {fulfilledModalCapsule.fulfilledChapter.fulfilledSynthesis}
              </div>

              {/* Past vs Present Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                    Past Perspective (Original Unsealed Prophecy)
                  </span>
                  <p className="opacity-90 italic font-serif leading-relaxed line-clamp-6">
                    &ldquo;{fulfilledModalCapsule.fulfilledChapter.pastPerspective}&rdquo;
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                    Present Reality (Current Resonance Mood)
                  </span>
                  <p className="opacity-90 font-sans leading-relaxed">
                    {fulfilledModalCapsule.fulfilledChapter.presentReality}
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFulfilledModalCapsule(null)}
                  className="text-xs text-slate-300 hover:text-white"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleTransmuteToChapter(fulfilledModalCapsule);
                    setFulfilledModalCapsule(null);
                  }}
                  disabled={savingChapterState}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Database className="w-4 h-4" />
                  <span>Save as Life Chapter in Chronicle</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIGN OUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showSignOutConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#18151D] text-slate-100 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-50 space-y-5"
            >
              <button
                type="button"
                onClick={() => setShowSignOutConfirmModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-amber-200">
                    Depart Sanctuary?
                  </h3>
                  <p className="text-xs text-amber-200/70 font-sans">
                    Closing current journaling session
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Are you sure you want to sign out? Your reflection history, active streaks, and encrypted time capsules remain safely preserved.
              </p>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-medium font-serif">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sanctuary Protection</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Upon confirmation, the grimoire will fold shut, lock the seal, and return you securely to the login portal.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSignOutConfirmModal(false)}
                  className="text-xs text-slate-300 hover:text-white cursor-pointer px-4 py-2"
                >
                  Stay in Sanctuary
                </Button>
                <Button
                  onClick={handleConfirmSignOut}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confirm & Lock Grimoire</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SANCTUM MOMENTS 3-STEP WIZARD OVERLAY */}
      <AnimatePresence>
        {showMomentWizard && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-2 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="w-full max-w-5xl h-[92vh] max-h-[92vh] flex flex-col bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative min-h-0"
            >
              <MomentCreator
                initialMoment={editingMoment || undefined}
                onClose={() => {
                  setShowMomentWizard(false);
                  setEditingMoment(null);
                  const local = getAllStoredMoments();
                  setUserMoments(local);
                  if (user?.uid) {
                    fetchUserMoments(user.uid).then((cloud) => {
                      if (cloud?.length) setUserMoments(cloud);
                    }).catch(() => {});
                  }
                }}
                onMomentCreated={(created) => {
                  setUserMoments((prev) => [created, ...prev.filter((m) => m.id !== created.id)]);
                }}
                onSave={(saved) => {
                  if (saved) {
                    setUserMoments((prev) => [saved, ...prev.filter((m) => m.id !== saved.id)]);
                  } else {
                    setUserMoments(getAllStoredMoments());
                  }
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3D BOOK OPENING & CLOSING LOADERS */}
      <AnimatePresence>
        {/* Initial Book Opening Loader */}
        {initialLoading && (
          <BookOpeningLoader
            key="initial-book-loader"
            mode="initial"
            theme={userTheme}
            onComplete={() => setInitialLoading(false)}
          />
        )}

        {/* Theme Transition Book Opening Loader */}
        {applyingThemeTarget && (
          <BookOpeningLoader
            key={`theme-book-loader-${applyingThemeTarget}`}
            mode="theme"
            theme={applyingThemeTarget}
            onEnterInside={handleThemeEnterInside}
            onComplete={handleThemeApplyComplete}
          />
        )}

        {/* Sign Out Book Closing Loader (Zoom out from middle of book & cover locks shut) */}
        {signingOut && (
          <BookClosingLoader
            key="signout-book-closing-loader"
            theme={userTheme}
            title="Closing & Locking the Grimoire..."
            subtitle="Your sanctuary, time capsules, and memories remain securely encrypted"
            onComplete={async () => {
              try {
                await signOut(auth);
              } catch (err) {
                console.error("Sign out error:", err);
              } finally {
                window.location.href = "/login";
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}