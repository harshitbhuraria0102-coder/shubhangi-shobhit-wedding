import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { MapPin, Navigation } from "lucide-react";
import { weddingData } from "../data/weddingData";

function FloatingBackdrops({ images }: { images: string[] }) {
  const shouldReduceMotion = useReducedMotion();

  const anim = (idx: number) =>
    shouldReduceMotion
      ? undefined
      : {
          y: [0, idx === 0 ? 18 : -20, 0],
          scale: [1, 1.05, 1],
        };

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* Left Arched Palace Hotel Backdrop */}
      <motion.div
        animate={anim(0)}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-20 -top-8 hidden h-[28rem] w-[20rem] rotate-[-5deg] overflow-hidden rounded-t-[10rem] border border-[#C8A96A]/50 opacity-80 shadow-[0_30px_70px_-40px_rgba(25,23,22,0.5)] sm:block"
      >
        <motion.img
          src={images[0]}
          alt=""
          animate={shouldReduceMotion ? undefined : { scale: [1, 1.08, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5EBD8]/10 via-[#F5EBD8]/30 to-[#F5EBD8]" />
      </motion.div>

      {/* Right Arched Palace Wedding Location Backdrop */}
      <motion.div
        animate={anim(1)}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-20 bottom-2 hidden h-[30rem] w-[21rem] rotate-[4deg] overflow-hidden rounded-t-[11rem] border border-[#C8A96A]/50 opacity-80 shadow-[0_30px_70px_-40px_rgba(25,23,22,0.5)] sm:block"
      >
        <motion.img
          src={images[1]}
          alt=""
          animate={shouldReduceMotion ? undefined : { scale: [1.08, 1, 1.08] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5EBD8]/10 via-[#F5EBD8]/30 to-[#F5EBD8]" />
      </motion.div>

      {/* Floating Fairy Glow Lights / Palace Lanterns */}
      <div className="absolute inset-0">
        {[
          { left: "15%", top: "25%", delay: 0 },
          { left: "80%", top: "30%", delay: 1.5 },
          { left: "30%", top: "75%", delay: 2.2 },
          { left: "70%", top: "80%", delay: 0.8 },
        ].map((pt, i) => (
          <motion.span
            key={i}
            animate={
              shouldReduceMotion
                ? undefined
                : { opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.2, 0.8], y: [0, -8, 0] }
            }
            transition={{ duration: 5 + i * 1.2, repeat: Infinity, ease: "easeInOut", delay: pt.delay }}
            style={{ left: pt.left, top: pt.top }}
            className="absolute block h-2 w-2 rounded-full bg-[#E8CC92] shadow-[0_0_14px_rgba(232,204,146,0.9)]"
          />
        ))}
      </div>

      {/* Mobile Top Header Backdrop */}
      <motion.div
        animate={shouldReduceMotion ? undefined : { scale: [1, 1.05, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 top-0 h-72 opacity-30 sm:hidden"
      >
        <img src={images[0]} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F5EBD8]/60 to-[#F5EBD8]" />
      </motion.div>

      {/* Warm Ambient Radial Backdrop Blend */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,235,216,0.88),rgba(245,235,216,0.65))]" />
    </div>
  );
}

export function StaySection() {
  const { stay } = weddingData;
  const shouldReduceMotion = useReducedMotion();

  const hotelBackdropImages = [
    stay.hotels[0]?.image || "/assets/aistudio/hotel-front-view_9d186f1e.jpg",
    stay.hotels[1]?.image || "/assets/aistudio/caption_dfd7c817.jpg",
  ];

  return (
    <section id="stay" className="relative overflow-hidden bg-[#F5EBD8] py-24 sm:py-32">
      {/* Animated Palace Architecture Backdrops */}
      <FloatingBackdrops images={hotelBackdropImages} />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center">
          <p className="label-caps text-[#A88950]">{stay.eyebrow}</p>
          <h2 className="mx-auto mt-6 max-w-3xl font-heading text-4xl font-light leading-[1.12] text-[#191716] sm:text-6xl">
            Making Your Stay <em className="italic">Special</em>
          </h2>
          <div className="mx-auto mt-8 h-px w-24 bg-[#C8A96A]/60" />
          <p className="mx-auto mt-8 max-w-2xl font-heading text-lg font-light leading-relaxed text-[#191716]/75 sm:text-xl">
            {stay.note}
          </p>
        </div>

        {/* Hotels Grid */}
        <div className="mt-14 grid gap-8 sm:mt-16 sm:grid-cols-2">
          {stay.hotels.map((hotel, idx) => {
            const hotelImg = hotel.image || hotelBackdropImages[idx];

            return (
              <motion.div
                key={hotel.name}
                initial={!shouldReduceMotion ? { opacity: 0, y: 28 } : undefined}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.85,
                  delay: 0.1 + idx * 0.15,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                className="group relative flex h-full flex-col overflow-hidden border border-[#C8A96A]/45 bg-[#FFF9F0]/92 p-6 shadow-[0_24px_60px_-45px_rgba(25,23,22,0.6)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:border-[#C8A96A] hover:shadow-[0_32px_75px_-30px_rgba(168,137,80,0.45)] sm:p-8"
              >
                {/* Subtle Palace Artwork Watermark inside Card */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-10 transition-opacity duration-500 group-hover:opacity-15">
                  <img
                    src={hotelImg}
                    alt=""
                    className="h-full w-full object-cover object-center filter blur-[1px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FFF9F0] via-transparent to-[#FFF9F0]" />
                </div>

                {/* Arched Window with Slow Zoom, Drift, and Light Sheen Animation */}
                <div className="relative mb-6 aspect-[16/10] w-full overflow-hidden rounded-t-[2.2rem] border border-[#C8A96A]/50 bg-[#191716] shadow-inner sm:aspect-[16/9]">
                  <motion.img
                    src={hotelImg}
                    alt={hotel.name}
                    animate={
                      shouldReduceMotion
                        ? undefined
                        : {
                            scale: idx === 0 ? [1, 1.07, 1] : [1.06, 1, 1.06],
                            y: idx === 0 ? [0, -3, 0] : [0, 3, 0],
                          }
                    }
                    transition={{
                      duration: 18 + idx * 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Diagonal Golden Light Sheen Animation */}
                  <motion.div
                    aria-hidden="true"
                    initial={{ x: "-150%" }}
                    animate={shouldReduceMotion ? undefined : { x: "160%" }}
                    transition={{
                      duration: 4.8,
                      repeat: Infinity,
                      repeatDelay: 3.5 + idx * 2.2,
                      ease: "easeInOut",
                    }}
                    className="pointer-events-none absolute inset-y-0 w-2/3 -skew-x-12 bg-gradient-to-r from-transparent via-[#FFF6E2]/25 to-transparent"
                  />

                  {/* Vignette Overlay & Gold Frame Rim */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#191716]/65 via-transparent to-transparent" />
                  <div className="pointer-events-none absolute inset-0 rounded-t-[2.2rem] ring-1 ring-inset ring-[#C8A96A]/30" />
                </div>

                {/* Card Content */}
                <div className="relative flex flex-1 flex-col">
                  <div className="flex items-center justify-between">
                    <p className="label-caps-sm text-[#A88950]">
                      Stay {String(idx + 1).padStart(2, "0")}
                    </p>
                    <span className="font-heading text-xs text-[#C8A96A]">❦</span>
                  </div>

                  <h3 className="mt-3 font-heading text-[1.65rem] font-light leading-snug text-[#191716] sm:text-[1.85rem]">
                    {hotel.name}
                  </h3>

                  <div className="mt-4 h-px w-14 bg-gradient-to-r from-[#C8A96A]/80 to-transparent" />

                  <p className="mt-4 flex items-start gap-3 font-body text-sm leading-relaxed text-[#191716]/75">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#A88950]" aria-hidden="true" />
                    <span className="min-w-0">{hotel.address}</span>
                  </p>

                  <a
                    href={hotel.mapsUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-7 inline-flex w-full items-center justify-center gap-2 border border-[#191716]/25 px-5 py-3 text-[0.65rem] uppercase tracking-[0.22em] text-[#191716] transition-all duration-300 hover:border-[#A88950] hover:bg-[#C8A96A]/20 hover:text-[#501D2A] sm:mt-auto sm:w-fit sm:justify-start cursor-pointer"
                  >
                    <Navigation className="h-3.5 w-3.5 text-[#A88950]" />
                    Get directions
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
