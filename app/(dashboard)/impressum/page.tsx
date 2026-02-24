"use client";

import { useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

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

export default function ImpressumPage() {
  const { mouseX, mouseY, scrollY } = useMouseFollower();
  const pageMouseY = useTransform(mouseY, (y) => y + scrollY.get());
  const spotlight = useMotionTemplate`radial-gradient(280px at ${mouseX}px ${pageMouseY}px, rgba(10, 10, 10, 0.42), transparent 70%)`;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white font-sans text-ink">
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

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-36 sm:pt-40">
        <h1 className="text-4xl font-semibold leading-[1.1] tracking-[-0.01em] text-ink sm:text-5xl">
          Impressum
        </h1>

        <div className="mt-10 grid gap-10 border-t border-ink/10 pt-10 text-base leading-[1.65] text-ink/80 sm:text-lg">
          <section>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">Angaben gemäß § 5 TMG / § 5 DDG</h2>
            <p className="mt-3">
              <strong>kadia.earth</strong>
              <br />
              Vertreten durch Sebastian Öhmann, Teichweg 16, 48653 Coesfeld
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">Kontakt</h2>
            <p className="mt-3">
              Telefon: +49 15234625477
              <br />
              E-Mail: sebastian@kadia.earth
              <br />
              Website:{" "}
              <a
                href="https://www.kadia.earth/"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-ink/40 underline-offset-4 hover:text-ink"
              >
                www.kadia.earth
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">Streitbeilegung</h2>
            <p className="mt-3">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-ink/40 underline-offset-4 hover:text-ink"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              <br />
              Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir nicht
              verpflichtet und nicht bereit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">Haftungshinweis</h2>
            <p className="mt-3">
              Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.
              Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
            </p>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
