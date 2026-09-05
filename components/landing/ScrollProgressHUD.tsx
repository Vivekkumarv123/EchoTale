"use client";

import * as React from "react";
import { Sparkles, Wand2, Heart, Zap, Compass } from "lucide-react";

interface ScrollProgressHUDProps {
  activeAct: 1 | 2 | 3;
  onNavigateAct: (act: 1 | 2 | 3) => void;
}

export function ScrollProgressHUD({ activeAct, onNavigateAct }: ScrollProgressHUDProps) {
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [currentSection, setCurrentSection] = React.useState<"hero" | "act1" | "act2" | "act3" | "vault">("hero");

  React.useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(progress);
      }

      const scrollY = window.scrollY;
      const h = window.innerHeight;

      if (scrollY < h * 0.7) {
        setCurrentSection("hero");
      } else if (scrollY < h * 2.1) {
        setCurrentSection("act1");
      } else if (scrollY < h * 3.6) {
        setCurrentSection("act2");
      } else if (scrollY < h * 5.0) {
        setCurrentSection("act3");
      } else {
        setCurrentSection("vault");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const actThemes = {
    1: {
      accent: "#5C3317",
      glow: "rgba(92, 51, 23, 0.2)",
      borderColor: "border-[#D7BEA8]",
      bg: "bg-[#FAF1E4]/90",
      activeText: "text-[#5C3317]",
      barGrad: "from-[#8A5A36] via-[#D97706] to-[#5C3317]",
    },
    2: {
      accent: "#EC4899",
      glow: "rgba(236, 72, 153, 0.3)",
      borderColor: "border-[#F0ABFC]",
      bg: "bg-[#FDF4FF]/90",
      activeText: "text-[#EC4899]",
      barGrad: "from-[#EC4899] via-[#C084FC] to-[#9333EA]",
    },
    3: {
      accent: "#38BDF8",
      glow: "rgba(56, 189, 248, 0.3)",
      borderColor: "border-sky-500/50",
      bg: "bg-[#0F172A]/90",
      activeText: "text-sky-400",
      barGrad: "from-sky-400 via-indigo-500 to-rose-500",
    },
  }[activeAct];

  return (
    <>
      {/* Top Fixed Dynamic Reading & Scroll Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60] pointer-events-none bg-black/5 dark:bg-white/5">
        <div
          className={`h-full bg-gradient-to-r ${actThemes.barGrad} transition-all duration-150 ease-out shadow-sm`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Interactive Right HUD Control Bar */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3 p-2 rounded-2xl backdrop-blur-xl border shadow-xl transition-all duration-500 bg-white/70 dark:bg-slate-900/80 border-slate-300 dark:border-slate-800">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold px-1 py-0.5">
          {Math.round(scrollProgress)}%
        </div>

        <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-700" />

        {/* Act 1 Step Button */}
        <button
          onClick={() => onNavigateAct(1)}
          title="Jump to Act I · Magic Ink"
          className={`group relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
            activeAct === 1
              ? "bg-[#5C3317] text-white shadow-md shadow-[#5C331735] scale-110"
              : "text-[#8A5A36] hover:bg-[#FAF1E4] hover:scale-105"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span className="absolute right-12 px-2.5 py-1 rounded-lg bg-[#5C3317] text-white text-xs font-sans whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            Act I · Magic Ink
          </span>
        </button>

        {/* Act 2 Step Button */}
        <button
          onClick={() => onNavigateAct(2)}
          title="Jump to Act II · Fairy Tale"
          className={`group relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
            activeAct === 2
              ? "bg-gradient-to-tr from-[#EC4899] to-[#9333EA] text-white shadow-md shadow-[#EC489935] scale-110"
              : "text-[#EC4899] hover:bg-[#FDF4FF] hover:scale-105"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span className="absolute right-12 px-2.5 py-1 rounded-lg bg-[#EC4899] text-white text-xs font-sans whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            Act II · Fairy Tale
          </span>
        </button>

        {/* Act 3 Step Button */}
        <button
          onClick={() => onNavigateAct(3)}
          title="Jump to Act III · Superhero"
          className={`group relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
            activeAct === 3
              ? "bg-sky-500 text-white shadow-md shadow-sky-500/35 scale-110"
              : "text-sky-500 hover:bg-sky-500/10 hover:scale-105"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="absolute right-12 px-2.5 py-1 rounded-lg bg-sky-500 text-white text-xs font-sans whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            Act III · Superhero
          </span>
        </button>

        <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-700" />

        {/* Dynamic Realm Marker */}
        <div className="flex flex-col items-center">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 animate-pulse`}
            style={{ backgroundColor: actThemes.accent }}
          />
        </div>
      </div>
    </>
  );
}
