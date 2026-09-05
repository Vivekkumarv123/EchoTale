"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const HowItWorks3DScene = dynamic(
  () => import("@/components/how-it-works/how-it-works-3d-scene").then((mod) => mod.HowItWorks3DScene),
  { ssr: false }
);
import {
  Sparkles,
  Mic,
  PenTool,
  Wand2,
  Lock,
  Share2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Volume2,
  Layers,
  HelpCircle,
  Eye,
  RefreshCw,
} from "lucide-react";

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = React.useState<number>(1);
  const lenisRef = React.useRef<any | null>(null);

  // Initialize Lenis smooth scroll & GSAP ScrollTrigger
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

      const ctx = gsap.context(() => {
        // Reveal animations for process cards
        gsap.utils.toArray<HTMLElement>(".how-step-card").forEach((card, index) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 50, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play reverse play reverse",
                onEnter: () => setActiveStep(index + 1),
              },
            }
          );
        });
      });

      cleanup = () => {
        ctx.revert();
        gsap.ticker.remove(updateTicker);
        lenis.destroy();
      };
    });

    return () => {
      cleanup();
    };
  }, []);

  const steps = [
    {
      num: 1,
      title: "Speak or Inscribe Your Raw Reflection",
      icon: Mic,
      tagline: "Unfiltered memory capture via Voice-to-Text or Magic Ink",
      description:
        "Begin by whispering your raw thoughts into EchoTale's real-time voice recorder, or typing them on parchment. No formatting required—tell your story freely.",
      accent: "from-[#8A5A36] to-[#5C3317]",
      badge: "Step 1 · Raw Expression",
      highlights: [
        "Browser-native high fidelity audio streaming",
        "Instant whisper transcription with zero storage of raw audio files",
        "Privacy guaranteed—no tracking or ad profiling",
      ],
    },
    {
      num: 2,
      title: "AI Chapter Weaving & Sentiment Alchemy",
      icon: Wand2,
      tagline: "Gemini narrative polishing & emotional extraction",
      description:
        "EchoTale's backend calls Gemini 3.8 Flash to weave raw entries into flowing emotional prose, extract core sentiments, and suggest evocative chapter titles.",
      accent: "from-[#EC4899] to-[#9333EA]",
      badge: "Step 2 · AI Transformation",
      highlights: [
        "Preserves your authentic voice & specific details",
        "Dual-View Guarantee: Raw draft is ALWAYS saved alongside polished text",
        "Smart tag generation and sentiment alchemy scoring",
      ],
    },
    {
      num: 3,
      title: "Sanctum Keepsake & Holographic Wax Seal",
      icon: Sparkles,
      tagline: "Transform memories into shareable, unboxable gifts",
      description:
        "Select a mythic aesthetic theme (Vintage Grimoire, Fairy Tale Love, or Kinetic Cyber). Attach personal photos, custom memory trivia questions, and ambient audio loops.",
      accent: "from-[#0284C7] to-[#38BDF8]",
      badge: "Step 3 · Keepsake Creation",
      highlights: [
        "Interactive 3D Three.js wax seal unboxing ritual",
        "Embedded Memory Trivia Quiz to verify recipient identity",
        "Web Audio ambient drone or MP3 atmospheric background soundtrack",
      ],
    },
    {
      num: 4,
      title: "Zero-Knowledge Vault & Recipient Unboxing",
      icon: Lock,
      tagline: "Encrypted link delivery with recipient ceremony",
      description:
        "Send your sealed moment via a unique recipient link (`/m/[id]`). When opened, your loved one experiences a sensory unboxing ceremony.",
      accent: "from-[#059669] to-[#10B981]",
      badge: "Step 4 · Sealed Unboxing",
      highlights: [
        "Firestore document-level access rules tied strictly to user UID",
        "No login required for recipients to break the seal and view",
        "Interactive memory reveal with confetti and custom soundscapes",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#3D2C2E] selection:bg-amber-200 selection:text-amber-900 font-sans">
      <Navbar activeAct={1} />

      {/* Hero Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8A5A36]/10 text-[#5C3317] border border-[#8A5A36]/30 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The EchoTale Alchemy Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-display font-extrabold tracking-tight text-[#3D2C2E] max-w-4xl mx-auto leading-tight">
          How Raw Reflections Become <span className="font-salted text-5xl sm:text-7xl lg:text-8xl text-[#5C3317] block sm:inline">Living Keepsakes</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#6B5242] max-w-2xl mx-auto font-sans-ui leading-relaxed">
          Follow the four-stage journey from spoken voice notes to 3D wax-sealed digital heirlooms.
        </p>

        {/* Quick Nav Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-semibold">
          <Link
            href="/features"
            className="px-5 py-2.5 rounded-2xl bg-[#FAF1E4] border border-[#D7BEA8] text-[#5C3317] hover:bg-[#F3E5D8] transition-all flex items-center gap-2 shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>Explore All Features</span>
          </Link>
          <Link
            href="/example"
            className="px-5 py-2.5 rounded-2xl bg-[#5C3317] text-[#FAF6F0] hover:bg-[#43220F] transition-all flex items-center gap-2 shadow-md"
          >
            <Eye className="w-4 h-4" />
            <span>See Live Example</span>
          </Link>
        </div>
      </section>

      {/* Interactive 3D Canvas + Workflow Step Timeline */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Sticky 3D Canvas & Active Step HUD (Left Column) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <HowItWorks3DScene activeStep={activeStep} onStepChange={setActiveStep} />

            {/* Quick Summary Card */}
            <div className="p-5 rounded-2xl bg-[#5C3317] text-[#FAF6F0] space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-200">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero-Knowledge & User Auth Guaranteed</span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed font-sans-ui">
                Every reflection is strictly isolated to your authenticated UID. Neither third parties nor public callers can read your unsealed private vault.
              </p>
            </div>
          </div>

          {/* Detailed Step Cards (Right Column) */}
          <div className="lg:col-span-7 space-y-8">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = activeStep === step.num;
              return (
                <div
                  key={step.num}
                  id={`step-${step.num}`}
                  onClick={() => setActiveStep(step.num)}
                  className={`how-step-card rounded-3xl p-8 transition-all duration-500 border relative overflow-hidden cursor-pointer ${
                    isActive
                      ? "bg-[#FAF1E4] border-[#8A5A36] shadow-2xl ring-2 ring-[#8A5A36]/30 scale-[1.01]"
                      : "bg-[#FAF6F0] border-[#E6D7C3] shadow-md opacity-90 hover:opacity-100 hover:border-[#8A5A36]/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${step.accent} shadow-md`}
                      >
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#8A5A36]">
                          {step.badge}
                        </span>
                        <h2 className="text-2xl font-serif-display font-bold text-[#3D2C2E]">
                          {step.title}
                        </h2>
                      </div>
                    </div>
                    <span className="text-3xl font-salted font-extrabold text-[#5C3317]/40">
                      0{step.num}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#8A5A36] mb-3 italic">
                    &quot;{step.tagline}&quot;
                  </p>

                  <p className="text-sm text-[#6B5242] font-sans-ui leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="space-y-2 pt-2 border-t border-[#E6D7C3]/80">
                    {step.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-[#3D2C2E]">
                        <CheckCircle2 className="w-4 h-4 text-[#8A5A36] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl p-10 bg-gradient-to-br from-[#5C3317] to-[#3D2C2E] text-[#FAF6F0] shadow-2xl relative overflow-hidden space-y-6">
          <h2 className="text-3xl sm:text-5xl font-serif-display font-extrabold">
            Ready to Inscribe Your First <span className="font-salted text-4xl sm:text-6xl text-amber-200">Sanctum Moment?</span>
          </h2>
          <p className="text-sm sm:text-base text-amber-100/90 max-w-xl mx-auto font-sans-ui">
            Experience the living grimoire. Create heartfelt shareable keepsakes in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-2xl bg-amber-200 text-[#5C3317] font-bold text-base hover:bg-amber-100 transition-all shadow-lg flex items-center gap-2"
            >
              <span>Begin Your Grimoire</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer activeAct={1} />
    </div>
  );
}
