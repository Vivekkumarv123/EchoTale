"use client";

import * as React from "react";
import {
  Wand2,
  Heart,
  Zap,
  CheckCircle2,
  Shield,
  Sparkles,
  Lock,
  Cpu,
  Feather,
  Flame,
  Layers,
} from "lucide-react";

interface ChapterShowcaseProps {
  activeAct: 1 | 2 | 3;
  onTriggerTransition?: (toAct: 1 | 2 | 3, direction?: "down" | "up") => void;
}

interface SampleEntry {
  raw: string;
  theme1: string;
  theme2: string;
  theme3: string;
  themeTitle: string;
}

const SAMPLE_ENTRIES: SampleEntry[] = [
  {
    themeTitle: "Missing the Last Train in the Rain",
    raw: "Walked home in heavy rain after missing the last express train. Soaked shoes, cold fingers, but the city lights looked pretty.",
    theme1: "The antique parchment drank the damp dusk air. Like ink blossoming on ancient parchment, the rain felt not like a delay, but like the world gently granting permission to slow our hurried stride and hold gratitude close.",
    theme2: "Silver stardust ribbons whispered down from the twilight canopy. Wandering across the cobblestone borders of the fairy realm, every puddle mirrored enchanted constellations waiting for two lovers to make a secret wish.",
    theme3: "Alert: Transit corridor severed. Engaging tactical ground traversal across the drenched metropolis. Rain hammered against the titanium alloy plating, yet the internal reactor core burned with unbreakable resolve.",
  },
  {
    themeTitle: "The Vulnerable Midnight Conversation",
    raw: "Finally had that honest talk with my partner about our future dreams and fears. Uncomfortable at first, but deeply liberating.",
    theme1: "Over steaming mugs and trembling candid pauses, we unburdened the unspoken dreams we had guarded so carefully. In listening with open hearts, the quiet room softened into pure, sacred understanding.",
    theme2: "Two travelers paused at the crossroads of the Whispering Woods, untying golden ribbons from their wish-scrolls to weave a shared tapestry of eternal devotion under the twin rose moons.",
    theme3: "Tactical alignment protocol confirmed: Disarmed all defensive barriers, initiated direct full-spectrum uplink. Vulnerability was not weakness, but the catalyst for ironclad unity on the mission ahead.",
  },
  {
    themeTitle: "Leaving the Safe Path to Build a Dream",
    raw: "Handed in my notice at the corporate firm today to build something of my own. Terrified, yet never felt so alive.",
    theme1: "Stepping off the familiar ledge of certainty stirred a sudden flutter in my chest. Fear and love sat side by side, reminding me that all true beginnings are born from the courage of surrender.",
    theme2: "With a pocketful of stardust seeds and an unwritten spellbook, the apprentice ventured past the kingdom gates into the uncharted realms of impossible romantic adventures.",
    theme3: "Safety dampeners disengaged. Thrusters ignited at 100% capacity. Breaking free of conventional orbit to pioneer an unshakeable citadel on the cosmic frontier. Brave and undefeated.",
  },
];

export function ChapterShowcase({
  activeAct,
  onTriggerTransition,
}: ChapterShowcaseProps) {
  const [selectedSampleIdx, setSelectedSampleIdx] = React.useState(0);
  const [activeTabGenre, setActiveTabGenre] = React.useState<"theme1" | "theme2" | "theme3">("theme1");

  const currentSample = SAMPLE_ENTRIES[selectedSampleIdx];

  return (
    <section id="chapter-showcase" className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* ========================================================================= */}
        {/* THEME 1: VINTAGE GRIMOIRE & INTIMATE LOVE (SELF-WRITING HARRY POTTER INK) */}
        {/* ========================================================================= */}
        <div
          id="act-1-showcase"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#8A5A36]/10 text-[#5C3317] border border-[#8A5A36]/20">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Theme 1 · Antique Grimoire & Magical Ink</span>
            </div>

            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3D2C2E] leading-tight">
              An enchanted haven where ink writes itself
            </h2>

            <p className="font-note text-2xl text-[#6D4C41] leading-relaxed">
              Experience the wonder of an antique grimoire. Sparkling golden ink weaves your thoughts into intimate, tender reflections with warmth and poetic grace.
            </p>

            <ul className="space-y-3 pt-2 text-[#3D2C2E]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#8A5A36] shrink-0 mt-0.5" />
                <span className="text-sm font-medium">
                  <strong>Magical Ink Manifestation:</strong> Golden cursive flourishes and warm ambient embers bringing your journal entries to life.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#8A5A36] shrink-0 mt-0.5" />
                <span className="text-sm font-medium">
                  <strong>Intimate Heart Sanctuary:</strong> Express deep vulnerability and love grounded faithfully in your exact words.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#8A5A36] shrink-0 mt-0.5" />
                <span className="text-sm font-medium">
                  <strong>Parchment & Antique Gold:</strong> Calming, eye-friendly leather and candlelight tones.
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 relative">
            {/* Parallax Float Decorative Rune Badge */}
            <div className="absolute -top-6 -right-4 hidden sm:flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF1E4] border border-[#D7BEA8] shadow-md parallax-float-fast z-20 pointer-events-none">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: "5s" }} />
              <span className="font-note text-sm text-[#5C3317] font-bold">100% Owner Verified</span>
            </div>

            {/* Theme 1 Showcase Card */}
            <div className="scroll-reveal-card relative rounded-3xl p-6 sm:p-8 bg-[#FAF1E4] border border-[#D7BEA8] shadow-xl shadow-[#5C331715] overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#F5DBC4]/80 to-transparent rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#D7BEA8]/60 pb-4 mb-6">
                <div className="flex items-center gap-2 text-xs font-serif text-[#6D4C41]">
                  <Wand2 className="w-4 h-4 text-amber-700 animate-pulse" />
                  <span>Entry #108 · Golden Ink Manifestation</span>
                </div>
                <span className="font-note text-base text-[#8A5A36]">Grimoire Inscribed ✨</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E9DAC6] shadow-sm">
                  <span className="text-xs uppercase tracking-widest text-[#8A5A36] font-semibold block mb-1">
                    Raw Memory Input
                  </span>
                  <p className="font-note text-xl text-[#3D2C2E]">
                    &quot;Sitting quietly by the fire reading your handwritten letter. I smiled for no reason.&quot;
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F4E3D2]/80 border border-[#D7BEA8] relative">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#5C3317] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Self-Writing Golden Magic Ink</span>
                  </div>
                  <p className="font-serif-display text-base sm:text-lg text-[#3D2C2E] italic leading-relaxed">
                    &quot;The dancing amber flames cast long golden silhouettes across the room. As the ink soaked into the parchment, love revealed its quietest secret: that true belonging is felt in the moments when silence is completely at peace.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* THEME 2: FAIRY TALE WITH LOVE & WHIMSICAL ENCHANTMENT */}
        {/* ========================================================================= */}
        <div
          id="act-2-showcase"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-7 order-2 lg:order-1 relative">
            {/* Parallax Float Decorative Rose Badge */}
            <div className="absolute -top-6 -left-4 hidden sm:flex items-center gap-2 p-2.5 rounded-xl bg-[#FDF4FF] border border-[#F0ABFC] shadow-md parallax-float-slow z-20 pointer-events-none">
              <Heart className="w-4 h-4 text-[#EC4899] animate-pulse" />
              <span className="font-note text-sm text-[#9333EA] font-bold">Starlight Enchanted</span>
            </div>

            {/* Theme 2 Pastel & Romantic Card */}
            <div className="scroll-reveal-card relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#FAF5FF] via-[#FDF4FF] to-[#FCE7F3] border border-[#F0ABFC] shadow-2xl shadow-[#EC489915] overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-radial from-[#F0ABFC]/50 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#F0ABFC]/60 pb-4 mb-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#9333EA]">
                  <Heart className="w-4 h-4 text-[#EC4899] animate-bounce" />
                  <span>Enchanted Romance Weaver</span>
                </div>
                <span className="font-salted text-2xl text-[#EC4899]">The Stardust Chapter</span>
              </div>

              {/* Interactive Genre Toggle */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 p-1 bg-[#F3E8FF]/70 rounded-xl border border-[#E9D5FF]">
                  <button
                    onClick={() => setActiveTabGenre("theme1")}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      activeTabGenre === "theme1"
                        ? "bg-white text-[#5C3317] shadow-sm font-bold"
                        : "text-[#6B21A8] hover:text-[#3B0764]"
                    }`}
                  >
                    Magic Ink Grimoire
                  </button>
                  <button
                    onClick={() => setActiveTabGenre("theme2")}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      activeTabGenre === "theme2"
                        ? "bg-gradient-to-r from-[#EC4899] to-[#9333EA] text-white shadow-sm font-bold"
                        : "text-[#6B21A8] hover:text-[#3B0764]"
                    }`}
                  >
                    Fairy Tale & Love
                  </button>
                  <button
                    onClick={() => setActiveTabGenre("theme3")}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      activeTabGenre === "theme3"
                        ? "bg-[#0F172A] text-sky-400 shadow-sm font-bold"
                        : "text-[#6B21A8] hover:text-[#3B0764]"
                    }`}
                  >
                    Superhero & Brave
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-white/90 border border-[#F0ABFC] backdrop-blur-sm min-h-[140px] flex items-center">
                  <p className="font-serif-display text-base sm:text-lg text-[#3B0764] leading-relaxed">
                    {activeTabGenre === "theme1" &&
                      "“Golden cursive glowed softly upon the page, carrying the warmth of ancient embers and honest confessions.”"}
                    {activeTabGenre === "theme2" &&
                      "“Across the Luminescent Glade, the fairy queen gathered starlight teardrops of joy, transforming each memory into floating rose petals and eternal love vows.”"}
                    {activeTabGenre === "theme3" &&
                      "“Titanium shields calibrated to maximum fortitude. The hero raised the battle banner, fearless and unshakeable in the eye of the storm.”"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EC4899]/15 text-[#EC4899] border border-[#EC4899]/30">
              <Heart className="w-3.5 h-3.5" />
              <span>Theme 2 · Fairy Tale with Love</span>
            </div>

            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3B0764] leading-tight">
              Turn your love story into a fairy-tale legend
            </h2>

            <p className="font-note text-2xl text-[#701A75] leading-relaxed">
              Why should journals be sterile logs? EchoTale reimagines romantic milestones, fond memories, and heartfelt dreams through the lens of luminous fairy-tale wonder and magical realism.
            </p>

            <ul className="space-y-3 pt-2 text-[#3B0764]">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#EC4899] shrink-0 mt-0.5" />
                <span className="text-sm font-medium">
                  <strong>Rose Gold & Lavender Palette:</strong> Shimmering starlight, soft rose blush, and fairy dust highlights.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#EC4899] shrink-0 mt-0.5" />
                <span className="text-sm font-medium">
                  <strong>Whimsical Romantic Chapters:</strong> Organizes everyday journals into captivating mythic storybooks.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* THEME 3: SUPERHERO WITH BRAVE & MATURE FORTITUDE */}
        {/* ========================================================================= */}
        <div
          id="act-3-showcase"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#0284C7]/15 text-[#38BDF8] border border-[#0284C7]/40">
              <Zap className="w-4 h-4 text-rose-500" />
              <span>Theme 3 · Superhero with Brave & Mature</span>
            </div>

            <h2 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F8FAFC] leading-tight">
              Titanium fortitude & mature courage
            </h2>

            <p className="font-note text-2xl text-[#94A3B8] leading-relaxed">
              When life tests your limits, the journal evolves into a superhero chronicle. Transmute raw adversity into mature bravery and battle-tested triumph, protected by cryptographically sealed Firebase security.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#1E293B]/90 border border-[#334155] text-[#F8FAFC]">
                <Shield className="w-5 h-5 text-sky-400 mb-1" />
                <span className="text-xs font-bold block">Brave Heroic Core</span>
                <span className="text-[11px] text-[#94A3B8]">Converts hardship into resilience stats</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#1E293B]/90 border border-[#334155] text-[#F8FAFC]">
                <Lock className="w-5 h-5 text-rose-500 mb-1" />
                <span className="text-xs font-bold block">Titanium Vault</span>
                <span className="text-[11px] text-[#94A3B8]">Owner-only token encryption</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            {/* Parallax Float Decorative Cyber Badge */}
            <div className="absolute -top-6 -right-4 hidden sm:flex items-center gap-2 p-2.5 rounded-xl bg-[#0F172A] border border-sky-500/50 shadow-lg parallax-float-fast z-20 pointer-events-none">
              <Zap className="w-4 h-4 text-sky-400 animate-pulse" />
              <span className="font-mono text-xs text-sky-300 font-bold uppercase tracking-wider">KINETIC OVERDRIVE</span>
            </div>

            {/* Theme 3 Cyber Hero Vault Card */}
            <div className="scroll-reveal-card relative rounded-3xl p-6 sm:p-8 bg-[#0F172A] border border-sky-500/40 shadow-2xl shadow-[#38BDF820] overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#38BDF8]/25 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-radial from-[#EF4444]/25 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#334155] pb-4 mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                  <Zap className="w-4 h-4 text-rose-500" />
                  <span>HERO_MATURE_VALOR_CHRONICLE // v3.0</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ARMOR_LOCKED</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#1E293B]/80 border border-[#334155]">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                    [Trial Logged]
                  </span>
                  <p className="font-note text-xl text-slate-200">
                    &quot;Faced rejection, took a deep breath, and decided to push forward with double the focus.&quot;
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-sky-500/50 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-wider">
                      Heroic Fortitude Synthesis:
                    </span>
                    <span className="text-xs font-mono text-rose-400 font-bold">+50 Valor XP</span>
                  </div>
                  <p className="font-serif-display text-base sm:text-lg text-slate-100 italic leading-relaxed">
                    &quot;The trial shattered old doubts, leaving only refined titanium resolve. True heroes are not defined by an absence of fear, but by the mature courage to stand tall and forge destiny with their own hands.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE 3-THEME REAL-TIME CHRONICLE COMPARISON STUDIO */}
        {/* ========================================================================= */}
        <div className="scroll-reveal-card rounded-3xl p-6 sm:p-10 border transition-all duration-700 backdrop-blur-xl bg-white/50 dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="font-salted text-4xl sm:text-5xl text-amber-700 dark:text-sky-400 block mb-2">
              The 3-Theme Transformation Studio
            </span>
            <h3 className="font-serif-display text-2xl sm:text-3xl font-bold mb-2">
              Watch Your Words Evolve in Real-Time
            </h3>
            <p className="font-note text-xl opacity-80">
              Pick any real scenario below and explore how EchoTale recreates your journal entry across all three narrative realms.
            </p>
          </div>

          {/* Scenario Selector Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
            {SAMPLE_ENTRIES.map((entry, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSampleIdx(idx)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  selectedSampleIdx === idx
                    ? "bg-[#5C3317] dark:bg-sky-500 text-white shadow-md scale-105"
                    : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 opacity-80"
                }`}
              >
                {entry.themeTitle}
              </button>
            ))}
          </div>

          {/* 3-Column Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Theme 1 Card */}
            <div className="p-5 rounded-2xl bg-[#FAF1E4] border border-[#D7BEA8] text-[#3D2C2E] flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5C3317] mb-3">
                  <Wand2 className="w-4 h-4" />
                  <span>Theme 1 · Vintage & Magic Ink</span>
                </div>
                <p className="font-serif-display text-base leading-relaxed italic">
                  &quot;{currentSample.theme1}&quot;
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#D7BEA8]/50 flex items-center justify-between text-xs opacity-75 font-note text-lg">
                <span>Parchment & Leather</span>
                <span>Tone: Intimate Magic</span>
              </div>
            </div>

            {/* Theme 2 Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FAF5FF] to-[#FDF4FF] border border-[#F0ABFC] text-[#3B0764] flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#EC4899] mb-3">
                  <Heart className="w-4 h-4" />
                  <span>Theme 2 · Fairy Tale with Love</span>
                </div>
                <p className="font-serif-display text-base leading-relaxed italic">
                  &quot;{currentSample.theme2}&quot;
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F0ABFC]/50 flex items-center justify-between text-xs opacity-75 font-note text-lg">
                <span>Rose Starlight & Petals</span>
                <span>Tone: Romantic Lore</span>
              </div>
            </div>

            {/* Theme 3 Card */}
            <div className="p-5 rounded-2xl bg-[#0F172A] border border-[#1E293B] text-slate-100 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-400 mb-3">
                  <Zap className="w-4 h-4 text-rose-500" />
                  <span>Theme 3 · Superhero & Brave</span>
                </div>
                <p className="font-serif-display text-base leading-relaxed italic text-slate-200">
                  &quot;{currentSample.theme3}&quot;
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs opacity-75 font-mono">
                <span className="text-sky-400">Titanium Core</span>
                <span className="text-rose-400">Tone: Heroic Valor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
