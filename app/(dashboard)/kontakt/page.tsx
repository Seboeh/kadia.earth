"use client";

import { useEffect } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap"
});

function useMouseFollower() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const scrollY = useMotionValue(0);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };
    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };

    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);
    scrollY.set(window.scrollY);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mouseX, mouseY, scrollY]);

  return { mouseX, mouseY, scrollY };
}

export default function KontaktPage() {
  const { mouseX, mouseY, scrollY } = useMouseFollower();
  const pageMouseY = useTransform(mouseY, (y) => y + scrollY.get());
  const spotlight = useMotionTemplate`radial-gradient(280px at ${mouseX}px ${pageMouseY}px, rgba(10, 10, 10, 0.42), transparent 70%)`;

  return (
    <main className={`${inter.className} relative min-h-screen overflow-x-hidden bg-white text-ink`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-transparent" />
        <div
          className="absolute inset-0 opacity-28"
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
              "radial-gradient(circle, rgba(46,92,85,0.5) 1.3px, transparent 1.4px)",
            backgroundSize: "18px 18px",
            WebkitMaskImage: spotlight,
            maskImage: spotlight
          }}
        />
      </div>

      <SiteHeader />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-40">
        <div className="text-center">
          <h2 className="mx-auto mt-3 max-w-3xl text-[clamp(1.7rem,3.2vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink">
            Made with purpose, direkt aus{" "}
            <span className="relative isolate inline-block px-0.5">
              <span className="pointer-events-none absolute -left-1 -right-1 bottom-0 h-[0.56em] rotate-[-2.8deg] rounded-[60%] bg-[linear-gradient(95deg,rgba(247,231,166,0.62)_0%,rgba(242,220,147,0.78)_48%,rgba(247,231,166,0.60)_100%)] blur-[0.1px]" />
              <span className="pointer-events-none absolute -left-0.5 -right-1.5 bottom-[-0.08em] h-[0.36em] rotate-[2.6deg] rounded-[58%] bg-[linear-gradient(100deg,rgba(247,231,166,0.50)_0%,rgba(242,220,147,0.62)_55%,rgba(247,231,166,0.44)_100%)] blur-[0.12px]" />
              <span className="relative z-10">Münster</span>
            </span>
            .
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[clamp(0.95rem,1.05vw,1.08rem)] text-ink/75">
            Besuchen Sie uns im REACH Start-up Center Münster.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/55 shadow-[0_12px_28px_rgba(20,40,29,0.08),inset_0_1px_0_rgba(255,255,255,0.58)]">
          <iframe
            title="Standort REACH Start-up Center Münster"
            src="https://maps.google.com/maps?q=REACH%20Start-up%20Center%20M%C3%BCnster%2C%20Geiststra%C3%9Fe%2024%2C%2048151%20M%C3%BCnster&z=15&output=embed"
            className="h-[280px] w-full sm:h-[380px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/55 bg-linen/46 p-4 shadow-[0_12px_28px_rgba(20,40,29,0.08),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-xl supports-[backdrop-filter]:bg-linen/42">
            <span className="pointer-events-none absolute -right-10 -top-8 h-24 w-24 rounded-full bg-[#2E5C55]/18 blur-2xl" />
            <span className="pointer-events-none absolute -left-10 -bottom-10 h-20 w-20 rounded-full bg-[#F7E7A6]/25 blur-2xl" />
            <p className="relative text-sm font-semibold text-ink">Anschrift</p>
            <p className="relative mt-2 text-sm leading-[1.55] text-ink/75">
              kadia.earth
              <br />
              REACH Start-up Center Münster
              <br />
              Geiststraße 24
              <br />
              48151 Münster
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/55 bg-linen/46 p-4 shadow-[0_12px_28px_rgba(20,40,29,0.08),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-xl supports-[backdrop-filter]:bg-linen/42">
            <span className="pointer-events-none absolute -left-10 -top-8 h-24 w-24 rounded-full bg-[#F7E7A6]/30 blur-2xl" />
            <span className="pointer-events-none absolute -right-10 -bottom-10 h-20 w-20 rounded-full bg-[#2E5C55]/15 blur-2xl" />
            <p className="relative text-sm font-semibold text-ink">Besuch</p>
            <p className="relative mt-2 text-sm leading-[1.55] text-ink/75">
              Termine nach Vereinbarung
              <br />
              Persönlich oder digital
              <br />
              <Link
                href="https://calendly.com/contact-kanopy-international/30min"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#2E5C55] underline decoration-[#2E5C55]/50 underline-offset-2 transition hover:text-ink"
              >
                Termin hier buchen
              </Link>
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/55 bg-linen/46 p-4 shadow-[0_12px_28px_rgba(20,40,29,0.08),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-xl supports-[backdrop-filter]:bg-linen/42">
            <span className="pointer-events-none absolute -right-12 -top-10 h-24 w-24 rounded-full bg-[#2E5C55]/16 blur-2xl" />
            <span className="pointer-events-none absolute -left-8 -bottom-10 h-20 w-20 rounded-full bg-[#F7E7A6]/24 blur-2xl" />
            <p className="relative text-sm font-semibold text-ink">Kontakt</p>
            <p className="relative mt-2 text-sm leading-[1.55] text-ink/75">
              Geschäftsführer: Sebastian Öhmann
              <br />
              E-Mail: sebastian@kadia.earth
              <br />
              Tel.: +49 15234625477
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

