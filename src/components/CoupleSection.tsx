import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { weddingData } from "../data/weddingData";

interface MotionBoxProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

function MotionBox({ children, className = "", delay = 0, y = 26 }: MotionBoxProps) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.95, delay, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {children}
    </motion.div>
  );
}

function RelationText({ relation, parents }: { relation: string; parents: string }) {
  return (
    <p className="mt-5 font-body text-[0.82rem] leading-relaxed tracking-[0.06em] text-[#191716]/65">
      <span className="block text-[#A88950]">{relation}</span>
      {parents}
    </p>
  );
}

export function CoupleSection() {
  const brideFirst = weddingData.bride.name.split(" ")[0];
  const groomFirst = weddingData.groom.name.split(" ")[0];

  return (
    <section id="couple" className="relative overflow-hidden bg-[#F5EBD8] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Welcome Blessing */}
        <MotionBox className="text-center">
          <p className="mx-auto max-w-3xl font-heading text-2xl font-light italic leading-relaxed text-[#191716] sm:text-[2rem]">
            {weddingData.welcomeLine}
          </p>
          <div className="mx-auto mt-10 h-px w-24 bg-[#C8A96A]/60" />
        </MotionBox>

        {/* Bride & Groom Showcase */}
        <div className="mt-16 grid items-center gap-12 md:grid-cols-[1fr_auto_1fr] md:gap-8">
          {/* Bride */}
          <MotionBox delay={0.1} className="text-center">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden border border-[#C8A96A]/40 bg-[#FFF9F0] shadow-[0_20px_50px_-30px_rgba(25,23,22,0.4)]">
              <img
                src={weddingData.bride.photo}
                alt={`Portrait of ${weddingData.bride.name}`}
                className="h-full w-full object-cover object-[center_35%]"
              />
            </div>
            <h3 className="mt-8 font-heading text-[2.6rem] font-light leading-[1.05] tracking-[0.015em] text-black sm:text-[3.4rem]">
              {brideFirst}
            </h3>
            <RelationText relation="Daughter of" parents={weddingData.bride.parents} />
          </MotionBox>

          {/* Ornamental 'with' */}
          <MotionBox
            delay={0.2}
            className="flex items-center justify-center self-center text-center"
          >
            <span className="block text-center font-script text-6xl leading-none text-[#C8A96A] sm:text-7xl">
              with
            </span>
          </MotionBox>

          {/* Groom */}
          <MotionBox delay={0.3} className="text-center">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden border border-[#C8A96A]/40 bg-[#FFF9F0] shadow-[0_20px_50px_-30px_rgba(25,23,22,0.4)]">
              <img
                src={weddingData.groom.photo}
                alt={`Portrait of ${weddingData.groom.name}`}
                className="h-full w-full object-cover object-[center_35%]"
              />
            </div>
            <h3 className="mt-8 font-heading text-[2.6rem] font-light leading-[1.05] tracking-[0.015em] text-black sm:text-[3.4rem]">
              {groomFirst}
            </h3>
            <RelationText relation="Son of" parents={weddingData.groom.parents} />
          </MotionBox>
        </div>

        {/* Mandap Illustration Banner */}
        <MotionBox delay={0.15} className="mt-20">
          <div className="relative aspect-[3/2] w-full overflow-hidden border border-[#C8A96A]/40 shadow-[0_30px_70px_-35px_rgba(25,23,22,0.5)]">
            <img
              src={weddingData.images.mandap}
              alt={`${weddingData.bride.name} and ${weddingData.groom.name} beneath a floral mandap`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#191716]/70 to-transparent" />
            <p className="absolute bottom-6 left-0 right-0 px-6 text-center font-script text-5xl text-[#FFF9F0] sm:text-6xl">
              {brideFirst} &amp; {groomFirst}
            </p>
          </div>
        </MotionBox>

        {/* Presence Line */}
        <MotionBox delay={0.2} className="mt-16 text-center sm:mt-20">
          <span className="block font-script text-4xl leading-tight text-[#A88950] sm:text-5xl">
            {weddingData.presenceLine}
          </span>
          <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-[#C8A96A]/70 to-transparent" />
        </MotionBox>
      </div>
    </section>
  );
}
