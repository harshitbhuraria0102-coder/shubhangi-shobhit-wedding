import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { weddingData } from "../data/weddingData";
import { PetalsCanvas } from "./PetalsCanvas";
import { SparkleField } from "./SparkleField";

const conicRaysGradient = `conic-gradient(from 0deg, transparent 0deg, rgba(200,169,106,0.85) 5deg, transparent 11deg, transparent 44deg, rgba(200,169,106,0.6) 50deg, transparent 56deg, transparent 88deg, rgba(200,169,106,0.8) 94deg, transparent 100deg, transparent 150deg, rgba(200,169,106,0.55) 156deg, transparent 162deg, transparent 208deg, rgba(200,169,106,0.75) 214deg, transparent 220deg, transparent 272deg, rgba(200,169,106,0.6) 278deg, transparent 284deg, transparent 326deg, rgba(200,169,106,0.8) 332deg, transparent 338deg)`;

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const [triggerCount, setTriggerCount] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const t1 = window.setTimeout(() => setTriggerCount(1), 700);
    const t2 = window.setTimeout(() => setTriggerCount(2), 4600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [shouldReduceMotion]);

  const anim = (delay: number) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.15, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      id="top"
      className="grain relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#191716]"
    >
      {triggerCount > 0 && <PetalsCanvas trigger={true} key={triggerCount} />}

      {/* Atmospheric lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_32%,rgba(200,169,106,0.3),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_104%,rgba(122,28,28,0.55),transparent_58%)]" />

      {/* Rotating ray halo */}
      <motion.div
        aria-hidden="true"
        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute h-[52rem] w-[52rem] opacity-[0.12]"
        style={{ background: conicRaysGradient }}
      />

      {/* Rotating dashed ring */}
      <motion.div
        aria-hidden="true"
        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute h-[26rem] w-[26rem] rounded-full border border-dashed border-[#C8A96A]/30 sm:h-[32rem] sm:w-[32rem]"
      />

      {/* Counter-rotating inner ring */}
      <motion.div
        aria-hidden="true"
        animate={shouldReduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute h-[21rem] w-[21rem] rounded-full border border-[#C8A96A]/20 sm:h-[26rem] sm:w-[26rem]"
      >
        <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#C8A96A]/80" />
        <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rotate-45 bg-[#C8A96A]/60" />
      </motion.div>

      {/* Center glowing golden orb */}
      <motion.div
        aria-hidden="true"
        animate={
          shouldReduceMotion
            ? undefined
            : { opacity: [0.35, 0.8, 0.35], scale: [1, 1.07, 1] }
        }
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute h-[20rem] w-[20rem] rounded-full blur-3xl sm:h-[25rem] sm:w-[25rem]"
        style={{
          background:
            "radial-gradient(circle, rgba(200,169,106,0.6), rgba(200,169,106,0) 70%)",
        }}
      />

      {/* Golden float particles */}
      <SparkleField />

      {/* Sacred Invitation Centerpiece */}
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 pb-24 pt-20 text-center">
        {/* Invocation */}
        <motion.p {...anim(0.05)} className="label-caps-sm text-[#C8A96A]">
          {weddingData.shrinathji.invocation}
        </motion.p>

        {/* Framed Divine Shrinath Ji Artwork */}
        <motion.div
          {...anim(0.2)}
          className="relative mt-6 w-[76vw] max-w-[19rem] sm:max-w-[23rem]"
        >
          {/* Animated decorative outer border */}
          <motion.div
            aria-hidden="true"
            animate={
              shouldReduceMotion
                ? undefined
                : { opacity: [0.35, 0.85, 0.35], scale: [1, 1.04, 1] }
            }
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -inset-5 rounded-[4px] border border-[#C8A96A]/30"
          />
          <motion.div
            aria-hidden="true"
            animate={
              shouldReduceMotion
                ? undefined
                : { opacity: [0.9, 0.3, 0.9] }
            }
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.2,
            }}
            className="pointer-events-none absolute -inset-2 rounded-[3px] border border-[#F3DFB4]/25"
          />

          {/* Golden framed canvas */}
          <div className="relative overflow-hidden rounded-[3px] border border-[#C8A96A]/70 bg-[#191716] p-1.5 shadow-[0_30px_110px_rgba(0,0,0,0.75)]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] border border-[#C8A96A]/25">
              <motion.div
                animate={
                  shouldReduceMotion ? undefined : { scale: [1, 1.09, 1] }
                }
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-full"
              >
                <img
                  src={weddingData.images.shrinathji}
                  alt="Shrinath Ji — the child form of Lord Krishna"
                  className="h-full w-full object-cover"
                />
              </motion.div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#191716]/45 via-transparent to-transparent" />

              {/* Gleam light sweeps */}
              <motion.div
                aria-hidden="true"
                initial={{ x: "-140%" }}
                animate={shouldReduceMotion ? undefined : { x: "140%" }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  repeatDelay: 2.8,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[#FFF6E2]/30 to-transparent"
              />
              <motion.div
                aria-hidden="true"
                initial={{ x: "150%" }}
                animate={shouldReduceMotion ? undefined : { x: "-150%" }}
                transition={{
                  duration: 5.6,
                  repeat: Infinity,
                  repeatDelay: 4.5,
                  delay: 2.4,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-[#C8A96A]/25 to-transparent"
              />
            </div>
          </div>

          {/* Golden bead accents across top */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 left-1/2 flex -translate-x-1/2 gap-1.5"
          >
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <motion.span
                key={i}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { y: [0, 4, 0], opacity: [0.45, 1, 0.45] }
                }
                transition={{
                  duration: 3.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.18,
                }}
                className="block h-1.5 w-1.5 rounded-full bg-[#E8CC92] shadow-[0_0_8px_rgba(232,204,146,0.9)]"
              />
            ))}
          </div>

          {/* Diamond accent at bottom */}
          <div
            aria-hidden="true"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2"
          >
            <motion.span
              animate={
                shouldReduceMotion
                  ? undefined
                  : { opacity: [0.35, 1, 0.35], scale: [1, 1.5, 1] }
              }
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              className="block h-2 w-2 rotate-45 bg-[#C8A96A] shadow-[0_0_16px_rgba(200,169,106,0.9)]"
            />
          </div>

          {/* Side sparkle stars */}
          <motion.span
            aria-hidden="true"
            animate={
              shouldReduceMotion
                ? undefined
                : { y: [-4, 4, -4], opacity: [0.5, 1, 0.5] }
            }
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-3 -top-1 font-heading text-lg text-[#C8A96A]"
          >
            ✦
          </motion.span>
          <span className="absolute -left-3 top-1/3 font-heading text-sm text-[#C8A96A]/70">
            ✦
          </span>
        </motion.div>

        {/* Shrinathji Hindi Heading — जय श्री कृष्णा। */}
        <div className="relative mt-10">
          {/* Subtle radiant golden aura */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-80 rounded-full bg-[#C8A96A]/20 blur-2xl"
          />

          <h1 className="relative font-hindi-display text-[3.4rem] leading-[1.08] tracking-[0.05em] sm:text-[5.4rem]">
            {weddingData.shrinathji.hindi.split(" ").map((word, i, arr) => (
              <motion.span
                key={`${word}-${i}`}
                className="animate-gold-shimmer inline-block bg-gradient-to-r from-[#FFFDF7] via-[#FCE9C2] via-[#E8CC92] via-[#FFF8E7] to-[#E8CC92] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(200,169,106,0.65)]"
                initial={
                  !shouldReduceMotion && { opacity: 0, y: 32, filter: "blur(12px)" }
                }
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 1.25,
                  delay: 0.65 + i * 0.22,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
              >
                {word}
                {i < arr.length - 1 ? "\u00A0" : ""}
              </motion.span>
            ))}
          </h1>
        </div>

        {/* Floral flourish divider */}
        <motion.div
          {...anim(0.8)}
          className="mt-6 flex items-center justify-center gap-4"
        >
          <motion.span
            initial={!shouldReduceMotion ? { scaleX: 0 } : undefined}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, delay: 1, ease: [0.22, 1, 0.36, 1] as const }}
            className="h-px w-16 origin-right bg-gradient-to-r from-transparent to-[#C8A96A]/80"
          />
          <motion.span
            animate={
              shouldReduceMotion
                ? undefined
                : { rotate: [0, 8, 0, -8, 0], opacity: [0.7, 1, 0.7] }
            }
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="font-heading text-base leading-none text-[#C8A96A]"
          >
            ❦
          </motion.span>
          <motion.span
            initial={!shouldReduceMotion ? { scaleX: 0 } : undefined}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, delay: 1, ease: [0.22, 1, 0.36, 1] as const }}
            className="h-px w-16 origin-left bg-gradient-to-l from-transparent to-[#C8A96A]/80"
          />
        </motion.div>

        {/* Transliteration */}
        <motion.p {...anim(0.95)} className="label-caps mt-6 text-[#F8F2E8]/75">
          {weddingData.shrinathji.transliteration}
        </motion.p>

        {/* Verse */}
        <motion.p
          {...anim(1.15)}
          className="mt-4 font-hindi text-[0.95rem] tracking-[0.12em] text-[#C8A96A]/80 sm:text-base"
        >
          {weddingData.shrinathji.verse}
        </motion.p>
      </div>

      {/* Floating indicator */}
      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-[#C8A96A]">
        <ChevronDown className="h-5 w-5 animate-soft-float" />
      </div>
    </section>
  );
}
