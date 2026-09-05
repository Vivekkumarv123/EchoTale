"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Wand2,
  Lock,
  Sparkles,
  ArrowRight,
  BookOpen,
  MessageSquare,
} from "lucide-react";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const lenisRef = React.useRef<any | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let cleanup = () => {};

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("lenis"),
    ]).then(([{ gsap }, { ScrollTrigger }, { default: Lenis }]) => {
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);
      const updateTicker = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(updateTicker);
      gsap.ticker.lagSmoothing(0);

      cleanup = () => {
        gsap.ticker.remove(updateTicker);
        lenis.destroy();
      };
    });

    return () => {
      cleanup();
    };
  }, []);

  const faqs = [
    {
      category: "security",
      question: "How are my journal entries protected in the Zero-Knowledge Vault?",
      answer:
        "Every reflection and Sanctum Moment is bound directly to your authenticated Firebase Auth UID. Strict Firestore Security Rules enforce document-level ownership. API routes verify Firebase ID tokens server-side before processing requests, and secrets like API keys are fetched fail-closed from GCP Secret Manager.",
    },
    {
      category: "ai",
      question: "What happens to my raw voice recordings and raw text drafts?",
      answer:
        "EchoTale streams audio through browser-native speech recognition directly to Gemini 3.8 Flash for prose alchemy. Raw audio files are never stored on any remote server. Furthermore, EchoTale enforces a Dual-View Guarantee: your raw draft is always preserved alongside the AI-polished version.",
    },
    {
      category: "moments",
      question: "Does a recipient need an account to unseal a Sanctum Moment?",
      answer:
        "No! Recipients can open and experience a shared keepsake link (`/m/[id]`) directly in any modern web browser without creating an account or logging in. They get the full 3D wax seal unboxing, memory trivia quiz, photo gallery, and ambient audio experience.",
    },
    {
      category: "themes",
      question: "Can I customize the aesthetic theme of my grimoire?",
      answer:
        "Yes! EchoTale offers three distinct mythic themes: Vintage Grimoire with Magic Ink, Fairy Tale with Love & Wand Swing, and Kinetic Cyber with Mechanical Core. You can switch themes at any time in your dashboard or step-by-step moment creator.",
    },
    {
      category: "security",
      question: "Is EchoTale free to use for personal reflective journaling?",
      answer:
        "Yes, EchoTale&apos;s core journaling engine, voice-to-text alchemy, and Sanctum Keepsake creation are completely free for personal use.",
    },
    {
      category: "moments",
      question: "How does the Memory Trivia Quiz verification work?",
      answer:
        "When creating a Sanctum Moment, you can attach a secret question and answer (e.g., 'Where did we first meet?'). When your recipient opens the link, they must answer the trivia question before the 3D wax seal unlocks.",
    },
    {
      category: "ai",
      question: "Which Gemini models power EchoTale's prose alchemy?",
      answer:
        "EchoTale utilizes Gemini 3.8 Flash as its primary model for text transformations and chapter summaries, with Gemini 3.1 Flash Lite as a secondary low-latency fallback.",
    },
  ];

  const categories = [
    { id: "all", label: "All Questions", icon: HelpCircle },
    { id: "security", label: "Security & Vault", icon: ShieldCheck },
    { id: "ai", label: "AI & Voice Engine", icon: Wand2 },
    { id: "moments", label: "Keepsakes & Unboxing", icon: Sparkles },
    { id: "themes", label: "Themes & Audio", icon: BookOpen },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#3D2C2E] font-sans">
      <Navbar activeAct={1} />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8A5A36]/10 text-[#5C3317] border border-[#8A5A36]/30 text-xs font-semibold mb-6">
          <HelpCircle className="w-3.5 h-3.5 text-[#8A5A36]" />
          <span>Knowledge & Support Base</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif-display font-extrabold text-[#3D2C2E] max-w-3xl mx-auto leading-tight">
          Frequently Asked <span className="font-salted text-5xl sm:text-7xl text-[#5C3317] block sm:inline">Questions</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-[#6B5242] max-w-xl mx-auto font-sans-ui">
          Everything you need to know about EchoTale&apos;s zero-knowledge vault, speech alchemy, and 3D wax-sealed keepsakes.
        </p>

        {/* Search Bar */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8A5A36]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g., encryption, voice, recipient)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#FAF1E4] border border-[#D7BEA8] text-sm text-[#3D2C2E] placeholder-[#8A5A36]/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8A5A36]"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-[#5C3317] text-white shadow-md"
                    : "bg-[#FAF1E4] border border-[#D7BEA8] text-[#6B5242] hover:bg-[#F3E5D8]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Accordion List */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto mb-16">
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "bg-[#FAF1E4] border-[#8A5A36] shadow-md ring-1 ring-[#8A5A36]/20"
                      : "bg-[#FAF6F0] border-[#E6D7C3] hover:bg-[#FAF1E4]/50"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer"
                  >
                    <span className="text-base font-serif-display font-bold text-[#3D2C2E]">
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? "bg-[#5C3317] text-white" : "bg-[#E6D7C3] text-[#5C3317]"
                      }`}
                    >
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-[#6B5242] font-sans-ui leading-relaxed border-t border-[#D7BEA8]/40 animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-10 rounded-2xl bg-[#FAF1E4] border border-[#D7BEA8] text-center space-y-2">
              <p className="font-serif-display font-bold text-[#3D2C2E]">No questions found</p>
              <p className="text-xs text-[#6B5242]">Try searching for different keywords or select &apos;All Questions&apos;.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-8 rounded-3xl bg-[#5C3317] text-[#FAF6F0] space-y-4 shadow-xl">
          <h3 className="text-2xl font-serif-display font-bold">Have More Questions?</h3>
          <p className="text-xs sm:text-sm text-amber-100/90 max-w-lg mx-auto font-sans-ui">
            Our living grimoire is ready to welcome your story.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-200 text-[#5C3317] font-bold text-sm hover:bg-amber-100 transition-all shadow-md"
          >
            <span>Begin Your Grimoire</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer activeAct={1} />
    </div>
  );
}
