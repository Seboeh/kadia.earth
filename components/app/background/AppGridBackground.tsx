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

  const spotlight = useMotionTemplate`radial-gradient(280px at ${mouseX}px ${mouseY}px, rgba(10, 10, 10, 0.45), transparent 72%)`;

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-transparent" />
      <div
        className="absolute inset-0 opacity-26"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(46,92,85,0.18) 1.1px, transparent 1.2px)",
          backgroundSize: "18px 18px"
        }}
      />
      <motion.div
        className="absolute inset-0 opacity-92"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(46,92,85,0.48) 1.3px, transparent 1.4px)",
          backgroundSize: "18px 18px",
          WebkitMaskImage: spotlight,
          maskImage: spotlight
        }}
      />
    </div>
  );
}
