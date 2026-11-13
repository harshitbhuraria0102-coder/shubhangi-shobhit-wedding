import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";
import { weddingData } from "../data/weddingData";

export function BlessingsSection() {
  const { grandparents } = weddingData;
  const shouldReduceMotion = useReducedMotion();

  const anim = (delay: number) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 1, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      id="blessings"
      className="relative overflow-hidden bg-gradient-to-b from-[#FBF3E6] via-[#F6E7D2] to-[#F2DCC4] py-24 sm:py-32"
    >
      {/* Background ambient lighting */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-6 h-72 w-72 -translate-x-1/2 rounded-full bg-[#C8A96A]/20 blur-3xl" />
        <div className="absolute -left-20 bottom-8 h-64 w-64 rounded-full bg-[#B76E79]/15 blur-3xl" />
        <div className="absolute -right-16 top-1/3 h-64 w-64 rounded-full bg-[#C8A96A]/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        {/* Sparkle divider */}
        <motion.div
          {...anim(0)}
          className="mx-auto flex items-center justify-center gap-4 text-[#A88950]"
        >
          <span className="h-px w-12 bg-[#C8A96A]/60 sm:w-20" />
          <motion.span
            animate={
              shouldReduceMotion
                ? undefined
                : { opacity: [0.45, 1, 0.45], scale: [0.94, 1.06, 0.94] }
            }
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex"
          >
            <Sparkles className="h-4 w-4" />
          </motion.span>
          <span className="h-px w-12 bg-[#C8A96A]/60 sm:w-20" />
        </motion.div>

        {/* Heading */}
        <motion.h2
          {...anim(0.1)}
          className="mt-7 font-hindi text-[2rem] leading-[1.5] text-[#501D2A] sm:text-[2.6rem]"
        >
          {grandparents.eyebrow}
        </motion.h2>

        {/* Blessing Lines */}
        <div className="mt-10 space-y-7">
          {grandparents.lines.map((line, idx) => (
            <motion.p
              key={line}
              {...anim(0.2 + idx * 0.15)}
              className="font-hindi text-[1.08rem] leading-[2.1] text-[#191716]/85 sm:text-[1.25rem] sm:leading-[2.15]"
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Hairline Divider */}
        <motion.div
          {...anim(0.75)}
          className="mx-auto mt-12 h-px w-24 bg-[#C8A96A]/50"
        />

        {/* Signatures */}
        <motion.div {...anim(0.85)} className="mt-10">
          <p className="font-hindi text-sm tracking-[0.12em] text-[#A88950]">
            {grandparents.awaiting}
          </p>
          <p className="mt-3 font-hindi text-[1.3rem] leading-relaxed text-[#501D2A] sm:text-[1.5rem]">
            {grandparents.signatory}
          </p>
          <p className="mt-2 font-hindi text-sm text-[#191716]/55">
            {grandparents.date}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
