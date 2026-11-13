import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { weddingData } from "../data/weddingData";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isOpen: boolean;
}

function calculateTimeLeft(targetTime: number): TimeLeft {
  const diff = targetTime - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      isOpen: Number.isFinite(diff),
    };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isPast: false,
    isOpen: true,
  };
}

function TimeBox({
  value,
  label,
  delay = 0,
}: {
  value: number;
  label: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const formatted = String(value).padStart(2, "0");

  return (
    <div className="flex min-w-[4.5rem] flex-col items-center sm:min-w-[6rem]">
      <div className="relative h-[3.4rem] overflow-hidden sm:h-[4.6rem]">
        {shouldReduceMotion ? (
          <span className="block font-heading text-5xl font-light leading-none text-[#FFF9F0] sm:text-6xl">
            {formatted}
          </span>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={formatted}
              initial={{ y: "-60%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "60%", opacity: 0 }}
              transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const }}
              className="block font-heading text-5xl font-light leading-none text-[#FFF9F0] sm:text-6xl"
            >
              {formatted}
            </motion.span>
          </AnimatePresence>
        )}
      </div>
      <span className="label-caps-sm mt-4 text-[#C8A96A]">{label}</span>
    </div>
  );
}

export function CountdownSection() {
  const targetTimestamp = new Date(weddingData.ceremony.isoDateTime).getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetTimestamp)
  );

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetTimestamp));
    const interval = window.setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetTimestamp));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [targetTimestamp]);

  const { days, hours, minutes, seconds, isPast, isOpen } = timeLeft;

  return (
    <section
      id="countdown"
      className="grain relative overflow-hidden bg-[#501D2A] py-20 text-[#F8F2E8] sm:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(200,169,106,0.16),transparent_65%)]" />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <div>
          <p className="label-caps text-[#C8A96A]">Countdown Board</p>
          <h2 className="mt-5 font-heading text-3xl font-light text-[#FFF9F0] sm:text-4xl">
            {isOpen && !isPast
              ? `Until we say forever in ${weddingData.ceremony.city}`
              : weddingData.ceremony.dateLabel}
          </h2>
        </div>

        <div className="mt-12">
          {isOpen ? (
            isPast ? (
              <p className="mx-auto max-w-xl font-heading text-2xl font-light leading-snug text-[#FFF9F0] sm:text-3xl">
                Today we begin our forever — thank you for celebrating with us.
              </p>
            ) : (
              <div className="flex items-start justify-center gap-3 sm:gap-8">
                <TimeBox value={days} label="Days" />
                <span className="pt-3 font-heading text-3xl text-[#C8A96A]/50 sm:pt-4">
                  :
                </span>
                <TimeBox value={hours} label="Hours" delay={0.03} />
                <span className="pt-3 font-heading text-3xl text-[#C8A96A]/50 sm:pt-4">
                  :
                </span>
                <TimeBox value={minutes} label="Mins" delay={0.06} />
                <span className="pt-3 font-heading text-3xl text-[#C8A96A]/50 sm:pt-4">
                  :
                </span>
                <TimeBox value={seconds} label="Secs" delay={0.09} />
              </div>
            )
          ) : (
            <p className="font-heading text-2xl font-light text-[#F8F2E8]/85">
              The celebration date is being confirmed.
            </p>
          )}
        </div>

        <div>
          <p className="label-caps-sm mt-12 text-[#F8F2E8]/55">
            {weddingData.ceremony.dayLabel} · {weddingData.ceremony.dateLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
