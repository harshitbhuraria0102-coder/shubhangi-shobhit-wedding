import React from "react";
import { Music } from "lucide-react";
import { useAudio } from "../context/AudioContext";

interface AudioButtonProps {
  tone?: "light" | "dark";
  className?: string;
}

export function AudioButton({ tone = "light", className = "" }: AudioButtonProps) {
  const { playing, available, toggle } = useAudio();
  const isLight = tone === "light";

  if (!available) {
    return (
      <button
        type="button"
        disabled
        title="Background music unavailable"
        aria-label="Background music unavailable"
        className={`inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full border border-dashed opacity-45 ${
          isLight ? "border-[#F8F2E8]/50 text-[#F8F2E8]" : "border-[#191716]/40 text-[#191716]"
        } ${className}`}
      >
        <Music className="h-4 w-4 opacity-40" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Pause background music" : "Play background music"}
      title={playing ? "Pause music" : "Play music"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-300 ${
        isLight
          ? "border-[#C8A96A]/50 text-[#F8F2E8] hover:border-[#C8A96A] hover:bg-[#C8A96A]/15"
          : "border-[#191716]/25 text-[#191716] hover:border-[#A88950] hover:bg-[#C8A96A]/15"
      } ${className}`}
    >
      <Music className={`h-4 w-4 ${playing ? "animate-pulse text-[#C8A96A]" : "opacity-60"}`} />
    </button>
  );
}
