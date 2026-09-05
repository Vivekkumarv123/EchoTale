"use client";

import * as React from "react";
import { Sparkles, BookOpen, Feather, Lock } from "lucide-react";
import type { ChronicleTheme } from "@/lib/user-service";

interface BookClosingLoaderProps {
  /** The theme being displayed */
  theme?: ChronicleTheme;
  /** Custom title or status subtitle */
  title?: string;
  subtitle?: string;
  /** Called when the closing sequence completes to finalize sign out and navigation */
  onComplete?: () => void;
  /** Allow manual immediate exit if desired */
  canSkip?: boolean;
}

export default function BookClosingLoader({
  theme = "grimoire",
  title,
  subtitle,
  onComplete,
  canSkip = true,
}: BookClosingLoaderProps) {
  // Animation phases:
  // 0: inside the book center (scale 4.5, open pages illuminated)
  // 1: zoom out from middle of book (scale down to 1, revealing full open book)
  // 2: leaf 4 flips back to right
  // 3: leaf 3 flips back to right
  // 4: leaf 2 flips back to right
  // 5: cover leaf 1 closes shut (0deg) & gold seal locks with latch pulse
  // 6: complete & fade out / redirect to login
  const [phase, setPhase] = React.useState<number>(0);
  const [isZoomingOut, setIsZoomingOut] = React.useState<boolean>(false);
  const [isLocked, setIsLocked] = React.useState<boolean>(false);
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
          tagline: "Your reveries and memories remain safely enchanted",
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
          tagline: "Neural echoes safely encrypted and committed to vault",
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
          tagline: "Your sacred milestones are sealed in timeless parchment",
        };
    }
  }, [theme]);

  // Orchestrate closing animation timing
  React.useEffect(() => {
    // Stage 1: Zoom out from middle of book (250ms)
    const t1 = setTimeout(() => {
      setPhase(1);
      setIsZoomingOut(true);
    }, 250);

    // Stage 2: Page 4 flips backward (750ms)
    const t2 = setTimeout(() => setPhase(2), 750);

    // Stage 3: Page 3 flips backward (1100ms)
    const t3 = setTimeout(() => setPhase(3), 1100);

    // Stage 4: Page 2 flips backward (1450ms)
    const t4 = setTimeout(() => setPhase(4), 1450);

    // Stage 5: Front Cover closes shut & locks (1800ms)
    const t5 = setTimeout(() => {
      setPhase(5);
      setIsLocked(true);
    }, 1800);

    // Stage 6: Fade out to reach login page (2400ms)
    const t6 = setTimeout(() => {
      setIsFadingOut(true);
    }, 2400);

    // Stage 7: Complete and redirect (2750ms)
    const t7 = setTimeout(() => {
      onComplete?.();
    }, 2750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete?.();
    }, 200);
  };

  // Status message based on closing phase
  const statusMessage = React.useMemo(() => {
    if (title) return title;
    if (phase === 0) return "Departing the Sanctuary...";
    if (phase === 1) return "Retracting from the illuminated pages...";
    if (phase >= 2 && phase <= 4) return "Flipping pages in reverse & committing entries...";
    if (phase >= 5) return "Grimoire safely closed & locked.";
    return "Returning to login...";
  }, [phase, title]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 select-none backdrop-blur-xl bg-gradient-to-b ${
        themeVisuals.overlayBg
      }`}
      style={{
        perspective: "1400px",
      }}
    >
      {/* Cinematic dark veil that fades in to black during final transition */}
      <div
        className={`fixed inset-0 bg-[#0B090E] pointer-events-none transition-opacity duration-500 z-50 ${
          isFadingOut ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Ambient background particles and glow ring */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none transition-all duration-1000"
        style={{
          background: themeVisuals.glowColor,
          transform: !isZoomingOut ? "scale(3)" : isLocked ? "scale(0.85)" : "scale(1.2)",
          opacity: isLocked ? 0.35 : !isZoomingOut ? 0.9 : 0.6,
        }}
      />

      {/* Skip button for rapid exit */}
      {canSkip && (
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-6 right-6 px-3.5 py-1.5 rounded-full text-xs font-serif tracking-wider text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/15 cursor-pointer z-50"
        >
          Exit Now &rarr;
        </button>
      )}

      {/* 3D BOOK RIG CONTAINER (Zooms out from middle, then closes) */}
      <div
        className="relative flex items-center justify-center transition-all duration-700 ease-out will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transform:
            !isZoomingOut
              ? "scale(4.6) translateZ(350px)"
              : isLocked
              ? "scale(0.95) rotateX(6deg)"
              : "scale(1) rotateX(12deg)",
        }}
      >
        {/* THE BOOK BODY */}
        <div
          className="relative w-[300px] sm:w-[440px] md:w-[480px] h-[210px] sm:h-[300px] md:h-[330px] flex rounded-r-xl transition-shadow duration-700"
          style={{
            transformStyle: "preserve-3d",
            boxShadow:
              isLocked
                ? `0 25px 50px -12px rgba(0,0,0,0.9), 0 0 25px ${themeVisuals.glowColor}`
                : `0 35px 70px -15px rgba(0,0,0,0.8), 0 0 50px ${themeVisuals.glowColor}`,
          }}
        >
          {/* STATIC LEFT BASE (Left page of open book) */}
          <div
            className={`w-1/2 h-full rounded-l-2xl border-l-4 border-y-2 border-r-0 relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${
              themeVisuals.bookCover
            } ${themeVisuals.bookBorder}`}
            style={{
              transformOrigin: "right center",
            }}
          >
            {/* Left Pages Block */}
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

              {/* Left Page Script */}
              <div className="space-y-2 sm:space-y-3 my-auto opacity-80">
                <div className="font-serif font-bold text-xs sm:text-sm tracking-wide">
                  Memory Sanctuary
                </div>
                <p className="text-[9px] sm:text-[11px] leading-relaxed font-serif italic">
                  &ldquo;A journey inscribed in honesty remains forever enduring in the vault.&rdquo;
                </p>
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

          {/* STATIC RIGHT BASE (Right page of open book) */}
          <div
            className={`w-1/2 h-full rounded-r-2xl border-r-4 border-y-2 border-l-0 relative overflow-hidden transition-all duration-500 bg-gradient-to-bl ${
              themeVisuals.bookCover
            } ${themeVisuals.bookBorder}`}
          >
            {/* Right Pages Block */}
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

              {/* Center Rested Content */}
              <div className="text-center my-auto px-1 space-y-2 sm:space-y-2.5">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full border border-current/30 flex items-center justify-center shadow-sm"
                  style={{
                    backgroundColor: `${themeVisuals.accentColor}20`,
                    color: themeVisuals.accentColor,
                  }}
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="font-serif font-bold text-xs sm:text-base tracking-tight">
                  Sealing Chronicle
                </h4>
                <p className="text-[9px] sm:text-[11px] font-serif leading-snug opacity-75">
                  {themeVisuals.tagline}
                </p>
                <div
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono tracking-wider uppercase border border-current/25 font-bold"
                  style={{
                    backgroundColor: `${themeVisuals.accentColor}15`,
                  }}
                >
                  <span>Vault Lock</span>
                </div>
              </div>

              {/* Right Page Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-current/15 text-[9px] opacity-50 font-mono">
                <span>EchoTale Safe</span>
                <span>Session Saved</span>
              </div>
            </div>
          </div>

          {/* THE GOLDEN CENTER CREASE / SPINE */}
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 sm:w-4 z-20 pointer-events-none transition-all duration-700"
            style={{
              background:
                !isLocked
                  ? `linear-gradient(to right, rgba(0,0,0,0.5), ${themeVisuals.accentColor}, rgba(0,0,0,0.5))`
                  : "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
              boxShadow: !isLocked ? `0 0 25px 4px ${themeVisuals.accentColor}` : "none",
            }}
          />

          {/* ========================================================================= */}
          {/* FLIPPING LEAVES RIG (Closing from left -180deg back to 0deg) */}
          {/* ========================================================================= */}

          {/* LEAF 4 (Page turns from left to right first) */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full z-20 transition-transform duration-650 ease-in-out origin-left rounded-r-xl"
            style={{
              transformStyle: "preserve-3d",
              transform: phase >= 2 ? "rotateY(0deg)" : "rotateY(-180deg)",
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

          {/* LEAF 3 (Second Page turning back) */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full z-25 transition-transform duration-650 ease-in-out origin-left rounded-r-xl"
            style={{
              transformStyle: "preserve-3d",
              transform: phase >= 3 ? "rotateY(0deg)" : "rotateY(-180deg)",
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

          {/* LEAF 2 (Third Page turning back) */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full z-30 transition-transform duration-650 ease-in-out origin-left rounded-r-xl"
            style={{
              transformStyle: "preserve-3d",
              transform: phase >= 4 ? "rotateY(0deg)" : "rotateY(-180deg)",
            }}
          >
            {/* Front of Page 2 */}
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
              </div>
              <div className="text-[9px] font-mono opacity-40 text-right">01</div>
            </div>

            {/* Back of Page 2 */}
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
              </div>
              <div className="text-[9px] font-mono opacity-40">02</div>
            </div>
          </div>

          {/* LEAF 1: FRONT LEATHER COVER (Hinges shut over right side at phase 5) */}
          <div
            className="absolute top-0 right-0 w-1/2 h-full z-40 transition-transform duration-750 ease-in-out origin-left rounded-r-2xl"
            style={{
              transformStyle: "preserve-3d",
              transform: phase >= 5 ? "rotateY(0deg)" : "rotateY(-180deg)",
            }}
          >
            {/* FRONT OF COVER: Visible when book is fully closed */}
            <div
              className={`absolute inset-0 rounded-r-2xl border-r-4 border-y-2 border-l-0 p-5 flex flex-col items-center justify-between shadow-2xl bg-gradient-to-br ${
                themeVisuals.bookCover
              } ${themeVisuals.bookBorder}`}
              style={{
                backfaceVisibility: "hidden",
              }}
            >
              {/* Ornate Cover Corners */}
              <div className="w-full flex justify-between opacity-80">
                <div className="w-5 h-5 border-t-2 border-l-2 border-[#D4AF37]" />
                <div className="w-5 h-5 border-t-2 border-r-2 border-[#D4AF37]" />
              </div>

              {/* Gold Foil Center Grimoire Seal with Lock animation */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform duration-500 ${
                    themeVisuals.coverEmboss
                  } ${isLocked ? "scale-105" : "scale-100"}`}
                  style={{
                    backgroundColor: "rgba(0,0,0,0.4)",
                  }}
                >
                  <Lock className={`w-7 h-7 sm:w-8 sm:h-8 ${isLocked ? "text-amber-300 animate-bounce" : ""}`} />
                </div>
                <div className="font-serif font-bold text-sm sm:text-base tracking-widest uppercase text-[#F5E6BE]">
                  EchoTale
                </div>
                <div className="text-[10px] sm:text-xs font-serif italic text-[#F5E6BE]/75">
                  Vault Locked &bull; Sealed
                </div>
              </div>

              {/* Bottom Ornate Corners */}
              <div className="w-full flex justify-between opacity-80">
                <div className="w-5 h-5 border-b-2 border-l-2 border-[#D4AF37]" />
                <div className="w-5 h-5 border-b-2 border-r-2 border-[#D4AF37]" />
              </div>
            </div>

            {/* BACK OF COVER (Inside front cover parchment) */}
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
                  &ldquo;Until your pen meets the parchment once more.&rdquo;
                </p>
              </div>
              <div className="text-[9px] opacity-40 font-mono text-center">EchoTale Sealed</div>
            </div>
          </div>
        </div>
      </div>

      {/* CHOREOGRAPHED STATUS CAPTIONS & SHIMMER PROGRESS */}
      <div className="mt-10 sm:mt-12 text-center space-y-2 transition-all duration-500 z-50">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-lg">
          <Lock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-serif font-semibold text-xs sm:text-sm tracking-wide">
            {statusMessage}
          </span>
        </div>

        <p className="text-xs text-white/60 font-serif italic max-w-sm mx-auto">
          {subtitle || themeVisuals.tagline}
        </p>

        {/* Shimmer progress line */}
        <div className="w-36 sm:w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden mt-3">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(100, (phase + 1) * 20)}%`,
              backgroundColor: themeVisuals.accentColor,
              boxShadow: `0 0 10px ${themeVisuals.accentColor}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
