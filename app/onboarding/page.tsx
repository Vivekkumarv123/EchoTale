"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { fetchUserProfile, saveUserTheme, type ChronicleTheme } from "@/lib/user-service";
import { motion, AnimatePresence } from "motion/react";
import {
  Feather,
  Wand2,
  Zap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ThemeOption {
  id: ChronicleTheme;
  title: string;
  subtitle: string;
  tagline: string;
  icon: LucideIcon;
  accentColor: string;
  themeBadge: string;
  quote: string;
  previewTitle: string;
  previewSnippet: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  cardTextColor: string;
  titleColor: string;
  subtitleColor: string;
  taglineColor: string;
  quoteColor: string;
  selectedRing: string;
  glowEffect: string;
  excerptGlow: string;
  previewDetails: {
    fontFamily: string;
    decor: string;
    ambientVibe: string;
  };
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "grimoire",
    title: "Vintage Grimoire",
    subtitle: "Parchment & Magic Ink",
    tagline: "Warm parchment creams, antique sepia tones, and golden runic accents.",
    icon: Feather,
    accentColor: "#8A5A36",
    themeBadge: "Act I · Classic Narrative",
    quote: "“The ink breathes memory into timeless gold.”",
    previewTitle: "Midnight Musings under Starlight",
    previewSnippet:
      "The candle flickers as words crystallize upon the rough-hewn vellum. In every passing thought lies an untold chapter of wisdom...",
    badgeBg: "bg-[#F5E6D3]",
    badgeBorder: "border-[#D7BEA8]",
    badgeText: "text-[#5C3317]",
    cardBg: "bg-[#FAF1E4]",
    cardBorder: "border-[#D7BEA8]",
    cardTextColor: "text-[#3D2C2E]",
    titleColor: "text-[#3D2C2E]",
    subtitleColor: "text-[#6D4C41]",
    taglineColor: "text-[#5C3317]/85",
    quoteColor: "text-[#6D4C41]",
    selectedRing: "ring-2 ring-[#8A5A36] border-[#8A5A36] shadow-xl shadow-[#5C331725]",
    glowEffect: "from-amber-300/30 via-amber-200/15 to-transparent",
    excerptGlow: "shadow-[0_0_20px_rgba(217,119,6,0.25)] border-[#8A5A36] bg-[#FAF1E4]",
    previewDetails: {
      fontFamily: "font-serif",
      decor: "border-l-2 border-[#8A5A36] pl-3 italic text-[#5C3317] font-serif",
      ambientVibe: "Warm Amber Vellum",
    },
  },
  {
    id: "fairytale",
    title: "Fairy Tale",
    subtitle: "Whimsical & Dreamy",
    tagline: "Soft pastel pinks, lavender gradients, and stardust sparkle highlights.",
    icon: Wand2,
    accentColor: "#EC4899",
    themeBadge: "Act II · Romantic & Whimsical",
    quote: "“Once upon a quiet starlit reverie, a heart awoke.”",
    previewTitle: "The Whispering Rose Garden",
    previewSnippet:
      "A trail of stardust leads through the twilight grove. Here, love and gentle wonder illuminate each reflection like falling blossom petals...",
    badgeBg: "bg-[#FDF2F8]",
    badgeBorder: "border-[#F0ABFC]",
    badgeText: "text-[#9333EA]",
    cardBg: "bg-gradient-to-br from-[#FAF5FF] via-[#FDF4FF] to-[#FCE7F3]",
    cardBorder: "border-[#F0ABFC]",
    cardTextColor: "text-[#4C1D95]",
    titleColor: "text-[#3B0764]",
    subtitleColor: "text-[#701A75]",
    taglineColor: "text-[#831843]/85",
    quoteColor: "text-[#701A75]",
    selectedRing: "ring-2 ring-[#EC4899] border-[#EC4899] shadow-xl shadow-[#EC489930]",
    glowEffect: "from-pink-300/40 via-purple-200/20 to-transparent",
    excerptGlow: "shadow-[0_0_22px_rgba(236,72,153,0.3)] border-[#EC4899] bg-white/95",
    previewDetails: {
      fontFamily: "font-serif",
      decor: "border-l-2 border-[#EC4899] pl-3 italic text-[#701A75] font-serif",
      ambientVibe: "Enchanted Stardust Fog",
    },
  },
  {
    id: "cyber",
    title: "Cyber-Mechanical",
    subtitle: "Futuristic & Fortitude",
    tagline: "Deep slate-charcoal, brushed titanium, with neon cyan and laser crimson underglow.",
    icon: Zap,
    accentColor: "#38BDF8",
    themeBadge: "Act III · Superhero Fortitude",
    quote: "“Armor forged through trials, memory encoded in light.”",
    previewTitle: "SYSTEM_DIARY // CORE_LOG_409",
    previewSnippet:
      ">> PROTOCOL INITIATED: Resilience matrix at maximum capacity. Fortitude core active. Unshakable resolve synchronized with kinetic drive...",
    badgeBg: "bg-[#0F172A]",
    badgeBorder: "border-sky-500/40",
    badgeText: "text-sky-400",
    cardBg: "bg-[#0B1120]",
    cardBorder: "border-sky-500/40",
    cardTextColor: "text-slate-100",
    titleColor: "text-white",
    subtitleColor: "text-sky-300",
    taglineColor: "text-slate-300/90",
    quoteColor: "text-sky-300",
    selectedRing: "ring-2 ring-sky-400 border-sky-400 shadow-xl shadow-sky-500/30",
    glowEffect: "from-sky-500/30 via-rose-500/10 to-transparent",
    excerptGlow: "shadow-[0_0_24px_rgba(56,189,248,0.35)] border-sky-400 bg-[#0F172A]",
    previewDetails: {
      fontFamily: "font-mono text-xs",
      decor: "border-l-2 border-sky-400 pl-3 text-sky-200 tracking-wide font-mono",
      ambientVibe: "Cyber Arc Reactor Core",
    },
  },
];

export default function OnboardingThemePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loadingUser, setLoadingUser] = React.useState<boolean>(true);
  const [selectedTheme, setSelectedTheme] = React.useState<ChronicleTheme>("grimoire");
  const [saving, setSaving] = React.useState<boolean>(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push("/login");
        return;
      }

      try {
        const profile = await fetchUserProfile(currentUser.uid);
        if (profile?.theme) {
          setSelectedTheme(profile.theme);
        }
      } catch (err) {
        console.warn("Could not retrieve existing profile during onboarding:", err);
      } finally {
        setLoadingUser(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSaveAndEnter = async () => {
    const targetUser = user || auth.currentUser;
    if (!targetUser) {
      setSaveError("Authentication session expired. Please log in again.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      await saveUserTheme(targetUser.uid, selectedTheme);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Failed to save chronicle atmosphere:", err);
      setSaveError(
        err instanceof Error ? err.message : "Unable to save theme selection. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedThemeMeta =
    THEME_OPTIONS.find((t) => t.id === selectedTheme) || THEME_OPTIONS[0];

  const canvasBackgrounds = {
    grimoire: "bg-[#FDF8F6] text-[#3D2C2E]",
    fairytale: "bg-[#FAF5FF] text-[#4C1D95]",
    cyber: "bg-[#030712] text-slate-100",
  }[selectedTheme];

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.trim().split(" ");
      return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "E";
  };

  return (
    <main
      className={`min-h-screen flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-8 sm:py-12 transition-colors duration-500 ease-in-out relative overflow-hidden ${canvasBackgrounds}`}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 transition-all duration-700 ${
            selectedTheme === "grimoire"
              ? "bg-[#D97706]"
              : selectedTheme === "fairytale"
              ? "bg-[#EC4899]"
              : "bg-[#38BDF8]"
          }`}
        />
        <div
          className={`absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25 transition-all duration-700 ${
            selectedTheme === "grimoire"
              ? "bg-[#8A5A36]"
              : selectedTheme === "fairytale"
              ? "bg-[#C084FC]"
              : "bg-[#F43F5E]"
          }`}
        />
      </div>

      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-black/10 dark:border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 text-white font-serif font-bold text-lg shrink-0"
            style={{ backgroundColor: selectedThemeMeta.accentColor }}
          >
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-salted text-3xl sm:text-4xl leading-none transition-colors">
              EchoTale
            </span>
            <span className="font-note text-xs sm:text-sm tracking-wide opacity-80 -mt-0.5">
              Personal Reflection Sanctum
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-black/5 dark:border-white/10">
              <Avatar className="w-6 h-6 border">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                <AvatarFallback className="text-[10px] bg-slate-700 text-white">
                  {getInitials(user.displayName, user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium truncate max-w-[140px]">
                {user.displayName || user.email?.split("@")[0]}
              </span>
            </div>
          )}

          <Badge
            variant="outline"
            className="border-black/10 dark:border-white/20 text-xs px-3 py-1 flex items-center gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 opacity-70" />
            <span>Onboarding · Step 02</span>
          </Badge>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full my-8 sm:my-12 relative z-10 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sanctum Atmosphere Selection</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
              Choose Your Chronicle Atmosphere
            </h2>
            <p className="text-sm sm:text-base opacity-75 leading-relaxed font-sans max-w-xl mx-auto">
              Select the visual realm and storytelling voice for your private journal. Click any card or select button below to activate your theme.
            </p>
          </div>
        </div>

        <AnimatePresence>
          {saveError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <p className="flex-1 font-medium">{saveError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10">
          {THEME_OPTIONS.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            const Icon = theme.icon;

            return (
              <div
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`group relative rounded-3xl p-6 sm:p-7 border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  theme.cardBg
                } ${theme.cardTextColor} ${
                  isSelected
                    ? `${theme.selectedRing} scale-[1.02] shadow-2xl`
                    : `${theme.cardBorder} hover:shadow-lg opacity-80 hover:opacity-100 hover:scale-[1.01]`
                }`}
              >
                <div
                  className={`absolute top-0 right-0 w-44 h-44 bg-radial ${theme.glowEffect} rounded-full blur-2xl pointer-events-none`}
                />

                <div className="flex items-center justify-between gap-2 mb-5 relative z-10">
                  <div
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}
                  >
                    {theme.themeBadge}
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isSelected
                        ? "bg-emerald-500 border-emerald-500 text-white scale-110 shadow-md shadow-emerald-500/30"
                        : "border-black/20 dark:border-white/20 bg-white/30 text-transparent"
                    }`}
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                </div>

                <div className="mb-6 relative z-10">
                  <div className="flex items-center gap-3.5 mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor:
                          theme.id === "cyber"
                            ? "#1E293B"
                            : theme.id === "fairytale"
                            ? "#FDF2F8"
                            : "#FAF1E4",
                        border: `1px solid ${theme.accentColor}40`,
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: theme.accentColor }}
                      />
                    </div>
                    <div>
                      <h3 className={`font-serif text-xl sm:text-2xl font-bold tracking-tight ${theme.titleColor}`}>
                        {theme.title}
                      </h3>
                      <p className={`text-xs font-sans font-semibold ${theme.subtitleColor}`}>
                        {theme.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed font-sans ${theme.taglineColor}`}>
                    {theme.tagline}
                  </p>
                </div>

                <div
                  className={`rounded-2xl p-4 border transition-all duration-300 mt-auto relative overflow-hidden backdrop-blur-sm ${
                    isSelected
                      ? `${theme.excerptGlow} shadow-md`
                      : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10"
                  }`}
                  style={{
                    borderColor: isSelected ? theme.accentColor : undefined,
                  }}
                >
                  {isSelected && (
                    <div
                      className="absolute top-0 left-0 right-0 h-1 opacity-90"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono opacity-80 uppercase mb-2">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
                      <span>Preview Excerpt</span>
                    </span>
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-md font-bold border"
                      style={{
                        backgroundColor: `${theme.accentColor}15`,
                        borderColor: `${theme.accentColor}40`,
                        color: theme.accentColor,
                      }}
                    >
                      {theme.previewDetails.ambientVibe}
                    </span>
                  </div>

                  <h4
                    className={`text-xs font-bold mb-1.5 ${theme.previewDetails.fontFamily} ${theme.titleColor}`}
                  >
                    {theme.previewTitle}
                  </h4>

                  <p className={`text-[11px] leading-relaxed line-clamp-3 ${theme.previewDetails.decor}`}>
                    {theme.previewSnippet}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-medium relative z-10 gap-2">
                  <span className={`font-note text-xs sm:text-sm truncate ${theme.quoteColor}`}>
                    {theme.quote}
                  </span>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTheme(theme.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-current"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Active</span>
                      </>
                    ) : (
                      <span>Select Theme</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-white"
              style={{ backgroundColor: selectedThemeMeta.accentColor }}
            >
              <selectedThemeMeta.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs opacity-60 font-sans uppercase tracking-wider font-bold">
                Selected Atmosphere
              </div>
              <div className="font-serif text-lg font-bold">
                {selectedThemeMeta.title} &bull;{" "}
                <span className="font-sans text-sm font-normal opacity-80">
                  {selectedThemeMeta.subtitle}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSaveAndEnter}
            disabled={saving || loadingUser}
            className="w-full sm:w-auto px-8 py-6 rounded-2xl font-semibold text-sm shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3 text-white disabled:opacity-75 disabled:cursor-not-allowed disabled:pointer-events-none disabled:scale-100"
            style={{
              backgroundColor: selectedThemeMeta.accentColor,
              boxShadow: `0 10px 25px -5px ${selectedThemeMeta.accentColor}50`,
            }}
          >
            {saving ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent shrink-0" />
                <span className="font-semibold tracking-wide">Entering Sanctum...</span>
              </>
            ) : (
              <>
                <span>Enter Sanctum &amp; Begin Chronicle</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      <footer className="max-w-5xl mx-auto w-full pt-6 border-t border-black/10 dark:border-white/10 text-center relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-60">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Firestore Zero-Trust Rule Enforcement &bull; Scoped strictly to /users/{user?.uid || "session"}</span>
        </div>
        <div className="font-mono text-[11px]">
          EchoTale v1.0 &bull; Chronicle Ambiance Engine
        </div>
      </footer>
    </main>
  );
}
