import React, { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { weddingData } from "../data/weddingData";
import { AudioButton } from "./AudioButton";

const NAV_ITEMS = [
  { label: "Functions", id: "functions" },
  { label: "Stay", id: "stay" },
  { label: "RSVP", id: "rsvp" },
];

const SECTION_IDS = ["story", ...NAV_ITEMS.map((item) => item.id)];

export function HeaderNav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 140);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      });
      if (window.history?.replaceState) {
        window.history.replaceState(null, "", `#${id}`);
      }
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
    if (window.history?.replaceState) {
      window.history.replaceState(null, "", " ");
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "border-b border-[#C8A96A]/25 bg-[#F5EBD8]/92 backdrop-blur-md"
          : "border-b border-transparent bg-gradient-to-b from-[#191716]/70 to-transparent"
      }`}
    >
      <nav
        aria-label="Invitation sections"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
      >
        {/* Monogram / Top Anchor */}
        <a
          href="#top"
          onClick={scrollToTop}
          aria-label="Back to the top of the invitation"
          className="group shrink-0"
        >
          <span
            className={`block h-8 w-8 overflow-hidden rounded-sm border transition-all duration-500 sm:h-12 sm:w-12 ${
              scrolled
                ? "border-[#C8A96A]/60 shadow-[0_6px_18px_rgba(168,137,80,0.22)]"
                : "border-[#C8A96A]/45 shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
            } group-hover:border-[#C8A96A] group-hover:shadow-[0_8px_26px_rgba(200,169,106,0.35)]`}
          >
            <img
              src={weddingData.images.monogram}
              alt={`${weddingData.groom.name} and ${weddingData.bride.name} wedding monogram`}
              className="h-full w-full object-cover"
            />
          </span>
        </a>

        {/* Navigation items */}
        <ul className="flex flex-1 items-center justify-center gap-3 sm:gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => scrollTo(e, item.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`label-caps-sm relative whitespace-nowrap transition-colors duration-300 ${
                    scrolled
                      ? isActive
                        ? "text-[#A88950]"
                        : "text-[#191716]/70 hover:text-[#191716]"
                      : isActive
                      ? "text-[#C8A96A]"
                      : "text-[#F8F2E8]/75 hover:text-[#F8F2E8]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px w-full origin-left bg-current transition-transform duration-500 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        {/* Music Player Control */}
        <div className="shrink-0">
          <AudioButton tone={scrolled ? "dark" : "light"} className="h-8 w-8" />
        </div>
      </nav>
    </header>
  );
}
