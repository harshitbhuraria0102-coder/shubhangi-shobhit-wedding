import React, { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { AudioProvider } from "./context/AudioContext";
import { GoogleSheetProvider } from "./context/GoogleSheetContext";
import { EntranceCard } from "./components/EntranceCard";
import { HeaderNav } from "./components/HeaderNav";
import { HeroSection } from "./components/HeroSection";
import { CoupleSection } from "./components/CoupleSection";
import { MarqueeRibbon } from "./components/MarqueeRibbon";
import { ScratchCardSection } from "./components/ScratchCardSection";
import { CountdownSection } from "./components/CountdownSection";
import { FunctionsSection } from "./components/FunctionsSection";
import { StaySection } from "./components/StaySection";
import { BlessingsSection } from "./components/BlessingsSection";
import { RsvpSection } from "./components/RsvpSection";
import { FooterSection } from "./components/FooterSection";
import { RsvpPage } from "./components/RsvpPage";
import { HostRsvpModal } from "./components/HostRsvpModal";

const KNOWN_SECTION_HASHES = [
  "functions",
  "stay",
  "blessings",
  "rsvp",
  "story",
  "save-the-date",
  "countdown",
];

export default function App() {
  const [isEntered, setIsEntered] = useState(() => {
    if (typeof window === "undefined") return false;
    const hash = window.location.hash.replace("#", "");
    const pathname = window.location.pathname;
    return (
      KNOWN_SECTION_HASHES.includes(hash) ||
      pathname === "/rsvp" ||
      window.location.hash === "#/rsvp"
    );
  });

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname === "/rsvp" ||
      window.location.hash === "#/rsvp"
      ? "/rsvp"
      : "/";
  });

  // Lock body scroll while entrance envelope card is open
  useEffect(() => {
    document.body.style.overflow = isEntered ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isEntered]);

  // Deep linking to anchor sections
  useEffect(() => {
    if (!isEntered) return;
    const hash = window.location.hash.replace("#", "");
    if (!KNOWN_SECTION_HASHES.includes(hash)) return;

    const timer = window.setTimeout(() => {
      const targetElement = document.getElementById(hash);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "auto", block: "start" });
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [isEntered]);

  // Listen for navigation events
  useEffect(() => {
    const handleRouteSync = () => {
      if (
        window.location.pathname === "/rsvp" ||
        window.location.hash === "#/rsvp"
      ) {
        setCurrentRoute("/rsvp");
      } else {
        setCurrentRoute("/");
      }
    };

    window.addEventListener("popstate", handleRouteSync);
    window.addEventListener("hashchange", handleRouteSync);
    return () => {
      window.removeEventListener("popstate", handleRouteSync);
      window.removeEventListener("hashchange", handleRouteSync);
    };
  }, []);

  const navigateToInvitation = () => {
    if (window.history?.pushState) {
      window.history.pushState(null, "", "/");
    }
    setCurrentRoute("/");
    setIsEntered(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AudioProvider>
      <GoogleSheetProvider>
        {currentRoute === "/rsvp" ? (
          <RsvpPage onBackToInvitation={navigateToInvitation} />
        ) : (
          <div className="relative min-h-screen overflow-x-hidden bg-[#F5EBD8]">
            {/* Animated Fullscreen Entrance / Invitation Card */}
            <AnimatePresence>
              {!isEntered && (
                <EntranceCard onEnter={() => setIsEntered(true)} />
              )}
            </AnimatePresence>

            {/* Main Content Layout */}
            <div
              aria-hidden={!isEntered}
              className={isEntered ? "" : "pointer-events-none select-none"}
            >
              <HeaderNav />
              <main>
                <HeroSection />
                <CoupleSection />
                <MarqueeRibbon />
                <ScratchCardSection />
                <CountdownSection />
                <FunctionsSection />
                <StaySection />
                <BlessingsSection />
                <RsvpSection />
                <FooterSection />
              </main>
            </div>
          </div>
        )}
        <HostRsvpModal />
      </GoogleSheetProvider>
    </AudioProvider>
  );
}
