"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Server,
  KeyRound,
  ArrowRight,
  Database,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

interface SecureVaultSectionProps {
  activeAct: 1 | 2 | 3;
}

export function SecureVaultSection({ activeAct }: SecureVaultSectionProps) {
  return (
    <section id="secure-vault-section" className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
      <div className="max-w-5xl mx-auto">
        {/* Main Vault Card */}
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-br from-[#0B0F19] via-[#0F172A] to-[#1E293B] border border-sky-500/30 shadow-2xl shadow-sky-500/10 overflow-hidden text-white">
          {/* Cyberpunk Accent Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-sky-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-radial from-rose-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            {/* Security Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Production-Grade Architecture · Google Cloud & Firebase</span>
            </div>

            <h2 className="font-serif-display text-3xl sm:text-5xl font-bold tracking-tight">
              Your Sanctum is Fortified. <br />
              <span className="font-salted text-5xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-rose-400 to-amber-300">
                Your Story is Eternal.
              </span>
            </h2>

            <p className="font-note text-2xl text-slate-300 max-w-2xl leading-relaxed">
              Every intimate vulnerability, wild fairy-tale vision, and triumph belongs only to you. Built with zero-compromise security principles.
            </p>

            {/* 3 Pillars of Security Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2">
                  <Database className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-100">Owner-Only Firestore</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Cryptographic Firestore rules enforce that only your UID can read or write your memories.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2">
                  <Server className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-100">Server-Isolated AI</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Gemini API keys and token authentication never touch client browser bundles.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-100">Admin SDK Verification</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Every request verifies Firebase JWT ID tokens server-side before execution.
                </p>
              </div>
            </div>

            {/* Action CTA Button in Amora Brush */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Link
                href="/login"
                id="vault-enter-journal-button"
                className="w-full sm:w-auto px-10 py-4 rounded-2xl font-amora text-xl sm:text-2xl tracking-wider text-center bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 hover:from-sky-400 hover:to-rose-400 text-white shadow-2xl shadow-sky-500/25 flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <BookOpen className="w-6 h-6" />
                <span>Enter Your EchoTale Journal</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-2 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Zero Third-Party Ad Trackers
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Instant PDF & Markdown Export
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Encrypted Cloud Sync
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
