"use client";

import { useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export function AppGridBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);
    window.addEventListener("pointermove", handleMove);

    return () => {
      window.removeEventListener("pointermove", handleMove);
    };
  }, [mouseX, mouseY]);

  const spotlight = useMotionTemplate`radial-gradient(320px at ${mouseX}px ${mouseY}px, rgba(0, 0, 0, 0.32), transparent 74%)`;

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-transparent" />
      <div
        className="absolute inset-0 opacity-26"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(148,163,184,0.18) 1.1px, transparent 1.2px)",
          backgroundSize: "18px 18px"
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(35,35,35,0.42) 1.3px, transparent 1.4px)",
          backgroundSize: "18px 18px",
          WebkitMaskImage: spotlight,
          maskImage: spotlight
        }}
      />
    </div>
  );
}
