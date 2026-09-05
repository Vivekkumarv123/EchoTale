"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import {
  RotateCcw,
  ImageIcon,
  HelpCircle,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import {
  MomentOccasion,
  OCCASION_CONFIGS,
  cleanSenderName,
} from "@/lib/moments-types";
import MomentParticles from "@/components/moments/moment-particles";
import MomentRecipientCard from "@/components/moments/moment-recipient-card";
import MomentUnsealStage from "@/components/moments/moment-unseal-stage";
import { playNote } from "@/lib/ambient-audio";

// Lazy-load Three.js signature ambient scene (Tier 3 of motion stack)
const MomentThreeScene = dynamic(
  () => import("@/components/moments/moment-three-scene"),
  { ssr: false }
);

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
}

export interface MomentCardRendererProps {
  moment: MomentRenderableData;
  fullScreen?: boolean;
  initialSealed?: boolean;
  onUnsealed?: () => void;
  className?: string;
}

/**
 * MomentCardRenderer: The SINGLE authoritative component owning 100% of the
 * visual, styling, palette, layout, and motion logic for a Sanctum Moment.
 *
 * Both Step 2 Creator Preview and the live recipient page (/m/[id]) render
 * through this exact component, guaranteeing zero visual drift.
 */
export default function MomentCardRenderer({
  moment,
  fullScreen = false,
  initialSealed = true,
  onUnsealed,
  className = "",
}: MomentCardRendererProps) {
  const [isSealed, setIsSealed] = useState<boolean>(initialSealed);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<
    Record<string, { selectedIndex: number; correct: boolean | null }>
  >({});

  const occasion = moment.occasion || "love";
  const config = OCCASION_CONFIGS[occasion] || OCCASION_CONFIGS.love;

  const recipientName = moment.recipientName || "My Dear Friend";
  const senderName = cleanSenderName(moment.senderName) || "Someone Special";

  const displayMessage =
    moment.displayMessage ||
    (moment.usePolished && moment.polishedMessage
      ? moment.polishedMessage
      : moment.rawMessage) ||
    "";

  const photoPaths = moment.photoPaths || [];
  const quizzes = moment.quizzes || [];

  const handleUnsealed = () => {
    setIsSealed(false);
    playNote("C5", 0.3, "triangle");
    onUnsealed?.();
  };

  const handleReplay = () => {
    setIsSealed(true);
    playNote("A4", 0.2, "sine");
  };

  const handleSelectQuizOption = async (
    questionId: string,
    selectedIndex: number,
    correctIndex?: number
  ) => {
    // If the quiz item contains local correctIndex (e.g. draft preview)
    if (typeof correctIndex === "number") {
      const isCorrect = selectedIndex === correctIndex;
      setQuizResults((prev) => ({
        ...prev,
        [questionId]: { selectedIndex, correct: isCorrect },
      }));
      if (isCorrect) {
        playNote("E5", 0.3, "triangle");
      } else {
        playNote("C4", 0.2, "sawtooth");
      }
      return;
    }

    // Otherwise, if moment has an ID, verify server-side
    if (moment.id) {
      try {
        const res = await fetch(`/api/moments/${moment.id}/verify-quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, selectedIndex }),
        });
        if (res.ok) {
          const data = await res.json();
          setQuizResults((prev) => ({
            ...prev,
            [questionId]: { selectedIndex, correct: data.correct },
          }));
          if (data.correct) {
            playNote("E5", 0.3, "triangle");
          } else {
            playNote("C4", 0.2, "sawtooth");
          }
          return;
        }
      } catch {
        // Silently fallback to optimistic display
      }
    }

    // Default optimistic selection
    setQuizResults((prev) => ({
      ...prev,
      [questionId]: { selectedIndex, correct: true },
    }));
  };

  return (
    <div
      className={`relative w-full overflow-hidden select-none bg-slate-950 text-white ${
        fullScreen
          ? "min-h-screen flex flex-col items-center justify-between p-4 sm:p-8"
          : "min-h-[640px] flex flex-col items-center justify-between p-6 sm:p-8 rounded-[2rem]"
      } ${className}`}
    >
      {/* ─── 1. FIXED BACKGROUND GRADIENT (from OCCASION_CONFIGS) ─────────── */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${config.bgGradient} opacity-95 pointer-events-none z-0 transition-colors duration-700`}
      />

      {/* ─── 2. TOP AMBIENT GLOW ORB ────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 sm:w-[500px] h-[300px] rounded-full blur-3xl pointer-events-none opacity-50 z-0"
        style={{ background: config.glowColor }}
      />

      {/* ─── 3. THREE-TIER MOTION LAYER ─────────────────────────────────────── */}
      {/* Tier 3: Three.js WebGL Signature Ambient Accent */}
      <MomentThreeScene occasion={occasion} />

      {/* Tier 2: 60fps Canvas Particle Physics & Confetti */}
      <MomentParticles occasion={occasion} density="low" />

      {/* ─── 4. MAIN KEEPSAKE CONTAINER (Tier 1: Framer Motion) ─────────────── */}
      <div className="relative z-20 w-full max-w-2xl my-auto py-4 flex flex-col items-center">
        {isSealed ? (
          /* UNBOXING CEREMONY STAGE (Before Opening) */
          <div className="w-full my-auto flex flex-col items-center">
            <MomentUnsealStage
              occasion={occasion}
              recipientName={recipientName}
              senderName={senderName}
              config={config}
              onUnsealed={handleUnsealed}
            />
          </div>
        ) : (
          /* UNFOLDED TACTILE RECIPIENT CARD */
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full space-y-6"
          >
            {/* Header Badge & Replay Control */}
            <div className="text-center space-y-1 w-full flex flex-col items-center">
              <div className="flex items-center justify-between w-full max-w-lg mb-1">
                <span
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md"
                  style={{
                    color: config.palette.accent,
                    borderColor: config.palette.cardBorder,
                    backgroundColor: `${config.palette.cardBase}cc`,
                  }}
                >
                  {config.sealLabel}
                </span>

                <button
                  type="button"
                  onClick={handleReplay}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold border backdrop-blur-md bg-black/40 hover:bg-black/60 text-white/90 border-white/10 flex items-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
                  title="Replay unboxing animation"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>Replay Unboxing</span>
                </button>
              </div>

              <p
                className={`text-xs opacity-80 font-serif italic ${config.textSecondary}`}
              >
                Crafted with care by {senderName}
              </p>
            </div>

            {/* The Dedicated 5-Theme Tactile Recipient Card */}
            <div className="w-full max-w-lg mx-auto">
              <MomentRecipientCard
                occasion={occasion}
                recipientName={recipientName}
                senderName={senderName}
                messageText={displayMessage}
                dateString={moment.createdAt}
                previewMode={!fullScreen}
              />
            </div>

            {/* Photo Memories Gallery (if attached) */}
            {photoPaths.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-lg mx-auto rounded-3xl p-5 sm:p-6 border backdrop-blur-md space-y-4 shadow-xl"
                style={{
                  backgroundColor: `${config.palette.cardBase}cc`,
                  borderColor: config.palette.cardBorder,
                }}
              >
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <h3 className="font-serif font-bold text-sm tracking-wide">
                      Cherished Memories ({photoPaths.length})
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] opacity-60 text-white/70">
                    Tap to expand
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {photoPaths.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPhoto(photoUrl)}
                      className="rounded-2xl overflow-hidden aspect-square border border-white/20 bg-black/50 cursor-pointer hover:scale-105 hover:border-amber-400 transition-all shadow-md group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoUrl}
                        alt={`Memory ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Interactive Memory Trivia Quiz (if attached) */}
            {quizzes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-lg mx-auto rounded-3xl p-5 sm:p-6 border backdrop-blur-md space-y-4 shadow-xl"
                style={{
                  backgroundColor: `${config.palette.cardBase}cc`,
                  borderColor: config.palette.cardBorder,
                }}
              >
                <div className="flex items-center gap-2 text-white">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif font-bold text-sm tracking-wide">
                    Memory Trivia for {recipientName}
                  </h3>
                </div>

                <div className="space-y-4">
                  {quizzes.map((q, qIdx) => {
                    const result = quizResults[q.id];
                    return (
                      <div
                        key={q.id || qIdx}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                      >
                        <p className="text-sm font-serif font-semibold text-white/90">
                          {qIdx + 1}. {q.question}
                        </p>

                        <div className="space-y-2">
                          {q.options.map((option, optIdx) => {
                            const isSelected = result?.selectedIndex === optIdx;
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() =>
                                  handleSelectQuizOption(
                                    q.id,
                                    optIdx,
                                    q.correctIndex
                                  )
                                }
                                className={`w-full p-3 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer border ${
                                  isSelected && result?.correct === true
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-200"
                                    : isSelected && result?.correct === false
                                    ? "bg-rose-500/20 border-rose-500 text-rose-200"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
                                }`}
                              >
                                <span>{option}</span>
                                {isSelected && result?.correct === true && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                                {isSelected && result?.correct === false && (
                                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Subtle Brand Footer Signature */}
            <div className="text-center pt-3">
              <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest text-white/70">
                EchoTale &bull; Sealed Sanctum Moment
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ─── 5. EXPANDED LIGHTBOX PHOTO MODAL ───────────────────────────────── */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto}
              alt="Expanded Memory"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain border border-white/20"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
