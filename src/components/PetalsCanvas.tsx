import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface PetalsCanvasProps {
  trigger?: boolean;
}

const burstPoints = [
  { x: 0.5, y: 0.4, at: 0 },
  { x: 0.17, y: 0.29, at: 220 },
  { x: 0.83, y: 0.33, at: 420 },
  { x: 0.33, y: 0.56, at: 920 },
  { x: 0.7, y: 0.52, at: 1180 },
];

const colors = ["#C8A96A", "#F8F2E8", "#D8B6B0", "#A88950", "#FFF9F0"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

export function PetalsCanvas({ trigger = false }: PetalsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!trigger || shouldReduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const onResize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    onResize();
    window.addEventListener("resize", onResize);

    const getW = () => window.innerWidth;
    const getH = () => window.innerHeight;

    const fired = new Set<number>();
    let particles: Particle[] = [];
    let animId = 0;
    const startTime = performance.now();
    let lastTime = startTime;

    const spawnBurst = (nx: number, ny: number) => {
      const bx = nx * getW();
      const by = ny * getH();
      for (let i = 0; i < 44; i++) {
        const angle = (Math.PI * 2 * i) / 44;
        const speed = 80 + Math.random() * 170;
        particles.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          size: 1.3 + Math.random() * 1.6,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const elapsed = now - startTime;

      burstPoints.forEach((point, idx) => {
        if (!fired.has(idx) && elapsed >= point.at) {
          fired.add(idx);
          spawnBurst(point.x, point.y);
        }
      });

      ctx.clearRect(0, 0, getW(), getH());
      ctx.globalCompositeOperation = "lighter";

      particles = particles.filter((p) => p.life > 0);
      particles.forEach((p) => {
        p.vy += 130 * dt;
        p.vx *= 0.994;
        p.vy *= 0.994;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 0.42;

        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (elapsed < 2800 || particles.length > 0) {
        animId = requestAnimationFrame(tick);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [trigger, shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70]"
    />
  );
}
