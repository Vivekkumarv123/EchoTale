"use client";

import * as React from "react";
import { Wand2, Zap, Sparkles, Shield, Flame, Stars } from "lucide-react";

interface ThemeTransitionFXProps {
  activeAct: 1 | 2 | 3;
  transitionEvent: {
    from: 1 | 2 | 3;
    to: 1 | 2 | 3;
    direction: "down" | "up";
    id: number;
  } | null;
}

export function ThemeTransitionFX({ activeAct, transitionEvent }: ThemeTransitionFXProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const wandRef = React.useRef<HTMLDivElement | null>(null);
  const blastRef = React.useRef<HTMLDivElement | null>(null);

  // Fog & Plasma Canvas Particle System
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle types: 'fog', 'stardust', 'lightning', 'spark', 'shockwave'
    interface FXParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      maxAlpha: number;
      life: number;
      maxLife: number;
      color: string;
      type: "fog" | "stardust" | "spark" | "lightning" | "shockwave";
      rotation?: number;
      rotSpeed?: number;
    }

    const particles: FXParticle[] = [];

    // Trigger Fairytale Fog & Stardust
    const spawnFairytaleFog = (direction: "down" | "up") => {
      const colors = ["#F0ABFC", "#E879F9", "#F472B6", "#FDE047", "#DDD6FE", "#FFFFFF"];
      const startX = direction === "down" ? -50 : width + 50;

      // Create sweeping fog clouds
      for (let i = 0; i < 35; i++) {
        particles.push({
          x: direction === "down" ? Math.random() * (width * 0.4) : width - Math.random() * (width * 0.4),
          y: Math.random() * height,
          vx: direction === "down" ? (Math.random() * 4 + 2) : -(Math.random() * 4 + 2),
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 180 + 120,
          alpha: 0.01,
          maxAlpha: Math.random() * 0.35 + 0.15,
          life: 0,
          maxLife: Math.random() * 80 + 70,
          color: colors[Math.floor(Math.random() * 3)],
          type: "fog",
        });
      }

      // Create sparkling stardust
      for (let i = 0; i < 80; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3 - 1,
          size: Math.random() * 4 + 2,
          alpha: 0.1,
          maxAlpha: Math.random() * 0.8 + 0.2,
          life: 0,
          maxLife: Math.random() * 60 + 50,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: "stardust",
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1,
        });
      }
    };

    // Trigger Superhero Mechanical Blast & Lightning
    const spawnSuperheroBlast = () => {
      const colors = ["#38BDF8", "#0284C7", "#EF4444", "#F97316", "#FFFFFF", "#60A5FA"];
      const centerX = width / 2;
      const centerY = height / 2;

      // Radial Shockwaves
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: centerX,
          y: centerY,
          vx: 0,
          vy: 0,
          size: 10 + i * 40,
          alpha: 0.8,
          maxAlpha: 0.8,
          life: 0,
          maxLife: 45 + i * 10,
          color: i % 2 === 0 ? "#38BDF8" : "#EF4444",
          type: "shockwave",
        });
      }

      // High velocity kinetic energy sparks
      for (let i = 0; i < 120; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 1.5,
          alpha: 1,
          maxAlpha: 1,
          life: 0,
          maxLife: Math.random() * 50 + 30,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: "spark",
        });
      }

      // Lightning arcs
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 2,
          alpha: 0.9,
          maxAlpha: 0.9,
          life: 0,
          maxLife: 25,
          color: "#38BDF8",
          type: "lightning",
        });
      }
    };

    // Animation Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Alpha envelope calculation
        const halfLife = p.maxLife / 2;
        if (p.life < halfLife) {
          p.alpha = (p.life / halfLife) * p.maxAlpha;
        } else {
          p.alpha = ((p.maxLife - p.life) / halfLife) * p.maxAlpha;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.type === "fog") {
          // Soft glowing mist cloud
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, "transparent");

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (p.type === "stardust") {
          // 4-point star sparkle
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined && p.rotSpeed !== undefined) {
            p.rotation += p.rotSpeed;
            ctx.rotate(p.rotation);
          }
          ctx.beginPath();
          ctx.moveTo(-p.size * 2, 0);
          ctx.quadraticCurveTo(0, 0, 0, -p.size * 2);
          ctx.quadraticCurveTo(0, 0, p.size * 2, 0);
          ctx.quadraticCurveTo(0, 0, 0, p.size * 2);
          ctx.quadraticCurveTo(0, 0, -p.size * 2, 0);
          ctx.fill();
          ctx.restore();
        } else if (p.type === "shockwave") {
          // Expanding kinetic ring
          p.size += 18;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1, 6 * (1 - p.life / p.maxLife));
          ctx.shadowBlur = 15;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else if (p.type === "spark") {
          // High-speed cyber sparks with motion blur tail
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
          ctx.stroke();
          ctx.restore();
        } else if (p.type === "lightning") {
          // Jagged electric discharge
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#38BDF8";
          ctx.beginPath();
          let lx = p.x;
          let ly = p.y;
          ctx.moveTo(lx, ly);
          for (let step = 0; step < 5; step++) {
            lx += (Math.random() - 0.5) * 60;
            ly += (Math.random() - 0.5) * 60;
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    // Trigger on transition event changes
    if (transitionEvent) {
      const { from, to, direction } = transitionEvent;
      if (to === 2 || (from === 2 && to === 1)) {
        spawnFairytaleFog(direction);
      }
      if (to === 3 || (from === 3 && to === 2)) {
        spawnSuperheroBlast();
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [transitionEvent]);

  // Magical Wand Swing Animation with GSAP
  React.useEffect(() => {
    if (!transitionEvent) return;

    import("gsap").then(({ gsap }) => {
      if (
        (transitionEvent.from === 1 && transitionEvent.to === 2) ||
        (transitionEvent.from === 3 && transitionEvent.to === 2) ||
        (transitionEvent.from === 2 && transitionEvent.to === 1)
      ) {
        const wandEl = wandRef.current;
        if (wandEl) {
          const isDown = transitionEvent.direction === "down";
          gsap.killTweensOf(wandEl);

          gsap.fromTo(
            wandEl,
            {
              display: "flex",
              x: isDown ? -180 : window.innerWidth + 80,
              y: window.innerHeight * 0.35,
              rotation: isDown ? -45 : 45,
              scale: 0.7,
              opacity: 0,
            },
            {
              x: isDown ? window.innerWidth + 120 : -120,
              y: window.innerHeight * 0.45,
              rotation: isDown ? 35 : -35,
              scale: 1.25,
              opacity: 1,
              duration: 1.35,
              ease: "power2.inOut",
              onComplete: () => {
                gsap.set(wandEl, { display: "none", opacity: 0 });
              },
            }
          );
        }
      }

      // Superhero Mechanical Blast Overlay with GSAP
      if (
        (transitionEvent.from === 2 && transitionEvent.to === 3) ||
        (transitionEvent.from === 1 && transitionEvent.to === 3)
      ) {
        const blastEl = blastRef.current;
        if (blastEl) {
          gsap.killTweensOf(blastEl);

          gsap.fromTo(
            blastEl,
            {
              display: "flex",
              scale: 0.2,
              opacity: 1,
              filter: "brightness(2) contrast(1.5)",
            },
            {
              scale: 2.8,
              opacity: 0,
              filter: "brightness(1) contrast(1)",
              duration: 1.1,
              ease: "expo.out",
              onComplete: () => {
                gsap.set(blastEl, { display: "none", opacity: 0 });
              },
            }
          );
        }
      }
    });
  }, [transitionEvent]);

  return (
    <>
      {/* Full-screen dynamic canvas for rolling fog, lightning, shockwaves, and stardust */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[40]"
      />

      {/* Magical Wand Swing Element (Act 2 Transition) */}
      <div
        ref={wandRef}
        className="fixed top-0 left-0 pointer-events-none z-[45] hidden items-center justify-center opacity-0"
        style={{ transformOrigin: "bottom center" }}
      >
        <div className="relative flex flex-col items-center">
          {/* Glowing Wand Starburst Tip */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-pink-400 via-fuchsia-300 to-amber-200 flex items-center justify-center shadow-[0_0_50px_#F0ABFC] animate-pulse">
            <Wand2 className="w-9 h-9 text-white drop-shadow-md" />
            <Stars className="w-6 h-6 text-amber-200 absolute -top-2 -right-2 animate-spin" style={{ animationDuration: "3s" }} />
            <Sparkles className="w-5 h-5 text-pink-100 absolute -bottom-1 -left-1 animate-bounce" />
          </div>
          {/* Wand Scepter Shaft with Gold Inlay */}
          <div className="w-3 h-32 bg-gradient-to-b from-amber-200 via-rose-300 to-purple-800 rounded-full shadow-lg border border-amber-100/60 mt-1" />
          {/* Luminous Star Ribbon Trail */}
          <div className="absolute -left-10 top-0 w-36 h-36 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Superhero Mechanical Blast Core (Act 3 Transition) */}
      <div
        ref={blastRef}
        className="fixed inset-0 m-auto w-96 h-96 pointer-events-none z-[45] hidden items-center justify-center opacity-0"
      >
        {/* Arc Reactor Blast Center */}
        <div className="relative w-72 h-72 rounded-full border-4 border-sky-400/80 bg-sky-950/40 backdrop-blur-sm flex items-center justify-center shadow-[0_0_100px_#38BDF8]">
          {/* Rotating Cyber Reticle Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-rose-500/90 animate-spin" style={{ animationDuration: "2s" }} />
          <div className="absolute -inset-6 rounded-full border border-sky-300/40 animate-ping" style={{ animationDuration: "1s" }} />

          <div className="flex flex-col items-center justify-center gap-1 z-10 text-center">
            <Zap className="w-16 h-16 text-sky-300 animate-pulse drop-shadow-[0_0_20px_#38BDF8]" />
            <span className="font-mono text-xs tracking-widest text-sky-200 uppercase font-bold">
              ARMOR CORE ENGAGED
            </span>
          </div>

          {/* Elemental Flame & Shield Accents */}
          <Shield className="w-8 h-8 text-rose-400 absolute -top-4 -right-4" />
          <Flame className="w-8 h-8 text-amber-400 absolute -bottom-4 -left-4 animate-bounce" />
        </div>
      </div>
    </>
  );
}
