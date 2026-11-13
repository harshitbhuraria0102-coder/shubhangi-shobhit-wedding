import React from "react";
import { weddingData } from "../data/weddingData";

export function MarqueeRibbon() {
  const items = Array.from({ length: 4 }).flatMap(() => weddingData.ticker);

  return (
    <div className="relative overflow-hidden border-y border-[#C8A96A]/30 bg-[#501D2A] py-4 select-none">
      <div className="marquee-track flex">
        {[0, 1].map((copyIdx) => (
          <div
            key={copyIdx}
            className="flex shrink-0 items-center"
            aria-hidden={copyIdx === 1 ? "true" : undefined}
          >
            {items.map((item, idx) => (
              <span key={`${copyIdx}-${idx}`} className="flex items-center whitespace-nowrap">
                <span className="label-caps text-[#F8F2E8]/90">{item}</span>
                <span className="mx-5 text-[#C8A96A] sm:mx-8">❦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
