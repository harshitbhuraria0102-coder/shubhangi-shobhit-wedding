import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { weddingData } from "../data/weddingData";

interface AudioContextType {
  playing: boolean;
  available: boolean;
  toggle: () => void;
  play: () => void;
  pause: () => void;
}

const AudioContext = createContext<AudioContextType>({
  playing: false,
  available: false,
  toggle: () => {},
  play: () => {},
  pause: () => {},
});

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const available = Boolean(weddingData.music.url);

  useEffect(() => {
    if (!available) return;
    const audio = new Audio(weddingData.music.url);
    audio.loop = true;
    audio.volume = 0.45;
    audio.preload = "auto";
    audioRef.current = audio;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [available]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {
        // Autoplay may be restricted until user interaction
      });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  };

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      pause();
    } else {
      play();
    }
  };

  return (
    <AudioContext.Provider value={{ playing, available, toggle, play, pause }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => useContext(AudioContext);
