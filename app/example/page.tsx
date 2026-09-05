"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import confetti from "canvas-confetti";
import { ambientAudioEngine } from "@/lib/ambient-audio";
import {
  Sparkles,
  Heart,
  Volume2,
  VolumeX,
  HelpCircle,
  CheckCircle2,
  Lock,
  Unlock,
  Wand2,
  Share2,
  ArrowRight,
  Eye,
  ImageIcon,
  Maximize2,
  X,
  RefreshCw,
  Gift,
} from "lucide-react";

export default function ExamplePage() {
  const [theme, setTheme] = React.useState<"grimoire" | "fairytale" | "cyber">("grimoire");
  const [isSealed, setIsSealed] = React.useState<boolean>(true);
  const [quizAnswer, setQuizAnswer] = React.useState<string>("");
  const [quizSolved, setQuizSolved] = React.useState<boolean>(false);
  const [quizError, setQuizError] = React.useState<string | null>(null);
  const [showRaw, setShowRaw] = React.useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = React.useState<string | null>(null);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Three.js 3D Interactive Wax Seal Canvas
  React.useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined" || !isSealed) return;

    let cleanup = () => {};

    import("three").then((THREE) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.z = 4.6;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const sealGroup = new THREE.Group();
      sealGroup.rotation.x = Math.PI / 4.5;
      scene.add(sealGroup);

      // Color theme configuration
      const waxColor = theme === "grimoire" ? 0x82241e : theme === "fairytale" ? 0xbe185d : 0x0369a1;
      const waxEmissive = theme === "grimoire" ? 0x2e0807 : theme === "fairytale" ? 0x4a0429 : 0x082f49;
      const goldColor = theme === "cyber" ? 0x38bdf8 : 0xf59e0b;
      const goldEmissive = theme === "cyber" ? 0x0284c7 : 0xb45309;

      // 1. Central Wax Base Disc
      const baseGeo = new THREE.CylinderGeometry(1.5, 1.58, 0.22, 64);
      const waxMat = new THREE.MeshStandardMaterial({
        color: waxColor,
        roughness: 0.28,
        metalness: 0.22,
        emissive: waxEmissive,
        emissiveIntensity: 0.35,
      });
      const baseMesh = new THREE.Mesh(baseGeo, waxMat);
      sealGroup.add(baseMesh);

      // 2. Scalloped Melted Droplet Rim (simulates hand-poured cooling wax)
      const dropletCount = 18;
      for (let i = 0; i < dropletCount; i++) {
        const angle = (i / dropletCount) * Math.PI * 2;
        const radiusOffset = 1.48 + ((i * 17) % 7) * 0.025;
        const dropRadius = 0.18 + ((i * 13) % 5) * 0.035;
        const dropGeo = new THREE.SphereGeometry(dropRadius, 12, 12);
        const dropMesh = new THREE.Mesh(dropGeo, waxMat);
        dropMesh.scale.set(1.1, 0.7, 1.1);
        dropMesh.position.set(
          Math.cos(angle) * radiusOffset,
          (Math.sin(angle * 3) * 0.02),
          Math.sin(angle) * radiusOffset
        );
        sealGroup.add(dropMesh);
      }

      // 3. Inner Recessed Coin Bed
      const innerBedGeo = new THREE.CylinderGeometry(1.18, 1.18, 0.24, 48);
      const innerBedMat = new THREE.MeshStandardMaterial({
        color: waxColor,
        roughness: 0.45,
        metalness: 0.15,
        emissive: waxEmissive,
        emissiveIntensity: 0.2,
      });
      const innerBed = new THREE.Mesh(innerBedGeo, innerBedMat);
      innerBed.position.y = 0.02;
      sealGroup.add(innerBed);

      // 4. Gold Outer Ring
      const ringGeo = new THREE.TorusGeometry(1.16, 0.065, 16, 80);
      const goldMat = new THREE.MeshStandardMaterial({
        color: goldColor,
        metalness: 0.88,
        roughness: 0.18,
        emissive: goldEmissive,
        emissiveIntensity: 0.3,
      });
      const ringMesh = new THREE.Mesh(ringGeo, goldMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.13;
      sealGroup.add(ringMesh);

      // 5. Embossed 8-Point Gold Compass Star
      const starCenterGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const starCenterMesh = new THREE.Mesh(starCenterGeo, goldMat);
      starCenterMesh.scale.set(1, 0.45, 1);
      starCenterMesh.position.y = 0.14;
      sealGroup.add(starCenterMesh);

      const starArmGeo = new THREE.BoxGeometry(0.12, 0.05, 0.95);
      for (let j = 0; j < 4; j++) {
        const arm = new THREE.Mesh(starArmGeo, goldMat);
        arm.rotation.y = (j * Math.PI) / 4;
        arm.position.y = 0.14;
        sealGroup.add(arm);
      }

      // 6. Orbiting Gold Dust Particles
      const dustCount = 80;
      const dustGeo = new THREE.BufferGeometry();
      const dustPositions = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2;
        const r = 1.8 + Math.random() * 1.5;
        dustPositions[i] = Math.cos(theta) * r;
        dustPositions[i + 1] = (Math.random() - 0.5) * 1.8;
        dustPositions[i + 2] = Math.sin(theta) * r;
      }
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
      const dustMat = new THREE.PointsMaterial({
        size: 0.045,
        color: goldColor,
        transparent: true,
        opacity: 0.85,
      });
      const dustPoints = new THREE.Points(dustGeo, dustMat);
      sealGroup.add(dustPoints);

      // Lighting
      const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
      keyLight.position.set(4, 6, 5);
      scene.add(keyLight);

      const rimLight = new THREE.PointLight(goldColor, 2, 30);
      rimLight.position.set(-4, -3, 3);
      scene.add(rimLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      // Pointer Drag Interaction
      let isDragging = false;
      let prevX = 0;
      let prevY = 0;
      let rotSpeedX = 0;
      let rotSpeedY = 0;

      const onPointerDown = (e: PointerEvent) => {
        isDragging = true;
        prevX = e.clientX;
        prevY = e.clientY;
        rotSpeedX = 0;
        rotSpeedY = 0;
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - prevX;
        const deltaY = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;

        sealGroup.rotation.y += deltaX * 0.012;
        sealGroup.rotation.x += deltaY * 0.008;

        rotSpeedX = deltaY * 0.004;
        rotSpeedY = deltaX * 0.006;
      };

      const onPointerUp = () => {
        isDragging = false;
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);

      let frameId: number;
      let clock = new THREE.Clock();

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        if (!isDragging) {
          sealGroup.rotation.y += 0.008 + rotSpeedY;
          sealGroup.rotation.x += rotSpeedX;
          rotSpeedX *= 0.94;
          rotSpeedY *= 0.94;
        }

        // Gentle breathing scale and dust float
        dustPoints.rotation.y = -elapsed * 0.15;

        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!canvas) return;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      };
      window.addEventListener("resize", handleResize);

      cleanup = () => {
        window.removeEventListener("resize", handleResize);
        canvas.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        cancelAnimationFrame(frameId);
        renderer.dispose();
        baseGeo.dispose();
        innerBedGeo.dispose();
        waxMat.dispose();
        innerBedMat.dispose();
        ringGeo.dispose();
        goldMat.dispose();
        starCenterGeo.dispose();
        starArmGeo.dispose();
        dustGeo.dispose();
        dustMat.dispose();
      };
    });

    return () => {
      cleanup();
    };
  }, [theme, isSealed]);

  // Audio Toggle
  const toggleAudio = async () => {
    try {
      const playing = await ambientAudioEngine.toggle();
      setIsPlayingAudio(playing);
    } catch (e) {
      console.warn("Audio toggle failed:", e);
    }
  };

  // Unseal Ceremony Execution
  const handleUnseal = () => {
    if (!quizSolved) {
      setQuizError("Please answer the memory trivia question correctly first!");
      return;
    }

    setIsSealed(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: theme === "grimoire" ? ["#5C3317", "#8A5A36", "#F59E0B"] : theme === "fairytale" ? ["#EC4899", "#9333EA", "#F472B6"] : ["#0284C7", "#38BDF8", "#DC2626"],
    });
  };

  // Quiz Verification
  const handleQuizCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizAnswer.trim().toLowerCase().includes("coffee") || quizAnswer.trim().toLowerCase().includes("cafe") || quizAnswer.trim().toLowerCase().includes("baking")) {
      setQuizSolved(true);
      setQuizError(null);
      // Immediately unseal and reveal the keepsake letter upon correct answer
      setIsSealed(false);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: theme === "grimoire" ? ["#5C3317", "#8A5A36", "#F59E0B"] : theme === "fairytale" ? ["#EC4899", "#9333EA", "#F472B6"] : ["#0284C7", "#38BDF8", "#DC2626"],
      });
    } else {
      setQuizError("Incorrect! Hint: It was where we shared our first warm espresso & cinnamon pastry.");
    }
  };

  const themeConfig = {
    grimoire: {
      bg: "bg-[#FAF1E4] border-[#D7BEA8] text-[#3D2C2E]",
      title: "font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#3D1E10]",
      subtextColor: "text-[#5C3317]",
      badge: "bg-[#8A5A36]/15 text-[#5C3317] border-[#8A5A36]/40 font-bold",
      btn: "bg-[#5C3317] hover:bg-[#43220F] text-[#FAF6F0] shadow-[#5C3317]/30 font-bold",
      card: "bg-[#FAF6F0] border-[#D7BEA8] shadow-md",
      headerBorder: "border-[#D7BEA8]/80",
      audioBtn: "bg-black/5 hover:bg-black/10 text-[#43220F] border border-[#D7BEA8]/60 font-semibold",
      triviaHeader: "text-[#5C3317] font-bold",
      questionText: "text-[#2B1810] font-bold",
      input: "bg-white border-[#D7BEA8] text-[#1A0C06] placeholder:text-[#8A5A36]/70 focus:ring-[#8A5A36] font-medium",
      letterBodyText: "text-[#1F110B] font-medium",
      letterSignText: "text-[#3D1E10]",
      rawText: "text-[#3D1E10] bg-[#FAF1E4] border-[#D7BEA8]",
      metaText: "text-[#5C3317] font-medium",
      photoBorder: "border-[#D7BEA8]",
      actNum: 1 as const,
    },
    fairytale: {
      bg: "bg-[#FAF5FF] border-[#F0ABFC] text-[#3B0764]",
      title: "font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#700B36]",
      subtextColor: "text-[#701A75]",
      badge: "bg-[#EC4899]/15 text-[#831843] border-[#F0ABFC]/70 font-bold",
      btn: "bg-gradient-to-r from-[#BE185D] to-[#86198F] hover:from-[#9D174D] hover:to-[#701A75] text-white shadow-pink-900/30 font-bold",
      card: "bg-white border-[#F0ABFC]/70 shadow-md",
      headerBorder: "border-[#F0ABFC]/70",
      audioBtn: "bg-[#FDF4FF] hover:bg-[#FAE8FF] text-[#86198F] border border-[#F0ABFC]/70 font-semibold",
      triviaHeader: "text-[#831843] font-bold",
      questionText: "text-[#2D0621] font-bold",
      input: "bg-white border-[#F0ABFC] text-[#2D0621] placeholder:text-[#9D174D]/60 focus:ring-[#BE185D] font-medium",
      letterBodyText: "text-[#2D0621] font-medium",
      letterSignText: "text-[#831843]",
      rawText: "text-[#4A044E] bg-[#FAF5FF] border-[#F0ABFC]/70",
      metaText: "text-[#831843] font-medium",
      photoBorder: "border-[#F0ABFC]/70",
      actNum: 2 as const,
    },
    cyber: {
      bg: "bg-[#090D16] border-[#1E293B] text-[#F8FAFC]",
      title: "font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#38BDF8]",
      subtextColor: "text-slate-200",
      badge: "bg-[#0284C7]/25 text-[#38BDF8] border-[#0284C7]/60 font-bold",
      btn: "bg-gradient-to-r from-[#0284C7] to-[#DC2626] hover:from-[#0369A1] hover:to-[#B91C1C] text-white shadow-cyan-950/50 font-bold",
      card: "bg-[#0F172A] border-slate-700 shadow-md",
      headerBorder: "border-slate-700",
      audioBtn: "bg-white/10 hover:bg-white/15 text-slate-100 border border-slate-600 font-semibold",
      triviaHeader: "text-[#38BDF8] font-bold",
      questionText: "text-[#F8FAFC] font-bold",
      input: "bg-slate-900 border-slate-700 text-[#F8FAFC] placeholder:text-slate-300 focus:ring-[#38BDF8] font-medium",
      letterBodyText: "text-[#F8FAFC] font-normal",
      letterSignText: "text-[#38BDF8]",
      rawText: "text-slate-100 bg-slate-950 border-slate-700",
      metaText: "text-slate-300 font-medium",
      photoBorder: "border-slate-700",
      actNum: 3 as const,
    },
  }[theme];

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#3D2C2E] font-sans">
      <Navbar activeAct={themeConfig.actNum} />

      {/* Hero Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8A5A36]/10 text-[#5C3317] border border-[#8A5A36]/30 text-xs font-semibold mb-6">
          <Gift className="w-3.5 h-3.5 text-[#8A5A36]" />
          <span>Interactive Recipient Unboxing Sandbox</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-serif-display font-extrabold text-[#3D2C2E] max-w-4xl mx-auto leading-tight">
          Experience a <span className="font-salted text-5xl sm:text-7xl text-[#5C3317] block sm:inline">Sanctum Moment</span> Unboxing
        </h1>

        <p className="mt-4 text-base sm:text-lg text-[#6B5242] max-w-2xl mx-auto font-sans-ui">
          This is an actual live preview of how recipients receive, unseal, and experience a shared keepsake memory link.
        </p>

        {/* Live Theme Switcher Bar */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-3 p-2 rounded-2xl bg-[#FAF1E4] border border-[#D7BEA8] max-w-xl mx-auto shadow-sm">
          <span className="text-xs font-bold text-[#8A5A36] uppercase tracking-wider px-2">Theme:</span>
          {(["grimoire", "fairytale", "cyber"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                theme === t
                  ? "bg-[#5C3317] text-white shadow-md scale-105"
                  : "text-[#6B5242] hover:bg-black/5"
              }`}
            >
              {t === "grimoire" ? "Vintage Grimoire" : t === "fairytale" ? "Fairy Tale Love" : "Kinetic Cyber"}
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Moment Card Container */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className={`rounded-3xl p-6 sm:p-10 border shadow-2xl transition-all duration-700 relative overflow-hidden ${themeConfig.bg}`}>
          
          {/* Card Top Header */}
          <div className={`flex flex-wrap items-center justify-between gap-4 pb-6 border-b ${themeConfig.headerBorder} mb-8`}>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${themeConfig.badge}`}>
                Sanctum Moment · Birthday & Gratitude
              </span>
            </div>

            {/* Ambient Sound Toggle */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${themeConfig.audioBtn}`}
            >
              {isPlayingAudio ? <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" /> : <VolumeX className="w-4 h-4 opacity-70" />}
              <span>{isPlayingAudio ? "Ambient Sound Playing" : "Play Ambient Soundtrack"}</span>
            </button>
          </div>

          {/* Locked Sealed State vs Unsealed Letter Content */}
          {isSealed ? (
            <div className="space-y-8 text-center py-6">
              <div className="max-w-md mx-auto space-y-3">
                <span className={`text-xs font-mono uppercase font-bold tracking-widest ${themeConfig.triviaHeader}`}>
                  Sealed Memory Keepsake
                </span>
                <h2 className={themeConfig.title}>
                  For Eleanor, On Your Birthday
                </h2>
                <p className={`text-sm font-note text-lg ${themeConfig.subtextColor}`}>
                  &quot;A collection of warmth, laughter, and an autumn promise...&quot;
                </p>
              </div>

              {/* 3D Wax Seal Canvas */}
              <div className={`w-72 h-72 mx-auto relative rounded-3xl overflow-hidden flex items-center justify-center shadow-inner border ${theme === "cyber" ? "bg-slate-950/80 border-slate-800" : "bg-black/5 border-[#D7BEA8]/50"}`}>
                <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" onClick={handleUnseal} />
                <span className="absolute bottom-2 text-[10px] font-mono opacity-85 bg-black/60 text-amber-200 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                  Drag 3D to orbit · Click to unseal
                </span>
              </div>

              {/* Memory Trivia Quiz Widget */}
              <div className={`p-6 sm:p-7 rounded-2xl border max-w-lg mx-auto text-left space-y-4 ${themeConfig.card}`}>
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${themeConfig.triviaHeader}`}>
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Memory Trivia Verification</span>
                </div>

                <p className={`text-sm sm:text-base font-bold leading-relaxed ${themeConfig.questionText}`}>
                  Question: Where did we share our very first autumn espresso pastry back in 2022?
                </p>

                <form onSubmit={handleQuizCheck} className="flex gap-2">
                  <input
                    type="text"
                    value={quizAnswer}
                    onChange={(e) => setQuizAnswer(e.target.value)}
                    placeholder="Type answer (e.g. coffee shop, cafe)..."
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 shadow-xs ${themeConfig.input}`}
                  />
                  <button
                    type="submit"
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${themeConfig.btn}`}
                  >
                    Verify
                  </button>
                </form>

                {quizSolved && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-100/90 p-3 rounded-xl border border-emerald-400/60 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                    <span>Identity Verified! You may now break the wax seal above.</span>
                  </div>
                )}

                {quizError && (
                  <p className="text-xs font-semibold text-rose-950 bg-rose-100/90 p-3 rounded-xl border border-rose-300 shadow-xs">
                    {quizError}
                  </p>
                )}
              </div>

              {/* Unseal CTA Button */}
              <button
                onClick={handleUnseal}
                className={`px-8 py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${themeConfig.btn}`}
              >
                <Unlock className="w-4 h-4" />
                <span>Break Wax Seal & Unbox Keepsake</span>
              </button>
            </div>
          ) : (
            /* Unsealed Letter & Memory Showcase */
            <div className="space-y-8 animate-fadeIn">
              
              {/* Header Title & Raw/Polished Toggle */}
              <div className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${themeConfig.headerBorder}`}>
                <div>
                  <h2 className={themeConfig.title}>
                    Celebrating You, Eleanor
                  </h2>
                  <p className={`text-xs font-mono font-medium mt-1 ${themeConfig.metaText}`}>
                    Inscribed by Julian · Sealed Autumn 2022
                  </p>
                </div>

                <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${theme === "cyber" ? "bg-slate-900 border-slate-800" : "bg-black/5 border-[#D7BEA8]/40"}`}>
                  <button
                    onClick={() => setShowRaw(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !showRaw
                        ? `${themeConfig.btn} shadow-xs`
                        : `${theme === "cyber" ? "text-slate-400 hover:text-white" : "text-[#8A5A36] hover:text-[#5C3317]"}`
                    }`}
                  >
                    Gemini Polished
                  </button>
                  <button
                    onClick={() => setShowRaw(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      showRaw
                        ? `${themeConfig.btn} shadow-xs`
                        : `${theme === "cyber" ? "text-slate-400 hover:text-white" : "text-[#8A5A36] hover:text-[#5C3317]"}`
                    }`}
                  >
                    Raw Draft
                  </button>
                </div>
              </div>

              {/* Letter Prose Body */}
              <div className={`p-8 rounded-2xl border ${themeConfig.card} shadow-sm font-serif-display text-base sm:text-lg leading-relaxed ${themeConfig.letterBodyText} space-y-4`}>
                {!showRaw ? (
                  <>
                    <p className={themeConfig.letterBodyText}>
                      Eleanor, looking back over the years, the quietest afternoons always hold the brightest warmth. From that crisp autumn coffee shop in 2022 to every shared triumph since, your steadfast kindness has been an anchor.
                    </p>
                    <p className={themeConfig.letterBodyText}>
                      On this birthday, I wanted to bind these reflections into something lasting—a living testament to our friendship, held safely in time.
                    </p>
                    <p className={`font-note text-2xl font-bold pt-3 ${themeConfig.letterSignText}`}>
                      With unending warmth and gratitude, — Julian
                    </p>
                  </>
                ) : (
                  <div className={`p-4 rounded-xl border font-mono text-xs leading-relaxed ${themeConfig.rawText}`}>
                    [RAW UNEDITED DRAFT]: Eleanor, happy bday! remember that coffee shop back in 2022? u have always been such a great friend and i wanted to send u something special today. thanks for everything bro!
                  </div>
                )}
              </div>

              {/* Photo Lightbox Gallery */}
              <div className="space-y-3">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${themeConfig.triviaHeader}`}>
                  <ImageIcon className="w-4 h-4" />
                  <span>Memory Photos Attached</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { url: "https://picsum.photos/seed/moment1/800/600", title: "Autumn Coffee Shop 2022" },
                    { url: "https://picsum.photos/seed/moment2/800/600", title: "Sunset Walk" },
                    { url: "https://picsum.photos/seed/moment3/800/600", title: "Birthday Celebration" },
                  ].map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPhoto(img.url)}
                      className={`group relative rounded-2xl overflow-hidden aspect-4/3 cursor-pointer border ${themeConfig.photoBorder} shadow-md hover:scale-[1.03] transition-transform`}
                    >
                      <Image
                        src={img.url}
                        alt={img.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
                        referrerPolicy="no-referrer"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold p-2 text-center z-10">
                        <Maximize2 className="w-4 h-4 mb-1" />
                        <span className="block">{img.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reseal Toggle Button */}
              <div className={`pt-4 border-t ${themeConfig.headerBorder} flex justify-between items-center`}>
                <button
                  onClick={() => setIsSealed(true)}
                  className={`text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer ${themeConfig.triviaHeader}`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reseal Memory for Demo</span>
                </button>

                <Link
                  href="/signup"
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${themeConfig.btn}`}
                >
                  <span>Create Your Own Keepsake</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-3xl w-full h-[70vh] rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <Image
              src={selectedPhoto}
              alt="Enlarged Memory Photo"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 768px"
              referrerPolicy="no-referrer"
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* CTA Footer */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-8 rounded-3xl bg-[#FAF1E4] border border-[#D7BEA8] space-y-4 shadow-lg">
          <h3 className="text-2xl font-serif-display font-bold text-[#3D2C2E]">
            Send a Sealed Keepsake to Someone You Cherish
          </h3>
          <p className="text-xs sm:text-sm text-[#6B5242] max-w-lg mx-auto font-sans-ui">
            Free forever for your personal journal entries and Sanctum Moments.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#5C3317] text-white font-bold text-sm hover:bg-[#43220F] transition-all shadow-md"
          >
            <span>Start Journaling Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer activeAct={themeConfig.actNum} />
    </div>
  );
}
