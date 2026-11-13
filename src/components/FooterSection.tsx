import React from "react";
import { ArrowUp } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { weddingData } from "../data/weddingData";

export function FooterSection() {
  const shouldReduceMotion = useReducedMotion();
  const brideFirst = weddingData.bride.name.split(" ")[0];
  const groomFirst = weddingData.groom.name.split(" ")[0];

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
    if (window.history?.replaceState) {
      window.history.replaceState(null, "", " ");
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#F5EBD8] pb-24 pt-6">
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 text-center">
        {/* Vertical subtle accent line */}
        <span className="h-16 w-px bg-gradient-to-b from-transparent via-[#C8A96A]/50 to-[#C8A96A]/70" />

        {/* Monogram Lockup */}
        <div className="relative mt-9">
          <span
            aria-hidden="true"
            className="absolute -inset-2 rounded-sm border border-[#C8A96A]/25"
          />
          <div className="h-28 w-28 overflow-hidden rounded-sm border border-[#C8A96A]/50 bg-[#FDFBF4] shadow-[0_18px_45px_-25px_rgba(25,23,22,0.55)] sm:h-32 sm:w-32">
            <img
              src={weddingData.images.monogram}
              alt={`${weddingData.groom.name} and ${weddingData.bride.name} wedding monogram`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Closing Line */}
        <p className="mt-9 font-heading text-lg italic tracking-[0.1em] text-[#191716]/60">
          {weddingData.closing.line}
        </p>

        {/* Script Names */}
        <p className="mt-3 font-script text-[2.9rem] leading-[1.18] text-[#A88950] sm:text-[3.9rem]">
          {brideFirst} &amp; {groomFirst}
        </p>

        {/* Date & City */}
        <p className="label-caps-sm mt-5 text-[#191716]/45">
          {weddingData.ceremony.monthYear} · {weddingData.ceremony.city}
        </p>

        {/* Return to Top CTA */}
        <button
          type="button"
          onClick={handleScrollTop}
          className="group mt-10 inline-flex flex-col items-center gap-3 text-[#191716]/70 transition-colors duration-500 hover:text-[#A88950] cursor-pointer"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C8A96A]/45 transition-all duration-500 group-hover:border-[#C8A96A] group-hover:bg-[#C8A96A]/10">
            <ArrowUp className="h-4 w-4" />
          </span>
          <span className="label-caps-sm">Back to the beginning</span>
        </button>

        {/* Hairline Divider */}
        <div className="mt-14 h-px w-16 bg-gradient-to-r from-transparent via-[#C8A96A]/60 to-transparent" />
      </div>
    </section>
  );
}
