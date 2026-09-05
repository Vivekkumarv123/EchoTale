"use client";

import * as React from "react";
import { Sparkles, BookOpen, Feather } from "lucide-react";
import type { ChronicleTheme } from "@/lib/user-service";

interface BookOpeningLoaderProps {
  /** Mode: "initial" for dashboard entry, "theme" for switching atmosphere */
  mode?: "initial" | "theme";
  /** The theme being displayed or switched to */
  theme?: ChronicleTheme;
  /** Custom title or status subtitle */
  title?: string;
  subtitle?: string;
  /** Called when the animation enters the "enter inside" zoom phase */
  onEnterInside?: () => void;
  /** Called when the animation completes the "enter inside" phase */
  onComplete?: () => void;
  /** Allow manual dismissal if needed */
  canSkip?: boolean;
}

export default function BookOpeningLoader({
  mode = "initial",
  theme = "grimoire",
  title,
  subtitle,
  onEnterInside,
  onComplete,
  canSkip = true,
}: BookOpeningLoaderProps) {
  // Animation phases:
  // 0: closed book appearing
  // 1: cover opening
  // 2: flipping page 1
  // 3: flipping page 2
  // 4: flipping page 3
  // 5: stop in middle (book open, radiant glow)
  // 6: enter inside (zoom in towards center pages)
  // 7: fade out / complete
  const [phase, setPhase] = React.useState<number>(0);
  const [isZoomingInside, setIsZoomingInside] = React.useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = React.useState<boolean>(false);

  // Theme-specific visual tokens
  const themeVisuals = React.useMemo(() => {
    switch (theme) {
      case "fairytale":
        return {
          overlayBg: "from-[#1F0624]/95 via-[#2C0A35]/95 to-[#16031A]/95",
          bookCover: "from-[#701A75] via-[#86198F] to-[#4A044E]",
          bookBorder: "border-[#F472B6]/40",
          coverEmboss: "text-[#FCE7F3] border-[#EC4899]/60",
          accentColor: "#EC4899",
          pageBg: "#FDF2F8",
          pageText: "#701A75",
          pageBorder: "#FBCFE8",
          glowColor: "rgba(236, 72, 153, 0.45)",
          realmName: "Fairytale Realm",
          tagline: "Woven in stardust, dreams, and timeless reverie",
        };
      case "cyber":
        return {
          overlayBg: "from-[#030712]/95 via-[#0B1528]/95 to-[#020617]/95",
          bookCover: "from-[#0F172A] via-[#1E293B] to-[#020617]",
          bookBorder: "border-[#06B6D4]/50",
          coverEmboss: "text-[#38BDF8] border-[#06B6D4]/70",
          accentColor: "#06B6D4",
          pageBg: "#0F172A",
          pageText: "#38BDF8",
          pageBorder: "#1E293B",
          glowColor: "rgba(6, 182, 212, 0.45)",
          realmName: "Cyberpunk Terminal",
          tagline: "Neural echoes inscribed across digital memory",
        };
      case "grimoire":
      default:
        return {
          overlayBg: "from-[#18110B]/95 via-[#231710]/95 to-[#120D08]/95",
          bookCover: "from-[#3D2314] via-[#4A2B18] to-[#2B180D]",
          bookBorder: "border-[#D4AF37]/50",
          coverEmboss: "text-[#F5E6BE] border-[#D4AF37]/70",
          accentColor: "#D4AF37",
          pageBg: "#FAF4E8",
          pageText: "#4A2B18",
          pageBorder: "#E8D9C0",
          glowColor: "rgba(212, 175, 55, 0.45)",
          realmName: "Ancient Grimoire",
          tagline: "Preserving life's sacred milestones on enduring parchment",
        };
    }
  }, [theme]);

  // Orchestrate animation timing
  React.useEffect(() => {
    // Stage 1: Book cover opens (350ms)
    const t1 = setTimeout(() => setPhase(1), 350);

    // Stage 2: Page 1 flips (750ms)
    const t2 = setTimeout(() => setPhase(2), 750);

    // Stage 3: Page 2 flips (1150ms)
    const t3 = setTimeout(() => setPhase(3), 1150);

    // Stage 4: Page 3 flips (1500ms)
    const t4 = setTimeout(() => setPhase(4), 1500);

    // Stage 5: Stop in the middle (1900ms) - pages rest flat, glowing
    const t5 = setTimeout(() => setPhase(5), 1900);

    // Stage 6: Enter inside (2500ms) - zoom in into the pages
    const t6 = setTimeout(() => {
      setPhase(6);
      setIsZoomingInside(true);
      onEnterInside?.();
    }, 2500);

    // Stage 7: Fade out (3100ms)
    const t7 = setTimeout(() => {
      setIsFadingOut(true);
    }, 3100);

    // Stage 8: Complete (3500ms)
    const t8 = setTimeout(() => {
      onComplete?.();
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
    };
  }, [onComplete, onEnterInside]);

  const handleSkip = () => {
    setIsZoomingInside(true);
    setIsFadingOut(true);
    onEnterInside?.();
    setTimeout(() => {
      onComplete?.();
    }, 400);
  };

  // Status message based on current phase
  const statusMessage = React.useMemo(() => {
    if (title) return title;
    if (mode === "theme") {
      if (phase < 2) return `Opening ${themeVisuals.realmName}...`;
      if (phase < 5) return "Transmuting atmosphere & ink...";
      if (phase === 5) return `Revealing ${themeVisuals.realmName}`;
      return "Entering sanctuary...";
    }
    if (phase < 2) return "Opening the Grimoire...";
    if (phase < 5) return "Flipping through life's chapters...";
    if (phase === 5) return "Sanctuary of Memory";
    return "Entering your quiet sanctuary...";
  }, [phase, mode, title, themeVisuals.realmName]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 select-none transition-opacity duration-700 backdrop-blur-xl bg-gradient-to-b ${
        themeVisuals.overlayBg
      } ${isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      style={{
        perspective: "1400px",
      }}
    >
      {/* Ambient background particles and glow ring */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none transition-all duration-1000"
        style={{
          background: themeVisuals.glowColor,
          transform: isZoomingInside ? "scale(3)" : "scale(1)",
          opacity: isZoomingInside ? 0.9 : 0.45,
        }}
      />

      {/* Skip button for rapid interaction */}
      {canSkip && (
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full text-xs font-serif tracking-wider text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/15 cursor-pointer z-50"
        >
          Enter Now &rarr;
        </button>
      )}

      {/* 3D BOOK RIG CONTAINER */}
      <div
        className="relative flex items-center justify-center transition-all duration-700 ease-out will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: isZoomingInside
            ? "scale(4.6) translateZ(350px)"
            : phase >= 1
            ? "scale(1) rotateX(12deg)"
            : "scale(0.92) rotateX(8deg)",
        }}
      >
        {/* THE BOOK BODY (Width ~ 480px, Height ~ 320px) */}
        <div
          className="relative w-[300px] sm:w-[440px] md:w-[480px] h-[210px] sm:h-[300px] md:h-[330px] flex rounded-r-xl"
          style={{
            transformStyle: "preserve-3d",
            boxShadow:
              phase >= 1
                ? `0 35px 70px -15px rgba(0,0,0,0.8), 0 0 50px ${themeVisuals.glowColor}`
                : "0 25px 50px -12px rgba(0,0,0,0.9)",
          }}
        >
          {/* STATIC LEFT BASE (The left side of the opened book) */}
          <div
            className={`w-1/2 h-full rounded-l-2xl border-l-4 border-y-2 border-r-0 relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${
              themeVisuals.bookCover
            } ${themeVisuals.bookBorder}`}
            style={{
              transformOrigin: "right center",
            }}
          >
            {/* Left Pages Block (Paper stack depth) */}
            <div
              className="absolute inset-[8px] rounded-l-xl p-4 sm:p-5 flex flex-col justify-between shadow-inner border border-black/10 overflow-hidden"
              style={{
                backgroundColor: themeVisuals.pageBg,
                color: themeVisuals.pageText,
              }}
            >
              {/* Left Page Illuminated Header */}
              <div className="flex items-center justify-between border-b pb-2 border-current/15">
                <div className="flex items-center gap-1.5 opacity-70 text-[10px] sm:text-xs font-serif uppercase tracking-widest">
                  <Feather className="w-3 h-3" />
                  <span>EchoTale &bull; Vol. I</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Folio 12</span>
              </div>

              {/* Left Page Calligraphy / Text Content */}
              <div className="space-y-2 sm:space-y-3 my-auto opacity-80">
                <div className="font-serif font-bold text-xs sm:text-sm tracking-wide">
                  {mode === "theme" ? "Metamorphosis" : "The Inner Horizon"}
                </div>
                <p className="text-[9px] sm:text-[11px] leading-relaxed font-serif italic">
                  &ldquo;Every entry inscribed into these pages is a step deeper into the sanctuary of self-discovery.&rdquo;
                </p>
                {/* Visual simulated script lines */}
                <div className="space-y-1.5 pt-1 opacity-40">
                  <div className="h-1 bg-current rounded-full w-full" />
                  <div className="h-1 bg-current rounded-full w-5/6" />
                  <div className="h-1 bg-current rounded-full w-4/6" />
                </div>
              </div>

              {/* Left Page Footer Ornament */}
              <div className="flex items-center justify-center pt-2 opacity-50">
                <div className="w-8 h-px bg-current/40" />
                <Sparkles className="w-2.5 h-2.5 mx-1" />
                <div className="w-8 h-px bg-current/40" />
              </div>
            </div>
          </div>

          {/* STATIC RIGHT BASE (The right side of the opened book) */}
          <div
            className={`w-1/2 h-full rounded-r-2xl border-r-4 border-y-2 border-l-0 relative overflow-hidden transition-all duration-500 bg-gradient-to-bl ${
              themeVisuals.bookCover
            } ${themeVisuals.bookBorder}`}
          >
            {/* Right Pages Block (Paper stack depth) */}
            <div
              className="absolute inset-[8px] rounded-r-xl p-4 sm:p-5 flex flex-col justify-between shadow-inner border border-black/10 overflow-hidden"
              style={{
                backgroundColor: themeVisuals.pageBg,
                color: themeVisuals.pageText,
              }}
            >
              {/* Right Page Illuminated Header */}
              <div className="flex items-center justify-between border-b pb-2 border-current/15">
                <span className="text-[10px] opacity-60 font-mono">Folio 13</span>
                <div className="flex items-center gap-1.5 opacity-70 text-[10px] sm:text-xs font-serif uppercase tracking-widest">
                  <span>{themeVisuals.realmName}</span>
                  <BookOpen className="w-3 h-3" />
                </div>
              </div>

              {/* Center Rested / Revealed Content (The "Stop in the middle" page) */}
              <div className="text-center my-auto px-1 space-y-2 sm:space-y-2.5">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full border border-current/30 flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: `${themeVisuals.accentColor}20`,
                    color: themeVisuals.accentColor,
                  }}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
                </div>
                <h4 className="font-serif font-bold text-xs sm:text-base tracking-tight">
                  {mode === "theme" ? themeVisuals.realmName : "Sanctuary of Memory"}
                </h4>
                <p className="text-[9px] sm:text-[11px] font-serif leading-snug opacity-75">
                  {themeVisuals.tagline}
                </p>

                {/* Subtle portal invitation */}
                <div
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono tracking-wider uppercase border border-current/25 font-bold"
                  style={{
                    backgroundColor: `${themeVisuals.accentColor}15`,
                  }}
                >
                  <span>Portal Opening</span>
                </div>
              </div>

              {/* Right Page Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-current/15 text-[9px] opacity-50 font-mono">
                <span>EchoTale Sanctuary</span>
                <span>Sealed &bull; Ready</span>
              </div>
            </div>
          </div>

          {/* THE GOLDEN CENTER CREASE / SPINE (Glows as book stops in middle) */}
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 sm:w-4 z-20 pointer-events-none transition-all duration-700"
            style={{
              background:
                phase >= 5
                  ? `linear-gradient(to right, rgba(0,0,0,0.5), ${themeVisuals.accentColor}, rgba(0,0,0,0.5))`
                  : "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
              boxShadow: phase >= 5 ? `0 0 25px 4px ${themeVisuals.accentColor}` : "none",
            }}
          />

          {/* ========================================================================= */}
          {/* FLIPPING LEAVES RIG (3D Rotating Pages from right to left) */}
          {/* ========================================================================= */}

          {/* LEAF 1 (Cover leaf that hinges open first) */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full z-40 transition-transform duration-700 ease-in-out origin-left rounded-r-2xl"
            style={{
              transformStyle: "preserve-3d",
              transform: phase >= 1 ? "rotateY(-180deg)" : "rotateY(0deg)",
            }}
          >
            {/* FRONT OF LEAF 1: LEATHER BOOK COVER (Visible when book is closed) */}
            <div
              className={`absolute inset-0 rounded-r-2xl border-r-4 border-y-2 border-l-0 p-5 flex flex-col items-center justify-between shadow-2xl bg-gradient-to-br ${
                themeVisuals.bookCover
              } ${themeVisuals.bookBorder}`}
              style={{
                backfaceVisibility: "hidden",
              }}
            >
              {/* Ornate Cover Corners */}
              <div className="w-full flex justify-between opacity-70">
                <div className="w-5 h-5 border-t-2 border-l-2 border-[#D4AF37]" />
                <div className="w-5 h-5 border-t-2 border-r-2 border-[#D4AF37]" />
              </div>

              {/* Gold Foil Center Grimoire Seal */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center shadow-lg ${themeVisuals.coverEmboss}`}
                  style={{
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                >
                  <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse" />
                </div>
                <div className="font-serif font-bold text-sm sm:text-base tracking-widest uppercase text-[#F5E6BE]">
                  EchoTale
                </div>
                <div className="text-[10px] sm:text-xs font-serif italic text-[#F5E6BE]/70">
                  Chronicles of the Soul
                </div>
              </div>

              {/* Bottom Ornate Corners */}
              <div className="w-full flex justify-between opacity-70">
                <div className="w-5 h-5 border-b-2 border-l-2 border-[#D4AF37]" />
                <div className="w-5 h-5 border-b-2 border-r-2 border-[#D4AF37]" />
              </div>
            </div>

            {/* BACK OF LEAF 1: Inside front cover parchment (Visible after opening) */}
            <div
              className="absolute inset-0 rounded-l-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl border border-black/10"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                backgroundColor: themeVisuals.pageBg,
                color: themeVisuals.pageText,
              }}
            >
              <div className="text-[10px] font-mono opacity-50 uppercase tracking-wider">
                Ex Libris &bull; Sanctuary
              </div>
              <div className="text-center space-y-1 my-auto">
                <Sparkles className="w-4 h-4 mx-auto opacity-70" />
                <p className="font-serif italic text-xs leading-snug">
                  &ldquo;A mind at rest discovers its own quiet wisdom.&rdquo;
                </p>
              </div>
              <div className="text-[9px] opacity-40 font-mono text-center">Volume I</div>
            </div>
          </div>

          {/* LEAF 2 (First Parchment Page turning) */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full z-30 transition-transform duration-700 ease-in-out origin-left rounded-r-xl"
            style={{
              transformStyle: "preserve-3d",
              transform: phase >= 2 ? "rotateY(-180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front of Page 2 (Right side) */}
            <div
              className="absolute inset-[6px] rounded-r-xl p-4 flex flex-col justify-between shadow-lg border border-black/10"
              style={{
                backfaceVisibility: "hidden",
                backgroundColor: themeVisuals.pageBg,
                color: themeVisuals.pageText,
              }}
            >
              <div className="text-[9px] font-mono opacity-40 uppercase">Prologue</div>
              <div className="space-y-1.5 opacity-60">
                <div className="h-1 bg-current rounded-full w-full" />
                <div className="h-1 bg-current rounded-full w-4/5" />
                <div className="h-1 bg-current rounded-full w-3/4" />
                <div className="h-1 bg-current rounded-full w-5/6" />
              </div>
              <div className="text-[9px] font-mono opacity-40 text-right">01</div>
            </div>

            {/* Back of Page 2 (Left side when flipped) */}
            <div
              className="absolute inset-[6px] rounded-l-xl p-4 flex flex-col justify-between shadow-lg border border-black/10"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                backgroundColor: themeVisuals.pageBg,
                color: themeVisuals.pageText,
              }}
            >
              <div className="text-[9px] font-mono opacity-40 uppercase">Chapter I</div>
              <div className="space-y-1.5 opacity-60">
                <div className="h-1 bg-current rounded-full w-full" />
                <div className="h-1 bg-current rounded-full w-5/6" />
                <div className="h-1 bg-current rounded-full w-4/6" />
              </div>
              <div className="text-[9px] font-mono opacity-40">02</div>
            </div>
          </div>

          {/* LEAF 3 (Second Parchment Page turning) */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full z-25 transition-transform duration-700 ease-in-out origin-left rounded-r-xl"
            style={{
              transformStyle: "preserve-3d",
              transform: phase >= 3 ? "rotateY(-180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front of Page 3 */}
            <div
              className="absolute inset-[6px] rounded-r-xl p-4 flex flex-col justify-between shadow-lg border border-black/10"
              style={{
                backfaceVisibility: "hidden",
                backgroundColor: themeVisuals.pageBg,
                color: themeVisuals.pageText,
              }}
            >
              <div className="text-[9px] font-mono opacity-40 uppercase">Memory Echoes</div>
              <div className="space-y-1.5 opacity-60">
                <div className="h-1 bg-current rounded-full w-full" />
                <div className="h-1 bg-current rounded-full w-5/6" />
                <div className="h-1 bg-current rounded-full w-3/5" />
              </div>
              <div className="text-[9px] font-mono opacity-40 text-right">03</div>
            </div>

            {/* Back of Page 3 */}
            <div
              className="absolute inset-[6px] rounded-l-xl p-4 flex flex-col justify-between shadow-lg border border-black/10"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                backgroundColor: themeVisuals.pageBg,
                color: themeVisuals.pageText,
              }}
            >
              <div className="text-[9px] font-mono opacity-40 uppercase">The Quiet Desk</div>
              <div className="space-y-1.5 opacity-60">
                <div className="h-1 bg-current rounded-full w-full" />
                <div className="h-1 bg-current rounded-full w-4/5" />
              </div>
              <div className="text-[9px] font-mono opacity-40">04</div>
            </div>
          </div>

          {/* LEAF 4 (Third Parchment Page turning before stopping in middle) */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full z-20 transition-transform duration-650 ease-out origin-left rounded-r-xl"
            style={{
              transformStyle: "preserve-3d",
              transform: phase >= 4 ? "rotateY(-180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front of Page 4 */}
            <div
              className="absolute inset-[6px] rounded-r-xl p-4 flex flex-col justify-between shadow-lg border border-black/10"
              style={{
                backfaceVisibility: "hidden",
                backgroundColor: themeVisuals.pageBg,
                color: themeVisuals.pageText,
              }}
            >
              <div className="text-[9px] font-mono opacity-40 uppercase">Illumination</div>
              <div className="space-y-1.5 opacity-60">
                <div className="h-1 bg-current rounded-full w-full" />
                <div className="h-1 bg-current rounded-full w-2/3" />
              </div>
              <div className="text-[9px] font-mono opacity-40 text-right">05</div>
            </div>

            {/* Back of Page 4 */}
            <div
              className="absolute inset-[6px] rounded-l-xl p-4 flex flex-col justify-between shadow-lg border border-black/10"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                backgroundColor: themeVisuals.pageBg,
                color: themeVisuals.pageText,
              }}
            >
              <div className="text-[9px] font-mono opacity-40 uppercase">Convergence</div>
              <div className="space-y-1.5 opacity-60">
                <div className="h-1 bg-current rounded-full w-full" />
                <div className="h-1 bg-current rounded-full w-3/4" />
              </div>
              <div className="text-[9px] font-mono opacity-40">06</div>
            </div>
          </div>
        </div>
      </div>

      {/* CHOREOGRAPHED STATUS CAPTIONS & ILLUMINATION BAR */}
      <div
        className={`mt-10 sm:mt-12 text-center space-y-2 transition-all duration-500 z-50 ${
          isZoomingInside ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-lg">
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-amber-400" />
          <span className="font-serif font-semibold text-xs sm:text-sm tracking-wide">
            {statusMessage}
          </span>
        </div>

        <p className="text-xs text-white/60 font-serif italic max-w-sm mx-auto">
          {subtitle || (mode === "theme" ? themeVisuals.tagline : "Woven from your authentic words and memories.")}
        </p>

        {/* Shimmer progress line */}
        <div className="w-36 sm:w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden mt-3">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.min(100, (phase + 1) * 16.6)}%`,
              backgroundColor: themeVisuals.accentColor,
              boxShadow: `0 0 10px ${themeVisuals.accentColor}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
