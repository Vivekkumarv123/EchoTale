"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, KeyRound, Eye, EyeOff, Sparkles, AlertCircle, HelpCircle } from "lucide-react";
import { MomentOccasion, OCCASION_CONFIGS, cleanSenderName } from "@/lib/moments-types";
import { playNote } from "@/lib/ambient-audio";

interface MomentPasscodeLockProps {
  occasion: MomentOccasion;
  recipientName: string;
  senderName: string;
  passwordHint?: string;
  onUnlockSuccess: (unlockedMoment: any) => void;
  momentId: string;
}

export default function MomentPasscodeLock({
  occasion,
  recipientName,
  senderName,
  passwordHint,
  onUnlockSuccess,
  momentId,
}: MomentPasscodeLockProps) {
  const [passcode, setPasscode] = React.useState<string>("");
  const [showPasscode, setShowPasscode] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [shake, setShake] = React.useState<boolean>(false);

  const config = OCCASION_CONFIGS[occasion] || OCCASION_CONFIGS.love;
  const cleanSender = cleanSenderName(senderName) || "Someone Special";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/moments/${momentId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passcode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Incorrect passcode. Please try again.");
      }

      // Success! Play celebratory unlock sound
      try {
        playNote("C5", 0.25, "triangle");
        setTimeout(() => playNote("G5", 0.35, "sine"), 140);
        setTimeout(() => playNote("C6", 0.5, "sine"), 280);
      } catch {
        // audio fallback
      }

      // Save unlock state and passcode to sessionStorage for session persistence
      try {
        sessionStorage.setItem(`echotale_passcode_${momentId}`, passcode.trim());
      } catch {
        // storage fallback
      }

      onUnlockSuccess(data.moment);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Incorrect passcode. Please check with the sender.";
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      try {
        playNote("C4", 0.2, "sawtooth");
      } catch {
        // audio fallback
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto px-4 py-8 z-30 relative flex flex-col items-center">
      {/* Glowing Ambient Halo */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: config.glowColor }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full rounded-3xl p-6 sm:p-8 backdrop-blur-xl border shadow-2xl relative overflow-hidden transition-all ${
          shake ? "translate-x-[-8px]" : ""
        }`}
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          borderColor: "rgba(255, 255, 255, 0.12)",
        }}
      >
        {/* Top Floating Wax Seal / Lock Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg border mb-3 relative"
            style={{
              backgroundColor: config.defaultAccent || "#B45309",
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <Lock className="w-8 h-8 text-amber-100 drop-shadow" />
            <span className="absolute -top-1 -right-1 text-xs">🔒</span>
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-2">
            Protected Keepsake
          </span>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            {config.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-serif italic mt-1 max-w-xs">
            For <span className="font-semibold text-amber-200">{recipientName}</span> &bull; Sealed by <span className="font-semibold text-amber-200">{cleanSender}</span>
          </p>
        </div>

        {/* Clue / Hint Box (if provided by sender) */}
        {passwordHint && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">
                Clue from {cleanSender}:
              </span>
              <p className="font-serif italic text-amber-100/90">&ldquo;{passwordHint}&rdquo;</p>
            </div>
          </div>
        )}

        {/* Passcode Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="keepsake-passcode-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Secret Passcode
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>

              <input
                id="keepsake-passcode-input"
                type={showPasscode ? "text" : "password"}
                autoFocus
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter passcode to open..."
                className="w-full pl-10 pr-12 py-3 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-slate-400 text-sm font-mono focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />

              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showPasscode ? "Hide Passcode" : "Show Passcode"}
              >
                {showPasscode ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unlock Action Button */}
          <button
            type="submit"
            disabled={!passcode.trim() || isSubmitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Breaking Seal...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Break Seal & Unlock</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-400 font-serif italic pt-1">
            Only the intended recipient with the secret passcode can view this keepsake.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
