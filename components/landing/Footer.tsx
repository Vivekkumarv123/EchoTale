"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Heart, Shield, Sparkles } from "lucide-react";

interface FooterProps {
  activeAct: 1 | 2 | 3;
}

export function Footer({ activeAct }: FooterProps) {
  return (
    <footer
      id="landing-footer"
      className={`relative border-t py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-700 z-10 ${
        activeAct === 1
          ? "bg-[#FAF1E4]/90 border-[#E6D7C3] text-[#5C3317]"
          : activeAct === 2
          ? "bg-[#FAF5FF]/90 border-[#E9D5FF] text-[#4C1D95]"
          : "bg-[#090D16] border-slate-800 text-slate-400"
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              activeAct === 1
                ? "bg-[#5C3317] text-[#FAF6F0] border-[#8A5A36]"
                : activeAct === 2
                ? "bg-[#9333EA] text-white border-[#C084FC]"
                : "bg-slate-800 text-sky-400 border-slate-700"
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="font-salted text-3xl block leading-none">EchoTale</span>
            <span className="font-note text-sm opacity-80 -mt-1 block">
              The AI-Powered Narrative Journal
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
          <Link href="/login" className="hover:opacity-100 opacity-80 transition-opacity">
            Sign In
          </Link>
          <Link href="/dashboard" className="hover:opacity-100 opacity-80 transition-opacity">
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("chapter-showcase");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:opacity-100 opacity-80 transition-opacity cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
          >
            Narrative Acts
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("secure-vault-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:opacity-100 opacity-80 transition-opacity cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit"
          >
            Security Architecture
          </button>
        </div>

        {/* Copyright */}
        <div className="text-xs opacity-70 text-center md:text-right font-sans-ui">
          <p>© {new Date().getFullYear()} EchoTale. All reflections encrypted.</p>
          <p className="font-note text-base mt-0.5">Crafted with care for your journey.</p>
        </div>
      </div>
    </footer>
  );
}
