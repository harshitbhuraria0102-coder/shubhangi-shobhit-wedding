import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface CrackersCanvasProps {
  burstKey: number;
  active: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

interface CrackerRocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  colorPalette: string[];
  exploded: boolean;
  style: "chrysanthemum" | "willow" | "ring";
  trail: { x: number; y: number }[];
}

interface CrackerSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  coreColor: string;
  size: number;
  gravity: number;
  drag: number;
  twinkleOffset: number;
  willow: boolean;
  trail: { x: number; y: number }[];
}

const PALETTES: string[][] = [
  ["#D49B27", "#B87A14", "#FFF0B3"], // Imperial Gold
  ["#B82546", "#8B1734", "#FFD1DC"], // Royal Crimson
  ["#E0741F", "#B54E0C", "#FFE1A8"], // Festive Amber & Marigold
  ["#C8A96A", "#9E7834", "#FFF8DC"], // Champagne Gold
  ["#287D5C", "#1B5E44", "#B8F2D8"], // Jewel Emerald Accent
];

export function CrackersCanvas({
  burstKey,
  active,
  anchorRef,
}: CrackersCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!active || burstKey === 0 || shouldReduceMotion) return;

    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = parent.clientWidth;
    let height = parent.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    const rockets: CrackerRocket[] = [];
    const sparks: CrackerSpark[] = [];

    const getAnchorBox = () => {
      const parentRect = parent.getBoundingClientRect();
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      if (!anchorRect) {
        return {
          left: width * 0.18,
          right: width * 0.82,
          top: height * 0.22,
          bottom: height * 0.8,
          cx: width * 0.5,
          cy: height * 0.52,
        };
      }
      return {
        left: anchorRect.left - parentRect.left,
        right: anchorRect.right - parentRect.left,
        top: anchorRect.top - parentRect.top,
        bottom: anchorRect.bottom - parentRect.top,
        cx: anchorRect.left - parentRect.left + anchorRect.width / 2,
        cy: anchorRect.top - parentRect.top + anchorRect.height / 2,
      };
    };

    const spawnBurst = (
      bx: number,
      by: number,
      palette: string[],
      style: "chrysanthemum" | "willow" | "ring",
      count: number,
      speedScale = 1
    ) => {
      for (let i = 0; i < count; i++) {
        const angle =
          style === "ring"
            ? (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.08
            : Math.random() * Math.PI * 2;
        const speed =
          style === "ring"
            ? (3.6 + Math.random() * 0.9) * speedScale
            : (1.5 + Math.random() * 4.8) * speedScale;
        const color = palette[i % 2];
        const coreColor = palette[2];

        sparks.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (style === "willow" ? 0.6 : 0.3),
          life: 0,
          maxLife: style === "willow" ? 68 + Math.random() * 26 : 46 + Math.random() * 24,
          color,
          coreColor,
          size: style === "willow" ? 2.1 : 1.8 + Math.random() * 1.4,
          gravity: style === "willow" ? 0.075 : 0.058,
          drag: style === "willow" ? 0.958 : 0.962,
          twinkleOffset: Math.random() * Math.PI * 2,
          willow: style === "willow",
          trail: [],
        });
      }

      // Inner bright core flash ring
      for (let j = 0; j < 14; j++) {
        const angle = (j / 14) * Math.PI * 2;
        const speed = 1.2 + Math.random() * 1.4;
        sparks.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 20 + Math.random() * 10,
          color: palette[0],
          coreColor: "#FFFDF5",
          size: 2.5,
          gravity: 0.03,
          drag: 0.92,
          twinkleOffset: j,
          willow: false,
          trail: [],
        });
      }
    };

    const spawnAnarFountain = (fx: number, fy: number, dirX: number) => {
      for (let i = 0; i < 34; i++) {
        const angle = -Math.PI / 2 + dirX * (0.18 + Math.random() * 0.36) + (Math.random() - 0.5) * 0.25;
        const speed = 3.2 + Math.random() * 4.8;
        const palette = PALETTES[i % 3];
        sparks.push({
          x: fx,
          y: fy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 38 + Math.random() * 22,
          color: palette[0],
          coreColor: palette[2],
          size: 1.7 + Math.random() * 1.3,
          gravity: 0.095,
          drag: 0.972,
          twinkleOffset: Math.random() * Math.PI * 2,
          willow: true,
          trail: [],
        });
      }
    };

    const launchRocket = (
      startX: number,
      startY: number,
      targetX: number,
      targetY: number,
      palette: string[],
      style: "chrysanthemum" | "willow" | "ring"
    ) => {
      const flightFrames = 22;
      rockets.push({
        x: startX,
        y: startY,
        vx: (targetX - startX) / flightFrames,
        vy: (targetY - startY) / flightFrames - 0.65,
        targetY,
        colorPalette: palette,
        exploded: false,
        style,
        trail: [],
      });
    };

    const box = getAnchorBox();
    const timeouts: number[] = [];

    // Wave 1 (0ms): Twin corner Anar fountains + central celebratory halo burst
    spawnAnarFountain(box.left + 28, box.bottom - 10, -0.35);
    spawnAnarFountain(box.right - 28, box.bottom - 10, 0.35);
    spawnBurst(box.cx, box.cy - 10, PALETTES[0], "ring", 42, 0.95);

    // Wave 2: Choreographed aerial cracker shells around the card
    const rocketSchedule: Array<{
      delay: number;
      sx: number;
      sy: number;
      tx: number;
      ty: number;
      paletteIdx: number;
      style: "chrysanthemum" | "willow" | "ring";
    }> = [
      {
        delay: 120,
        sx: box.left + 40,
        sy: box.bottom,
        tx: box.left + (box.right - box.left) * 0.22,
        ty: Math.max(55, box.top - 22),
        paletteIdx: 1,
        style: "chrysanthemum",
      },
      {
        delay: 260,
        sx: box.right - 40,
        sy: box.bottom,
        tx: box.left + (box.right - box.left) * 0.78,
        ty: Math.max(60, box.top - 15),
        paletteIdx: 0,
        style: "willow",
      },
      {
        delay: 480,
        sx: box.cx,
        sy: box.bottom - 12,
        tx: box.cx + (Math.random() - 0.5) * 35,
        ty: Math.max(48, box.top - 36),
        paletteIdx: 2,
        style: "chrysanthemum",
      },
      {
        delay: 720,
        sx: box.left + 70,
        sy: box.bottom,
        tx: Math.max(42, box.left + 20),
        ty: box.top + 46,
        paletteIdx: 3,
        style: "ring",
      },
      {
        delay: 940,
        sx: box.right - 70,
        sy: box.bottom,
        tx: Math.min(width - 42, box.right - 20),
        ty: box.top + 42,
        paletteIdx: 1,
        style: "willow",
      },
      {
        delay: 1200,
        sx: box.cx - 20,
        sy: box.bottom,
        tx: box.cx + 12,
        ty: Math.max(56, box.top - 10),
        paletteIdx: 0,
        style: "chrysanthemum",
      },
    ];

    rocketSchedule.forEach((item) => {
      const tid = window.setTimeout(() => {
        launchRocket(
          item.sx,
          item.sy,
          item.tx,
          item.ty,
          PALETTES[item.paletteIdx],
          item.style
        );
      }, item.delay);
      timeouts.push(tid);
    });

    // Wave 3 (1450ms): Finale corner sparkles
    timeouts.push(
      window.setTimeout(() => {
        const freshBox = getAnchorBox();
        spawnAnarFountain(freshBox.left + 32, freshBox.bottom - 8, -0.25);
        spawnAnarFountain(freshBox.right - 32, freshBox.bottom - 8, 0.25);
      }, 1450)
    );

    const handleResize = () => {
      if (!canvas || !parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    window.addEventListener("resize", handleResize);

    let rafId = 0;
    let tickCount = 0;

    const render = () => {
      tickCount += 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Update and draw aerial rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 8) r.trail.shift();

        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.055;

        // Draw glowing rocket tail
        for (let t = 1; t < r.trail.length; t++) {
          const p0 = r.trail[t - 1];
          const p1 = r.trail[t];
          const ratio = t / r.trail.length;
          ctx.strokeStyle = `rgba(212, 155, 39, ${ratio * 0.85})`;
          ctx.lineWidth = ratio * 2.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }

        // Rocket head spark
        ctx.fillStyle = "#FFF7DB";
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.4, 0, Math.PI * 2);
        ctx.fill();

        if (r.y <= r.targetY || r.vy >= 0) {
          spawnBurst(
            r.x,
            r.y,
            r.colorPalette,
            r.style,
            r.style === "willow" ? 54 : 62,
            1
          );
          rockets.splice(i, 1);
        }
      }

      // Update and draw explosion & fountain sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += 1;
        if (s.life >= s.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        s.trail.push({ x: s.x, y: s.y });
        const maxTrail = s.willow ? 9 : 6;
        if (s.trail.length > maxTrail) s.trail.shift();

        s.vx *= s.drag;
        s.vy *= s.drag;
        s.vy += s.gravity;
        s.x += s.vx;
        s.y += s.vy;

        const progress = s.life / s.maxLife;
        const fade = Math.max(0, 1 - Math.pow(progress, 1.55));
        const twinkle =
          progress > 0.55
            ? 0.55 + 0.45 * Math.sin(tickCount * 0.6 + s.twinkleOffset)
            : 1;
        const alpha = fade * twinkle;

        // Draw luminous tapered trail
        if (s.trail.length > 1) {
          for (let t = 1; t < s.trail.length; t++) {
            const p0 = s.trail[t - 1];
            const p1 = s.trail[t];
            const segAlpha = alpha * (t / s.trail.length) * 0.78;
            ctx.strokeStyle = s.color;
            ctx.globalAlpha = segAlpha;
            ctx.lineWidth = s.size * (t / s.trail.length);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
        }

        // Draw glowing head with hot core
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 1.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = alpha * 0.95;
        ctx.fillStyle = s.coreColor;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Occasional crackling sub-pop near end of willow tail
        if (s.willow && s.life === Math.floor(s.maxLife * 0.72) && Math.random() < 0.18) {
          sparks.push({
            x: s.x,
            y: s.y,
            vx: (Math.random() - 0.5) * 2.2,
            vy: (Math.random() - 0.5) * 2.2,
            life: 0,
            maxLife: 12,
            color: "#D49B27",
            coreColor: "#FFFDF5",
            size: 1.4,
            gravity: 0.04,
            drag: 0.9,
            twinkleOffset: i,
            willow: false,
            trail: [],
          });
        }
      }

      ctx.globalAlpha = 1;

      if (rockets.length > 0 || sparks.length > 0 || tickCount < 110) {
        rafId = window.requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      timeouts.forEach((t) => window.clearTimeout(t));
    };
  }, [active, burstKey, anchorRef, shouldReduceMotion]);

  if (!active || shouldReduceMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
    />
  );
}
