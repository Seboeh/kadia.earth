"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Inter, Newsreader } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useTransform
} from "framer-motion";
import {
  BrainCircuit,
  CalendarClock,
  Clock3,
  Database,
  FileCheck2,
  Leaf,
  MapPin,
  MapPinned,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site/site-footer";

const subheadLead =
  "Ihr digitaler Partner für die artenschutzrechtliche Relevanzprüfung – nachvollziehbar,";
const subheadTail = "regulatorisch konform und in wenigen Minuten erstellt.";
const calendlyPopupUrl =
  "https://calendly.com/contact-kanopy-international/30min?hide_event_type_details=1&hide_gdpr_banner=1";
const calendlyStylesheetId = "calendly-widget-styles";

const howItWorksSteps = [
  {
    title: "Projektgebiet markieren",
    description:
      "Wählen Sie den Standort und zeichnen Sie die Projektfläche in der Kartenansicht ein.",
    icon: MapPin
  },
  {
    title: "Ergebnisse erhalten",
    description:
      "Alle relevanten Arten- und Umweltdaten werden automatisch zusammengeführt – inklusive Prüfbedarfseinschätzung und Kompensationsmaßnahmen.",
    icon: Leaf
  },
  {
    title: "Bericht exportieren",
    description:
      "Erstellen und exportieren Sie Berichte mit nur wenigen Klicks – für Umweltanalysen, artenschutzrechtliche Relevanzprüfungen und Flächenbewertungen. Behördenkonform und nachvollziehbar dokumentiert.",
    icon: FileCheck2
  }
];

const howItWorksPainPoints = [
  {
    metric: "20+",
    title: "Stunden",
    description:
      "Manuelle Zusammenf\u00fchrung beh\u00f6rdlicher Datenbanken, Artendaten und Umweltinformationen bindet enormes Zeitbudget."
  },
  {
    metric: "16",
    title: "Bundesl\u00e4nder",
    description:
      "Berichterstellung nach landesspezifischen Leitf\u00e4den und Richtlinien erfordert manuelle Anpassung."
  },
  {
    metric: "6+",
    title: "Monate",
    description:
      "Verz\u00f6gerung durch enge Kartierungsfristen (z. B. Brutperioden bis M\u00e4rz) \u2013 ohne fr\u00fche Einsch\u00e4tzung steigen Kosten."
  }
];

const compareBenefits = [
  {
    title: "Automatisierte Datenzusammenführung",
    description:
      "Statt Informationen aus Behördenquellen, Artendatenbanken und Umweltinformationen manuell zu recherchieren und zu konsolidieren, führt unsere Lösung relevante Daten automatisiert zusammen – und reduziert den Aufwand von Stunden auf Minuten.",
    icon: Clock3
  },
  {
    title: "Länderspezifische Anpassung",
    description:
      "Berichterstellungen nach landesspezifischen Leitfäden und Richtlinien werden von unserer Lösung bundesweit unterstützt – für konsistente Ergebnisse in allen 16 Bundesländern und deutlich weniger manuellen Anpassungsaufwand.",
    icon: MapPinned,
    label: "Analyse",
    metric: "< 5 Min",
    tone: "tint"
  },
  {
    title: "Reduzierte Fehlerquote",
    description:
      "Statt Daten manuell zu übertragen und anschließend zu prüfen, übernimmt unsere Lösung relevante Informationen automatisiert und validiert sie durchgängig – die Fehlerquote sinkt deutlich, und Prozesse werden verlässlicher, Nacharbeit reduziert sich, die Datenqualität steigt spürbar.",
    icon: FileCheck2
  }
];

const faqItems = [
  {
    question: "Auf welcher rechtlichen Grundlage basiert die digitale Artenschutzanalyse und was ersetzt sie nicht?",
    answer:
      "Die Analyse basiert auf dem Bundesnaturschutzgesetz (BNatSchG), insbesondere §§ 44 und 45, sowie den dazugehörigen Methodenhandbüchern und Leitfäden der Bundesländer zur Artenschutzprüfung (ASP). Sie digitalisiert die ASP Stufe I (Vorprüfung/Grobsichtprüfung) vollständig, indem sie bekannte Datenquellen zu Arten, Habitaten und Schutzgebieten räumlich bewertet und risikobasiert zusammenführt. Eine Feldkartierung oder on-site Untersuchung (ASP Stufe II) wird dadurch nicht ersetzt – sie dient als effizienter erster Schritt für Go/No-Go-Entscheidungen und Planungsabsicherung."
  },
  {
    question: "Was genau erhalten Sie mit der digitalen Artenschutzanalyse?",
    answer:
      "Sie erhalten eine strukturierte Zusammenführung relevanter Arten-, Habitat- und Umweltinformationen inklusive räumlicher Bewertung des Projektgebiets in Form einer artenschutzrechtlichen Relevanzprüfung. Die Ergebnisse dienen als fundierte Grundlage für Vorprüfung, Risikoabschätzung und weitere Planungsschritte."
  },
  {
    question: "Für wen ist die digitale Artenschutzanalyse besonders geeignet?",
    answer:
      "Für Projektentwickler, Umwelt- und Gutachterbüros, die eine schnelle Vorprüfung (ASP1) für artenschutzrechtliche Gutachten benötigen und frühzeitig einschätzen möchten, welche Arten, Schutzgebiete und Konfliktpotenziale relevant sind. Für Naturschutzorganisationen eignet es sich besonders zur Bewertung von Projektgebieten und Flächenpriorisierung – unterstützt durch Arten- und Habitatmodellierungen, die flächendeckend Hinweise auf potenziell sensible Bereiche liefern."
  },
  {
    question: "Sind die Ergebnisse für die Behördenkommunikation nutzbar?",
    answer:
      "Ja. Die Ergebnisse werden nachvollziehbar aufbereitet und in einem standardisierten Bericht ausgegeben. Die Struktur basiert auf gängigen Standards und Methodenleitfäden der Bundesländer und eignet sich damit gut für Behördenprozesse und Abstimmung."
  }
];

const productFeatures = [
  {
    title: "GIS-basierte Standortanalyse",
    description:
      "Wir bündeln die wichtigsten behördlichen Umweltlayer und Arteninformationen in einer einzigen, intuitiven GIS-Ansicht – reduziert Komplexität, macht relevante Zusammenhänge sofort sichtbar und beschleunigt jegliche Artenschutzprüfungen.",
    icon: MapPinned
  },
  {
    title: "Automatisierte Datenintegration",
    description:
      "Behördliche Datenquellen, öffentliche und validierte Umwelt- und Arteninformationen werden automatisch zusammengeführt.",
    icon: Database
  },
  {
    title: "KI gestuetzte Arten- & Habitatmodellierungen",
    description:
      "Wir ermöglichen die Nutzung von bundesweiten Habitatpotenzialanalysen - methodisch validiert, KI basiert und optimiert für Ihre Artenschutzprüfungen, noch bevor vertiefende Schritte nötig sind.",
    icon: BrainCircuit
  },
  {
    title: "Bericht & Dokumentation per Klick",
    description:
      "Ein exportierbarer, standardisierter und behördenkonformer Bericht ist per Klick erstellbar und enthält alle Karten, Quellen sowie eine nachvollziehbare, strukturierte Herleitung aller aufgezeigten Informationen.",
    icon: FileCheck2
  }
];

const audienceGroupTabs = [
  {
    id: "projektentwickler",
    label: "Projektentwicklung",
    text:
      "Sie erhalten frühzeitig eine belastbare Einschätzung, welche Genehmigungsanforderungen und Artenschutzrisiken bundesweit für ihren ausgewählten Projektstandort relevant sind – bevor Zeit und Budget investiert werden.",
    benefits: [
      "Frühe Klarheit in Minuten statt Wochen",
      "Risiken und Auflagen transparent auf einen Blick",
      "Regulatorisch konforme Grundlage für Go/No-Go-Entscheidungen",
      "Bericht als Entscheidungsbasis exportierbar"
    ],
    proof: "Von Standortwahl -> Einschätzung in Minuten",
    cta: "Demo anfragen",
    visionText:
      "Sie erhalten frühzeitig eine belastbare Einschätzung, welche Genehmigungsanforderungen und Artenschutzrisiken bundesweit für ihren ausgewählten Projektstandort relevant sind – bevor Zeit und Budget investiert werden."
  },
  {
    id: "planungsbuero",
    label: "Umwelt- & Gutachterbüros",
    text:
      "Automatisieren Sie die Zusammenführung relevanter Arten- und Umweltdaten und vereinfachen Sie Ihre Gutachten- und Planungsprozesse – inklusive effizienter Ableitung und Planung von Kompensationsmaßnahmen.",
    benefits: [
      "Deutlich weniger manuelle Datenrecherche",
      "Alle relevanten Quellen gebündelt im Dashboard",
      "Ergebnisse als regulatorisch konformer Bericht exportierbar",
      "Schneller von der Fläche zur prüffähigen Dokumentation"
    ],
    proof: "Stunden sparen bei Recherche & Bericht",
    cta: "Demo anfragen",
    visionText:
      "Automatisieren Sie die Zusammenführung relevanter Arten- und Umweltdaten und vereinfachen Sie Ihre Gutachten- und Planungsprozesse – inklusive effizienter Ableitung und Planung von Kompensationsmaßnahmen."
  },
  {
    id: "naturschutzorganisation",
    label: "Naturschutzorganisation",
    text:
      "Erhalten Sie frühzeitig eine fundierte Einschätzung zu Schutzgebieten auf Basis transparenter Biodiversitätsdaten – und maximieren Sie die Wirkung Ihrer Maßnahmen durch Artenmodellierungen und Habitatpotenzialanalysen.",
    benefits: [
      "Transparente Datengrundlage in Minuten statt Wochen",
      "Wirkungspotenziale auf einen Blick",
      "Nachvollziehbare Basis für Erhalt & Renaturierung",
      "Ergebnisse als Bericht exportierbar"
    ],
    proof: "Mehr Klarheit, weniger Reibung",
    cta: "Austausch starten",
    visionText:
      "Erhalten Sie frühzeitig eine fundierte Einschätzung zu Schutzgebieten auf Basis transparenter Biodiversitätsdaten – und maximieren Sie die Wirkung Ihrer Maßnahmen durch Artenmodellierungen und Habitatpotenzialanalysen."
  }
] as const;
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

const wordVariants = {
  hidden: { y: 28, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7 }
  }
};

const fadeUp = {
  hidden: { y: 18, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7 }
  }
};

const fadeUpImageDelayed = {
  hidden: { y: 24, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.9,
      delay: 0.75,
    }
  }
};

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap"
});

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

export default function HomePage() {
  const { mouseX, mouseY, scrollY } = useMouseFollower();
  const pageMouseY = useTransform(mouseY, (y) => y + scrollY.get());
  const spotlight = useMotionTemplate`radial-gradient(280px at ${mouseX}px ${pageMouseY}px, rgba(10, 10, 10, 0.42), transparent 70%)`;
  const timelineTrackRef = useRef<HTMLDivElement | null>(null);
  const timelineBaseRef = useRef<HTMLDivElement | null>(null);
  const timelineFillRef = useRef<HTMLDivElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isQuickNavOpen, setIsQuickNavOpen] = useState(false);
  const [activeAudienceTab, setActiveAudienceTab] = useState<(typeof audienceGroupTabs)[number]["id"]>(
    "projektentwickler"
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const activeAudienceContent =
    audienceGroupTabs.find((tab) => tab.id === activeAudienceTab) ?? audienceGroupTabs[0];
  const quickNavLinks = [
    { id: "hero", label: "Start" },
    { id: "produkt-compare", label: "Vorteile" },
    { id: "workflow", label: "Ablauf" },
    { id: "fuer-wen", label: "Zielgruppe" },
    { id: "technologie", label: "Technologie" },
    { id: "faq", label: "FAQ" }
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
      const calendly = (window as Window & { Calendly?: { initPopupWidget?: (opts: { url: string }) => void } }).Calendly;
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

  useEffect(() => {
    let rafId = 0;

    const updateLine = () => {
      rafId = 0;
      const track = timelineTrackRef.current;
      const lineBase = timelineBaseRef.current;
      const lineFill = timelineFillRef.current;
      if (!track || !lineBase || !lineFill) return;

      const rect = track.getBoundingClientRect();
      const viewportCenter = window.innerHeight * 0.5;
      const rawProgress = (viewportCenter - rect.top) / rect.height;
      const progress = Math.max(0, Math.min(1, rawProgress));

      const lineBaseHeight = lineBase.offsetHeight;
      const lineFillHeight = progress * lineBaseHeight;
      lineFill.style.height = `${lineFillHeight}px`;

      const dots = track.querySelectorAll<HTMLElement>("[data-timeline-dot='true']");
      const stepIsActive: boolean[] = [];
      dots.forEach((dot, index) => {
        const dotRect = dot.getBoundingClientRect();
        const dotCenter = dotRect.top - rect.top + dotRect.height / 2;
        const isActive = lineFillHeight >= dotCenter;
        stepIsActive[index] = isActive;

        const core = dot.querySelector<HTMLElement>("[data-timeline-core='true']");
        const ping = dot.querySelector<HTMLElement>("[data-timeline-ping='true']");
        if (!core || !ping) return;

        core.style.backgroundColor = isActive ? "#2E5C55" : "#C6CFCC";
        core.style.borderColor = isActive ? "#2E5C55" : "transparent";
        core.style.boxShadow = isActive
          ? "0 0 0 3px rgba(46,92,85,0.22), 0 0 10px rgba(46,92,85,0.32)"
          : "0 0 0 4px rgba(255,255,255,0.9)";

        ping.classList.toggle("animate-ping", isActive);
        ping.classList.toggle("opacity-100", isActive);
        ping.classList.toggle("opacity-0", !isActive);
      });

    };

    const requestUpdate = () => {
      if (!rafId) rafId = window.requestAnimationFrame(updateLine);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-x-hidden bg-white font-sans text-ink"
      style={{ fontSize: "clamp(13px, 0.42vw + 8.8px, 16px)" }}
    >
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
            <div className="flex items-center gap-5">
              <Link
                href="/ueber-uns"
                className="hidden text-xs font-medium tracking-[0.02em] text-ink/80 transition hover:text-ink md:inline-flex"
              >
                Über uns
              </Link>
              <Link
                href="/kontakt"
                className="hidden text-xs font-medium tracking-[0.02em] text-ink/80 transition hover:text-ink md:inline-flex"
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

      <section id="hero" className="relative z-10 w-full">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/kadia-hero.png"
            alt=""
            fill
            className="object-cover object-[center_18%] -translate-y-10 sm:-translate-y-14 lg:-translate-y-[5.5rem] xl:-translate-y-[7.5rem] 2xl:-translate-y-[9.5rem]"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-white/24" />
          <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-72 bg-gradient-to-b from-transparent via-white/88 to-white sm:h-88 md:h-[24rem]" />
          <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-10 bg-white" />
        </div>
        <div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end gap-5 px-4 pb-10 pt-24 text-center sm:gap-6 sm:px-8 sm:pb-20 sm:pt-28 md:translate-y-2">
          <div className="relative mx-auto w-full max-w-2xl">
            <motion.div
              className="mb-5 flex justify-center"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-linen/55 px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-ink/80 shadow-[0_12px_28px_rgba(20,40,29,0.12),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl supports-[backdrop-filter]:bg-linen/50">
                <span className="relative inline-flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7FA89F]/45" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#7FA89F]" />
                </span>
                Demo verfügbar
              </span>
            </motion.div>
            <motion.h1
              className="relative z-10 max-w-3xl text-[clamp(1.35rem,5.8vw,2.95rem)] font-bold leading-[1.12] tracking-[-0.01em] text-ink"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.span className="mr-3 inline-block" variants={wordVariants}>
                Artenschutzanalyse
              </motion.span>
              <motion.span className="mr-3 inline-block" variants={wordVariants}>
                in
              </motion.span>
              <br className="hidden sm:block" />
              <motion.span className="inline-block sm:whitespace-nowrap" variants={wordVariants}>
                wenigen{" "}
                <span className="relative isolate inline-block px-1 before:absolute before:-left-1.5 before:-right-1 before:bottom-[0.03em] before:h-[0.34em] before:rotate-[-2.4deg] before:rounded-[62%] before:bg-[linear-gradient(92deg,rgba(247,231,166,0.88)_0%,rgba(242,220,147,0.97)_42%,rgba(247,231,166,0.84)_100%)] before:opacity-100 before:blur-[0.42px] before:z-0 after:absolute after:-left-1 after:-right-2 after:bottom-[-0.02em] after:h-[0.24em] after:rotate-[2.1deg] after:rounded-[58%] after:bg-[linear-gradient(98deg,rgba(247,231,166,0.42)_0%,rgba(242,220,147,0.62)_52%,rgba(247,231,166,0.34)_100%)] after:blur-[0.4px] after:z-0">
                  <span className="relative z-10">Klicks</span>
                </span>
              </motion.span>
            </motion.h1>
          </div>
          <motion.p
            className="mx-auto max-w-[34ch] px-1 text-balance text-[clamp(0.95rem,1.05vw,1.08rem)] font-normal leading-[1.55] text-ink/75 sm:max-w-3xl sm:px-0 lg:max-w-5xl"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <span className="inline lg:block lg:whitespace-nowrap">{subheadLead} </span>
            <span className="inline lg:mt-2 lg:block">{subheadTail}</span>
          </motion.p>
          <motion.div
            className="flex justify-center"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <Link
              href="#produkt-compare"
              aria-label="Zur Sektion Messbare Vorteile auf einen Blick"
              onClick={(event) => {
                event.preventDefault();
                const targetSection = document.getElementById("produkt-compare");
                targetSection?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="inline-flex h-10 w-20 items-center justify-center text-ink transition hover:-translate-y-0.5"
            >
              <svg viewBox="0 0 28 14" aria-hidden="true" className="h-4 w-14">
                <path
                  d="M1.5 1.5L14 12.5L26.5 1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="h-12 sm:h-16" />
        <div className="mx-auto h-px w-full max-w-5xl bg-ink/12" />
        <div className="h-4 sm:h-6" />
      </div>

      <section id="produkt-compare" className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pb-36">
        <div className="relative mt-4 bg-transparent px-3 py-8 sm:px-10 sm:py-12 lg:px-6">
          <div className="max-w-4xl">
            <h3 className="text-[clamp(1.35rem,2.2vw,1.95rem)] font-semibold leading-[1.16] tracking-[-0.02em] text-ink">
              Weniger Recherche. Mehr Zeit fürs Wesentliche.
            </h3>
            <p className="mt-4 max-w-4xl text-[clamp(0.92rem,1vw,1.05rem)] font-normal leading-[1.6] text-ink/70 xl:max-w-none xl:whitespace-nowrap">
              Erkennen Sie frühzeitig, wie ein Standort artenschutzrechtlich zu bewerten ist.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 min-[760px]:grid-cols-3 sm:gap-8 lg:gap-10">
            <div>
              <StrikeReplaceMetric
                oldValue="18+"
                oldLabel="Stunden"
                newValue="8+"
                newLabel="Minuten"
                strikeDelayMs={760}
                newDelayMs={1360}
                strikeTopClassName="top-[64%]"
                splitSwapLabels
              />
            </div>
            <div>
              <StrikeReplaceMetric
                oldValue="3"
                oldLabel="Bundesländer"
                newValue="16"
                newLabel="Bundesländer"
                strikeDelayMs={430}
                newDelayMs={700}
              />
            </div>
            <div className="col-span-2 justify-self-center min-[760px]:col-span-1 min-[760px]:justify-self-auto">
              <StrikeReplaceMetric
                oldValue="1%"
                oldLabel="Fehlerquote"
                newValue="< 0,1%"
                newLabel="Fehlerquote"
                strikeDelayMs={520}
                newDelayMs={790}
              />
            </div>
          </div>

          <div className="mt-6 h-px w-full bg-ink/10" />

          <div className="mt-5 grid gap-8 text-center md:grid-cols-3 md:gap-0 md:text-left">
            {compareBenefits.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className={`mx-auto max-w-[42ch] ${index > 0 ? "md:border-l md:border-ink/10 md:pl-6 lg:pl-7" : "md:pl-0"} ${index < 2 ? "md:pr-6 lg:pr-7" : "md:pr-0"} md:mx-0 md:max-w-none`}
                >
                  {Icon ? (
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center text-black md:mx-0 md:justify-start">
                      <Icon className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                  ) : null}
                  <h4 className="break-words hyphens-auto text-lg font-normal leading-[1.3] tracking-[-0.01em] text-ink [overflow-wrap:anywhere] sm:text-xl">
                    {item.title}
                  </h4>
                  <p className="mt-4 max-w-none break-words hyphens-auto text-sm font-light leading-[1.72] text-ink/85 [overflow-wrap:anywhere] sm:text-base">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-0 sm:px-6 sm:pb-32"
      >
        <div className="relative px-0 py-12 sm:px-4 sm:py-14 lg:px-8">
            <div className="relative text-center">
              <h2 className="text-[clamp(1.45rem,2.6vw,2.45rem)] font-semibold leading-[1.16] tracking-[-0.02em] text-ink">
              Artenschutzanalyse in nur drei Schritten
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-[clamp(0.92rem,1vw,1.05rem)] font-normal leading-[1.6] text-ink/65">
              {"Digitale Unterstützung für schnellere Entscheidungen und regulatorisch konforme artenschutzrechtliche Relevanzprüfungen."}
            </p>
          </div>

          <div
            ref={timelineTrackRef}
            className="relative mx-auto mt-12 max-w-5xl pb-10 md:pb-14"
          >
            <div
              ref={timelineBaseRef}
              className="pointer-events-none absolute left-1/2 top-0 bottom-1 z-40 hidden w-[2px] -translate-x-1/2 rounded-full bg-[#C6CFCC] md:block"
            />
            <div
              ref={timelineFillRef}
              className="pointer-events-none absolute left-1/2 top-0 z-50 hidden w-[2px] -translate-x-1/2 rounded-full bg-[#2E5C55] md:block"
              style={{ height: 0 }}
            />
            <div className="space-y-14 md:space-y-16">
              {howItWorksSteps.map((step, index) => {
                const stepOnRight = index === 1;
                return (
                  <article
                    key={step.title}
                    className="relative grid items-start justify-items-center gap-6 md:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] md:justify-items-stretch md:gap-8"
                  >
                    <div
                      className={`relative z-30 text-center md:pt-2 md:text-left ${stepOnRight ? "md:col-start-3" : "md:col-start-1 md:justify-self-end md:text-right"}`}
                    >
                      <motion.div className="space-y-5">
                        <p className={`${newsreader.className} text-[clamp(1.9rem,3.4vw,2.7rem)] font-semibold leading-none tracking-[-0.02em] text-[#2E5C55]`}>
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="text-xl font-semibold leading-[1.35] tracking-[-0.01em] text-ink sm:text-2xl">
                          {step.title}
                        </h3>
                        <p className="mx-auto max-w-[44ch] text-sm font-light leading-[1.72] text-ink/85 sm:text-base md:mx-0">
                          {step.description}
                        </p>
                      </motion.div>
                    </div>
                    <div className="pointer-events-none absolute left-1/2 top-12 z-[60] hidden h-4 w-4 -translate-x-1/2 items-center justify-center md:flex">
                      <span data-timeline-dot="true" className="relative inline-flex h-3.5 w-3.5 items-center justify-center">
                        <span data-timeline-ping="true" className="absolute inset-0 rounded-full bg-[#2E5C55]/35 opacity-0" />
                        <span data-timeline-core="true" className="relative inline-flex h-3.5 w-3.5 rounded-full border border-transparent bg-[#C6CFCC] shadow-[0_0_0_4px_rgba(255,255,255,0.9)] transition-[background-color,border-color,box-shadow] duration-300" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="fuer-wen" className="relative z-10 mt-14 sm:mt-32">
        <div className="relative mx-3 overflow-hidden rounded-[32px] py-12 shadow-[0_30px_60px_rgba(20,40,29,0.2)] sm:mx-6 sm:rounded-[44px] sm:py-20">
          <Image
            src="/images/Widget-Section.png"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-white/24" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-white/14 to-white/20" />

          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="rounded-[24px] border border-white/55 bg-white/72 p-6 shadow-[0_24px_52px_rgba(20,40,29,0.13)] backdrop-blur-[2.5px] sm:rounded-[30px] sm:p-8 md:p-14">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-xl">
                    <p className="text-xs uppercase tracking-[0.4em] text-ink/70">
                    Für wen?
                  </p>
                  <h2 className="mt-4 break-words text-lg font-semibold leading-[1.2] tracking-[-0.01em] text-ink sm:text-3xl">
                    {activeAudienceContent.label}
                  </h2>
                  <p className="mt-4 text-[clamp(0.92rem,1vw,1.04rem)] font-light leading-[1.6] text-ink/85">
                    {activeAudienceContent.visionText}
                  </p>
                  <motion.div
                    key={activeAudienceContent.id}
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: {},
                      show: {
                        transition: { staggerChildren: 0.12 }
                      }
                    }}
                    className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2"
                  >
                    {activeAudienceContent.benefits.map((benefit) => (
                      <motion.p
                        key={benefit}
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
                        }}
                        className="flex items-start gap-2 text-sm font-medium leading-relaxed text-ink/90"
                      >
                        <span className="relative mt-1.5 inline-flex h-3 w-3 flex-shrink-0 items-center justify-center">
                          <span
                            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E5C55]/45"
                            style={{ animationDuration: "2.2s" }}
                          />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2E5C55]" />
                        </span>
                        <span>{benefit}</span>
                      </motion.p>
                    ))}
                  </motion.div>
                  <Button
                    type="button"
                    onClick={openCalendlyPopup}
                    className="mt-8 w-full rounded-full border border-white/55 bg-[#F7E7A6]/68 px-5 py-2.5 text-sm font-medium tracking-[0.02em] text-ink shadow-[0_10px_22px_rgba(20,40,29,0.08),inset_0_1px_0_rgba(255,255,255,0.56)] transition hover:-translate-y-0.5 hover:bg-[#F2DC93]/78 sm:mt-10 sm:w-auto sm:text-base"
                  >
                    Demo anfragen
                  </Button>
                </div>
                <div className="flex w-full flex-col gap-4 lg:w-[280px] lg:self-center lg:justify-center lg:min-h-[320px]">
                  {audienceGroupTabs.map((tab) => {
                    const isActive = tab.id === activeAudienceTab;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveAudienceTab(tab.id)}
                        className={`relative overflow-hidden rounded-2xl border p-4 text-left text-sm shadow-[0_12px_30px_rgba(20,40,29,0.08)] transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/35 ${
                          isActive
                            ? "border-[#2E5C55]/34 bg-[#F1F2F3] text-ink ring-1 ring-[#2E5C55]/16 shadow-[0_0_30px_rgba(46,92,85,0.24),0_0_56px_rgba(46,92,85,0.11),0_14px_30px_rgba(20,40,29,0.11),inset_0_1px_0_rgba(255,255,255,0.62)]"
                            : "border-white/85 bg-white/90 text-ink/88 hover:-translate-y-0.5 hover:border-ink/25 hover:bg-white hover:shadow-[0_16px_30px_rgba(20,40,29,0.12)]"
                        }`}
                      >
                        <span className={`block text-xs font-light uppercase tracking-[0.24em] ${isActive ? "text-ink/55" : "text-ink/45"}`}>
                          Zielgruppe
                        </span>
                        <span className={`mt-2 block break-words text-sm font-semibold sm:text-base ${isActive ? "text-ink" : "text-ink/82"}`}>
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="technologie" className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-44 lg:px-10 lg:pt-56">
        <div className="text-center">
          <h2 className="text-[clamp(1.45rem,2.6vw,2.45rem)] font-semibold leading-[1.16] tracking-[-0.02em] text-ink">
            Technologie für planbaren Artenschutz
          </h2>
          <p className="mx-auto mt-5 max-w-5xl text-[clamp(0.92rem,1vw,1.05rem)] font-normal leading-[1.6] text-ink/70">
            Als digitales Werkzeug für Projektentwicklung, Umwelt- & Gutachterbüros sowie Naturschutzorganisationen
            vereinen wir technologische Präzision und fachliche Tiefe – für nachvollziehbare und behördlich konforme
            Artenschutzanalysen.
          </p>
        </div>

        <div className="mx-auto mt-14 grid w-full max-w-[76rem] gap-6 sm:mt-20 lg:grid-cols-12">
          {productFeatures.map((feature, index) => {
            const cardLayoutClass =
              index === 0
                ? "lg:col-span-8 lg:min-h-[400px]"
                : index === 1
                  ? "lg:col-span-4 lg:min-h-[345px]"
                  : index === 2
                    ? "lg:col-span-6 lg:min-h-[320px]"
                    : "lg:col-span-6 lg:min-h-[370px]";
            const tintPrimaryClass = index % 2 === 0 ? "bg-[#2E5C55]/18" : "bg-[#F7E7A6]/28";
            const tintSecondaryClass = index % 2 === 0 ? "bg-[#F7E7A6]/26" : "bg-[#2E5C55]/16";
            const tintPrimaryPositionClass =
              index === 0
                ? "-top-12 right-8"
                : index === 1
                  ? "top-10 -right-14"
                  : index === 2
                    ? "-bottom-12 left-10"
                    : "top-14 left-[46%]";
            const tintSecondaryPositionClass =
              index === 0
                ? "bottom-8 left-16"
                : index === 1
                  ? "-bottom-12 left-8"
                  : index === 2
                    ? "top-8 right-10"
                    : "-top-10 left-6";

            return (
              <article key={feature.title} className={`relative overflow-hidden rounded-[28px] border border-ink/10 bg-white/92 p-5 shadow-[0_20px_50px_rgba(20,40,29,0.08)] sm:p-6 ${cardLayoutClass}`}>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(20,40,29,0.08),transparent_42%)]" />
                <div className="relative">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink/10 bg-white text-[#2E5C55]">
                      <feature.icon className="h-[19px] w-[19px]" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3 className="text-base font-semibold leading-[1.3] tracking-[-0.01em] text-ink sm:text-xl">
                        {feature.title}
                      </h3>
                      <p className="mt-3 max-w-none text-sm leading-[1.65] text-ink/72 sm:text-base">{feature.description}</p>
                    </div>
                  </div>

                  <div className="relative mt-4">
                    <div className={`pointer-events-none absolute ${tintPrimaryPositionClass} h-44 w-44 rounded-full blur-3xl ${tintPrimaryClass}`} />
                    <div className={`pointer-events-none absolute ${tintSecondaryPositionClass} h-36 w-36 rounded-full blur-3xl ${tintSecondaryClass}`} />
                    <div className="relative">
                    {index === 0 ? (
                      <div className="overflow-hidden pt-3 sm:pt-8">
                        <Image
                          src="/images/GIS.png"
                          alt="GIS Kartenansicht"
                          width={1400}
                          height={900}
                          className="h-[160px] w-full object-contain object-center sm:h-[250px]"
                        />
                      </div>
                    ) : null}

                    {index === 1 ? (
                      <div className="mt-4 overflow-hidden">
                        <Image
                          src="/images/API.png"
                          alt="Automatisierte Datenintegration"
                          width={1200}
                          height={700}
                          className="h-[170px] w-full object-contain object-center sm:h-[280px]"
                        />
                      </div>
                    ) : null}

                    {index === 2 ? (
                      <div className="overflow-hidden">
                        <Image
                          src="/images/KI.png"
                          alt="KI-basierte Arten- und Habitatprognose"
                          width={1200}
                          height={700}
                          className="h-[170px] w-full object-contain sm:h-[280px]"
                        />
                      </div>
                    ) : null}

                    {index === 3 ? (
                      <div className="overflow-hidden">
                        <Image
                          src="/images/Report.png"
                          alt="Bericht und Dokumentation"
                          width={1200}
                          height={700}
                          className="h-[170px] w-full object-contain sm:h-[280px]"
                        />
                      </div>
                    ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="faq" className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pb-32 sm:pt-44">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
          <div>
            <h2 className="text-xl font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-3xl">
              Häufig gestellte
              <br />
              Fragen
            </h2>
          </div>
          <div>
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={item.question} className="border-b border-ink/10 py-6">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-6 text-left"
                  >
                    <span className="min-w-0 flex-1 text-base font-medium leading-[1.35] text-ink sm:text-lg">
                      {item.question}
                    </span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2E5C55]/25 text-[#2E5C55]">
                      <Plus className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`} />
                    </span>
                  </button>
                  {isOpen ? (
                    <p className="mt-3 max-w-3xl pr-0 text-sm font-normal leading-[1.6] text-ink/70 sm:pr-10">
                      {item.answer}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-24 sm:px-6 sm:pb-32 sm:pt-32">
  <h2 className="mx-auto max-w-6xl text-center text-[clamp(1.45rem,5vw,3rem)] font-semibold italic leading-[1.2] tracking-[-0.01em] text-ink">
    Schließen Sie sich den Teams an, die Artenschutzanalysen in Minuten meistern. Buchen Sie jetzt Ihren Demo Termin.
  </h2>
  <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:mt-12">
    <Button
      asChild
      variant="outline"
      className="h-12 w-full justify-center rounded-full border border-white/80 bg-white px-6 text-sm font-medium tracking-[0.02em] text-ink shadow-[0_12px_30px_rgba(20,40,29,0.10),inset_0_1px_0_rgba(255,255,255,0.7)] transition hover:scale-[1.02] hover:bg-white/95 sm:w-auto sm:text-base"
    >
      <Link href="/kontakt">Kontakt</Link>
    </Button>
    <Button
      type="button"
      onClick={openCalendlyPopup}
      className="h-12 w-full justify-center rounded-full border border-white/45 bg-[#F7E7A6]/72 px-6 text-sm font-medium tracking-[0.02em] text-ink shadow-[0_14px_36px_rgba(247,231,166,0.28),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl transition hover:scale-[1.02] hover:bg-[#F2DC93]/76 sm:w-auto sm:text-base"
    >
      Demo anfragen
    </Button>
  </div>
</section>

      <SiteFooter />
    </main>
  );
}

function StrikeReplaceMetric({
  oldValue,
  oldLabel,
  newValue,
  newLabel,
  strikeDelayMs = 320,
  newDelayMs = 590,
  strikeTopClassName = "top-[59%]",
  splitSwapLabels = false
}: {
  oldValue: string;
  oldLabel: string;
  newValue: string;
  newLabel: string;
  strikeDelayMs?: number;
  newDelayMs?: number;
  strikeTopClassName?: string;
  splitSwapLabels?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { amount: 0.7 });
  const [showStrike, setShowStrike] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const hasLabelSwap = oldLabel !== newLabel;

  useEffect(() => {
    if (!isInView) {
      setShowStrike(false);
      setShowNew(false);
      return;
    }

    const strikeTimer = window.setTimeout(() => setShowStrike(true), strikeDelayMs);
    const newTimer = window.setTimeout(() => setShowNew(true), newDelayMs);

    return () => {
      window.clearTimeout(strikeTimer);
      window.clearTimeout(newTimer);
    };
  }, [isInView, strikeDelayMs, newDelayMs]);

  return (
    <div ref={ref} className="min-w-0 text-center">
      <div className="flex min-h-[2.25rem] items-end justify-center gap-1.5 sm:min-h-0 sm:gap-4">
        <span className="relative inline-block">
          <p className={`${newsreader.className} whitespace-nowrap text-[clamp(1.15rem,5.4vw,1.7rem)] font-bold leading-[0.95] tracking-[-0.03em] text-[#1F4F47] sm:text-[clamp(1.7rem,3.1vw,2.55rem)]`}>
            {oldValue}
          </p>
          <motion.span
            aria-hidden="true"
            className={`pointer-events-none absolute -left-4 -right-3 ${strikeTopClassName} h-[0.44em] -translate-y-1/2 rotate-[-17deg] rounded-[60%] bg-[linear-gradient(95deg,rgba(247,231,166,0.86)_0%,rgba(242,220,147,0.98)_48%,rgba(247,231,166,0.82)_100%)]`}
            initial={{ scaleX: 0, opacity: 0, x: -5 }}
            animate={showStrike ? { scaleX: 1, opacity: 1, x: 0 } : { scaleX: 0, opacity: 0, x: -5 }}
            transition={{ duration: 0.34, ease: "easeOut" }}
            style={{ transformOrigin: "left center" }}
          />
        </span>
        <motion.p
          className={`${newsreader.className} whitespace-nowrap text-[clamp(1.15rem,5.4vw,1.7rem)] font-bold leading-[0.95] tracking-[-0.03em] text-[#2E5C55] sm:text-[clamp(1.7rem,3.1vw,2.55rem)]`}
          initial={{ opacity: 0, x: -6 }}
          animate={showNew ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {newValue}
        </motion.p>
      </div>
      {hasLabelSwap && splitSwapLabels ? (
        <div className="mt-1.5 flex min-h-[1.35rem] flex-col items-center justify-center gap-0.5 sm:mt-4 sm:min-h-0 sm:flex-row sm:items-start sm:gap-4">
          <span className="relative inline-block whitespace-nowrap text-center text-[clamp(0.72rem,2.7vw,0.95rem)] font-medium leading-[1.25] text-ink sm:text-[clamp(0.95rem,1.6vw,1.2rem)] sm:leading-[1.3]">
            {oldLabel}
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute -left-2 -right-2 top-[90%] h-[0.58em] -translate-y-1/2 rotate-[-14deg] rounded-[60%] bg-[linear-gradient(95deg,rgba(247,231,166,0.86)_0%,rgba(242,220,147,0.98)_48%,rgba(247,231,166,0.82)_100%)]"
              initial={{ scaleX: 0, opacity: 0, x: -3 }}
              animate={showStrike ? { scaleX: 1, opacity: 1, x: 0 } : { scaleX: 0, opacity: 0, x: -3 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
            />
          </span>
          <motion.p
            className="whitespace-nowrap text-center text-[clamp(0.72rem,2.8vw,0.95rem)] font-medium leading-[1.25] text-ink sm:text-[clamp(0.95rem,1.6vw,1.2rem)] sm:leading-[1.3]"
            initial={{ opacity: 0, x: -4 }}
            animate={showNew ? { opacity: 1, x: 0 } : { opacity: 0, x: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {newLabel}
          </motion.p>
        </div>
      ) : hasLabelSwap ? (
        <motion.p
          key={showNew ? newLabel : oldLabel}
          className="mt-1.5 min-h-[1.35rem] whitespace-nowrap text-center text-[clamp(0.72rem,2.8vw,0.95rem)] font-medium leading-[1.25] text-ink sm:mt-4 sm:min-h-0 sm:text-[clamp(0.95rem,1.6vw,1.2rem)] sm:leading-[1.3]"
          initial={{ opacity: 0.55, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          {showNew ? newLabel : oldLabel}
        </motion.p>
      ) : (
        <p className="mt-1.5 min-h-[1.35rem] whitespace-nowrap text-center text-[clamp(0.72rem,2.8vw,0.95rem)] font-medium leading-[1.25] text-ink sm:mt-4 sm:min-h-0 sm:text-[clamp(0.95rem,1.6vw,1.2rem)] sm:leading-[1.3]">
          {oldLabel}
        </p>
      )}
    </div>
  );
}



























































































