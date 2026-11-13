import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Calendar, Clock, MapPin, Shirt, ChevronDown } from "lucide-react";
import { weddingData } from "../data/weddingData";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  const weekday = DAY_NAMES[dateObj.getUTCDay()];
  const month = MONTH_NAMES[m - 1];
  return {
    weekday,
    label: `${d} ${month} ${y}`,
  };
}

interface EventCardProps {
  event: (typeof weddingData.events)[0];
  index: number;
  total: number;
}

function EventCard({ event, index, total }: EventCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const dateInfo = formatDate(event.date);

  return (
    <motion.article
      initial={!shouldReduceMotion ? { opacity: 0, y: 42 } : undefined}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] as const }}
      className="overflow-hidden border border-[#C8A96A]/30 bg-[#221D1C] shadow-[0_40px_80px_-50px_rgba(0,0,0,0.9)]"
    >
      <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Event visual */}
        <div className="relative aspect-[5/4] w-full overflow-hidden md:aspect-auto md:min-h-[300px]">
          <img
            src={event.image}
            alt={`${event.title} celebration`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191716]/70 via-transparent to-transparent" />
        </div>

        {/* Event details */}
        <div className="flex flex-col justify-center px-5 py-8 sm:px-10 sm:py-10">
          {/* Header strip */}
          <div className="flex items-center gap-3">
            <span className="label-caps-sm text-[#C8A96A]">
              Function {String(index + 1).padStart(2, "0")}
            </span>
            <span className="h-px flex-1 bg-[#C8A96A]/25" />
            <span className="label-caps-sm text-[#F8F2E8]/40">
              {String(total).padStart(2, "0")}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-5 font-heading text-3xl font-light text-[#FFF9F0] sm:text-4xl">
            {event.title}
          </h3>

          {/* Description */}
          <p className="mt-4 max-w-xl font-body text-sm leading-relaxed text-[#F8F2E8]/70">
            {event.description}
          </p>

          {/* Metadata Grid */}
          <div className="mt-7 grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-x-3 gap-y-4 text-sm text-[#F8F2E8]/85">
            <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8A96A]" aria-hidden="true" />
            <p className="font-medium leading-snug">
              {dateInfo.weekday} · {dateInfo.label}
            </p>

            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8A96A]" aria-hidden="true" />
            <p className="leading-snug text-[#F8F2E8]/70">{event.time} onwards</p>

            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8A96A]" aria-hidden="true" />
            <p className="leading-snug">
              <span className="font-medium">{event.venue}</span>
              <span className="mt-0.5 block text-[#F8F2E8]/55">{event.city}</span>
            </p>

            {event.dressCode && (
              <>
                <Shirt className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8A96A]" aria-hidden="true" />
                <p className="leading-snug">
                  <span className="text-[#F8F2E8]/55">Dress code · </span>
                  {event.dressCode}
                </p>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#C8A96A]/20" />
            <span className="font-heading text-lg text-[#C8A96A]">❦</span>
            <div className="h-px flex-1 bg-[#C8A96A]/20" />
          </div>

          {/* Maps CTA */}
          {event.mapsUrl && (
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-7 inline-flex w-fit items-center gap-2 border border-[#C8A96A]/45 px-5 py-2.5 text-xs uppercase tracking-[0.22em] text-[#F8F2E8] transition-colors duration-300 hover:border-[#C8A96A] hover:bg-[#C8A96A]/15 cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5" />
              Open in Maps
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function FunctionsSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="functions" className="relative bg-[#191716] pt-24 pb-24 sm:pt-32 sm:pb-32">
      {/* Story / Header Anchor */}
      <div id="story" className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 className="font-heading text-4xl font-light leading-tight text-[#FFF9F0] sm:text-6xl">
          The wedding <em className="italic">celebrations</em>
        </h2>
        <p className="label-caps-sm mt-6 text-[#F8F2E8]/50">
          {shouldReduceMotion
            ? "Each celebration follows the next"
            : "Scroll to stack the next function"}
        </p>
        {!shouldReduceMotion && (
          <ChevronDown className="mx-auto mt-8 h-5 w-5 animate-soft-float text-[#C8A96A]" />
        )}
      </div>

      {/* Stacking Function Cards */}
      <div className="mx-auto mt-20 max-w-5xl px-5 sm:px-8">
        {weddingData.events.map((event, index) => (
          <div
            key={event.id}
            className={
              shouldReduceMotion ? "mb-10 last:mb-0" : "sticky mb-[12vh] last:mb-0"
            }
            style={
              shouldReduceMotion ? undefined : { top: `${84 + index * 14}px` }
            }
          >
            <EventCard
              event={event}
              index={index}
              total={weddingData.events.length}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
