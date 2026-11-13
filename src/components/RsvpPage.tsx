import React from "react";
import { ArrowLeft } from "lucide-react";
import { weddingData } from "../data/weddingData";
import { RsvpSection } from "./RsvpSection";

interface RsvpPageProps {
  onBackToInvitation: () => void;
}

export function RsvpPage({ onBackToInvitation }: RsvpPageProps) {
  const brideFirst = weddingData.bride.name.split(" ")[0];
  const groomFirst = weddingData.groom.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#F5EBD8]">
      <header className="relative overflow-hidden px-5 pb-12 pt-12 text-center sm:pt-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,169,106,0.2),transparent_65%)]" />

        <div className="relative mx-auto max-w-xl">
          <div className="mx-auto h-16 w-16 overflow-hidden rounded-sm border border-[#C8A96A]/50 bg-[#FDFBF4] shadow-[0_14px_35px_-22px_rgba(25,23,22,0.6)] sm:h-20 sm:w-20">
            <img
              src={weddingData.images.monogram}
              alt={`${weddingData.groom.name} and ${weddingData.bride.name} wedding monogram`}
              className="h-full w-full object-cover"
            />
          </div>

          <p className="label-caps mt-7 text-[#A88950]">You are invited</p>
          <h1 className="mt-4 font-heading text-[2.1rem] font-light leading-tight text-[#191716] sm:text-5xl">
            {brideFirst}{" "}
            <span className="italic text-[#A88950]">&amp;</span>{" "}
            {groomFirst}
          </h1>

          <div className="mx-auto mt-6 h-px w-16 bg-[#C8A96A]/60" />

          <p className="mt-5 font-body text-[0.65rem] uppercase tracking-[0.24em] text-[#191716]/55">
            {weddingData.coverDate} · {weddingData.ceremony.city}
          </p>

          <p className="mx-auto mt-6 max-w-sm font-heading text-base font-light leading-relaxed text-[#191716]/70 sm:text-lg">
            Please let us know if you can join us — it only takes a moment.
          </p>
        </div>
      </header>

      <RsvpSection />

      <div className="px-5 py-10 text-center">
        <button
          type="button"
          onClick={onBackToInvitation}
          className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.24em] text-[#191716]/65 transition-colors duration-300 hover:text-[#A88950] cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          View the full invitation
        </button>
      </div>
    </div>
  );
}
