"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import type { MomentOccasion } from "@/lib/moments-types";
import { OCCASION_CONFIGS, cleanSenderName } from "@/lib/moments-types";
import { playNote } from "@/lib/ambient-audio";
import { Sparkles, Heart, Gift, Flame, RotateCcw } from "lucide-react";

interface MomentUnboxingCeremonyProps {
  occasion: MomentOccasion;
  recipientName: string;
  senderName: string;
  onOpened: () => void;
  isOpened: boolean;
  onReplay?: () => void;
}

export default function MomentUnboxingCeremony({
  occasion,
  recipientName,
  senderName,
  onOpened,
  isOpened,
  onReplay,
}: MomentUnboxingCeremonyProps) {
  const config = OCCASION_CONFIGS[occasion] || OCCASION_CONFIGS.love;
  const palette = config.palette;
  const cleanSender = cleanSenderName(senderName) || "Someone Who Cares";

  // Opening states: 0 = idle/sealed, 1 = vibrating/opening, 2 = revealed visual (cake/hearts/etc), 3 = completed
  const [stage, setStage] = React.useState<number>(isOpened ? 3 : 0);
  const [candlesBlown, setCandlesBlown] = React.useState<boolean>(false);

  // Sync if externally toggled
  React.useEffect(() => {
    if (isOpened && stage === 0) {
      setStage(3);
    }
  }, [isOpened, stage]);

  const triggerConfettiExplosion = React.useCallback(() => {
    try {
      // Multi-angle festive confetti cannons
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ["#F59E0B", "#FBBF24", "#EC4899", "#38BDF8", "#10B981"],
      });
      fire(0.2, {
        spread: 60,
        colors: ["#FBBF24", "#F59E0B", "#FFE4E6"],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ["#EC4899", "#8B5CF6", "#FBBF24"],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    } catch {
      // Fallback if canvas confetti isn't ready
    }
  }, []);

  const playChimeSequence = (type: MomentOccasion) => {
    try {
      if (type === "birthday") {
        playNote("C5", 0.25, "triangle", 0.2);
        setTimeout(() => playNote("E5", 0.25, "triangle", 0.22), 120);
        setTimeout(() => playNote("G5", 0.35, "triangle", 0.25), 240);
        setTimeout(() => playNote("C6", 0.6, "sine", 0.28), 380);
      } else if (type === "love") {
        playNote("E5", 0.35, "sine", 0.18);
        setTimeout(() => playNote("G5", 0.35, "sine", 0.2), 160);
        setTimeout(() => playNote("B5", 0.45, "sine", 0.22), 320);
        setTimeout(() => playNote("E6", 0.7, "sine", 0.25), 480);
      } else if (type === "apology") {
        playNote("D5", 0.5, "sine", 0.15);
        setTimeout(() => playNote("F5", 0.5, "sine", 0.18), 200);
        setTimeout(() => playNote("A5", 0.8, "sine", 0.2), 400);
      } else if (type === "family") {
        playNote("C5", 0.3, "triangle", 0.18);
        setTimeout(() => playNote("G5", 0.4, "triangle", 0.2), 180);
        setTimeout(() => playNote("E5", 0.6, "sine", 0.22), 360);
      } else {
        playNote("F5", 0.4, "sine", 0.18);
        setTimeout(() => playNote("A5", 0.4, "sine", 0.2), 180);
        setTimeout(() => playNote("C6", 0.6, "sine", 0.22), 360);
      }
    } catch {
      // Ignore audio failure
    }
  };

  const handleStartUnboxing = () => {
    if (stage !== 0) return;
    setStage(1);
    playChimeSequence(occasion);

    if (occasion === "birthday") {
      // Wobble -> Pop Lid -> Shoot Confetti -> Reveal Cake
      setTimeout(() => {
        setStage(2);
        triggerConfettiExplosion();
      }, 900);
    } else if (occasion === "love") {
      // Crack Wax Seal -> Open Flap -> Hearts Burst Out
      setTimeout(() => {
        setStage(2);
      }, 800);
    } else {
      // Other occasions: reveal signature element
      setTimeout(() => {
        setStage(2);
      }, 750);
    }
  };

  const handleCompleteReveal = () => {
    setCandlesBlown(true);
    if (occasion === "birthday") {
      playNote("C6", 0.7, "sine", 0.25);
      triggerConfettiExplosion();
    }
    setTimeout(() => {
      setStage(3);
      onOpened();
    }, 600);
  };

  const handleResetCeremony = () => {
    setStage(0);
    setCandlesBlown(false);
    if (onReplay) onReplay();
  };

  // If already opened, show a subtle replay ribbon banner
  if (stage === 3) {
    return (
      <div className="w-full flex justify-end mb-4">
        <button
          type="button"
          onClick={handleResetCeremony}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all hover:scale-105 cursor-pointer shadow-sm text-white/90 hover:text-white"
          style={{
            backgroundColor: `${palette.cardBase}cc`,
            borderColor: palette.cardBorder,
          }}
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Replay Unboxing Ceremony</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[460px] relative z-20 select-none py-6">
      {/* ─── OCCASION TITLE HEADER ─── */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-2 mb-6"
      >
        <span
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border backdrop-blur-md shadow-lg"
          style={{
            color: palette.accent,
            borderColor: palette.cardBorder,
            backgroundColor: `${palette.cardBase}ee`,
          }}
        >
          <span>{config.emoji}</span>
          <span>{config.sealLabel}</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-display font-extrabold text-white tracking-tight drop-shadow-md">
          {occasion === "birthday"
            ? `A Birthday Gift for ${recipientName}`
            : occasion === "love"
            ? `A Sealed Love Letter for ${recipientName}`
            : occasion === "apology"
            ? `A Sincere Message for ${recipientName}`
            : occasion === "family"
            ? `Family Keepsake for ${recipientName}`
            : `Carried Across The Stars for ${recipientName}`}
        </h1>
        <p className="text-xs sm:text-sm text-white/80 font-serif italic">
          Crafted with care by {cleanSender}
        </p>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          OCCASION 1: BIRTHDAY CELEBRATION (3D Gift Box -> Pop Lid -> Birthday Cake)
      ═══════════════════════════════════════════════════════════════════════ */}
      {occasion === "birthday" && (
        <div className="relative w-full flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {stage < 2 ? (
              /* THE 3D GIFT BOX (Stage 0 & 1) */
              <motion.div
                key="gift-box"
                onClick={handleStartUnboxing}
                animate={
                  stage === 1
                    ? {
                        x: [-5, 5, -4, 4, -2, 2, 0],
                        scale: [1, 1.08, 1.15],
                        rotate: [-2, 2, -2, 2, 0],
                      }
                    : {
                        y: [-5, 5, -5],
                      }
                }
                transition={
                  stage === 1
                    ? { duration: 0.8, ease: "easeInOut" }
                    : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }
                className="relative w-72 h-72 sm:w-80 sm:h-80 cursor-pointer group flex items-center justify-center"
              >
                {/* Ambient Golden Halo Glow */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity pointer-events-none"
                  style={{ background: "radial-gradient(circle, #F59E0B 0%, #EC4899 50%, transparent 70%)" }}
                />

                {/* 3D Gift Box Isometric Container */}
                <div
                  className="relative w-56 h-56 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center border transition-transform duration-500 group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #3B1663 0%, #200D36 100%)",
                    borderColor: "#7C3AED",
                    boxShadow: "0 25px 50px -12px rgba(124, 58, 237, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {/* Vertical & Horizontal Gold Satin Ribbons */}
                  <div className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 shadow-md" />
                  <div className="absolute left-0 right-0 h-8 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 shadow-md" />

                  {/* 3D Gift Box Lid */}
                  <motion.div
                    animate={
                      stage === 1
                        ? {
                            y: -80,
                            rotateX: -110,
                            opacity: [1, 1, 0],
                          }
                        : {}
                    }
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    className="absolute -top-3 left-2 right-2 h-16 rounded-2xl bg-gradient-to-b from-[#4C1D95] to-[#2E1065] border border-amber-400/60 shadow-xl flex items-center justify-center z-20"
                  >
                    {/* Golden Satin Bow Knot */}
                    <div className="relative -top-5 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-500 shadow-lg border border-amber-200 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-purple-950" />
                      </div>
                      {/* Ribbon loops */}
                      <div className="absolute -left-6 -top-2 w-8 h-8 rounded-full border-4 border-amber-300 transform -rotate-45" />
                      <div className="absolute -right-6 -top-2 w-8 h-8 rounded-full border-4 border-amber-300 transform rotate-45" />
                    </div>
                  </motion.div>

                  {/* Gift Tag */}
                  <div className="relative z-10 mt-6 px-3.5 py-1.5 rounded-xl bg-black/50 border border-amber-400/40 backdrop-blur-md text-center shadow-lg">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                      Birthday Surprise
                    </span>
                    <span className="text-xs font-serif italic text-white/95">
                      For {recipientName}
                    </span>
                  </div>

                  {/* Pulsing Tap Hint */}
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="absolute -bottom-8 flex items-center gap-1.5 text-xs font-medium text-amber-300 drop-shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tap to unwrap gift</span>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              /* THE REVEALED 3D BIRTHDAY CAKE & CANDLES (Stage 2) */
              <motion.div
                key="birthday-cake"
                initial={{ opacity: 0, scale: 0.7, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.15, filter: "blur(8px)" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm flex flex-col items-center space-y-6 text-center"
              >
                {/* 3D Tiered Cake Illustration Container */}
                <div className="relative w-64 h-56 flex flex-col items-center justify-end pb-4">
                  {/* Confetti & Sparkle Glow Behind Cake */}
                  <div className="absolute inset-0 rounded-full blur-3xl bg-gradient-to-tr from-amber-400/40 via-pink-500/40 to-purple-500/40 pointer-events-none" />

                  {/* 3 Glowing Birthday Candles with Animated Flickering Flames */}
                  <div className="flex items-end justify-center gap-6 mb-1 relative z-20">
                    {[1, 2, 3].map((candleIdx) => (
                      <div key={candleIdx} className="flex flex-col items-center">
                        {/* Animated Flame */}
                        <motion.div
                          animate={
                            candlesBlown
                              ? { scale: 0, opacity: 0 }
                              : {
                                  scale: [1, 1.25, 0.9, 1.15, 1],
                                  y: [-1, 2, -2, 1, 0],
                                }
                          }
                          transition={{ duration: 0.6, repeat: candlesBlown ? 0 : Infinity }}
                          className="w-4 h-6 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 shadow-[0_0_15px_#F59E0B] relative -bottom-1 flex items-center justify-center"
                        >
                          <Flame className="w-3 h-3 text-amber-200 fill-amber-200 opacity-90" />
                        </motion.div>
                        {/* Candle Stick */}
                        <div
                          className="w-3 h-10 rounded-sm shadow-md border-t border-white/40"
                          style={{
                            background:
                              candleIdx === 2
                                ? "repeating-linear-gradient(45deg, #F59E0B, #F59E0B 4px, #FFFBEB 4px, #FFFBEB 8px)"
                                : "repeating-linear-gradient(45deg, #EC4899, #EC4899 4px, #FFFBEB 4px, #FFFBEB 8px)",
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Top Cake Tier */}
                  <div className="w-36 h-14 rounded-2xl bg-gradient-to-r from-pink-300 via-rose-200 to-pink-300 border-2 border-white/60 shadow-lg relative flex items-center justify-center z-10">
                    {/* Cream Frosting Swirls */}
                    <div className="absolute top-0 left-0 right-0 flex justify-between px-2 -mt-1.5">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-4 h-3 bg-white rounded-b-full shadow-sm" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700">
                      ★ Joy & Cheers ★
                    </span>
                  </div>

                  {/* Base Cake Tier */}
                  <div className="w-52 h-18 rounded-3xl bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 border-2 border-amber-300/80 shadow-2xl relative flex items-center justify-center z-0 -mt-2">
                    {/* Frosting drips */}
                    <div className="absolute top-0 left-0 right-0 flex justify-between px-3 -mt-1.5">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-5 h-4 bg-pink-300 rounded-b-full shadow-sm" />
                      ))}
                    </div>
                    {/* Decorative Sugar Sprinkles */}
                    <div className="flex gap-2 opacity-70">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* Golden Serving Plate */}
                  <div className="w-64 h-4 rounded-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-xl -mt-1 border border-amber-200" />
                </div>

                {/* Celebratory Banner */}
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-serif-display font-extrabold text-amber-300 tracking-tight drop-shadow-md">
                    🎉 Happy Birthday, {recipientName}! 🎂
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 font-serif italic max-w-xs mx-auto">
                    Your special day has arrived! Make a wish and blow out the candles to read your personal keepsake letter.
                  </p>
                </div>

                {/* Blow Candles & Read CTA */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCompleteReveal}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-purple-950 font-extrabold text-sm shadow-2xl flex items-center gap-2.5 mx-auto cursor-pointer border-2 border-amber-200"
                >
                  <Sparkles className="w-4 h-4 text-purple-900" />
                  <span>Blow Out Candles & Unfold Message</span>
                  <span>🕯️</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          OCCASION 2: LOVE & ROMANCE (Wax Sealed Letter -> Flap Opens -> Hearts Erupt)
      ═══════════════════════════════════════════════════════════════════════ */}
      {occasion === "love" && (
        <div className="relative w-full flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {stage < 2 ? (
              /* SEALED ENVELOPE (Stage 0 & 1) */
              <motion.div
                key="love-envelope"
                onClick={handleStartUnboxing}
                animate={
                  stage === 1
                    ? {
                        scale: [1, 1.06, 1.12],
                        y: [-4, 4, -2, 2, 0],
                      }
                    : {
                        y: [-4, 4, -4],
                      }
                }
                transition={
                  stage === 1
                    ? { duration: 0.7, ease: "easeInOut" }
                    : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }
                className="relative w-72 h-64 sm:w-84 sm:h-72 cursor-pointer group flex items-center justify-center"
              >
                {/* Crimson Rose Halo Glow */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity pointer-events-none"
                  style={{ background: "radial-gradient(circle, #F43F5E 0%, #9F1239 60%, transparent 80%)" }}
                />

                {/* 3D Envelope Container */}
                <div
                  className="relative w-64 h-48 sm:w-72 sm:h-52 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center border transition-transform duration-500 group-hover:scale-105 overflow-hidden"
                  style={{
                    backgroundColor: "#38081B",
                    borderColor: "#6B1437",
                    boxShadow: "0 25px 50px -12px rgba(107, 20, 55, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.15)",
                  }}
                >
                  {/* Envelope triangular flap folds */}
                  <div className="absolute inset-0 border-t-[80px] border-t-[#4A0B24] border-x-[144px] border-x-transparent pointer-events-none z-10" />

                  {/* 3D Wax Seal Button with Heart */}
                  <motion.div
                    animate={
                      stage === 1
                        ? { scale: [1, 1.3, 0], rotate: [0, 15, -15, 45], opacity: [1, 1, 0] }
                        : {}
                    }
                    transition={{ duration: 0.65 }}
                    className="relative z-20 w-18 h-18 rounded-full shadow-2xl flex flex-col items-center justify-center text-white border-2 border-rose-300/40"
                    style={{
                      background: "radial-gradient(circle, #E11D48 0%, #9F1239 80%)",
                      boxShadow: "0 0 25px rgba(225, 29, 72, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <Heart className="w-8 h-8 text-white fill-white drop-shadow-md" />
                  </motion.div>

                  <motion.div
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative z-20 mt-4 text-[11px] font-serif italic text-rose-200 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                    <span>Tap the wax seal to break & open</span>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              /* REVEALED HEARTS CASCADE & UNFOLDING LETTER (Stage 2) */
              <motion.div
                key="love-unfolded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.7 }}
                className="w-full max-w-sm flex flex-col items-center space-y-6 text-center"
              >
                {/* Cascade of Floating 3D Hearts */}
                <div className="relative w-64 h-48 flex items-center justify-center">
                  {[...Array(9)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1.4, 1],
                        x: (i - 4) * 28 + (Math.sin(i) * 15),
                        y: -35 - (i % 3) * 30,
                        opacity: [0, 1, 0.9],
                        rotate: [-15, 15, -10][i % 3],
                      }}
                      transition={{
                        duration: 0.85,
                        delay: i * 0.08,
                        ease: "easeOut",
                      }}
                      className="absolute"
                    >
                      <Heart
                        className="drop-shadow-lg"
                        style={{
                          width: `${24 + (i % 3) * 8}px`,
                          height: `${24 + (i % 3) * 8}px`,
                          color: ["#FB7185", "#F43F5E", "#FDA4AF", "#E11D48"][i % 4],
                          fill: ["#FB7185", "#F43F5E", "#FDA4AF", "#E11D48"][i % 4],
                        }}
                      />
                    </motion.div>
                  ))}

                  {/* Parchment letter sliding out */}
                  <motion.div
                    initial={{ y: 50, scale: 0.7 }}
                    animate={{ y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-48 h-36 rounded-xl bg-gradient-to-b from-[#FFF1F2] to-[#FFE4E6] p-4 shadow-2xl border border-rose-300/60 flex flex-col justify-between text-left"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono uppercase text-rose-500 font-bold tracking-wider">
                        Love Letter
                      </span>
                      <p className="font-serif italic text-xs text-rose-950 font-bold">
                        Dearest {recipientName},
                      </p>
                    </div>
                    <div className="space-y-1 opacity-60">
                      <div className="w-full h-1 bg-rose-400 rounded-full" />
                      <div className="w-3/4 h-1 bg-rose-400 rounded-full" />
                      <div className="w-5/6 h-1 bg-rose-400 rounded-full" />
                    </div>
                    <p className="font-serif italic text-[10px] text-rose-800 text-right">
                      Forever with you &hearts;
                    </p>
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-serif-display font-bold text-rose-200">
                    A Letter From The Heart 💖
                  </h3>
                  <p className="text-xs font-serif italic text-rose-200/80 max-w-xs mx-auto">
                    The wax seal has broken. Step into your private sanctuary to read every word.
                  </p>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCompleteReveal}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-rose-400 to-pink-500 text-white font-bold text-sm shadow-2xl flex items-center gap-2.5 mx-auto cursor-pointer border-2 border-rose-300"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Unfold Romantic Keepsake</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          OCCASION 3: HEARTFELT APOLOGY (Blossoming Water Lily / Calm Dove)
      ═══════════════════════════════════════════════════════════════════════ */}
      {occasion === "apology" && (
        <div className="relative w-full flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {stage < 2 ? (
              <motion.div
                key="apology-lily"
                onClick={handleStartUnboxing}
                animate={
                  stage === 1
                    ? { scale: [1, 1.15, 1.2], opacity: [1, 0.9, 1] }
                    : { y: [-3, 3, -3] }
                }
                transition={
                  stage === 1
                    ? { duration: 0.7 }
                    : { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }
                className="relative w-72 h-64 cursor-pointer group flex items-center justify-center"
              >
                {/* Calm Moonlit Water Aura */}
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-40 pointer-events-none"
                  style={{ background: "radial-gradient(circle, #38BDF8 0%, #818CF8 50%, transparent 70%)" }}
                />

                {/* Folded Lotus / Dove Icon Plate */}
                <div
                  className="w-56 h-56 rounded-full p-6 shadow-2xl flex flex-col items-center justify-center border relative overflow-hidden group-hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: "#0F2434",
                    borderColor: "#1D4766",
                    boxShadow: "0 20px 40px -10px rgba(56, 189, 248, 0.35)",
                  }}
                >
                  {/* Water Ripple Rings */}
                  <div className="absolute inset-4 rounded-full border border-sky-400/20 animate-ping opacity-25" />
                  <div className="absolute inset-10 rounded-full border border-sky-400/30" />

                  <motion.div
                    animate={stage === 1 ? { scale: [1, 1.3, 0] } : { scale: 1 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-500 shadow-xl flex items-center justify-center text-white relative z-10"
                  >
                    <span className="text-3xl">🕊️</span>
                  </motion.div>

                  <span className="relative z-10 mt-4 text-xs font-serif italic text-sky-200">
                    Tap to unfold honest amends
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="apology-unfolded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm flex flex-col items-center space-y-6 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-sky-500/20 border-2 border-sky-400/40 flex items-center justify-center text-4xl shadow-xl">
                  🕊️
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif-display font-light text-sky-200">
                    With Sincere Humility & Stillness
                  </h3>
                  <p className="text-xs font-serif italic text-sky-200/80 max-w-xs mx-auto">
                    A heartfelt message written with honesty and the deepest care for your bond.
                  </p>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCompleteReveal}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-2xl cursor-pointer border border-sky-300"
                >
                  <span>Read Sincere Keepsake</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          OCCASION 4: FAMILY MILESTONES (Heirloom Memory Chest)
      ═══════════════════════════════════════════════════════════════════════ */}
      {occasion === "family" && (
        <div className="relative w-full flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {stage < 2 ? (
              <motion.div
                key="family-chest"
                onClick={handleStartUnboxing}
                animate={
                  stage === 1
                    ? { scale: [1, 1.1, 1.15], rotate: [-2, 2, 0] }
                    : { y: [-3, 3, -3] }
                }
                transition={
                  stage === 1
                    ? { duration: 0.7 }
                    : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }
                className="relative w-72 h-64 cursor-pointer group flex items-center justify-center"
              >
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-40 pointer-events-none"
                  style={{ background: "radial-gradient(circle, #D97706 0%, #78350F 60%, transparent 70%)" }}
                />
                <div
                  className="w-64 h-48 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center border relative group-hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: "#331809",
                    borderColor: "#5C2E12",
                    boxShadow: "0 25px 50px -12px rgba(92, 46, 18, 0.7)",
                  }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner">
                    🏡
                  </div>
                  <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    Heirloom Memory Chest
                  </span>
                  <span className="text-xs font-serif italic text-amber-200/80 mt-1">
                    Tap to open family keepsakes
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="family-unfolded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm flex flex-col items-center space-y-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-4xl shadow-xl">
                  🏡
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif-display font-bold text-amber-200">
                    Honoring Our Roots & Heritage
                  </h3>
                  <p className="text-xs font-serif italic text-amber-200/80 max-w-xs mx-auto">
                    A timeless keepsake celebrating the milestones and love that hold our family together.
                  </p>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCompleteReveal}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-sm shadow-2xl cursor-pointer border border-amber-300"
                >
                  <span>Unfold Family Keepsake</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          OCCASION 5: THINKING OF YOU / MISSING (Celestial Starlight Lantern)
      ═══════════════════════════════════════════════════════════════════════ */}
      {occasion === "missing" && (
        <div className="relative w-full flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {stage < 2 ? (
              <motion.div
                key="missing-lantern"
                onClick={handleStartUnboxing}
                animate={
                  stage === 1
                    ? { scale: [1, 1.1, 1.18], rotate: [-4, 4, 0] }
                    : { y: [-4, 4, -4] }
                }
                transition={
                  stage === 1
                    ? { duration: 0.7 }
                    : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }
                className="relative w-72 h-64 cursor-pointer group flex items-center justify-center"
              >
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-50 pointer-events-none"
                  style={{ background: "radial-gradient(circle, #818CF8 0%, #312E81 60%, transparent 70%)" }}
                />
                <div
                  className="w-56 h-56 rounded-full p-6 shadow-2xl flex flex-col items-center justify-center border relative group-hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: "#10183B",
                    borderColor: "#23337A",
                    boxShadow: "0 20px 40px -10px rgba(129, 140, 248, 0.45)",
                  }}
                >
                  <div className="w-18 h-18 rounded-full bg-indigo-500/25 border border-indigo-400/50 flex items-center justify-center text-3xl shadow-inner">
                    🌙
                  </div>
                  <span className="mt-3 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    Starlight Lantern
                  </span>
                  <span className="text-xs font-serif italic text-indigo-200/80 mt-1">
                    Tap to catch the message
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="missing-unfolded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm flex flex-col items-center space-y-6 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 border-2 border-indigo-400/40 flex items-center justify-center text-4xl shadow-xl">
                  ✨
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif-display font-medium text-indigo-200">
                    Carried Across The Miles
                  </h3>
                  <p className="text-xs font-serif italic text-indigo-200/80 max-w-xs mx-auto">
                    Distance cannot fade true bonds. Read your personal message sent across the stars.
                  </p>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCompleteReveal}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-bold text-sm shadow-2xl cursor-pointer border border-indigo-300"
                >
                  <span>Unfold Message Across The Distance</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
