import React, { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

const SPARKLE_COUNT = 18;

export function SparkleField() {
  const shouldReduceMotion = useReducedMotion();

  const sparkles = useMemo(() => {
    return Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
      id: i,
      left: (i * 37) % 100,
      size: 3 + ((i * 5) % 7),
      delay: (i % 6) * 1.1,
      duration: 10 + ((i * 3) % 8),
      drift: (i % 2 === 0 ? 1 : -1) * (8 + ((i * 7) % 26)),
      opacity: 0.25 + (i % 4) * 0.16,
    }));
  }, []);

  if (shouldReduceMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          className="absolute top-0 block rounded-full bg-[#EFD69F] shadow-[0_0_8px_rgba(239,214,159,0.8)]"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
          }}
          initial={{ y: "-4vh", opacity: 0 }}
          animate={{
            y: "112vh",
            x: [0, s.drift, 0],
            opacity: [0, s.opacity, s.opacity, 0],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
