import React, { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { weddingData } from "../data/weddingData";
import { CrackersCanvas } from "./CrackersCanvas";

const SCRATCH_THRESHOLD = 0.28;
const BRUSH_RADIUS = 30;

function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  letterSpacing: number
) {
  const chars = [...text];
  const charWidths = chars.map((c) => ctx.measureText(c).width);
  const totalWidth =
    charWidths.reduce((acc, w) => acc + w, 0) +
    letterSpacing * (chars.length - 1);
  let startX = centerX - totalWidth / 2;

  chars.forEach((char, i) => {
    ctx.fillText(char, startX + charWidths[i] / 2, y);
    startX += charWidths[i] + letterSpacing;
  });
}

export function ScratchCardSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const moveCount = useRef(0);
  const isRevealedRef = useRef(false);
  const isInteracting = useRef(false);

  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const triggerReveal = useCallback(() => {
    if (isRevealedRef.current) return;
    isRevealedRef.current = true;
    setIsRevealed(true);
    setBurstKey((prev) => prev + 1);
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, rect.width, rect.height);

    const w = rect.width;
    const h = rect.height;

    // Linear gold gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#F1E3C1");
    grad.addColorStop(0.22, "#D6B77F");
    grad.addColorStop(0.48, "#F7ECD4");
    grad.addColorStop(0.72, "#CBAA6C");
    grad.addColorStop(1, "#E9D6AD");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Radial shimmer
    const rad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.62);
    rad.addColorStop(0, "rgba(255,255,255,0.44)");
    rad.addColorStop(0.55, "rgba(255,255,255,0.12)");
    rad.addColorStop(1, "rgba(120,84,35,0.18)");
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);

    // Diagonal gleam
    const gleam = ctx.createLinearGradient(0, h, w, 0);
    gleam.addColorStop(0.26, "rgba(255,255,255,0)");
    gleam.addColorStop(0.45, "rgba(255,255,255,0.38)");
    gleam.addColorStop(0.56, "rgba(255,255,255,0)");
    ctx.fillStyle = gleam;
    ctx.fillRect(0, 0, w, h);

    // Gold noise speckles
    const speckleCount = Math.round((w * h) / 1100);
    for (let i = 0; i < speckleCount; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.18)" : "rgba(122,84,34,0.1)";
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2);
    }

    // Border lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(80,29,42,0.5)";
    ctx.strokeRect(13.5, 13.5, w - 27, h - 27);

    ctx.strokeStyle = "rgba(80,29,42,0.24)";
    ctx.strokeRect(20.5, 20.5, w - 41, h - 41);

    // Corner flourishes
    ctx.strokeStyle = "rgba(80,29,42,0.42)";
    const corners: [number, number, number, number][] = [
      [34, 34, 1, 1],
      [w - 34, 34, -1, 1],
      [34, h - 34, 1, -1],
      [w - 34, h - 34, -1, -1],
    ];
    corners.forEach(([cx, cy, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(cx + sx * 26, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + sy * 26);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy - sy * 6);
      ctx.lineTo(cx + sx * 5, cy);
      ctx.lineTo(cx, cy + sy * 6);
      ctx.lineTo(cx - sx * 5, cy);
      ctx.closePath();
      ctx.fillStyle = "rgba(80,29,42,0.3)";
      ctx.fill();
    });

    // Center emblem & text
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(80,29,42,0.62)";
    ctx.font = '400 16px "Cormorant Garamond", Georgia, serif';
    ctx.fillText("❦", w / 2, h / 2 - 62);

    ctx.fillStyle = "#501D2A";
    const scriptSize = Math.max(26, Math.min(38, w * 0.06));
    ctx.font = `400 ${scriptSize}px "Great Vibes", "Cormorant Garamond", cursive`;
    ctx.fillText("Scratch to reveal", w / 2, h / 2 - 16);

    // Divider line with center diamond
    ctx.strokeStyle = "rgba(80,29,42,0.42)";
    ctx.beginPath();
    ctx.moveTo(w / 2 - 74, h / 2 + 8);
    ctx.lineTo(w / 2 - 12, h / 2 + 8);
    ctx.moveTo(w / 2 + 12, h / 2 + 8);
    ctx.lineTo(w / 2 + 74, h / 2 + 8);
    ctx.stroke();

    ctx.fillStyle = "rgba(80,29,42,0.5)";
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2 + 3);
    ctx.lineTo(w / 2 + 5, h / 2 + 8);
    ctx.lineTo(w / 2, h / 2 + 13);
    ctx.lineTo(w / 2 - 5, h / 2 + 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(80,29,42,0.7)";
    ctx.font = "400 9px Inter, Helvetica, Arial, sans-serif";
    drawSpacedText(ctx, "THE DAY WE SAY FOREVER", w / 2, h / 2 + 36, 2.4);

    moveCount.current = 0;
    lastPoint.current = null;
    setScratchPercent(0);
  }, []);

  useEffect(() => {
    isRevealedRef.current = isRevealed;
  }, [isRevealed]);

  useEffect(() => {
    if (isRevealed) return;
    initCanvas();

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      if (!isRevealedRef.current && !isInteracting.current) {
        initCanvas();
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [isRevealed, initCanvas]);

  useEffect(() => {
    let mounted = true;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (mounted && !isRevealedRef.current && !isInteracting.current) {
          initCanvas();
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [initCanvas]);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const erasePoint = (p: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";

    const radial = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, BRUSH_RADIUS);
    radial.addColorStop(0, "rgba(0,0,0,1)");
    radial.addColorStop(0.6, "rgba(0,0,0,1)");
    radial.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = radial;

    ctx.beginPath();
    ctx.arc(p.x, p.y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    if (lastPoint.current) {
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = BRUSH_RADIUS * 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    lastPoint.current = p;
  };

  const calculateScratchRatio = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return 0;

    const { width, height } = canvas;
    if (!width || !height) return 0;

    const imgData = ctx.getImageData(0, 0, width, height).data;
    let transparent = 0;
    let total = 0;

    // Sample every 32nd pixel (stride = 4 * 8)
    for (let i = 3; i < imgData.length; i += 32) {
      total += 1;
      if (imgData[i] < 28) {
        transparent += 1;
      }
    }

    return total ? transparent / total : 0;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isRevealedRef.current) return;
    isInteracting.current = true;
    isDrawing.current = true;
    lastPoint.current = null;

    if (canvasRef.current?.setPointerCapture) {
      try {
        canvasRef.current.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    erasePoint(getCanvasCoords(e));
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || isRevealedRef.current) return;
    e.preventDefault();
    erasePoint(getCanvasCoords(e));

    moveCount.current += 1;
    if (moveCount.current % 3 === 0) {
      const ratio = calculateScratchRatio();
      setScratchPercent(ratio);
      if (ratio >= SCRATCH_THRESHOLD) {
        isDrawing.current = false;
        triggerReveal();
      }
    }
  };

  const onPointerUp = () => {
    if (!isDrawing.current || isRevealedRef.current) return;
    isDrawing.current = false;
    lastPoint.current = null;
    const ratio = calculateScratchRatio();
    setScratchPercent(ratio);
    if (ratio >= SCRATCH_THRESHOLD) {
      triggerReveal();
    }
  };

  const handleReset = () => {
    setIsRevealed(false);
    isRevealedRef.current = false;
    isInteracting.current = false;
    requestAnimationFrame(() => initCanvas());
  };

  const handleReveal = () => {
    triggerReveal();
  };

  return (
    <section id="save-the-date" className="relative overflow-hidden bg-[#F5EBD8] py-24 sm:py-32">
      {/* Celebratory Crackers & Fireworks Overlay */}
      <CrackersCanvas
        burstKey={burstKey}
        active={isRevealed}
        anchorRef={containerRef}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center">
          <p className="label-caps text-[#A88950]">Mark Your Calendars</p>
          <h2 className="mt-5 font-heading text-4xl font-light text-[#191716] sm:text-5xl">
            Scratch to <em className="italic">Reveal</em>
          </h2>
          <p className="mt-4 text-sm text-[#191716]/60">
            A little something is waiting underneath — scratch it away to see the day we say forever.
          </p>
        </div>

        {/* Scratch Card Frame */}
        <div className="mt-12">
          <div
            ref={containerRef}
            className="relative mx-auto min-h-[340px] w-full overflow-hidden rounded-[3px] border border-[#C8A96A]/50 bg-[linear-gradient(158deg,#FDF9EF_0%,#F8F0DE_48%,#FBF4E7_100%)] shadow-[0_36px_80px_-48px_rgba(25,23,22,0.55),0_2px_18px_-8px_rgba(200,169,106,0.55)] ring-1 ring-[#C8A96A]/25 ring-offset-4 ring-offset-[#F5EBD8] sm:min-h-[380px]"
          >
            {/* Background lighting */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(233,216,180,0.55),transparent_66%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_108%,rgba(200,169,106,0.18),transparent_62%)]" />

            {/* Inner Border insets */}
            <div className="pointer-events-none absolute inset-3 border border-[#C8A96A]/35" />
            <div className="pointer-events-none absolute inset-[19px] border border-[#C8A96A]/18" />

            {/* Corner Ornamental Accents */}
            {[
              "left-6 top-6 border-l border-t",
              "right-6 top-6 border-r border-t",
              "left-6 bottom-6 border-l border-b",
              "right-6 bottom-6 border-r border-b",
            ].map((cls) => (
              <span
                key={cls}
                aria-hidden="true"
                className={`pointer-events-none absolute h-7 w-7 ${cls} border-[#C8A96A]/70`}
              />
            ))}

            {/* Revealed Underlying Wedding Information */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 py-10 text-center select-none">
              {/* Warm Golden Reveal Glow Pulse */}
              {isRevealed && !shouldReduceMotion && (
                <motion.div
                  key={`halo-${burstKey}`}
                  initial={{ opacity: 0, scale: 0.55 }}
                  animate={{ opacity: [0, 0.85, 0.25], scale: [0.6, 1.18, 1] }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] as const }}
                  aria-hidden="true"
                  className="pointer-events-none absolute h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(232,204,146,0.55)_0%,rgba(200,169,106,0.18)_45%,transparent_75%)]"
                />
              )}

              <motion.div
                key={`date-content-${burstKey}`}
                initial={
                  isRevealed && !shouldReduceMotion
                    ? { scale: 0.9, opacity: 0.5 }
                    : undefined
                }
                animate={
                  isRevealed && !shouldReduceMotion
                    ? { scale: [0.92, 1.05, 1], opacity: 1 }
                    : undefined
                }
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
                className="relative flex flex-col items-center"
              >
                <span className="font-heading text-base leading-none text-[#C8A96A]">❦</span>
                <p className="mt-6 font-script text-[clamp(2.1rem,7vw,3.5rem)] leading-tight text-[#3C1A23]">
                  {weddingData.ceremony.dateLabel}
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#C8A96A]" />
                  <span className="text-[0.55rem] leading-none text-[#C8A96A]">◆</span>
                  <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#C8A96A]" />
                </div>
                <p className="mt-7 font-heading text-2xl font-light text-[#191716] sm:text-3xl">
                  {weddingData.ceremony.venue}
                </p>
                <p className="label-caps-sm mt-3 text-[#191716]/55">
                  {weddingData.ceremony.city}
                </p>
              </motion.div>
            </div>

            {/* Interactive Scratch-off Foil Canvas */}
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onPointerLeave={onPointerUp}
              className={`absolute inset-0 h-full w-full touch-none transition-opacity duration-700 ${
                isRevealed ? "pointer-events-none opacity-0" : "cursor-crosshair opacity-100"
              }`}
            />
          </div>
        </div>

        {/* Action Controls & Percentage */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isRevealed ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-[#C8A96A]/60 px-6 py-2.5 text-sm tracking-[0.08em] text-[#191716] transition-colors duration-300 hover:bg-[#C8A96A]/20 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-[#A88950]" />
              Scratch again
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReveal}
              className="inline-flex items-center gap-2 rounded-full border border-[#C8A96A]/60 px-6 py-2.5 text-sm tracking-[0.08em] text-[#191716] transition-colors duration-300 hover:bg-[#C8A96A]/20 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-[#A88950]" />
              Reveal the date
            </button>
          )}

          <span className="text-xs text-[#191716]/45" aria-live="polite">
            {isRevealed
              ? "The date is revealed"
              : `${Math.round(scratchPercent * 100)}% scratched`}
          </span>
        </div>
      </div>
    </section>
  );
}
