"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Hash,
  Info,
  LocateFixed,
  MapPinned,
  Ruler,
  Search,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultAreaMapClient } from "@/components/app/map/ResultAreaMapClient";
import {
  SCREENING_SESSION_KEY,
  ScreeningSessionData
} from "@/lib/app/screeningSession";

type SpeciesRow = {
  art: string;
  latin: string;
  tag: string;
  pruefung: string;
  pruefTone: "warning" | "ok";
  flaechenanteil: string;
};

type CompensationSection = {
  title: string;
  bullets: string[];
};

type SourceHabitatEntry = {
  title: string;
  text: string;
};

type SpeciesDetail = {
  compensation: {
    headline: string;
    intro: string;
    sections: CompensationSection[];
    notes: string[];
    sources: string[];
  };
  source: {
    lanuk: string[];
    gbif: string[];
    score: string;
    scoreText: string;
    regulatoryUnit: string;
    legalSource: string;
    habitatEntries: SourceHabitatEntry[];
  };
};

const speciesRows: SpeciesRow[] = [
  {
    art: "Feldlerche",
    latin: "Alauda arvensis",
    tag: "Europaeische Vogelarten (Vogelschutz-RL)",
    pruefung: "Lokale Massnahmen",
    pruefTone: "warning",
    flaechenanteil: "34%"
  },
  {
    art: "Wachtel",
    latin: "Coturnix coturnix",
    tag: "Rote Liste",
    pruefung: "Lokale Massnahmen",
    pruefTone: "warning",
    flaechenanteil: "31%"
  },
  {
    art: "Grasfrosch",
    latin: "Rana temporaria",
    tag: "Rote Liste",
    pruefung: "Lokale Massnahmen",
    pruefTone: "warning",
    flaechenanteil: "23%"
  },
  {
    art: "Mauersegler",
    latin: "Apus apus",
    tag: "Europaeische Vogelarten (Vogelschutz-RL)",
    pruefung: "Lokale Massnahmen",
    pruefTone: "warning",
    flaechenanteil: "5%"
  },
  {
    art: "Rote Waldameise",
    latin: "Formica rufa",
    tag: "BArtSchV Anlage 1 (BNatSchG Paragraph 54)",
    pruefung: "Nicht pruefrelevant",
    pruefTone: "ok",
    flaechenanteil: "10%"
  },
  {
    art: "Hornisse",
    latin: "Vespa crabro",
    tag: "BArtSchV Anlage 1 (BNatSchG Paragraph 54)",
    pruefung: "Nicht pruefrelevant",
    pruefTone: "ok",
    flaechenanteil: "5%"
  }
];

const habitatCategories = [
  {
    category: "Klima",
    metrics: [
      { label: "Temperatur Jahresmittel (C)", value: "9.8" },
      { label: "Temperatur waermster Monat / Sommermittel (C)", value: "19.6" },
      { label: "Niederschlag Jahressumme (mm)", value: "640" },
      { label: "Niederschlag waermstes Quartal / Sommer (mm)", value: "210" }
    ],
    sources: ["WorldClim (Bioclim)", "CHELSA", "ERA5-(Land) Raster"]
  },
  {
    category: "Topografie",
    metrics: [
      { label: "Hoehe (m)", value: "148" },
      { label: "Hangneigung (°)", value: "6.2" },
      { label: "Exposition (dominant)", value: "SW" }
    ],
    sources: ["SRTM", "Copernicus DEM", "EU-DEM (je nach Region)"]
  },
  {
    category: "Landbedeckung / Habitat",
    metrics: [
      { label: "Waldanteil (%)", value: "18" },
      { label: "Acker (%)", value: "52" },
      { label: "Siedlung (%)", value: "24" },
      { label: "Wasser (%)", value: "6" }
    ],
    sources: ["CORINE Land Cover (EU)", "ESA WorldCover (global)", "Copernicus Global Land Cover"]
  },
  {
    category: "Boden",
    metrics: [
      { label: "pH (Topsoil)", value: "6.3" },
      { label: "Textur (dominant)", value: "Lehm" },
      { label: "Organischer Kohlenstoff (SOC) (%)", value: "1.7" }
    ],
    sources: ["SoilGrids (global)", "nationale Bodenuebersichten (falls verfuegbar)"]
  },
  {
    category: "Hydrologie",
    metrics: [
      { label: "Distanz zum naechsten Gewaesser (m)", value: "420" },
      { label: "Wasserflaechenanteil (%)", value: "6" }
    ],
    sources: ["HydroSHEDS / HydroRIVERS", "OpenStreetMap Wasser", "EU-Hydro (EU)"]
  },
  {
    category: "Menschlicher Druck",
    metrics: [
      { label: "Versiegelung / Built-up Anteil (%)", value: "22" },
      { label: "Distanz zur naechsten Strasse (m)", value: "95" },
      { label: "Bevoelkerungsdichte (Einw./km²)", value: "420" },
      { label: "Nachtlicht (Index)", value: "0.31" }
    ],
    sources: ["Copernicus Imperviousness / HRL (EU)", "GHSL (global built-up)", "OpenStreetMap Strassen", "WorldPop / GHSL Population", "VIIRS Night Lights"]
  },
  {
    category: "Vegetation (Biotik-Proxy)",
    metrics: [
      { label: "NDVI Median", value: "0.54" },
      { label: "NDVI Sommer", value: "0.63" }
    ],
    sources: ["MODIS NDVI (global)", "Copernicus Global Land Service NDVI", "Sentinel-2 abgeleitet"]
  }
] as const;

const speciesDetails: Record<string, SpeciesDetail> = {
  Feldlerche: {
    compensation: {
      headline: "Feldlerche - Habitatoptimierungen",
      intro:
        "Fuer die Feldlerche (Alauda arvensis) als lokale Kompensationsmassnahme muessen offene Acker- oder Gruenlandflaechen extensiviert werden, um niedrige Vegetation fuer Brut und Nahrung zu schaffen. Massnahmen erfolgen pro Revier im Verhaeltnis 1:1 zur Beeintraechtigung.",
      sections: [
        {
          title: "Massnahmen im Ackerland (O2.1, O2.2)",
          bullets: [
            "Ackerbrache/Selbstbegruenung oder Bluehflaeche anlegen (min. 0,5 ha/Rev.).",
            "Saatreihen mit doppeltem Abstand (min. 20 cm, min. 1 ha/Rev.) in Winterweizen/Triticale/Sommergetreide.",
            "Streifen: 20 m breit, 100-150 m lang, Abstand >=25 m zu Wegen.",
            "Keine Duenger/Pestizide, Rotation jaehrlich, Umbruch Herbst/Winter.",
            "Wirksam sofort nach Etablierung, Eignung hoch."
          ]
        },
        {
          title: "Extensivgruenland (O1.1)",
          bullets: [
            "Min. 1 ha/Rev., Kraeuteranteil erhoehen (autochthones Saatgut).",
            "Vegetationshoehe max. 20-40 cm; keine Mahd/hohe Beweidung April-Juli.",
            "Keine Duenger/Pestizide.",
            "Jaehrliche Pflege, wirksam in 2-5 Jahren, Eignung hoch."
          ]
        }
      ],
      notes: [
        "Offenes Gelaende waehlen (Abstaende zu Baeumen/Gehoelzen: 25-200 m je Hoehe).",
        "Max. 2 km zu Vorkommen.",
        "Kein Gruenland in Acker umwandeln.",
        "Massnahmen- und populationsbezogenes Monitoring erforderlich."
      ],
      sources: ["Arten-Information", "NRW Rasterkarte 103035", "GBIF", "GBIF Artprofil 8077224"]
    },
    source: {
      lanuk: ["Arten-Information NRW", "NRW Rasterkarte 103035"],
      gbif: ["GBIF Artprofil 8077224"],
      score: "98 (hoch)",
      scoreText:
        "Mehrere aktuelle, raeumlich zuordenbare Nachweise und passende Umwelt- bzw. Habitatpraediktoren sprechen fuer eine robuste Habitateignung mit hohem Evidenz-Score.",
      regulatoryUnit: "Europaeische Vogelarten (Vogelschutz-RL)",
      legalSource: "Vogelschutzrichtlinie 2009/147/EG, Art. 1 (EUR-Lex)",
      habitatEntries: [
        {
          title: "Landnutzung / Habitattypen",
          text: "Offene und halboffene Nutzungen als Nahrungs- und Jagdhabitat."
        },
        {
          title: "Landschaftsstruktur / Fragmentierung",
          text: "Groesse, Vernetzung und Strukturvielfalt beeinflussen die Habitateignung wesentlich."
        }
      ]
    }
  },
  Wachtel: {
    compensation: {
      headline: "Wachtel - Deckungsreiche Offenlandmassnahmen",
      intro:
        "Fuer die Wachtel (Coturnix coturnix) sind mosaikartige, stoerungsarme Offenlandstrukturen mit mittlerer Vegetationshoehe zentral. Kompensation sollte brutzeitlich wirksame Deckung und stoerungsarme Nahrungshabitate sichern.",
      sections: [
        {
          title: "Offenland und Saumstrukturen",
          bullets: [
            "Extensive Getreideschlaege mit Altgras- und Saumanteilen kombinieren.",
            "Rueckzugsstreifen ohne Bearbeitung waehrend der Brutzeit erhalten.",
            "Niedrige Stoerungsintensitaet entlang Wegen und Fahrspuren sicherstellen."
          ]
        },
        {
          title: "Pflege und Bewirtschaftung",
          bullets: [
            "Mahd-/Bearbeitungstermine ausserhalb sensibler Brutphasen legen.",
            "Keine intensiven Duengergaben oder breitflaechige Pestizidanwendung in Kernbereichen.",
            "Jaehrliche Anpassung anhand Revierbeobachtungen."
          ]
        }
      ],
      notes: [
        "Bevorzugt in grossflaechigen, ruhigen Agrarlandschaften umsetzen.",
        "Massnahmenflaechen vernetzt statt isoliert planen."
      ],
      sources: ["LANUK Artenhinweise", "NRW Rasterkarte", "GBIF Artprofil"]
    },
    source: {
      lanuk: ["Wachtel Artenhinweise NRW", "NRW Rasterkarte"],
      gbif: ["GBIF Artprofil Coturnix coturnix"],
      score: "91 (hoch)",
      scoreText:
        "Die Evidenzlage zeigt stabile Nachweise im Vorhabenumfeld. Modellierte Eignung und Landnutzungsstruktur unterstuetzen eine hohe artspezifische Relevanz.",
      regulatoryUnit: "Rote Liste / Schutzrelevante Offenlandart",
      legalSource: "BNatSchG i. V. m. landesfachlichen Arbeitshilfen",
      habitatEntries: [
        {
          title: "Deckung und Vegetationsstruktur",
          text: "Mittelhohe, heterogene Vegetation mit stoerungsarmen Rueckzugsraeumen."
        },
        {
          title: "Distanz zu Stoerquellen",
          text: "Abstand zu intensiv genutzten Wegen/Siedlungsrandsituationen verbessert Eignung."
        }
      ]
    }
  },
  Grasfrosch: {
    compensation: {
      headline: "Grasfrosch - Gewaesser- und Landlebensraumverbund",
      intro:
        "Fuer den Grasfrosch (Rana temporaria) sind reproduktionsgeeignete Kleingewaesser und ein funktionaler Verbund zu feuchten Landlebensraeumen entscheidend. Kompensation sollte Wasserhaushalt und Wanderkorridore sichern.",
      sections: [
        {
          title: "Laichhabitate",
          bullets: [
            "Flache, fischfreie Kleingewaesser mit strukturreichen Uferzonen anlegen/aufwerten.",
            "Sonnige Teilbereiche bei gleichzeitiger Randdeckung bereitstellen.",
            "Naehrstoffeintraege minimieren."
          ]
        },
        {
          title: "Landlebensraum und Verbund",
          bullets: [
            "Feuchte Wiesen-/Waldrandstrukturen als Sommer- und Ueberwinterungshabitat sichern.",
            "Barrierearme Wanderkorridore zu Laichgewaessern schaffen.",
            "Pflege extensiv und abschnittsweise durchfuehren."
          ]
        }
      ],
      notes: [
        "Hydrologische Stabilitaet priorisieren.",
        "Wanderzeiten in Bau- und Pflegeplanung beruecksichtigen."
      ],
      sources: ["LANUK Amphibienhinweise", "NRW Rasterdaten", "GBIF Amphibienprofil"]
    },
    source: {
      lanuk: ["Grasfrosch Arten-Information NRW", "NRW Amphibien-Rasterkarte"],
      gbif: ["GBIF Artprofil Rana temporaria"],
      score: "87 (hoch)",
      scoreText:
        "Nachweis- und Habitatdaten zeigen eine plausible lokale Betroffenheit. Modellindikatoren fuer Feuchte- und Gewaessernaehe stuetzen die hohe Relevanz.",
      regulatoryUnit: "Rote Liste / Amphibien-Schutzrelevanz",
      legalSource: "FFH-/Artenschutzrechtliche Fachhinweise der Laender",
      habitatEntries: [
        {
          title: "Wasserhaushalt",
          text: "Feuchtehaushalt, Gewaesserverfuegbarkeit und saisonale Dynamik sind zentral."
        },
        {
          title: "Vernetzung",
          text: "Kurze, barrierearme Distanzen zwischen Laich- und Landlebensraeumen."
        }
      ]
    }
  },
  Mauersegler: {
    compensation: {
      headline: "Mauersegler - Niststaetten und Nahrungsraum",
      intro:
        "Beim Mauersegler (Apus apus) liegt der Fokus auf dem dauerhaften Erhalt bzw. Ersatz von Niststaetten sowie auf insektenreichen Nahrungsraeumen im Umfeld.",
      sections: [
        {
          title: "Niststaetten",
          bullets: [
            "Verlustfreie Sicherung bestehender Brutplaetze vor Baubeginn.",
            "Ersatzquartiere (Niststeine/Nistkaesten) in ausreichender Anzahl integrieren.",
            "Anflugkorridore und Einflughoehen freihalten."
          ]
        },
        {
          title: "Nahrungsraum",
          bullets: [
            "Insektenfoerdernde Gruenflaechen und Bluehstrukturen im Umkreis entwickeln.",
            "Pestizideinsatz in Kernflaechen reduzieren.",
            "Langfristige Pflege auf Habitatkontinuitaet ausrichten."
          ]
        }
      ],
      notes: ["Quartierkontrolle vor Eingriffen obligatorisch.", "Monitoring ueber mehrere Brutperioden empfohlen."],
      sources: ["LANUK Vogelhinweise", "Gebaeudebrueter-Leitfaden", "GBIF Artprofil"]
    },
    source: {
      lanuk: ["Mauersegler Artenhinweise NRW", "Gebaeudebrueter Hinweise"],
      gbif: ["GBIF Artprofil Apus apus"],
      score: "83 (mittel-hoch)",
      scoreText:
        "Die Datenlage zeigt artspezifische Relevanz vor allem bei Gebaeudebezug und Nahrungshabitaten. Die lokale Betroffenheit ist gut begruendbar.",
      regulatoryUnit: "Europaeische Vogelarten (Vogelschutz-RL)",
      legalSource: "Vogelschutzrichtlinie 2009/147/EG, BNatSchG",
      habitatEntries: [
        {
          title: "Gebaeudebezug",
          text: "Niststrukturen an Gebaeuden und freie Anflugkorridore sind Schluesselkriterien."
        },
        {
          title: "Insektenangebot",
          text: "Insektenreiche Offen- und Gruenflaechen beeinflussen den Bruterfolg."
        }
      ]
    }
  },
  "Rote Waldameise": {
    compensation: {
      headline: "Rote Waldameise - Nestschutz und Habitatkontinuitaet",
      intro:
        "Fuer die Rote Waldameise (Formica rufa) ist der Schutz bestehender Nester und die Sicherung geeigneter Wald- und Waldrandstrukturen zentral.",
      sections: [
        {
          title: "Nestschutz",
          bullets: [
            "Nester vor direkten Eingriffen raeumlich sichern.",
            "Bau- und Pflegearbeiten mit Schutzabstaenden planen.",
            "Keine Bodenverdichtung im unmittelbaren Nestumfeld."
          ]
        },
        {
          title: "Habitatpflege",
          bullets: [
            "Lichte Wald-/Waldrandstrukturen erhalten.",
            "Totholz- und Strukturvielfalt foerdern.",
            "Stoerungen in sensiblen Zeiten reduzieren."
          ]
        }
      ],
      notes: ["Nestkartierung vor Eingriffen empfehlenswert.", "Artenschutzfachliche Begleitung einplanen."],
      sources: ["BArtSchV Fachhinweise", "Landesdatenbank", "GBIF Formica rufa"]
    },
    source: {
      lanuk: ["Waldameisen-Hinweise NRW", "Regionale Rasterdaten"],
      gbif: ["GBIF Artprofil Formica rufa"],
      score: "72 (mittel)",
      scoreText:
        "Punktuelle Nachweise und Habitatindikatoren sprechen fuer lokale Relevanz, jedoch mit hoeherer Unsicherheit als bei Leitarten mit dichterer Datenlage.",
      regulatoryUnit: "BArtSchV Anlage 1",
      legalSource: "BNatSchG Paragraph 54, BArtSchV",
      habitatEntries: [
        {
          title: "Waldstruktur",
          text: "Lichte, strukturreiche Waldbereiche und Waldrandlagen erhoehen Eignung."
        },
        {
          title: "Stoerungsarmut",
          text: "Geringe Bodenstoerung und stabile Mikrostandorte sind entscheidend."
        }
      ]
    }
  },
  Hornisse: {
    compensation: {
      headline: "Hornisse - Quartiersicherung und Konfliktpraevention",
      intro:
        "Bei der Hornisse (Vespa crabro) stehen Quartierschutz, konfliktarme Sicherung bestehender Nistplaetze und geeignete Ersatzstrukturen im Vordergrund.",
      sections: [
        {
          title: "Quartiere",
          bullets: [
            "Bekannte Nistquartiere vor Eingriffen sichern und kennzeichnen.",
            "Ersatzquartiere in geeigneter Umgebung bereitstellen.",
            "Eingriffe ausserhalb sensibler Entwicklungsphasen planen."
          ]
        },
        {
          title: "Umfeldmanagement",
          bullets: [
            "Nahrungsangebot ueber strukturreiche Gruenflaechen stabil halten.",
            "Konfliktkommunikation mit Nutzern/Anwohnern fruehzeitig einplanen.",
            "Monitoring bis zur erfolgreichen Etablierung durchfuehren."
          ]
        }
      ],
      notes: ["Umsiedlungen nur fachlich begleitet.", "Schutzstatus in Bauablaeufen verbindlich beruecksichtigen."],
      sources: ["BArtSchV Fachinformationen", "Landesregister", "GBIF Vespa crabro"]
    },
    source: {
      lanuk: ["Hornissen-Hinweise NRW", "Regionale Nachweisdaten"],
      gbif: ["GBIF Artprofil Vespa crabro"],
      score: "69 (mittel)",
      scoreText:
        "Nachweise und Habitatfaktoren indizieren eine mittlere Relevanz. Die artspezifische Betroffenheit ist oft stark standortabhaengig.",
      regulatoryUnit: "BArtSchV Anlage 1",
      legalSource: "BNatSchG / BArtSchV",
      habitatEntries: [
        {
          title: "Quartierpotenzial",
          text: "Geeignete Baumhoehlen/Gebaeudestrukturen bestimmen die lokale Eignung."
        },
        {
          title: "Nahrungsumfeld",
          text: "Strukturreiche Gruenraeume verbessern die Habitatstabilitaet."
        }
      ]
    }
  }
};

function formatCoordinate(value: number) {
  return Number.isFinite(value) ? value.toFixed(5) : "-";
}

function formatArea(areaHa: number) {
  return Number.isFinite(areaHa) ? `${areaHa.toFixed(1)} ha` : "-";
}

function formatAnalysisTime(isoTimestamp: string) {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export default function ResultsPage() {
  const [sessionData, setSessionData] = useState<ScreeningSessionData | null>(null);
  const [speciesExpanded, setSpeciesExpanded] = useState(false);
  const [habitatExpanded, setHabitatExpanded] = useState(false);
  const [selectedCompensation, setSelectedCompensation] = useState<SpeciesRow | null>(null);
  const [selectedSource, setSelectedSource] = useState<SpeciesRow | null>(null);
  const [sourceTab, setSourceTab] = useState<"evidenz" | "praediktoren">("evidenz");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SCREENING_SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ScreeningSessionData;
      if (!parsed?.polygon?.geometry?.coordinates?.[0]?.length) return;
      setSessionData(parsed);
    } catch {
      // Keep fallback UI when session data is not available.
    }
  }, []);

  const projectInformation = useMemo(() => {
    if (!sessionData) {
      return {
        location: "Ausgewaehlte Gemeinde",
        area: "-",
        coordinates: "-",
        analysisTime: "-",
        analysisId: "-"
      };
    }

    return {
      location: sessionData.selectedLocation || "Ausgewaehlte Gemeinde",
      area: formatArea(sessionData.areaHa),
      coordinates: `${formatCoordinate(sessionData.center.lat)}, ${formatCoordinate(sessionData.center.lng)}`,
      analysisTime: formatAnalysisTime(sessionData.analysisTimestamp),
      analysisId: sessionData.analysisId || "-"
    };
  }, [sessionData]);

  const speciesRowsToRender = speciesExpanded ? speciesRows : speciesRows.slice(0, 4);
  const habitatGroupsPreview = useMemo(() => {
    const climate = habitatCategories[0];
    const topography = habitatCategories[1];
    const landCover = habitatCategories[2];

    return [
      climate,
      topography,
      {
        ...landCover,
        metrics: landCover.metrics.slice(0, 2)
      }
    ];
  }, []);
  const habitatGroupsToRender = habitatExpanded ? habitatCategories : habitatGroupsPreview;
  const fallbackSpeciesDetail = speciesDetails.Feldlerche;
  const compensationDetail = selectedCompensation
    ? speciesDetails[selectedCompensation.art] ?? fallbackSpeciesDetail
    : fallbackSpeciesDetail;
  const sourceDetail = selectedSource
    ? speciesDetails[selectedSource.art] ?? fallbackSpeciesDetail
    : fallbackSpeciesDetail;

  if (!sessionData) {
    return (
      <div className="mx-auto w-full max-w-[1280px] pb-10 pt-6">
        <Card className="app-glass-card rounded-[24px]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-[-0.01em] text-ink">Ergebnisdashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-ink/80">
            <p>Es wurde noch kein markierter Bereich fuer das Screening uebernommen.</p>
            <Button asChild className="app-brand-button rounded-full px-6">
              <Link href="/app">Zurueck zur Kartenauswahl</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6 pb-10 pt-6 text-[0.95rem]">
        <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-[-0.012em] text-ink">Projektinformationen</h2>
      <Card className="app-glass-card rounded-[24px]">
        <CardContent className="space-y-4">
          <div className="rounded-2xl app-glass-panel px-5 py-4">
            <p className="flex items-center gap-2 text-[1.02rem] font-medium leading-none text-ink/95">
              <MapPinned className="h-5 w-5 text-[#1f8f82]" />
              Gemeinde / Stadt
            </p>
            <p className="mt-3 pt-1 text-[1.02rem] font-light leading-tight text-ink/80">{projectInformation.location}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl app-glass-panel px-5 py-4">
              <p className="flex items-center gap-2 text-[1.02rem] font-medium leading-none text-ink/95">
                <Ruler className="h-5 w-5 text-[#1f8f82]" />
                Flaeche
              </p>
              <p className="mt-3 pt-1 text-[1.02rem] font-light leading-tight text-ink/80">{projectInformation.area}</p>
            </div>
            <div className="rounded-2xl app-glass-panel px-5 py-4">
              <p className="flex items-center gap-2 text-[1.02rem] font-medium leading-none text-ink/95">
                <LocateFixed className="h-5 w-5 text-[#1f8f82]" />
                Koordinaten
              </p>
              <p className="mt-3 pt-1 whitespace-nowrap text-[1.02rem] font-light leading-tight text-ink/80">{projectInformation.coordinates}</p>
            </div>
            <div className="rounded-2xl app-glass-panel px-5 py-4">
              <p className="flex items-center gap-2 text-[1.02rem] font-medium leading-none text-ink/95">
                <CalendarClock className="h-5 w-5 text-[#1f8f82]" />
                Analysezeitraum
              </p>
              <p className="mt-3 pt-1 text-[1.02rem] font-light leading-tight text-ink/80">{projectInformation.analysisTime}</p>
            </div>
            <div className="rounded-2xl app-glass-panel px-5 py-4">
              <p className="flex items-center gap-2 text-[1.02rem] font-medium leading-none text-ink/95">
                <Hash className="h-5 w-5 text-[#1f8f82]" />
                Analyse-ID
              </p>
              <p className="mt-3 pt-1 whitespace-nowrap text-[1.02rem] font-light leading-tight text-ink/80">{projectInformation.analysisId}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-[-0.012em] text-ink">Ergebnisinformationen</h2>
        </div>
      <Card className="app-glass-card rounded-[24px]">
        <CardContent className="space-y-4">
          <div className="widget-soft-panel">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-[1.02rem] font-medium leading-none text-ink/95">
                <AlertTriangle className="h-5 w-5 text-[#1f8f82]" />
                Gesamtstatus
              </p>
              <span className="mt-1 inline-flex items-center gap-2 self-center rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-semibold text-yellow-700">
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" aria-hidden="true" />
                Relevanz: Mittel
              </span>
            </div>
            <p className="mt-3 text-[1.02rem] font-light leading-tight text-ink/80">
              Hinweise auf potenziell betroffene Arten; lokale Kompensationsmassnahmen empfohlen.
            </p>
          </div>

        </CardContent>
      </Card>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold tracking-[-0.012em] text-ink">Karten- und Raumanalyse</h2>
        </div>
      <Card className="app-glass-card rounded-[24px]">
        <CardContent>
          <ResultAreaMapClient polygon={sessionData.polygon} />
        </CardContent>
      </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-[1.65rem] font-semibold tracking-[-0.012em] text-ink">Priorisierte Artenliste</h2>
        <Card className="overflow-hidden app-glass-card rounded-[24px]">
          <CardHeader className="border-b border-slate-200/70 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[0.98rem] font-semibold text-ink/95">
                {speciesExpanded ? (
                  <ChevronUp className="h-4 w-4 text-ink/80" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-ink/80" />
                )}
                Artenliste
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl app-glass-panel px-3 py-1.5 text-sm font-medium text-ink/90 transition hover:bg-white/80"
              >
                <Download className="h-4 w-4" />
                CSV Export
              </button>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            <div className="border-b border-slate-200/70 px-4 py-3">
              <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_auto_auto]">
                <div className="flex items-center gap-2 rounded-xl border border-slate-300/65 bg-white/55 px-3 py-2 text-sm text-ink/65">
                  <Search className="h-4 w-4" />
                  Art suchen...
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300/65 bg-white/55 px-4 py-2 text-sm font-medium text-ink/90"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300/65 bg-white/55 px-4 py-2 text-sm font-medium text-ink/90"
                >
                  Nach Score
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[0.86rem] font-medium text-ink/65">
                    <th className="px-4 py-3">Art</th>
                    <th className="px-4 py-3">Pruefung</th>
                    <th className="px-4 py-3">Flaechenanteil</th>
                    <th className="px-4 py-3">Kompensation</th>
                    <th className="px-4 py-3">Quelle</th>
                  </tr>
                </thead>
                <tbody>
                  {speciesRowsToRender.map((row, index) => {
                    const isTeaserRow = !speciesExpanded && index === 3;
                    return (
                    <tr
                      key={row.art}
                      className={`border-b border-slate-200/70 align-middle ${isTeaserRow ? "opacity-70 [filter:blur(0.35px)]" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-[0.86rem] font-medium text-ink/95">{row.art}</p>
                        <p className="mt-0.5 text-[0.74rem] italic text-ink/65">{row.latin}</p>
                        <span className="mt-1.5 inline-flex rounded-md bg-[#dbe8e5] px-2 py-[2px] text-[9px] text-[#2f7f75]">
                          {row.tag}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-[2px] text-[0.74rem] font-medium ${
                            row.pruefTone === "warning"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {row.pruefung}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-[2px] text-[0.74rem] font-medium text-ink/90">
                          {row.flaechenanteil}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <button
                          type="button"
                          onClick={() => setSelectedCompensation(row)}
                          className="rounded-xl app-glass-panel px-3.5 py-[3px] text-[0.74rem] font-medium text-ink/90 transition hover:text-[#1f8f82] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E5C55]/35"
                        >
                          Info
                        </button>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <button
                          type="button"
                          onClick={() => {
                            setSourceTab("evidenz");
                            setSelectedSource(row);
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300/65 bg-white/60 text-ink/80 transition hover:text-[#1f8f82]"
                          aria-label={`Quelle zu ${row.art}`}
                        >
                          <Info className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>

              {!speciesExpanded ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/95 via-white/70 to-transparent" />
              ) : null}
            </div>
            <div className="flex justify-center px-4 py-3">
              <button
                type="button"
                onClick={() => setSpeciesExpanded((current) => !current)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl app-glass-panel text-ink/70"
                aria-label={speciesExpanded ? "Artenliste einklappen" : "Artenliste ausklappen"}
              >
                {speciesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="text-[1.65rem] font-semibold tracking-[-0.012em] text-ink">Habitatindikatoren & Umwelt-Praediktoren</h2>
        <Card className="overflow-hidden app-glass-card rounded-[24px]">
          <CardHeader className="border-b border-slate-200/70 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-[0.98rem] font-semibold text-ink/95">
                {habitatExpanded ? (
                  <ChevronUp className="h-4 w-4 text-ink/80" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-ink/80" />
                )}
                Habitatindikatoren & Umwelt-Praediktoren
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl app-glass-panel px-3 py-1.5 text-sm font-medium text-ink/90 transition hover:bg-white/80"
              >
                <Download className="h-4 w-4" />
                CSV Export
              </button>
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-3 pt-3">
            <div className="relative overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[0.86rem] font-medium text-ink/65">
                    <th className="w-[14%] px-3 py-3">Kategorie</th>
                    <th className="w-[58%] px-3 py-3">Kenngroessen</th>
                    <th className="w-[28%] px-3 py-3">Quelle</th>
                  </tr>
                </thead>
                <tbody>
                  {habitatGroupsToRender.map((group) => {
                    return group.metrics.map((metric, idx) => (
                      <tr
                        key={`${group.category}-${metric.label}`}
                        className={`border-b border-slate-200/65 ${idx === group.metrics.length - 1 ? "border-b-slate-200/80" : ""}`}
                      >
                        {idx === 0 ? (
                          <td
                            rowSpan={group.metrics.length}
                            className="px-3 py-4 align-middle text-[0.86rem] font-semibold text-ink/90"
                          >
                            {group.category}
                          </td>
                        ) : null}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2">
                            <span className="text-[0.84rem] text-ink/85">{metric.label}</span>
                            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-[2px] text-[0.74rem] font-semibold text-emerald-700">
                              {metric.value}
                            </span>
                          </div>
                        </td>
                        {idx === 0 ? (
                          <td
                            rowSpan={group.metrics.length}
                            className="px-3 py-4 align-middle"
                          >
                            <div className="flex flex-wrap gap-1.5">
                              {group.sources.map((source) => (
                                <span
                                  key={`${group.category}-${source}`}
                                  className="inline-flex rounded-full bg-[#dbe8e5] px-2.5 py-[3px] text-[0.72rem] font-medium text-[#2f7f75]"
                                >
                                  {source}
                                </span>
                              ))}
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ));
                  })}
                </tbody>
              </table>

              {!habitatExpanded ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/95 via-white/70 to-transparent" />
              ) : null}
            </div>

            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setHabitatExpanded((current) => !current)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl app-glass-panel text-ink/70"
                aria-label={habitatExpanded ? "Habitatindikatoren einklappen" : "Habitatindikatoren ausklappen"}
              >
                {habitatExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedCompensation ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-xl font-semibold text-ink">{selectedCompensation.art}</h3>
                <p className="mt-1 text-sm italic text-ink/60">{selectedCompensation.latin}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompensation(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/60 transition hover:bg-[#eff5f2] hover:text-ink"
                aria-label="Popup schliessen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-5 py-4">
              <div className="rounded-2xl app-glass-panel p-3">
                <ResultAreaMapClient polygon={sessionData.polygon} />
              </div>

              <div className="mt-4 space-y-4 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/65 p-4">
                <div className="space-y-1">
                  <h4 className="text-[1.08rem] font-semibold tracking-[-0.01em] text-ink">Kompensationsmassnahmen</h4>
                  <p className="text-xs uppercase tracking-[0.12em] text-ink/45">{compensationDetail.compensation.headline}</p>
                </div>

                <div className="rounded-xl app-glass-panel p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <p className="text-[0.95rem] leading-relaxed text-ink/80">
                    {compensationDetail.compensation.intro}
                  </p>
                </div>

                {compensationDetail.compensation.sections.map((section) => (
                  <div
                    key={section.title}
                    className="rounded-xl app-glass-panel p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                  >
                    <p className="text-[0.92rem] font-semibold text-ink">{section.title}</p>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[0.9rem] leading-relaxed text-ink/80">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="rounded-xl app-glass-panel p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <p className="text-[0.92rem] font-semibold text-ink">Wichtige Hinweise</p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[0.9rem] leading-relaxed text-ink/80">
                    {compensationDetail.compensation.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl app-glass-panel p-4 text-[0.9rem] text-ink/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <p className="text-[0.92rem] font-semibold text-ink">Quellen</p>
                  <ul className="mt-2 space-y-1">
                    {compensationDetail.compensation.sources.map((source) => (
                      <li key={source}>{source}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedSource ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/60 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-[1.35rem] font-semibold text-ink">{selectedSource.art} - Quellen</h3>
                <p className="mt-1 text-sm italic text-ink/60">{selectedSource.latin}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSource(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/60 transition hover:bg-[#eff5f2] hover:text-ink"
                aria-label="Quellen-Popup schliessen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[80vh] space-y-4 overflow-y-auto px-5 py-4">
              <div className="inline-flex w-full rounded-xl border border-slate-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setSourceTab("evidenz")}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    sourceTab === "evidenz"
                      ? "bg-[#dbe8e5] text-ink"
                      : "text-ink/55 hover:bg-[#eff5f2]"
                  }`}
                >
                  Artenhinweise & Evidenz
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab("praediktoren")}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    sourceTab === "praediktoren"
                      ? "bg-[#dbe8e5] text-ink"
                      : "text-ink/55 hover:bg-[#eff5f2]"
                  }`}
                >
                  Habitatindikatoren & Umwelt-Praediktoren
                </button>
              </div>

              {sourceTab === "evidenz" ? (
                <div className="space-y-3">
                  <div className="rounded-2xl app-glass-panel p-4">
                    <p className="text-base font-semibold text-ink">Quellen</p>
                    <p className="mt-1 text-sm font-semibold text-[#2f7f75]">LANUK</p>
                    <div className="mt-2 space-y-2">
                      {sourceDetail.source.lanuk.map((entry) => (
                        <div
                          key={entry}
                          className="rounded-xl border border-[#bcd9d3] bg-[#eef7f4] px-4 py-3 text-[0.95rem] font-medium text-ink/85"
                        >
                          {entry}
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#2f7f75]">GBIF</p>
                    <div className="mt-2 space-y-2">
                      {sourceDetail.source.gbif.map((entry) => (
                        <div
                          key={entry}
                          className="rounded-xl border border-[#bcd9d3] bg-[#eef7f4] px-4 py-3 text-[0.95rem] font-medium text-ink/85"
                        >
                          {entry}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl app-glass-panel p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-base font-semibold text-ink">Scoring</p>
                      <p className="text-[1.02rem] font-semibold text-emerald-600">{sourceDetail.source.score}</p>
                    </div>
                    <p className="mt-3 rounded-xl app-glass-panel px-4 py-3 text-[0.95rem] leading-relaxed text-ink/70">
                      {sourceDetail.source.scoreText}
                    </p>
                  </div>

                  <div className="rounded-2xl app-glass-panel p-4">
                    <p className="text-base font-semibold text-ink">Hinweise</p>
                    <div className="mt-3 space-y-2">
                      <div className="rounded-xl app-glass-panel px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/45">Regulatorische Einheit</p>
                        <p className="mt-1 text-[0.95rem] text-ink/80">{sourceDetail.source.regulatoryUnit}</p>
                      </div>
                      <div className="rounded-xl app-glass-panel px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink/45">Quelle</p>
                        <p className="mt-1 text-[0.95rem] text-ink/80">{sourceDetail.source.legalSource}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl app-glass-panel p-4">
                  <p className="text-base font-semibold text-ink">Raeumliche Habitateignung (modellbasiert)</p>
                  <div className="mt-3 space-y-3 text-[0.95rem] leading-relaxed text-ink/75">
                    {sourceDetail.source.habitatEntries.map((entry) => (
                      <div key={entry.title}>
                        <p className="font-semibold text-ink/90">{entry.title}</p>
                        <p>{entry.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
