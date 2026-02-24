"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site/site-footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap"
});
const calendlyPopupUrl =
  "https://calendly.com/contact-kanopy-international/30min?hide_event_type_details=1&hide_gdpr_banner=1";
const calendlyStylesheetId = "calendly-widget-styles";

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

export default function UeberUnsPage() {
  const { mouseX, mouseY, scrollY } = useMouseFollower();
  const pageMouseY = useTransform(mouseY, (y) => y + scrollY.get());
  const spotlight = useMotionTemplate`radial-gradient(280px at ${mouseX}px ${pageMouseY}px, rgba(10, 10, 10, 0.42), transparent 70%)`;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const quickNavLinks = [
    { id: "hero", label: "Start" },
    { id: "about", label: "Über uns" },
    { id: "karriere", label: "Karriere" },
    { id: "kontakt", label: "Kontakt" }
  ];
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsQuickNavOpen(false);
  };
  const openCalendlyPopup = () => {
    const fallbackRedirect = () => {
      document.body.style.overflow = "";
      document.querySelectorAll(".calendly-overlay").forEach((node) => node.remove());
      window.location.href = calendlyPopupUrl;
    };

    try {
      const calendly = (
        window as Window & { Calendly?: { initPopupWidget?: (opts: { url: string }) => void } }
      ).Calendly;
      if (calendly?.initPopupWidget) {
        calendly.initPopupWidget({ url: calendlyPopupUrl });
        window.setTimeout(() => {
          const overlay = document.querySelector(".calendly-overlay");
          const hasIframe = Boolean(overlay?.querySelector("iframe"));
          if (overlay && !hasIframe) fallbackRedirect();
        }, 900);
        return;
      }
    } catch {
      // Fallback below
    }
    fallbackRedirect();
  };

  useEffect(() => {
    if (document.getElementById(calendlyStylesheetId)) return;
    const link = document.createElement("link");
    link.id = calendlyStylesheetId;
    link.rel = "stylesheet";
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className={`${inter.className} relative min-h-screen overflow-x-hidden bg-white text-ink`}>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
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

      <header className="fixed inset-x-0 top-0 z-30 pt-2">
        <div className="mx-auto flex w-full items-center px-5 sm:px-6">
          <div
            className={`flex w-full items-center justify-between rounded-full border border-white/45 bg-linen/55 shadow-[0_16px_40px_rgba(20,40,29,0.16),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl supports-[backdrop-filter]:bg-linen/50 transition-all duration-300 ${
              isScrolled
                ? "mx-auto max-w-4xl px-3 py-1"
                : "mx-auto max-w-6xl px-4 py-2"
            }`}
          >
            <Link href="/" className={`${inter.className} ml-2 inline-flex items-center whitespace-nowrap text-sm font-medium leading-none tracking-[0.01em] text-ink sm:ml-3`}>
              <span className="relative isolate inline-block px-0.5">
                <span className="pointer-events-none absolute -left-1 -right-1 bottom-0 h-[0.56em] rotate-[-2.8deg] rounded-[60%] bg-[linear-gradient(95deg,rgba(247,231,166,0.62)_0%,rgba(242,220,147,0.78)_48%,rgba(247,231,166,0.60)_100%)] blur-[0.1px]" />
                <span className="pointer-events-none absolute -left-0.5 -right-1.5 bottom-[-0.08em] h-[0.36em] rotate-[2.6deg] rounded-[58%] bg-[linear-gradient(100deg,rgba(247,231,166,0.50)_0%,rgba(242,220,147,0.62)_55%,rgba(247,231,166,0.44)_100%)] blur-[0.12px]" />
                <span className="relative z-10">kadia<span className="text-[#2E5C55]">.</span>earth</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/ueber-uns"
                className="hidden text-[13px] font-medium tracking-[0.02em] text-ink/80 transition hover:text-ink md:inline-flex"
              >
                Über uns
              </Link>
              <Link
                href="/kontakt"
                className="hidden text-[13px] font-medium tracking-[0.02em] text-ink/80 transition hover:text-ink md:inline-flex"
              >
                Kontakt
              </Link>
              <Button
                asChild
                className="ml-1 rounded-full bg-[#F7E7A6] px-4 py-1.5 text-xs font-medium tracking-[0.02em] text-ink shadow-[0_10px_26px_rgba(247,231,166,0.35)] transition hover:scale-[1.02] hover:bg-[#F2DC93]"
              >
                <Link href="/sign-in">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 md:block">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsQuickNavOpen((prev) => !prev)}
            aria-label="Schnellnavigation öffnen"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/55 bg-white/38 shadow-[0_14px_34px_rgba(20,40,29,0.18),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-xl transition hover:bg-white/46"
          >
            <span className="flex flex-col items-center gap-1">
              <span className="block h-[2px] w-5 rounded-full bg-black" />
              <span className="block h-[2px] w-5 rounded-full bg-black" />
              <span className="block h-[2px] w-5 rounded-full bg-black" />
            </span>
          </button>
          {isQuickNavOpen ? (
            <div className="absolute left-16 top-1/2 w-44 -translate-y-1/2 rounded-2xl border border-white/55 bg-white/40 p-2.5 shadow-[0_18px_38px_rgba(20,40,29,0.18),inset_0_1px_0_rgba(255,255,255,0.52)] backdrop-blur-xl">
              <div className="flex flex-col gap-1">
                {quickNavLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => scrollToSection(link.id)}
                    className="rounded-xl px-3 py-2 text-left text-sm font-medium text-ink/88 transition hover:bg-white/55 hover:text-ink"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <section id="hero" className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-40">
        <div className="text-center">
          <h2 className="mx-auto mt-3 max-w-3xl text-[clamp(1.7rem,3.2vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-ink">
            Artenschutz{" "}
            <span className="relative isolate inline-block px-0.5">
              <span className="pointer-events-none absolute -left-1 -right-1 bottom-0 h-[0.56em] rotate-[-2.8deg] rounded-[60%] bg-[linear-gradient(95deg,rgba(247,231,166,0.62)_0%,rgba(242,220,147,0.78)_48%,rgba(247,231,166,0.60)_100%)] blur-[0.1px]" />
              <span className="pointer-events-none absolute -left-0.5 -right-1.5 bottom-[-0.08em] h-[0.36em] rotate-[2.6deg] rounded-[58%] bg-[linear-gradient(100deg,rgba(247,231,166,0.50)_0%,rgba(242,220,147,0.62)_55%,rgba(247,231,166,0.44)_100%)] blur-[0.12px]" />
              <span className="relative z-10">digital</span>
            </span>{" "}
            gedacht...
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-[clamp(0.95rem,1.05vw,1.08rem)] text-ink/75">
            Wir entwickeln skalierbare Daten- und Analyseinfrastruktur für schnellere, fundierte Entscheidungen im
            Artenschutz.
          </p>
        </div>

        <div className="relative mx-auto mt-12 w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/55 shadow-[0_12px_28px_rgba(20,40,29,0.08),inset_0_1px_0_rgba(255,255,255,0.58)]">
          <Image
            src="/images/About.png"
            alt="Team und Arbeitsumfeld von kadia.earth"
            width={1800}
            height={900}
            className="h-[220px] w-full object-cover sm:h-[210px] lg:h-[235px]"
            priority
          />
          <div className="absolute inset-0 bg-white/18" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/6 via-white/12 to-white/16" />

          <div className="relative z-10 mx-auto grid w-full gap-3 p-3 sm:absolute sm:inset-x-6 sm:top-1/2 sm:w-[calc(100%-3rem)] sm:max-w-5xl sm:-translate-y-1/2 sm:grid-cols-3 sm:gap-4 sm:p-0">
            <div className="rounded-2xl border border-white/45 bg-white/46 p-4 text-center text-ink shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <p className="text-[clamp(1.7rem,3.1vw,2.5rem)] font-semibold leading-none">8+</p>
              <p className="mt-2 text-sm font-medium">Minuten</p>
              <p className="mt-2 text-xs text-ink/78 sm:text-sm">Strukturierte und digitalisierte ASP1 durch innovative und bewährte technologische Ansätze.</p>
            </div>
            <div className="rounded-2xl border border-white/45 bg-white/46 p-4 text-center text-ink shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <p className="text-[clamp(1.7rem,3.1vw,2.5rem)] font-semibold leading-none">16</p>
              <p className="mt-2 text-sm font-medium">Bundesländer</p>
              <p className="mt-2 text-xs text-ink/78 sm:text-sm">Länderspezifische Anforderungen in einem konsistenten Workflow.</p>
            </div>
            <div className="rounded-2xl border border-white/45 bg-white/46 p-4 text-center text-ink shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <p className="text-[clamp(1.7rem,3.1vw,2.5rem)] font-semibold leading-none">&lt; 0.1%</p>
              <p className="mt-2 text-sm font-medium">Fehlerquote</p>
              <p className="mt-2 text-xs text-ink/78 sm:text-sm">Validierte Datenflüsse reduzieren manuelle Übertragungsfehler.</p>
            </div>
          </div>
        </div>

        <section id="about" className="mt-16 sm:mt-28">
          <h2 className="mt-3 max-w-4xl text-[clamp(1.2rem,1.9vw,1.8rem)] font-semibold leading-[1.2] tracking-[-0.01em] text-ink">
            Über uns
          </h2>
          <p className="mt-4 max-w-4xl text-[clamp(0.95rem,1.05vw,1.08rem)] text-ink/75">
            Wir ermöglichen nachvollziehbare und praxisnahe Artenschutzanalysen - und sind überzeugt, dass digitale
            Technologien dafür einen entscheidenden Beitrag leisten.
          </p>

          <div className="mt-8 grid gap-8 border-t border-ink/10 pt-8 text-sm leading-[1.62] text-ink/78 sm:grid-cols-2 sm:gap-12 sm:text-base">
            <div className="space-y-6">
              <p>
                Wir entwickeln digitale Lösungen, die den Artenschutz in der Praxis greifbar machen. Unser Ziel ist
                es, Daten zu bündeln, Abläufe zu vereinfachen und so fundierte Entscheidungen schon früh im
                Planungsprozess zu ermöglichen. Dabei setzen wir auf Transparenz, Automatisierung und klare
                Nachvollziehbarkeit – damit Artenschutzberichte nicht nur Pflicht sind, sondern echten Mehrwert
                schaffen.
              </p>
              <p>
                Wir arbeiten für Projektentwicklungen, Umwelt- und Gutachterbüros sowie Naturschutzorganisationen, die
                eine schnelle und fundierte Einschätzung benötigen - mit transparenter Datengrundlage, konsistenten
                Ergebnissen über Bundesländer hinweg und einem klaren Fokus auf verlässliche, behördennahe
                Auswertungen.
              </p>
            </div>

            <div className="flex h-full flex-col space-y-6">
              <p>
                Artenschutz ist oft ein Wettlauf gegen Zeit, Datenlücken und Komplexität. Genau hier setzen wir an:
                mit digitalen Werkzeugen, die aus Informationen verlässliche Entscheidungen machen.
              </p>

              <p>
                Unsere Mission: Wir transformieren komplexe Artendaten in wissenschaftlich belastbare, zugängliche
                und handlungsrelevante Informationen für evidenzbasierte Entscheidungen.
              </p>

              <p>
                Unsere Vision: Eine weltweit führende, wissenschaftlich fundierte Artendatenbank bereitzustellen, die
                Entscheidungen in Wirtschaft und Naturschutz datenbasiert verbessert und so Ökosysteme langfristig
                schützt.
              </p>
            </div>
          </div>
        </section>

        <section id="karriere" className="mt-16 sm:mt-24">
          <h2 className="mt-3 max-w-4xl text-[clamp(1.2rem,1.9vw,1.8rem)] font-semibold leading-[1.2] tracking-[-0.01em] text-ink">
            Wir suchen motivierte Teammitglieder.
          </h2>
          <p className="mt-4 max-w-4xl text-[clamp(0.95rem,1.05vw,1.08rem)] text-ink/75">
            Gestalte mit uns digitale Artenschutzanalysen und arbeite an echten Impact-Projekten.
          </p>

          <div className="mt-8 grid gap-4 border-t border-ink/10 pt-6 sm:grid-cols-2 sm:gap-6">
            <article className="relative overflow-hidden rounded-2xl border border-white/55 bg-linen/46 p-4 shadow-[0_12px_28px_rgba(20,40,29,0.08),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-xl supports-[backdrop-filter]:bg-linen/42">
              <span className="pointer-events-none absolute -right-10 -top-8 h-24 w-24 rounded-full bg-[#2E5C55]/14 blur-2xl" />
              <span className="pointer-events-none absolute -left-10 -bottom-10 h-20 w-20 rounded-full bg-[#F7E7A6]/24 blur-2xl" />
              <div className="relative flex items-center gap-2.5">
                <h3 className="text-lg font-semibold text-ink sm:text-xl">Umweltplaner*in</h3>
                <span className="rounded-full border border-[#96E0A8]/60 bg-[#EAF9EE] px-2.5 py-0.5 text-[11px] font-medium text-[#1F7A3D]">
                  Planung
                </span>
              </div>
              <p className="relative mt-2.5 text-sm leading-[1.55] text-ink/75">
                Du bewertest Standorte, strukturierst naturschutzfachliche Anforderungen und begleitest die
                Erstellung belastbarer Artenschutzanalysen.
              </p>
              <div className="relative mt-3.5 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/55 bg-white/48 px-3 py-1 text-xs font-medium text-ink/80 shadow-[0_10px_24px_rgba(20,40,29,0.10),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl">
                  Münster
                </span>
                <span className="rounded-full border border-white/55 bg-white/48 px-3 py-1 text-xs font-medium text-ink/80 shadow-[0_10px_24px_rgba(20,40,29,0.10),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl">
                  Vollzeit
                </span>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-2xl border border-white/55 bg-linen/46 p-4 shadow-[0_12px_28px_rgba(20,40,29,0.08),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-xl supports-[backdrop-filter]:bg-linen/42">
              <span className="pointer-events-none absolute -left-10 -top-8 h-24 w-24 rounded-full bg-[#F7E7A6]/26 blur-2xl" />
              <span className="pointer-events-none absolute -right-10 -bottom-10 h-20 w-20 rounded-full bg-[#2E5C55]/14 blur-2xl" />
              <div className="relative flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-2.5">
                <h3 className="text-lg font-semibold text-ink sm:text-xl">Backend-Entwickler*in / Geoinformatiker*in</h3>
                <span className="rounded-full border border-[#8DB7FF]/60 bg-[#EAF2FF] px-2.5 py-0.5 text-[11px] font-medium text-[#2C5ACB]">
                  Tech
                </span>
              </div>
              <p className="relative mt-2.5 text-sm leading-[1.55] text-ink/75">
                Du entwickelst skalierbare Datenpipelines, integrierst Geodatenquellen und verbesserst die technische
                Basis unserer Analyseplattform.
              </p>
              <div className="relative mt-3.5 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/55 bg-white/48 px-3 py-1 text-xs font-medium text-ink/80 shadow-[0_10px_24px_rgba(20,40,29,0.10),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl">
                  Münster
                </span>
                <span className="rounded-full border border-white/55 bg-white/48 px-3 py-1 text-xs font-medium text-ink/80 shadow-[0_10px_24px_rgba(20,40,29,0.10),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl">
                  Vollzeit
                </span>
              </div>
            </article>
          </div>
        </section>

        <section id="kontakt" className="mt-20 sm:mt-36">
          <h2 className="mt-3 max-w-4xl text-[clamp(1.2rem,1.9vw,1.8rem)] font-semibold leading-[1.2] tracking-[-0.01em] text-ink">
            Kontakt
          </h2>
          <p className="mt-4 max-w-4xl text-[clamp(0.95rem,1.05vw,1.08rem)] text-ink/75">
            Besuchen Sie uns in Münster oder stimmen Sie direkt einen Termin mit uns ab.
          </p>
        </section>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/55 shadow-[0_12px_28px_rgba(20,40,29,0.08),inset_0_1px_0_rgba(255,255,255,0.58)]">
          <iframe
            title="Standort REACH Start-up Center Münster"
            src="https://maps.google.com/maps?q=REACH%20Start-up%20Center%20M%C3%BCnster%2C%20Geiststra%C3%9Fe%2024%2C%2048151%20M%C3%BCnster&z=15&output=embed"
            className="h-[320px] w-full sm:h-[380px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="mt-10 grid gap-4 sm:mt-20 sm:grid-cols-3 sm:gap-6">
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
