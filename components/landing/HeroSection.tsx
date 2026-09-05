"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronRight,
  PenTool,
  Zap,
  Heart,
  Wand2,
  Feather,
  ShieldCheck,
  Flame,
  Bookmark,
  BookOpen,
} from "lucide-react";

interface HeroSectionProps {
  activeAct: 1 | 2 | 3;
}

export function HeroSection({ activeAct }: HeroSectionProps) {
  return (
    <section
      id="hero-section"
      className="relative min-h-[90vh] flex flex-col justify-between pt-28 pb-16 px-4 sm:px-6 lg:px-12 z-10 overflow-hidden"
    >
      {/* Top Hero Layout: Flanked 3-Column Architecture on Desktop (Left Card - Center Hero - Right Card) */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-8 items-center pt-4 sm:pt-6">
        
        {/* ========================================================================= */}
        {/* LEFT FLANK WIDGET: Daily Reflection & Sanctum State */}
        {/* ========================================================================= */}
        <div className="hidden xl:flex xl:col-span-3 flex-col gap-4 parallax-float-slow">
          <div
            className={`rounded-3xl p-5 border backdrop-blur-xl transition-all duration-700 shadow-xl relative overflow-hidden group hover:scale-[1.03] ${
              activeAct === 1
                ? "bg-[#FAF1E4]/90 border-[#D7BEA8] shadow-[#5C331715] text-[#3D2C2E]"
                : activeAct === 2
                ? "bg-gradient-to-br from-[#FAF5FF]/90 to-[#FDF4FF]/90 border-[#F0ABFC] shadow-[#EC489915] text-[#4C1D95]"
                : "bg-[#0B1120]/95 border-sky-500/30 shadow-sky-500/15 text-slate-100"
            }`}
          >
            {/* Ambient Background Radial Glow */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
                activeAct === 1
                  ? "bg-amber-300/30"
                  : activeAct === 2
                  ? "bg-pink-300/30"
                  : "bg-sky-400/20"
              }`}
            />

            {/* Widget Top Header */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-xs ${
                    activeAct === 1
                      ? "bg-[#8A5A36] text-white"
                      : activeAct === 2
                      ? "bg-gradient-to-tr from-[#EC4899] to-[#9333EA] text-white"
                      : "bg-sky-500 text-white"
                  }`}
                >
                  {activeAct === 1 && <Feather className="w-4 h-4" />}
                  {activeAct === 2 && <Wand2 className="w-4 h-4" />}
                  {activeAct === 3 && <Zap className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-65">
                    {activeAct === 1 && "Day 142 · Vellum Entry"}
                    {activeAct === 2 && "Chapter IX · Reverie"}
                    {activeAct === 3 && "TACTICAL_LOG // 409"}
                  </span>
                  <h4 className="text-xs font-bold font-serif-display leading-none">
                    {activeAct === 1 && "Morning Contemplation"}
                    {activeAct === 2 && "The Whispering Petal"}
                    {activeAct === 3 && "KINETIC_CORE_ACTIVE"}
                  </h4>
                </div>
              </div>

              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                  activeAct === 1
                    ? "bg-[#8A5A36]/10 text-[#8A5A36]"
                    : activeAct === 2
                    ? "bg-pink-500/10 text-pink-600"
                    : "bg-sky-500/20 text-sky-300"
                }`}
              >
                {activeAct === 1 && "Ink: 98%"}
                {activeAct === 2 && "Aura: 100%"}
                {activeAct === 3 && "Ready"}
              </span>
            </div>

            {/* Dynamic Prompt Snippet */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 mb-3">
              <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Today&apos;s Reflective Spark</span>
              </div>
              <p className="font-note text-lg leading-tight opacity-90 italic">
                {activeAct === 1 && "“What quiet miracle revealed itself in the stillness of dawn?”"}
                {activeAct === 2 && "“Where did gentle kindness bring starlight to your heart today?”"}
                {activeAct === 3 && "“What unseen obstacle did your courage dismantle today?”"}
              </p>
            </div>

            {/* Micro Tags & Status */}
            <div className="flex items-center justify-between text-[10px] pt-2 border-t border-black/10 dark:border-white/10 opacity-70">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>AES-256 Vault Sealed</span>
              </span>
              <span className="font-mono text-[9px]">v1.0 &bull; Private</span>
            </div>
          </div>

          {/* Secondary Mini Pill under Left Widget */}
          <div
            className={`p-3 rounded-2xl border backdrop-blur-md flex items-center gap-3 transition-all duration-700 shadow-sm ${
              activeAct === 1
                ? "bg-white/60 border-[#D7BEA8] text-[#5C3317]"
                : activeAct === 2
                ? "bg-white/60 border-[#F0ABFC] text-[#9333EA]"
                : "bg-slate-900/60 border-sky-500/30 text-sky-300"
            }`}
          >
            <div className="w-2 h-2 rounded-full animate-ping bg-emerald-500 shrink-0" />
            <span className="font-note text-base leading-none">
              {activeAct === 1 && "Ink weaves thoughts into eternity"}
              {activeAct === 2 && "Live within your fairy tale reverie"}
              {activeAct === 3 && "Heroic fortitude forged daily"}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER HERO CORE: Main Headline, Subtitle, & Primary CTA */}
        {/* ========================================================================= */}
        <div className="xl:col-span-6 text-center flex flex-col items-center">
          {/* Active Act Tagline Pill */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border mb-5 transition-all duration-700 backdrop-blur-md ${
              activeAct === 1
                ? "bg-[#FAF1E4]/90 text-[#6D3D1E] border-[#D7BEA8] shadow-sm"
                : activeAct === 2
                ? "bg-[#FDF4FF]/90 text-[#9333EA] border-[#F0ABFC] shadow-sm shadow-pink-500/10"
                : "bg-[#0F172A]/90 text-[#38BDF8] border-[#1E293B] shadow-sm shadow-sky-500/10"
            }`}
          >
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: "6s" }} />
            <span>
              {activeAct === 1 && "Act I · Ancient Grimoire & Magic Ink"}
              {activeAct === 2 && "Act II · Fairy Tale with Love & Romance"}
              {activeAct === 3 && "Act III · Superhero with Brave & Mature"}
            </span>
          </div>

          {/* Main Hero Headline with Salted Caramel Script */}
          <h1 className="tracking-tight max-w-2xl">
            <span className="block font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight transition-colors duration-700">
              Every thought becomes a
            </span>
            <span
              className={`block font-salted text-6xl sm:text-8xl lg:text-[8.5rem] my-1 transition-all duration-700 ${
                activeAct === 1
                  ? "text-[#5C3317] drop-shadow-sm"
                  : activeAct === 2
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] via-[#A855F7] to-[#F59E0B]"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#EF4444]"
              }`}
            >
              Living Grimoire
            </span>
          </h1>

          {/* Casual handwritten body/subheading with Make a Note font */}
          <p
            className={`font-note text-xl sm:text-2xl max-w-xl mt-3 leading-relaxed transition-colors duration-700 ${
              activeAct === 1
                ? "text-[#6D4C41]"
                : activeAct === 2
                ? "text-[#701A75]"
                : "text-[#94A3B8]"
            }`}
          >
            {activeAct === 1 &&
              "Sparkling golden ink weaves your raw daily thoughts into timeless, reflective parchment."}
            {activeAct === 2 &&
              "Immerse yourself in a romantic fairy tale with starlight, soft rose blush, and whimsical love lore."}
            {activeAct === 3 &&
              "Forge titanium fortitude and mature courage in the cyberpunk superhero chronicle."}
          </p>

          {/* CTA Buttons with explicit Sign Up & Log In paths */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-7 w-full sm:w-auto">
            <Link
              href="/signup"
              id="hero-signup-btn"
              className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-serif-display font-bold text-base sm:text-lg tracking-wide text-center flex items-center justify-center gap-2.5 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 ${
                activeAct === 1
                  ? "bg-[#5C3317] hover:bg-[#43220F] text-[#FAF6F0] shadow-xl shadow-[#5C331730]"
                  : activeAct === 2
                  ? "bg-gradient-to-r from-[#EC4899] to-[#9333EA] hover:from-[#DB2777] hover:to-[#7E22CE] text-white shadow-xl shadow-[#EC489935]"
                  : "bg-gradient-to-r from-[#0284C7] to-[#DC2626] hover:from-[#0369A1] hover:to-[#B91C1C] text-white shadow-xl shadow-[#0284C740]"
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Sign Up Free</span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              id="hero-login-btn"
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-semibold text-sm sm:text-base text-center border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 ${
                activeAct === 1
                  ? "bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] text-[#3D2C2E] border-[#D7BEA8]"
                  : activeAct === 2
                  ? "bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] text-[#3B0764] border-[#F0ABFC]"
                  : "bg-[#1E293B]/80 hover:bg-[#1E293B] text-[#F8FAFC] border-[#334155]"
              }`}
            >
              <span>Log In to Vault</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT FLANK WIDGET: AI Chapter Weaver & Memory Synthesis */}
        {/* ========================================================================= */}
        <div className="hidden xl:flex xl:col-span-3 flex-col gap-4 parallax-float-fast">
          <div
            className={`rounded-3xl p-5 border backdrop-blur-xl transition-all duration-700 shadow-xl relative overflow-hidden group hover:scale-[1.03] ${
              activeAct === 1
                ? "bg-[#FAF1E4]/90 border-[#D7BEA8] shadow-[#5C331715] text-[#3D2C2E]"
                : activeAct === 2
                ? "bg-gradient-to-br from-[#FAF5FF]/90 to-[#FDF4FF]/90 border-[#F0ABFC] shadow-[#EC489915] text-[#4C1D95]"
                : "bg-[#0B1120]/95 border-sky-500/30 shadow-sky-500/15 text-slate-100"
            }`}
          >
            {/* Ambient Background Radial Glow */}
            <div
              className={`absolute top-0 left-0 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
                activeAct === 1
                  ? "bg-amber-400/25"
                  : activeAct === 2
                  ? "bg-purple-400/25"
                  : "bg-rose-500/20"
              }`}
            />

            {/* Widget Top Header */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-xs ${
                    activeAct === 1
                      ? "bg-[#8A5A36] text-white"
                      : activeAct === 2
                      ? "bg-gradient-to-tr from-[#EC4899] to-[#9333EA] text-white"
                      : "bg-gradient-to-tr from-sky-500 to-rose-500 text-white"
                  }`}
                >
                  {activeAct === 1 && <BookOpen className="w-4 h-4" />}
                  {activeAct === 2 && <Heart className="w-4 h-4" />}
                  {activeAct === 3 && <Flame className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-65">
                    {activeAct === 1 && "AI Life Chapter"}
                    {activeAct === 2 && "Enchanted Lore"}
                    {activeAct === 3 && "NEURAL_SYNTHESIS"}
                  </span>
                  <h4 className="text-xs font-bold font-serif-display leading-none">
                    {activeAct === 1 && "The Alchemist's Dawn"}
                    {activeAct === 2 && "Stardust & Everafter"}
                    {activeAct === 3 && "ARMOR_CALIBRATION"}
                  </h4>
                </div>
              </div>

              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                  activeAct === 1
                    ? "bg-[#8A5A36]/10 text-[#8A5A36]"
                    : activeAct === 2
                    ? "bg-purple-500/10 text-purple-600"
                    : "bg-rose-500/20 text-rose-300"
                }`}
              >
                {activeAct === 1 && "Ch. 04"}
                {activeAct === 2 && "Starlit"}
                {activeAct === 3 && "OVERDRIVE"}
              </span>
            </div>

            {/* AI Synthesized Memoir Snippet */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 mb-3">
              <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 mb-1 flex items-center justify-between">
                <span>Synthesized Narrative</span>
                <Bookmark className="w-3 h-3 opacity-60" />
              </div>
              <p className="font-note text-lg leading-tight opacity-90 italic line-clamp-3">
                {activeAct === 1 && "“Through quiet patience and golden ink, raw experience crystallizes into enduring wisdom.”"}
                {activeAct === 2 && "“In the sanctuary of the heart, gentle whispers blossom into an eternal starlit fairy tale.”"}
                {activeAct === 3 && "“Every trial conquered adds a tempered layer of unbreakable titanium fortitude.”"}
              </p>
            </div>

            {/* Micro Tags & Status */}
            <div className="flex items-center justify-between text-[10px] pt-2 border-t border-black/10 dark:border-white/10 opacity-70">
              <span className="flex items-center gap-1 font-note text-sm">
                <span>~ EchoTale Neural Weaver</span>
              </span>
              <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">● Active</span>
            </div>
          </div>

          {/* Secondary Mini Pill under Right Widget */}
          <div
            className={`p-3 rounded-2xl border backdrop-blur-md flex items-center justify-between transition-all duration-700 shadow-sm ${
              activeAct === 1
                ? "bg-white/60 border-[#D7BEA8] text-[#5C3317]"
                : activeAct === 2
                ? "bg-white/60 border-[#F0ABFC] text-[#9333EA]"
                : "bg-slate-900/60 border-sky-500/30 text-sky-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: "10s" }} />
              <span className="font-note text-base leading-none">
                {activeAct === 1 && "Personal Grimoire active"}
                {activeAct === 2 && "Love Lore & Enchantment"}
                {activeAct === 3 && "Hero Vault Online"}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">3 Themes</span>
          </div>
        </div>

      </div>

      {/* 3 Active Theme Cards Preview & Narrative Flow Indicator (Below for mobile/tablet + broad context) */}
      <div className="max-w-6xl mx-auto w-full mt-10 sm:mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Theme 1 */}
          <div
            className={`scroll-reveal-card p-5 rounded-2xl border text-left backdrop-blur-md transition-all duration-500 ${
              activeAct === 1
                ? "bg-[#FAF1E4]/95 border-[#C8A27A] shadow-md shadow-[#5C331715] scale-[1.02]"
                : "bg-[#FAF6F0]/60 border-[#E6D7C3] opacity-75"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2 text-[#8A5A36]">
              <Wand2 className="w-4 h-4 text-[#8A5A36] animate-pulse" />
              <span>Act I · Vintage & Magic Ink</span>
            </div>
            <p className="font-note text-xl leading-snug text-[#3D2C2E]">
              &quot;Golden ink flows gracefully across parchment, turning raw feelings into eternal wisdom.&quot;
            </p>
          </div>

          {/* Theme 2 */}
          <div
            className={`scroll-reveal-card p-5 rounded-2xl border text-left backdrop-blur-md transition-all duration-500 ${
              activeAct === 2
                ? "bg-[#FDF4FF]/95 border-[#F0ABFC] shadow-md shadow-[#EC489920] scale-[1.02]"
                : "bg-[#FAF5FF]/60 border-[#E9D5FF] opacity-75"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2 text-[#EC4899]">
              <Heart className="w-4 h-4 text-[#EC4899] animate-pulse" />
              <span>Act II · Fairy Tale with Love</span>
            </div>
            <p className="font-note text-xl leading-snug text-[#4C1D95]">
              &quot;Pastel pinks, stardust constellations, and whimsical love lore celebrating romance.&quot;
            </p>
          </div>

          {/* Theme 3 */}
          <div
            className={`scroll-reveal-card p-5 rounded-2xl border text-left backdrop-blur-md transition-all duration-500 ${
              activeAct === 3
                ? "bg-[#0F172A]/95 border-[#38BDF8] shadow-md shadow-[#38BDF825] scale-[1.02]"
                : "bg-[#0B0F19]/60 border-[#1E293B] opacity-75"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2 text-sky-400">
              <Zap className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Act III · Superhero & Brave Fortitude</span>
            </div>
            <p className="font-note text-xl leading-snug text-slate-200">
              &quot;Titanium armor, neon underglow, and high-impact bravery chronicles.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="flex flex-col items-center justify-center gap-2 text-center pt-8">
        <span className="font-note text-2xl tracking-wide opacity-85">
          {activeAct === 1 && "✨ Scroll down to explore the 3 Living Journal Themes ✨"}
          {activeAct === 2 && "🌸 Scroll to see the Fairy Tale Love Sanctuary 🌸"}
          {activeAct === 3 && "⚡ Scroll to view the Fortified Security Vault ⚡"}
        </span>
        <div
          className={`w-8 h-12 rounded-full border-2 flex items-start justify-center p-1.5 transition-colors duration-500 ${
            activeAct === 1
              ? "border-[#5C3317]/60"
              : activeAct === 2
              ? "border-[#EC4899]/60"
              : "border-[#38BDF8]/60"
          }`}
        >
          <div
            className={`w-1.5 h-3 rounded-full animate-bounce transition-colors duration-500 ${
              activeAct === 1
                ? "bg-[#5C3317]"
                : activeAct === 2
                ? "bg-[#EC4899]"
                : "bg-[#38BDF8]"
            }`}
          />
        </div>
      </div>
    </section>
  );
}

