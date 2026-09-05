"use client";

import * as React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ChapterShowcase } from "@/components/landing/ChapterShowcase";
import { SecureVaultSection } from "@/components/landing/SecureVaultSection";
import { Footer } from "@/components/landing/Footer";
import { ThemeCursorOverlay } from "@/components/landing/ThemeCursorOverlay";
import { ThemeTransitionFX } from "@/components/landing/ThemeTransitionFX";
import { ScrollProgressHUD } from "@/components/landing/ScrollProgressHUD";

export default function LandingPage() {
  const [activeAct, setActiveAct] = React.useState<1 | 2 | 3>(1);
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [transitionEvent, setTransitionEvent] = React.useState<{
    from: 1 | 2 | 3;
    to: 1 | 2 | 3;
    direction: "down" | "up";
    id: number;
  } | null>(null);

  const mainContainerRef = React.useRef<HTMLDivElement | null>(null);
  const lenisRef = React.useRef<any | null>(null);
  const activeActRef = React.useRef<1 | 2 | 3>(1);

  React.useEffect(() => {
    activeActRef.current = activeAct;
  }, [activeAct]);

  // Initialize Lenis bi-directional smooth scroll & GSAP ScrollTrigger
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Reset scroll restoration and strip URL hash on refresh so URL stays as '/'
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);

    let cleanup = () => {};

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("lenis"),
    ]).then(([{ gsap }, { ScrollTrigger }, { default: Lenis }]) => {
      gsap.registerPlugin(ScrollTrigger);

      // 1. Initialize Lenis for smooth inertia scrolling
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
      });
      lenisRef.current = lenis;
      lenis.scrollTo(0, { immediate: true });

      lenis.on("scroll", ScrollTrigger.update);

      const updateTicker = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(updateTicker);
      gsap.ticker.lagSmoothing(0);

      const triggerActChange = (from: 1 | 2 | 3, to: 1 | 2 | 3, direction: "down" | "up") => {
        if (from === to) return;
        setActiveAct(to);
        setTransitionEvent({
          from,
          to,
          direction,
          id: Date.now(),
        });
      };

      const ctx = gsap.context(() => {
        // Bi-directional Act 2 Trigger (Fairytale Theme: Wand Swing & Rolling Fog)
        ScrollTrigger.create({
          trigger: "#act-2-showcase",
          start: "top 65%",
          end: "bottom 35%",
          onEnter: () => triggerActChange(activeActRef.current, 2, "down"),
          onEnterBack: () => triggerActChange(activeActRef.current, 2, "up"),
          onLeaveBack: () => triggerActChange(activeActRef.current, 1, "up"),
        });

        // Bi-directional Act 3 Trigger (Superhero Theme: Mechanical Blast & Elemental Core)
        ScrollTrigger.create({
          trigger: "#act-3-showcase",
          start: "top 60%",
          end: "bottom 20%",
          onEnter: () => triggerActChange(activeActRef.current, 3, "down"),
          onEnterBack: () => triggerActChange(activeActRef.current, 3, "up"),
          onLeaveBack: () => triggerActChange(activeActRef.current, 2, "up"),
        });

        // 1. Smooth Bidirectional Zoom In/Out & Reveal for Showcase Cards
        gsap.utils.toArray<HTMLElement>(".scroll-reveal-card").forEach((card) => {
          gsap.fromTo(
            card,
            {
              opacity: 0.15,
              y: 45,
              scale: 0.92,
              filter: "blur(4px)",
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                end: "top 50%",
                scrub: 0.8,
                toggleActions: "play reverse play reverse",
              },
            }
          );
        });

        // 2. Parallax Float Movement on Ambient Decorative Elements
        gsap.utils.toArray<HTMLElement>(".parallax-float-slow").forEach((el) => {
          gsap.to(el, {
            y: -40,
            rotation: 4,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        });

        gsap.utils.toArray<HTMLElement>(".parallax-float-fast").forEach((el) => {
          gsap.to(el, {
            y: -80,
            rotation: -6,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          });
        });

        // 3. Bidirectional Section Highlight Scale & Spotlight Glow
        ["#hero-section", "#act-1-showcase", "#act-2-showcase", "#act-3-showcase", "#secure-vault-section"].forEach((selector) => {
          const sec = document.querySelector<HTMLElement>(selector);
          if (sec) {
            ScrollTrigger.create({
              trigger: sec,
              start: "top 60%",
              end: "bottom 40%",
              onEnter: () => {
                gsap.to(sec, { scale: 1.008, duration: 0.6, ease: "power2.out" });
              },
              onLeave: () => {
                gsap.to(sec, { scale: 1.0, duration: 0.6, ease: "power2.inOut" });
              },
              onEnterBack: () => {
                gsap.to(sec, { scale: 1.008, duration: 0.6, ease: "power2.out" });
              },
              onLeaveBack: () => {
                gsap.to(sec, { scale: 1.0, duration: 0.6, ease: "power2.inOut" });
              },
            });
          }
        });
      }, mainContainerRef);

      cleanup = () => {
        gsap.ticker.remove(updateTicker);
        lenis.destroy();
        ctx.revert();
        ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
      };
    });

    // Mouse parallax for ambient lighting
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 20;
      const normY = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x: normX, y: normY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cleanup();
    };
  }, []);

  // Manual transition callback (from portal buttons or nav)
  const handleManualTransition = (toAct: 1 | 2 | 3, direction: "down" | "up" = "down") => {
    const current = activeActRef.current;
    if (current !== toAct) {
      setActiveAct(toAct);
      setTransitionEvent({
        from: current,
        to: toAct,
        direction,
        id: Date.now(),
      });
    }

    const targetSelector =
      toAct === 1 ? "#hero-section" : toAct === 2 ? "#act-2-showcase" : "#act-3-showcase";

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetSelector, {
        duration: 1.4,
        offset: -40,
      });
    }
  };

  // Background style configuration for the 3 distinct Acts
  const backgroundStyles = {
    1: "bg-[#FAF6F0] text-[#3D2C2E]",
    2: "bg-gradient-to-b from-[#FAF5FF] via-[#FDF2F8] to-[#FCE7F3] text-[#3B0764]",
    3: "bg-[#090D16] text-[#F8FAFC]",
  }[activeAct];

  return (
    <div
      ref={mainContainerRef}
      className={`relative min-h-screen transition-colors duration-1000 ease-in-out font-sans ${backgroundStyles}`}
    >
      {/* Cinematic Theme Changing Transition FX Overlay (Wand Swing, Rolling Fog, Mechanical Blast & Lightning) */}
      <ThemeTransitionFX activeAct={activeAct} transitionEvent={transitionEvent} />

      {/* Dynamic Ambient Blur Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-Left Orb */}
        <div
          className={`absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full blur-[120px] transition-all duration-1000 opacity-60 ${
            activeAct === 1
              ? "bg-[#F5E6D3]"
              : activeAct === 2
              ? "bg-[#F0ABFC]/70"
              : "bg-[#0369A1]/40"
          }`}
          style={{
            transform: `translate3d(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px, 0)`,
          }}
        />

        {/* Center-Right Orb */}
        <div
          className={`absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-1000 opacity-50 ${
            activeAct === 1
              ? "bg-[#EDD5BE]"
              : activeAct === 2
              ? "bg-[#C084FC]/60"
              : "bg-[#DC2626]/30"
          }`}
          style={{
            transform: `translate3d(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px, 0)`,
          }}
        />

        {/* Bottom Ambient Glow */}
        <div
          className={`absolute bottom-0 left-1/4 w-[700px] h-[500px] rounded-full blur-[160px] transition-all duration-1000 opacity-40 ${
            activeAct === 1
              ? "bg-[#E6CDB5]"
              : activeAct === 2
              ? "bg-[#FBCFE8]/60"
              : "bg-[#38BDF8]/20"
          }`}
        />
      </div>

      {/* Theme-Adaptive Interactive Mouse FX Overlay Canvas */}
      <ThemeCursorOverlay activeAct={activeAct} />

      {/* Interactive Bi-Directional Scroll HUD & Reading Progress Bar */}
      <ScrollProgressHUD activeAct={activeAct} onNavigateAct={handleManualTransition} />

      {/* Navigation Header */}
      <Navbar activeAct={activeAct} />

      {/* Main Page Content */}
      <main className="relative z-10">
        {/* Act I: Hero Section */}
        <HeroSection activeAct={activeAct} />

        {/* Acts Showcase & Interactive Narrative Weaver */}
        <ChapterShowcase activeAct={activeAct} onTriggerTransition={handleManualTransition} />

        {/* Act III & Security Vault Footer */}
        <SecureVaultSection activeAct={activeAct} />
      </main>

      {/* Global Footer */}
      <Footer activeAct={activeAct} />
    </div>
  );
}
