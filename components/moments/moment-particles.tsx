"use client";

import * as React from "react";
import type { MomentOccasion } from "@/lib/moments-types";

interface MomentParticlesProps {
  occasion: MomentOccasion;
  className?: string;
  density?: "low" | "medium" | "high";
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  vRot: number;
  type: "heart" | "confetti" | "sparkle" | "leaf" | "star" | "mist";
  seed: number;
}

export default function MomentParticles({
  occasion,
  className = "",
  density = "medium",
}: MomentParticlesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const countMap = { low: 25, medium: 45, high: 75 };
    const count = countMap[density];

    const colorsMap: Record<MomentOccasion, string[]> = {
      love: ["#FB7185", "#F43F5E", "#FDA4AF", "#E11D48", "#FFE4E6"],
      birthday: ["#F59E0B", "#FBBF24", "#EC4899", "#38BDF8", "#10B981", "#8B5CF6"],
      apology: ["#C084FC", "#A855F7", "#E9D5FF", "#94A3B8", "#CBD5E1"],
      family: ["#F59E0B", "#D97706", "#84CC16", "#EAB308", "#FED7AA"],
      missing: ["#38BDF8", "#818CF8", "#60A5FA", "#E0F2FE", "#C7D2FE"],
    };

    const typeMap: Record<MomentOccasion, Particle["type"]> = {
      love: "heart",
      birthday: "confetti",
      apology: "mist",
      family: "leaf",
      missing: "star",
    };

    const particles: Particle[] = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: occasion === "love" ? -0.4 - Math.random() * 0.6 : (Math.random() - 0.5) * 0.8,
      size: Math.random() * 8 + 4,
      color: colorsMap[occasion][Math.floor(Math.random() * colorsMap[occasion].length)],
      alpha: Math.random() * 0.6 + 0.2,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.04,
      type: typeMap[occasion],
      seed: Math.random() * 100,
    }));

    function drawHeart(c: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number, rot: number) {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(0, topCurveHeight);
      c.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      c.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.2);
      c.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      c.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      c.closePath();
      c.fill();
      c.restore();
    }

    function drawConfetti(c: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number, rot: number) {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.fillRect(-size / 2, -size / 4, size, size * 0.6);
      c.restore();
    }

    function drawStar(c: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number, rot: number) {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.shadowBlur = 8;
      c.shadowColor = color;
      c.beginPath();
      c.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      c.fill();

      // Subtle cross shine
      c.strokeStyle = color;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-size, 0);
      c.lineTo(size, 0);
      c.moveTo(0, -size);
      c.lineTo(0, size);
      c.stroke();
      c.restore();
    }

    function drawLeaf(c: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number, rot: number) {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.globalAlpha = alpha;
      c.fillStyle = color;
      c.beginPath();
      c.ellipse(0, 0, size * 0.8, size * 0.4, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    function drawMist(c: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha: number) {
      c.save();
      c.globalAlpha = alpha * 0.5;
      const grad = c.createRadialGradient(x, y, 0, x, y, size * 2.5);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "transparent");
      c.fillStyle = grad;
      c.beginPath();
      c.arc(x, y, size * 2.5, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    let t = 0;
    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx + Math.sin(t + p.seed) * 0.3;
        p.y += p.vy;
        p.rotation += p.vRot;

        // Wrap around bounds
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        switch (p.type) {
          case "heart":
            drawHeart(ctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);
            break;
          case "confetti":
            drawConfetti(ctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);
            break;
          case "star":
            drawStar(ctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);
            break;
          case "leaf":
            drawLeaf(ctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);
            break;
          case "mist":
            drawMist(ctx, p.x, p.y, p.size, p.color, p.alpha);
            break;
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [occasion, density]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-10 w-full h-full ${className}`}
    />
  );
}
