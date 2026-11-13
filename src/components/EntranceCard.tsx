import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { MapPin, ChevronDown } from "lucide-react";
import { weddingData } from "../data/weddingData";
import { useAudio } from "../context/AudioContext";
import { AudioButton } from "./AudioButton";

interface EntranceCardProps {
  onEnter: () => void;
}

export function EntranceCard({ onEnter }: EntranceCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const { play } = useAudio();

  const handleEnter = () => {
    play();
    onEnter();
  };

  const anim = (delay: number) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const brideFirstName = weddingData.bride.name.split(" ")[0];
  const groomFirstName = weddingData.groom.name.split(" ")[0];

  return (
    <motion.div
      key="opening"
      className="grain fixed inset-0 z-50 overflow-hidden bg-[#191716]"
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
      transition={{ duration: shouldReduceMotion ? 0.2 : 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Background Image with slow zoom */}
      <div className="absolute inset-0">
        <img
          src={weddingData.images.hero}
          alt="The bride and groom"
          className="h-full w-full object-cover animate-slow-zoom"
        />
      </div>

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#191716]/85 via-[#191716]/60 to-[#191716]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(25,23,22,0.75)_100%)]" />

      {/* Audio Button */}
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6 z-10">
        <AudioButton tone="light" />
      </div>

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-6 py-16 text-center">
        {/* Poetic Intro */}
        <motion.p
          {...anim(0.1)}
          className="max-w-2xl font-heading text-[1.45rem] font-light italic leading-relaxed tracking-[0.02em] text-[#F8F2E8]/90 sm:text-[1.9rem]"
        >
          {weddingData.intro.line1}
          <br />
          <span className="text-[#C8A96A]">{weddingData.intro.line2}</span>
        </motion.p>

        {/* Wedding Emblem Logo */}
        <motion.div {...anim(0.45)} className="mt-8">
          <div className="mx-auto h-28 w-28 overflow-hidden rounded-sm border border-[#C8A96A]/50 shadow-[0_14px_50px_rgba(0,0,0,0.5)] sm:h-32 sm:w-32">
            <img
              src={weddingData.images.logo}
              alt={`${weddingData.groom.name} and ${weddingData.bride.name} wedding emblem`}
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>

        {/* Names */}
        <motion.div {...anim(0.7)} className="mt-8">
          <div className="text-center">
            <h1 className="font-heading font-light text-[#FFF9F0]">
              <span className="block text-[clamp(2.6rem,9vw,5.25rem)] leading-[0.95] tracking-[0.03em]">
                {brideFirstName}
              </span>
              <span className="my-2 flex items-center justify-center gap-4 sm:my-3 sm:gap-6">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#C8A96A]/70 sm:w-16" />
                <span className="font-script text-[clamp(1.5rem,4vw,2.5rem)] leading-none text-[#C8A96A]">
                  &
                </span>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#C8A96A]/70 sm:w-16" />
              </span>
              <span className="block text-[clamp(2.6rem,9vw,5.25rem)] leading-[0.95] tracking-[0.03em]">
                {groomFirstName}
              </span>
            </h1>
          </div>
        </motion.div>

        {/* Invitation Line */}
        <motion.p {...anim(0.95)} className="label-caps mt-6 max-w-lg text-[#F8F2E8]/80">
          {weddingData.inviteLine}
        </motion.p>

        {/* Date and City Badge */}
        <motion.p
          {...anim(1.1)}
          className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#C8A96A]/45 bg-[#191716]/40 px-5 py-2 text-[0.66rem] uppercase tracking-[0.26em] text-[#F8F2E8]/90 backdrop-blur-sm"
        >
          <MapPin className="h-3.5 w-3.5 text-[#C8A96A]" />
          {weddingData.coverDate} · {weddingData.ceremony.city}
        </motion.p>

        {/* Enter Button */}
        <motion.div {...anim(1.25)} className="mt-10">
          <button
            type="button"
            onClick={handleEnter}
            aria-label={`Enter the wedding invitation — ${weddingData.hashtag}`}
            className="group rounded-full border border-[#C8A96A]/60 bg-[#191716]/45 px-7 py-3 text-sm tracking-[0.14em] text-[#F8F2E8] backdrop-blur-sm transition-all duration-500 hover:border-[#C8A96A] hover:bg-[#C8A96A]/20 hover:tracking-[0.2em] cursor-pointer"
          >
            {weddingData.hashtag}
          </button>
          <p className="mt-6 font-heading text-lg italic leading-relaxed tracking-[0.04em] text-[#F8F2E8]/85 sm:text-xl">
            Tap the <span className="text-[#C8A96A]">Hashtag</span> to enter our celebration
          </p>
          <div className="mx-auto mt-5 h-px w-14 bg-gradient-to-r from-transparent via-[#C8A96A]/70 to-transparent" />
        </motion.div>

        {/* Floating Indicator */}
        <motion.div
          {...anim(1.6)}
          className="absolute bottom-8 flex flex-col items-center gap-3 text-[#C8A96A]"
        >
          <ChevronDown className="h-4 w-4 animate-soft-float" />
        </motion.div>
      </div>
    </motion.div>
  );
}
