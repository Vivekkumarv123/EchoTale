"use client";

import * as React from "react";

interface ThemeCursorOverlayProps {
  activeAct: 1 | 2 | 3;
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface CyberRipple {
  id: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

export function ThemeCursorOverlay({ activeAct }: ThemeCursorOverlayProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const mousePosRef = React.useRef<{ x: number; y: number; prevX: number; prevY: number; speed: number }>({
    x: -100,
    y: -100,
    prevX: -100,
    prevY: -100,
    speed: 0,
  });

  const sparklesRef = React.useRef<SparkleParticle[]>([]);
  const ripplesRef = React.useRef<CyberRipple[]>([]);
  const nextIdRef = React.useRef(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const prevX = mousePosRef.current.x;
      const prevY = mousePosRef.current.y;
      const dx = clientX - prevX;
      const dy = clientY - prevY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      mousePosRef.current.prevX = prevX;
      mousePosRef.current.prevY = prevY;
      mousePosRef.current.x = clientX;
      mousePosRef.current.y = clientY;
      mousePosRef.current.speed = speed;

      // Act 1: Spawn fairy dust / golden spark particles on mouse movement
      if (activeAct === 1) {
        const count = Math.min(4, Math.max(1, Math.floor(speed / 8)));
        for (let i = 0; i < count; i++) {
          const isGold = Math.random() > 0.4;
          sparklesRef.current.push({
            id: nextIdRef.current++,
            x: clientX + (Math.random() - 0.5) * 16,
            y: clientY + (Math.random() - 0.5) * 16,
            size: Math.random() * 5 + 2,
            color: isGold ? "#F59E0B" : Math.random() > 0.5 ? "#EC4899" : "#C084FC",
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.8, // drift gently upwards
            life: 0,
            maxLife: Math.random() * 30 + 25,
          });
        }
      }

      // Act 2: Spawn neon shockwave ripples when moving fast
      if (activeAct === 2 && speed > 10) {
        if (ripplesRef.current.length < 8) {
          ripplesRef.current.push({
            id: nextIdRef.current++,
            x: clientX,
            y: clientY,
            radius: 8,
            opacity: 0.85,
          });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;

      if (mx > 0 && my > 0) {
        // =====================================================================
        // ACT 1: Soft Candlelight Fairy Aura & Sparkles
        // =====================================================================
        if (activeAct === 1) {
          // Ambient warm cursor glow
          const radialGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 90);
          radialGlow.addColorStop(0, "rgba(245, 158, 11, 0.18)");
          radialGlow.addColorStop(0.5, "rgba(236, 72, 153, 0.08)");
          radialGlow.addColorStop(1, "rgba(245, 158, 11, 0)");
          ctx.fillStyle = radialGlow;
          ctx.beginPath();
          ctx.arc(mx, my, 90, 0, Math.PI * 2);
          ctx.fill();

          // Sparkle particles
          sparklesRef.current.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life++;
            const progress = p.life / p.maxLife;
            const alpha = 1 - progress;

            ctx.save();
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, alpha);

            // Draw 4-point star sparkle
            const r = p.size * (1 - progress * 0.5);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - r);
            ctx.lineTo(p.x + r * 0.3, p.y - r * 0.3);
            ctx.lineTo(p.x + r, p.y);
            ctx.lineTo(p.x + r * 0.3, p.y + r * 0.3);
            ctx.lineTo(p.x, p.y + r);
            ctx.lineTo(p.x - r * 0.3, p.y + r * 0.3);
            ctx.lineTo(p.x - r, p.y);
            ctx.lineTo(p.x - r * 0.3, p.y - r * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          });

          sparklesRef.current = sparklesRef.current.filter((p) => p.life < p.maxLife);
        }

        // =====================================================================
        // ACT 2: Holographic Cyber HUD Cursor & Neon Shockwave Ripples
        // =====================================================================
        else if (activeAct === 2) {
          // Neon cyan & magenta cursor reticle
          ctx.save();
          ctx.strokeStyle = "#00E5FF";
          ctx.lineWidth = 1.5;
          ctx.shadowColor = "#00E5FF";
          ctx.shadowBlur = 10;

          // Outer rotating HUD ring
          const time = performance.now() * 0.003;
          ctx.beginPath();
          ctx.arc(mx, my, 22, time, time + Math.PI * 1.5);
          ctx.stroke();

          ctx.strokeStyle = "#EC4899";
          ctx.shadowColor = "#EC4899";
          ctx.beginPath();
          ctx.arc(mx, my, 14, -time, -time + Math.PI * 1.2);
          ctx.stroke();

          // Crosshair notches
          ctx.strokeStyle = "#38BDF8";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(mx - 28, my);
          ctx.lineTo(mx - 20, my);
          ctx.moveTo(mx + 20, my);
          ctx.lineTo(mx + 28, my);
          ctx.moveTo(mx, my - 28);
          ctx.lineTo(mx, my - 20);
          ctx.moveTo(mx, my + 20);
          ctx.lineTo(mx, my + 28);
          ctx.stroke();
          ctx.restore();

          // Shockwave ripples
          ripplesRef.current.forEach((r) => {
            r.radius += 3.2;
            r.opacity -= 0.035;

            ctx.save();
            ctx.strokeStyle = "#00E5FF";
            ctx.shadowColor = "#00E5FF";
            ctx.shadowBlur = 12;
            ctx.lineWidth = 2;
            ctx.globalAlpha = Math.max(0, r.opacity);
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          });

          ripplesRef.current = ripplesRef.current.filter((r) => r.opacity > 0);
        }

        // =====================================================================
        // ACT 3: Refined Minimalist Slate Spotlight & Ambient Sepia Focus
        // =====================================================================
        else if (activeAct === 3) {
          // Sophisticated subtle spotlight
          const spotGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 130);
          spotGrad.addColorStop(0, "rgba(56, 189, 248, 0.12)");
          spotGrad.addColorStop(0.6, "rgba(212, 175, 55, 0.05)");
          spotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = spotGrad;
          ctx.beginPath();
          ctx.arc(mx, my, 130, 0, Math.PI * 2);
          ctx.fill();

          // Sleek minimal ring
          ctx.save();
          ctx.strokeStyle = "rgba(226, 232, 240, 0.5)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(mx, my, 12, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = "#38BDF8";
          ctx.beginPath();
          ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [activeAct]);

  return (
    <canvas
      ref={canvasRef}
      id="theme-cursor-overlay-canvas"
      className="fixed inset-0 pointer-events-none z-[4] w-full h-full"
      aria-hidden="true"
    />
  );
}
