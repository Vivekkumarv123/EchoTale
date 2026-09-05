"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, BookOpen, ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen w-full bg-[#03050B] text-[#E2E8F0] flex flex-col items-center justify-center p-6 relative font-sans select-none overflow-hidden">
      {/* HIGH-INTENSITY LIGHTING & LIGHT-LEAK GLOWS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[140px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-fuchsia-600/15 blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-cyan-600/20 via-purple-600/20 to-pink-600/20 blur-[100px]" />
      </div>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="relative z-10 max-w-lg w-full text-center flex flex-col items-center">
        {/* ISEKAI PORTAL GLOW */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-cyan-500/30 via-fuchsia-500/20 to-amber-400/20 animate-pulse blur-xl" />

          {/* Outer Rotating Arcana Ring */}
          <div className="w-36 h-36 rounded-full border-2 border-dashed border-cyan-400/60 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex items-center justify-center relative backdrop-blur-2xl bg-slate-950/60 animate-[spin_20s_linear_infinite]">
            <div className="absolute inset-3 rounded-full border border-fuchsia-500/40 shadow-[inset_0_0_20px_rgba(217,70,239,0.35)]" />
          </div>

          {/* Central Floating Icon */}
          <div className="absolute flex items-center justify-center text-cyan-300">
            <Compass className="w-10 h-10 animate-bounce" />
          </div>
        </div>

        {/* CONTENT BLOCK */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
            <span>Dimensions Fractured &bull; Void 404</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-amber-200 drop-shadow-[0_0_35px_rgba(255,255,255,0.3)]">
            Lost In Quantum Void
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-md mx-auto font-sans opacity-90">
            You have crossed the threshold of known realm coordinates. The page or grimoire chapter you seek has dissolved into quantum static or shifted into an unwritten timeline.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/30 active:scale-95">
                <BookOpen className="w-4 h-4" />
                <span>Return to Primary Realm</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.history.back();
                }
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer flex items-center justify-center gap-2 border active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Step Back Through Rift</span>
            </Button>
          </div>
        </div>

        <p className="text-[11px] font-mono text-slate-500 tracking-[0.25em] uppercase mt-10">
          EchoTale &bull; Quantum Anomaly Transceiver &bull; Coordinates Zero
        </p>
      </div>
    </main>
  );
}