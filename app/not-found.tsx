"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Compass, Sparkles, BookOpen, Atom, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Particle {
  id: number;
  type: number;
  top: string;
  left: string;
}

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const coreIconRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Client-side particle state to eliminate SSR hydration mismatches
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particle positions strictly on client mount
    const generated: Particle[] = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      type: i % 3,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }));
    setParticles(generated);
  }, []);

  // THREE.JS 3D QUANTUM VORTEX BACKGROUND CANVAS
  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return;

    let cleanup = () => {};

    import("three").then((THREE) => {
      if (!canvasRef.current) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Create 3D Volumetric Particle Vortex Swarm
      const particleCount = 1200;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const cyan = new THREE.Color("#06B6D4");
      const magenta = new THREE.Color("#E0E7FF");
      const gold = new THREE.Color("#F59E0B");

      for (let i = 0; i < particleCount; i++) {
        const radius = 2 + Math.random() * 6;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;

        positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
        positions[i * 3 + 1] = radius * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

        const mixedColor = i % 3 === 0 ? cyan : i % 3 === 1 ? magenta : gold;
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });

      const particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);

      // Resize Handler
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", handleResize);

      // Animation Loop
      let animationFrameId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        particleSystem.rotation.y = elapsedTime * 0.12;
        particleSystem.rotation.x = Math.sin(elapsedTime * 0.08) * 0.2;
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();

      cleanup = () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animationFrameId);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    });

    return () => {
      cleanup();
    };
  }, []);

  // GSAP TIMELINE & FLOATING ANOMALY CONTROLLER
  useEffect(() => {
    if (particles.length === 0 || typeof window === "undefined") return;

    let ctxRevert = () => {};

    import("gsap").then(({ default: gsap }) => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          portalRef.current,
          { scale: 0, rotate: -180, opacity: 0 },
          { scale: 1, rotate: 0, opacity: 1, duration: 1.4 }
        )
          .fromTo(
            coreIconRef.current,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
            "-=0.6"
          )
          .fromTo(
            textContainerRef.current?.children || [],
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
            "-=0.4"
          );

        gsap.to(portalRef.current, {
          rotate: 360,
          duration: 30,
          repeat: -1,
          ease: "none",
        });

        gsap.to(coreIconRef.current, {
          y: -14,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        if (particlesRef.current) {
          const particleEls = Array.from(particlesRef.current.children);
          particleEls.forEach((p) => {
            gsap.to(p, {
              y: `-=${gsap.utils.random(40, 120)}`,
              x: `+=${gsap.utils.random(-40, 40)}`,
              opacity: gsap.utils.random(0.3, 1),
              scale: gsap.utils.random(0.8, 1.8),
              duration: gsap.utils.random(3, 7),
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              delay: gsap.utils.random(0, 2),
            });
          });
        }
      }, containerRef);

      ctxRevert = () => ctx.revert();
    });

    return () => {
      ctxRevert();
    };
  }, [particles]);

  return (
    <main
      ref={containerRef}
      className="h-screen w-screen overflow-hidden bg-[#03050B] text-[#E2E8F0] flex flex-col items-center justify-center p-6 relative font-sans select-none"
    >
      {/* THREE.JS BACKGROUND CANVAS */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none w-full h-full"
      />

      {/* HIGH-INTENSITY LIGHTING & LIGHT-LEAK GLOWS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-cyan-500/20 blur-[150px]" />
        <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-fuchsia-600/20 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-cyan-600/30 via-purple-600/30 to-pink-600/30 blur-[110px] opacity-80" />
      </div>

      {/* FLOATING PARTICLES LAYER */}
      <div
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute w-1.5 h-1.5 rounded-full ${
              p.type === 0
                ? "bg-cyan-400 shadow-[0_0_12px_#06B6D4]"
                : p.type === 1
                ? "bg-fuchsia-400 shadow-[0_0_12px_#E0E7FF]"
                : "bg-amber-300 shadow-[0_0_12px_#F59E0B]"
            }`}
            style={{ top: p.top, left: p.left }}
          />
        ))}
      </div>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="relative z-10 max-w-xl w-full text-center flex flex-col items-center">
        {/* ISEKAI PORTAL WITH GIF OVERLAY & THREE.JS GLOW */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Animated Quantum Hole / Portal Glow Background */}
          <div className="absolute w-60 h-60 rounded-full overflow-hidden opacity-50 mix-blend-screen pointer-events-none bg-gradient-to-tr from-cyan-500/30 via-fuchsia-500/20 to-amber-400/20 animate-pulse blur-xl" />

          {/* Outer Rotating Arcana Ring */}
          <div
            ref={portalRef}
            className="w-48 h-48 rounded-full border-2 border-dashed border-cyan-400/60 shadow-[0_0_70px_rgba(6,182,212,0.5)] flex items-center justify-center relative backdrop-blur-2xl bg-slate-950/40"
          >
            <div className="absolute inset-3 rounded-full border border-fuchsia-500/40 shadow-[inset_0_0_25px_rgba(217,70,239,0.35)] animate-pulse" />
          </div>

          {/* Floating Central Artifact Core */}
          
        </div>

        {/* CONTENT BLOCK */}
        <div ref={textContainerRef} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
            <span>Dimensions Fractured &bull; Void 404</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-amber-200 drop-shadow-[0_0_35px_rgba(255,255,255,0.3)]">
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
              onClick={() => window.history.back()}
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