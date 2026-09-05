"use client";

import * as React from "react";
import { motion } from "motion/react";
import type { MomentOccasion } from "@/lib/moments-types";
import { OCCASION_CONFIGS, cleanSenderName } from "@/lib/moments-types";

interface MomentRecipientCardProps {
  occasion: MomentOccasion;
  recipientName: string;
  senderName: string;
  messageText: string;
  dateString?: string;
  className?: string;
  previewMode?: boolean;
}

export default function MomentRecipientCard({
  occasion,
  recipientName,
  senderName,
  messageText,
  dateString,
  className = "",
  previewMode = false,
}: MomentRecipientCardProps) {
  const config = OCCASION_CONFIGS[occasion] || OCCASION_CONFIGS.love;
  const palette = config.palette;
  const displayedSender = cleanSenderName(senderName) || senderName || "Someone Who Cares";

  const formattedDate = dateString
    ? new Date(dateString).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  // Separate body paragraphs for clean typographic cadence
  const paragraphs = (messageText || "").split("\n\n").filter(Boolean);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. LOVE & ROMANCE (Intimate Handwritten Parchment & Candlelight)
  // ═══════════════════════════════════════════════════════════════════════════
  if (occasion === "love") {
    return (
      <motion.article
        initial={previewMode ? { opacity: 0, scale: 0.98 } : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full relative overflow-hidden rounded-3xl p-8 sm:p-12 shadow-2xl transition-all duration-700 ${className}`}
        style={{
          backgroundColor: palette.cardBase,
          borderColor: palette.cardBorder,
          borderWidth: "1px",
          boxShadow: `0 25px 50px -12px rgba(26, 6, 14, 0.7), 0 0 40px ${config.glowColor}`,
        }}
      >
        {/* Subtle horizontal paper-fold crease line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-[1px] pointer-events-none opacity-25"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(245, 235, 230, 0.4), rgba(74, 14, 23, 0.8), rgba(245, 235, 230, 0.4), transparent)",
          }}
        />

        {/* Soft warm low-candlelight vignette radial */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ background: palette.accent }}
        />

        {/* Header Ribbon & Date */}
        <header className="pb-6 mb-8 border-b border-[#621438]/60 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 relative z-10">
          <div>
            <span
              className="text-[11px] font-sans font-bold tracking-wider uppercase inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 mb-2"
              style={{ color: palette.accent }}
            >
              💌 Sealed Love Letter
            </span>
            <h2
              className="text-2xl sm:text-3xl font-serif-display font-medium tracking-tight"
              style={{ color: palette.textHeading }}
            >
              To My Beloved, {recipientName}
            </h2>
          </div>
          <time
            className="text-xs font-serif italic"
            style={{ color: `${palette.textBody}99` }}
          >
            {formattedDate}
          </time>
        </header>

        {/* Body Text */}
        <div className="space-y-5 relative z-10">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, idx) => (
              <p
                key={idx}
                className="font-serif-display text-base sm:text-lg leading-relaxed text-balance"
                style={{ color: palette.textHeading }}
              >
                {p}
              </p>
            ))
          ) : (
            <p
              className="font-serif-display text-base sm:text-lg leading-relaxed italic"
              style={{ color: palette.textBody }}
            >
              {messageText}
            </p>
          )}
        </div>

        {/* Tactile Signature Line */}
        <footer className="pt-10 mt-10 border-t border-[#4A0E17]/60 flex flex-col items-end relative z-10">
          <span
            className="text-xs font-serif italic mb-1"
            style={{ color: palette.accent }}
          >
            With all my devotion,
          </span>
          <span
            className="font-salted text-3xl sm:text-4xl transition-all"
            style={{ color: palette.textHeading }}
          >
            {displayedSender}
          </span>
        </footer>
      </motion.article>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. BIRTHDAY CELEBRATION (Unwrap & Unfold Golden Keepsake)
  // ═══════════════════════════════════════════════════════════════════════════
  if (occasion === "birthday") {
    return (
      <motion.article
        initial={previewMode ? { opacity: 0, scale: 0.98 } : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full relative overflow-hidden rounded-3xl p-8 sm:p-12 shadow-2xl transition-all duration-700 ${className}`}
        style={{
          backgroundColor: palette.cardBase,
          borderColor: palette.cardBorder,
          borderWidth: "1px",
          boxShadow: `0 25px 50px -12px rgba(20, 13, 4, 0.8), 0 0 35px ${config.glowColor}`,
        }}
      >
        {/* Subtle geometric gold corner accents */}
        <div
          className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20 border-t-2 border-r-2 rounded-tr-3xl"
          style={{ borderColor: palette.accent }}
        />
        <div
          className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none opacity-20 border-b-2 border-l-2 rounded-bl-3xl"
          style={{ borderColor: palette.accent }}
        />

        {/* Ambient Top Glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ background: palette.accent }}
        />

        {/* Header */}
        <header className="pb-6 mb-8 border-b border-[#532E91]/80 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 relative z-10">
          <div>
            <span
              className="text-[11px] font-sans font-bold tracking-wider uppercase inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 mb-2"
              style={{ color: palette.accent }}
            >
              🎉 Birthday Celebration
            </span>
            <h2
              className="text-2xl sm:text-3xl font-serif-display font-bold tracking-tight"
              style={{ color: palette.textHeading }}
            >
              Happy Birthday, {recipientName}! 🎂
            </h2>
          </div>
          <time
            className="text-xs font-mono font-medium"
            style={{ color: `${palette.textBody}99` }}
          >
            {formattedDate}
          </time>
        </header>

        {/* Body Text */}
        <div className="space-y-5 relative z-10">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, idx) => (
              <p
                key={idx}
                className="font-serif-display text-base sm:text-lg leading-relaxed text-balance"
                style={{ color: palette.textHeading }}
              >
                {p}
              </p>
            ))
          ) : (
            <p
              className="font-serif-display text-base sm:text-lg leading-relaxed"
              style={{ color: palette.textHeading }}
            >
              {messageText}
            </p>
          )}
        </div>

        {/* Sign-off */}
        <footer className="pt-10 mt-10 border-t border-[#3B280A]/80 flex flex-col items-end relative z-10">
          <span
            className="text-xs font-serif italic mb-1"
            style={{ color: palette.accent }}
          >
            Celebrating every chapter with you,
          </span>
          <span
            className="font-serif-display text-2xl sm:text-3xl font-bold"
            style={{ color: palette.textHeading }}
          >
            {displayedSender}
          </span>
        </footer>
      </motion.article>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. APOLOGY & RECONCILIATION (Quiet Slate & Generous Negative Space)
  // ═══════════════════════════════════════════════════════════════════════════
  if (occasion === "apology") {
    return (
      <motion.article
        initial={previewMode ? { opacity: 0, scale: 0.98 } : { opacity: 0, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full relative overflow-hidden rounded-3xl p-8 sm:p-14 shadow-2xl transition-all duration-700 ${className}`}
        style={{
          backgroundColor: palette.cardBase,
          borderColor: palette.cardBorder,
          borderWidth: "1px",
          boxShadow: `0 20px 40px -12px rgba(13, 14, 21, 0.9), 0 0 30px ${config.glowColor}`,
        }}
      >
        {/* Subtle glowing vertical boundary line */}
        <div
          className="absolute left-6 sm:left-8 top-12 bottom-12 w-[1px] pointer-events-none opacity-40"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(142, 147, 168, 0.6), rgba(180, 130, 145, 0.4), transparent)",
          }}
        />

        <div className="pl-4 sm:pl-8 space-y-8">
          {/* Quiet Header */}
          <header className="pb-4 border-b border-[#2B3866]/80 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span
                className="text-[11px] font-sans font-bold tracking-wider uppercase inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 mb-2"
                style={{ color: palette.accent }}
              >
                🕊️ Heartfelt Apology & Amends
              </span>
              <h2
                className="text-xl sm:text-2xl font-serif-display font-light tracking-tight"
                style={{ color: palette.textHeading }}
              >
                With Sincere Heart, For {recipientName}
              </h2>
            </div>
            <time
              className="text-xs font-sans opacity-50"
              style={{ color: palette.textBody }}
            >
              {formattedDate}
            </time>
          </header>

          {/* Body Text with Generous Space & Calm Typography */}
          <div className="space-y-6">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className="font-serif-display text-base sm:text-lg leading-loose text-balance font-normal"
                  style={{ color: palette.textHeading }}
                >
                  {p}
                </p>
              ))
            ) : (
              <p
                className="font-serif-display text-base sm:text-lg leading-loose"
                style={{ color: palette.textHeading }}
              >
                {messageText}
              </p>
            )}
          </div>

          {/* Quiet Sign-off */}
          <footer className="pt-8 border-t border-[#232533]/80 flex flex-col items-end">
            <span
              className="text-xs font-serif italic mb-1 opacity-80"
              style={{ color: palette.textBody }}
            >
              With honest humility and hope,
            </span>
            <span
              className="font-serif-display text-xl sm:text-2xl font-medium"
              style={{ color: palette.textHeading }}
            >
              {displayedSender}
            </span>
          </footer>
        </div>
      </motion.article>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. FAMILY MILESTONES (Woven Linen & Hearth Warmth)
  // ═══════════════════════════════════════════════════════════════════════════
  if (occasion === "family") {
    return (
      <motion.article
        initial={previewMode ? { opacity: 0, scale: 0.98 } : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full relative overflow-hidden rounded-3xl p-8 sm:p-12 shadow-2xl transition-all duration-700 ${className}`}
        style={{
          backgroundColor: palette.cardBase,
          borderColor: palette.cardBorder,
          borderWidth: "1px",
          boxShadow: `0 25px 50px -12px rgba(18, 15, 11, 0.85), 0 0 35px ${config.glowColor}`,
        }}
      >
        {/* Woven linen inner border / stitched seam */}
        <div
          className="absolute inset-3 sm:inset-4 rounded-2xl pointer-events-none border border-dashed opacity-30"
          style={{ borderColor: palette.accent }}
        />

        {/* Header */}
        <header className="pb-6 mb-8 border-b border-[#5E3314]/80 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 relative z-10">
          <div>
            <span
              className="text-[11px] font-sans font-bold tracking-wider uppercase inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-600/15 border border-amber-500/30 mb-2"
              style={{ color: palette.accent }}
            >
              🏡 Family Milestone Keepsake
            </span>
            <h2
              className="text-2xl sm:text-3xl font-serif-display font-bold tracking-tight"
              style={{ color: palette.textHeading }}
            >
              Cherished Memories with {recipientName}
            </h2>
          </div>
          <time
            className="text-xs font-serif italic"
            style={{ color: `${palette.textBody}99` }}
          >
            {formattedDate}
          </time>
        </header>

        {/* Body Text */}
        <div className="space-y-5 relative z-10">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, idx) => (
              <p
                key={idx}
                className="font-serif-display text-base sm:text-lg leading-relaxed text-balance"
                style={{ color: palette.textHeading }}
              >
                {p}
              </p>
            ))
          ) : (
            <p
              className="font-serif-display text-base sm:text-lg leading-relaxed"
              style={{ color: palette.textHeading }}
            >
              {messageText}
            </p>
          )}
        </div>

        {/* Grounded Family Signature */}
        <footer className="pt-10 mt-10 border-t border-[#30281E]/80 flex flex-col items-end relative z-10">
          <span
            className="text-xs font-serif italic mb-1"
            style={{ color: palette.accent }}
          >
            Rooted in love and shared years,
          </span>
          <span
            className="font-serif-display text-2xl sm:text-3xl font-semibold"
            style={{ color: palette.textHeading }}
          >
            {displayedSender}
          </span>
        </footer>
      </motion.article>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. MISSING YOU (Celestial Midnight & Floating Drift)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <motion.article
      initial={previewMode ? { opacity: 0, scale: 0.98 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full relative overflow-hidden rounded-3xl p-8 sm:p-12 shadow-2xl transition-all duration-700 animate-[floatSlow_9s_ease-in-out_infinite] ${className}`}
      style={{
        backgroundColor: palette.cardBase,
        borderColor: palette.cardBorder,
        borderWidth: "1px",
        boxShadow: `0 25px 50px -12px rgba(4, 7, 16, 0.9), 0 0 45px ${config.glowColor}`,
      }}
    >
      {/* Astral glow ring */}
      <div
        className="absolute -top-28 -left-28 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-25"
        style={{ background: palette.accent }}
      />

      {/* Header */}
      <header className="pb-6 mb-8 border-b border-[#1E2F7A]/80 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 relative z-10">
        <div>
          <span
            className="text-[11px] font-sans font-bold tracking-wider uppercase inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 mb-2"
            style={{ color: palette.accent }}
          >
            🌙 Thinking of You Across the Miles
          </span>
          <h2
            className="text-2xl sm:text-3xl font-serif-display font-medium tracking-wide"
            style={{ color: palette.textHeading }}
          >
            Thinking of You, {recipientName}
          </h2>
        </div>
        <time
          className="text-xs font-mono"
          style={{ color: `${palette.textBody}99` }}
        >
          {formattedDate}
        </time>
      </header>

      {/* Body Text */}
      <div className="space-y-5 relative z-10">
        {paragraphs.length > 0 ? (
          paragraphs.map((p, idx) => (
            <p
              key={idx}
              className="font-serif-display text-base sm:text-lg leading-relaxed text-balance"
              style={{ color: palette.textHeading }}
            >
              {p}
            </p>
          ))
        ) : (
          <p
            className="font-serif-display text-base sm:text-lg leading-relaxed"
            style={{ color: palette.textHeading }}
          >
            {messageText}
          </p>
        )}
      </div>

      {/* Floating Signature */}
      <footer className="pt-10 mt-10 border-t border-[#111C3A]/80 flex flex-col items-end relative z-10">
        <span
          className="text-xs font-serif italic mb-1"
          style={{ color: palette.accent }}
        >
          Always holding you close in thought,
        </span>
        <span
          className="font-serif-display text-2xl sm:text-3xl font-normal tracking-wide"
          style={{ color: palette.textHeading }}
        >
          {displayedSender}
        </span>
      </footer>
    </motion.article>
  );
}
