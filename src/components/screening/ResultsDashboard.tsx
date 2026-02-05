import { useState } from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  Download,
  MapPin,
  RefreshCcw,
  Ruler,
  LocateFixed,
  CalendarClock,
  Hash,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ScreeningResult } from "@/data/dummyData";
import RedFlagsSection from "./RedFlagsSection";
import SpeciesListSection from "./SpeciesListSection";
import ResultsMap from "./ResultsMap";
import ExportModal from "./ExportModal";

interface ResultsDashboardProps {
  results: ScreeningResult;
  onReset: () => void;
}


const ResultsDashboard = ({ results, onReset }: ResultsDashboardProps) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);
  const [isEnvOpen, setIsEnvOpen] = useState(true);
  const [showAllEnvRows, setShowAllEnvRows] = useState(false);
  const analysisDate = new Date(results.analysis.timestamp);
  const analysisTimestamp = Number.isNaN(analysisDate.getTime())
    ? results.analysis.timestamp
    : analysisDate.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
  const [lat, lng] = results.area.coordinates;
  const coordinateLabel = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  const locationLabel = results.area.gemeinde || results.area.name;
  const environmentalSections = [
    {
      id: "climate",
      title: "Klima",
      metrics: [
        { label: "Temperatur Jahresmittel (°C)", value: "9.8" },
        { label: "Temperatur wärmster Monat / Sommermittel (°C)", value: "19.6" },
        { label: "Niederschlag Jahressumme (mm)", value: "640" },
        { label: "Niederschlag wärmstes Quartal / Sommer (mm)", value: "210" },
      ],
      sources: ["WorldClim (Bioclim)", "CHELSA", "ERA5(-Land) Raster"],
    },
    {
      id: "topography",
      title: "Topografie",
      metrics: [
        { label: "Höhe (m)", value: "148" },
        { label: "Hangneigung (°)", value: "6.2" },
        { label: "Exposition (dominant)", value: "SW" },
      ],
      sources: ["SRTM", "Copernicus DEM", "EU-DEM (je nach Region)"],
    },
    {
      id: "landcover",
      title: "Landbedeckung / Habitat",
      metrics: [
        { label: "Waldanteil (%)", value: "18" },
        { label: "Acker (%)", value: "52" },
        { label: "Siedlung (%)", value: "24" },
        { label: "Wasser (%)", value: "6" },
      ],
      sources: [
        "CORINE Land Cover (EU)",
        "ESA WorldCover (global)",
        "Copernicus Global Land Cover",
      ],
    },
    {
      id: "soil",
      title: "Boden",
      metrics: [
        { label: "pH (Topsoil)", value: "6.3" },
        { label: "Textur (dominant)", value: "Lehm" },
        { label: "Organischer Kohlenstoff (SOC) (%)", value: "1.7" },
      ],
      sources: ["SoilGrids (global)", "nationale Bodenübersichten (falls verfügbar)"],
    },
    {
      id: "hydrology",
      title: "Hydrologie",
      metrics: [
        { label: "Distanz zum nächsten Gewässer (m)", value: "420" },
        { label: "Wasserflächenanteil (%)", value: "6" },
      ],
      sources: ["HydroSHEDS / HydroRIVERS", "OpenStreetMap Wasser", "EU-Hydro (EU)"],
    },
    {
      id: "pressure",
      title: "Menschlicher Druck",
      metrics: [
        { label: "Versiegelung / Built-up Anteil (%)", value: "22" },
        { label: "Distanz zur nächsten Straße (m)", value: "95" },
        { label: "Bevölkerungsdichte (Einw./km²)", value: "420" },
        { label: "Nachtlicht (Index)", value: "0.31" },
      ],
      sources: [
        "Copernicus Imperviousness / HRL (EU)",
        "GHSL (global built-up)",
        "OpenStreetMap Straßen",
        "WorldPop / GHSL Population",
        "VIIRS Night Lights",
      ],
    },
    {
      id: "vegetation",
      title: "Vegetation (Biotik-Proxy)",
      metrics: [
        { label: "NDVI Median", value: "0.54" },
        { label: "NDVI Sommer", value: "0.63" },
      ],
      sources: [
        "MODIS NDVI (global)",
        "Copernicus Global Land Service NDVI",
        "Sentinel-2 abgeleitet",
      ],
    },
  ];
  const visibleEnvSections = showAllEnvRows
    ? environmentalSections
    : environmentalSections.slice(0, 2);
  const previewEnvSection = !showAllEnvRows ? environmentalSections[2] : undefined;
  const landcoverSection = environmentalSections.find((section) => section.id === "landcover");
  const getLandcoverPercent = (labelMatch: string) => {
    const metric = landcoverSection?.metrics.find((item) =>
      item.label.toLowerCase().includes(labelMatch)
    );
    if (!metric) return 0;
    const value = Number(metric.value.replace(",", "."));
    return Number.isFinite(value) ? value : 0;
  };
  const landcoverAcker = getLandcoverPercent("acker");
  const landcoverWald = getLandcoverPercent("wald");
  const landcoverWasser = getLandcoverPercent("wasser");
  const landcoverSiedlung = getLandcoverPercent("siedlung");
  const areaHectares = results.area.flaeche_ha;
  const formatHectares = (value: number) => Math.max(0.1, value).toFixed(1);
  const displaySpeciesName: Record<string, string> = {
    "Fledermaeuse (alle Arten)": "Fledermäuse (alle Arten)",
  };
  const sdmSpeciesNames = Array.from(new Set(results.heatmapCells.map((cell) => cell.species)));
  const sdmSpeciesRows = sdmSpeciesNames
    .map((name) => results.species.find((species) => species.name === name))
    .filter((species): species is ScreeningResult["species"][number] => Boolean(species))
    .filter((species) => species.evidenceScore > 50)
    .sort((a, b) => b.evidenceScore - a.evidenceScore)
    .map((species) => {
      const isWaterSpecies = false;
      const isForestUrban =
        species.name === "Rotmilan" || species.name.includes("Fledermaeuse");
      const isAckerSpecies = ["Feldlerche", "Rebhuhn", "Grasfrosch", "Wachtel"].includes(
        species.name
      );

      let habitatLabel = "Acker/Wiese";
      let habitatParts = [{ label: "Acker", percent: landcoverAcker }];
      if (isForestUrban) {
        habitatLabel = "Wald/Siedlung";
        habitatParts = [
          { label: "Wald", percent: landcoverWald },
          { label: "Siedlung", percent: landcoverSiedlung },
        ];
      } else if (isWaterSpecies) {
        habitatLabel = "Wasser";
        habitatParts = [{ label: "Wasser", percent: landcoverWasser }];
      } else if (isAckerSpecies) {
        habitatLabel = "Acker/Wiese";
        habitatParts = [{ label: "Acker", percent: landcoverAcker }];
      }

      const habitatShare = habitatParts.reduce((total, part) => total + part.percent, 0);
      const shareLabel = `${Math.round(habitatShare)}%`;
      const score = species.evidenceScore;
      const compensationNeed =
        score >= 85
          ? "Hoch"
          : score >= 60
            ? "Grenzwertig"
            : "Kritisch";

      return {
        id: species.id,
        name: displaySpeciesName[species.name] ?? species.name,
        score,
        habitatLabel,
        shareLabel,
        habitatShare,
        compensationNeed,
      };
    });
  const landcoverEntries = [
    { label: "Acker", percent: landcoverAcker, value: 6 },
    { label: "Wald", percent: landcoverWald, value: 20 },
    { label: "Wasser", percent: landcoverWasser, value: 15 },
    { label: "Siedlung", percent: landcoverSiedlung, value: 0 },
  ];
  const biotopeRows = landcoverEntries
    .filter((entry) => entry.percent > 0 || entry.label === "Siedlung")
    .map((entry) => {
      const areaHa = (areaHectares * entry.percent) / 100;
      const points = Math.round(areaHa * entry.value * 100);
      return {
        ...entry,
        areaHa,
        points,
      };
    });
  const totalBiotopePoints = biotopeRows.reduce((sum, row) => sum + row.points, 0);
  const habitatImpactShare = sdmSpeciesRows.length
    ? Math.round(
        sdmSpeciesRows.reduce((sum, row) => sum + row.habitatShare, 0) / sdmSpeciesRows.length
      )
    : 0;
  const impactSeverity =
    habitatImpactShare < 10
      ? {
          label: "keine",
          abbr: "--",
          consequence: "Keine Kompensation",
          restRatio: 0.9,
          multiplier: 1,
        }
      : habitatImpactShare <= 50
        ? {
            label: "erheblich",
            abbr: "eB",
            consequence: "Standard-Kompensation",
            restRatio: 0.5,
            multiplier: 1,
          }
        : {
            label: "bes. schwer",
            abbr: "eBS",
            consequence: "Artenspezifische Massnahmen",
            restRatio: 0.2,
            multiplier: 2,
          };
  const severityTone =
    impactSeverity.abbr === "--"
      ? {
          label: "Keine Eingriffsrelevanz",
          dot: "bg-status-green",
          text: "text-status-green",
          badge: "bg-status-green-bg text-status-green",
        }
      : impactSeverity.abbr === "eB"
        ? {
            label: "Eingriff erheblich",
            dot: "bg-status-yellow",
            text: "text-status-yellow",
            badge: "bg-status-yellow/15 text-status-yellow",
          }
        : {
            label: "Eingriff bes. schwer",
            dot: "bg-status-red",
            text: "text-status-red",
            badge: "bg-status-red-bg text-status-red",
          };
  const remainingPoints = Math.round(totalBiotopePoints * impactSeverity.restRatio);
  const deltaPoints = Math.max(0, totalBiotopePoints - remainingPoints);
  const compensationNeedPoints = Math.round(deltaPoints * impactSeverity.multiplier);
  const formatPoints = (value: number) => value.toLocaleString("de-DE");
  const averageRedFlagScore = results.redFlags.length
    ? results.redFlags.reduce((sum, flag) => sum + flag.score, 0) / results.redFlags.length
    : 0;
  const highConflictCount = results.redFlags.filter((flag) => flag.status === "high").length;
  const overallRiskScore = Math.min(
    100,
    Math.round(averageRedFlagScore * 0.65 + habitatImpactShare * 0.35 + highConflictCount * 4)
  );
  const relevanceLevels = {
    low: {
      label: "Relevanz: Niedrig",
      dotClass: "bg-status-green",
      badgeClass: "bg-status-green-bg text-status-green",
      description:
        "Geringes Konfliktpotenzial; in der Regel ist keine weitergehende artenschutzrechtliche Pruefung erforderlich.",
    },
    medium: {
      label: "Relevanz: Mittel",
      dotClass: "bg-status-yellow",
      badgeClass: "bg-status-yellow/15 text-status-yellow",
      description:
        "Hinweise auf potenziell betroffene Arten; vertiefte Einschaetzung durch Fachplaner empfohlen (z. B. Abgleich mit aktuellen Fach- und Behoerdendaten).",
    },
    high: {
      label: "Relevanz: Hoch",
      dotClass: "bg-status-red",
      badgeClass: "bg-status-red-bg text-status-red",
      description:
        "Moegliche Zugriffsverbote nach Paragraph 44 BNatSchG nicht auszuschliessen; artenschutzrechtliches Fachgutachten bzw. spezielle Pruefung empfohlen.",
    },
    very_high: {
      label: "Relevanz: Sehr hoch",
      dotClass: "bg-status-red",
      badgeClass: "bg-status-red-bg text-status-red",
      marker: "⛔",
      description:
        "Sehr hohe Konfliktdichte; Standort artenschutzrechtlich voraussichtlich problematisch, planerische Alternativen pruefen.",
    },
  } as const;
  const relevanceKey =
    overallRiskScore >= 80
      ? "very_high"
      : overallRiskScore >= 60
        ? "high"
        : overallRiskScore >= 35
          ? "medium"
          : "low";
  const activeRelevance = relevanceLevels[relevanceKey];
  const preferredTopSpecies = ["Rebhuhn", "Rotmilan", "Fledermaeuse (alle Arten)"];
  const computedSpeciesRisks = Array.from(new Set(results.heatmapCells.map((cell) => cell.species))).map(
    (name) => {
      const speciesCells = results.heatmapCells.filter((cell) => cell.species === name);
      const averageRisk =
        speciesCells.reduce((sum, cell) => sum + cell.sdmValue, 0) /
        Math.max(1, speciesCells.length);
      return {
        rawName: name,
        name: displaySpeciesName[name] ?? name,
        probability: Math.round(averageRisk * 100),
      };
    }
  );
  const topSpeciesRisks = preferredTopSpecies
    .map((speciesName) => {
      const computed = computedSpeciesRisks.find((risk) => risk.rawName === speciesName);
      if (computed) return computed;
      const species = results.species.find((item) => item.name === speciesName);
      return {
        rawName: speciesName,
        name: displaySpeciesName[speciesName] ?? speciesName,
        probability: species?.sdmValue ? Math.round(species.sdmValue * 100) : species?.evidenceScore ?? 0,
      };
    })
    .slice(0, 3);
  const getReviewBadgeClass = (status?: string) => {
  if (!status) return "bg-muted/40 text-muted-foreground";
  if (status === "saP-relevant") return "status-red";
  if (status === "Prüfrelevant") return "status-orange";
  if (status === "Lokale Ma?nahmen") return "status-yellow";
  if (status === "Nicht pr?frelevant") return "status-green";
  return "status-yellow";
};
const reviewLevelBySpecies: Record<string, string> = {
  Rebhuhn: "saP-relevant",
  Rotmilan: "Prüfrelevant",
  "Fledermaeuse (alle Arten)": "Prüfrelevant",
  "Fledermäuse (alle Arten)": "Prüfrelevant",
};
  const topSpeciesTableRows = topSpeciesRisks.map((risk) => {
    const sdmRow = sdmSpeciesRows.find((row) => row.name === risk.name);
    const sharePercent = Number((sdmRow?.shareLabel ?? `${habitatImpactShare}%`).replace("%", ""));
    const areaShareHa = ((areaHectares * sharePercent) / 100).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return {
      ...risk,
      habitatShareLabel: sdmRow?.shareLabel ?? `${habitatImpactShare}%`,
      areaShareHa,
      reviewLabel: reviewLevelBySpecies[risk.rawName] ?? reviewLevelBySpecies[risk.name] ?? "-",
    };
  });
  const speciesAreaShareByName = sdmSpeciesRows.reduce(
    (acc, row) => {
      acc[row.name] = row.shareLabel;
      if (row.name === "Fledermäuse (alle Arten)") {
        acc["Fledermaeuse (alle Arten)"] = row.shareLabel;
      }
      return acc;
    },
    {} as Record<string, string>
  );

  const renderEnvRow = (section: (typeof environmentalSections)[number], isPreview = false) => {
    const contentClamp = isPreview ? "max-h-20 overflow-hidden" : "";
    return (
      <TableRow key={section.id} className={`text-xs align-top ${isPreview ? "opacity-60" : ""}`}>
        <TableCell className="py-4">
          <div className={`font-semibold text-foreground ${contentClamp}`}>{section.title}</div>
        </TableCell>
        <TableCell className="py-4 text-muted-foreground">
          <div className={`grid gap-2 ${contentClamp}`}>
            {section.metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex items-center justify-between gap-4 rounded-lg border border-border/40 bg-background/60 px-3 py-2"
              >
                <span className="text-foreground">{metric.label}</span>
                <span className="inline-flex items-center rounded-full bg-status-green-bg px-2.5 py-0.5 text-[11px] font-semibold text-status-green">
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </TableCell>
        <TableCell className="py-4">
          <div className={`flex flex-wrap gap-2 ${contentClamp}`}>
            {section.sources.map((source) => (
              <span
                key={source}
                className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground"
              >
                {source}
              </span>
            ))}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const handleShowOnMap = (speciesId: string) => {
    setSelectedSpeciesId(speciesId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">kadia.earth</h1>
              <p className="text-xs text-muted-foreground">KI gestuetzter Natur Hub</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
              <RefreshCcw className="w-4 h-4" />
              Neue Fläche
            </Button>
            <Button
              size="sm"
              onClick={() => setShowExportModal(true)}
              className="gap-2 gradient-hero text-primary-foreground"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Area Info Bar removed; info shown in project card */}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Projektinformationen
          </h2>
          <div className="rounded-xl border border-border/50 bg-background p-4 shadow-md">
            <div className="rounded-lg border border-border/40 bg-background px-4 py-4">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                Gemeinde / Stadt
              </div>
              <div className="mt-2 text-base text-foreground">{locationLabel}</div>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border/40 bg-background px-3 py-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Ruler className="w-4 h-4 text-primary" />
                  Fläche
                </div>
                <div className="mt-1 text-foreground">ca. {results.area.flaeche_ha} ha</div>
              </div>
              <div className="rounded-lg border border-border/40 bg-background px-3 py-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <LocateFixed className="w-4 h-4 text-primary" />
                  Koordinaten
                </div>
                <div className="mt-1 text-foreground">{coordinateLabel}</div>
              </div>
              <div className="rounded-lg border border-border/40 bg-background px-3 py-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CalendarClock className="w-4 h-4 text-primary" />
                  Analysezeitraum
                </div>
                <div className="mt-1 text-foreground">{analysisTimestamp}</div>
              </div>
              <div className="rounded-lg border border-border/40 bg-background px-3 py-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Hash className="w-4 h-4 text-primary" />
                  Analyse-ID
                </div>
                <div className="mt-1 text-foreground">{results.analysis.id}</div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">Ergebnisinformationen</h2>
          <div className="rounded-xl border border-border/50 bg-background p-4 shadow-md">
            <div className="grid gap-3 text-sm">
              <div className="rounded-lg border border-border/40 bg-background px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-base text-foreground font-medium">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    Gesamtstatus
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${activeRelevance.dotClass}`} />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {activeRelevance.marker ? (
                          <button
                            type="button"
                            className="text-base leading-none"
                            aria-label={`Bedeutung von ${activeRelevance.label}`}
                          >
                            {activeRelevance.marker}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${activeRelevance.badgeClass}`}
                            aria-label={`Bedeutung von ${activeRelevance.label}`}
                          >
                            {activeRelevance.label}
                          </button>
                        )}
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm space-y-2 text-xs">
                        {Object.values(relevanceLevels).map((level) => (
                          <div key={level.label} className="rounded-md border border-border/50 bg-background/80 p-2">
                            <div className="flex items-center gap-2">
                              {level.marker ? (
                                <span className="text-base leading-none">{level.marker}</span>
                              ) : (
                                <span className={`h-2.5 w-2.5 rounded-full ${level.dotClass}`} />
                              )}
                              <span className="font-semibold text-foreground">{level.label}</span>
                            </div>
                            <div className="mt-1 text-foreground">{level.description}</div>
                          </div>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
                <p className="mt-2 text-sm text-foreground">{activeRelevance.description}</p>
              </div>

              <div className="rounded-lg border border-border/40 bg-background px-3 py-3">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Leaf className="w-4 h-4 text-primary" />
                  Top-Arten-Risiken
                </div>
                <div className="mt-2 overflow-x-auto">
                  <UITable>
                    <TableHeader>
                      <TableRow className="bg-muted/30 text-xs">
                        <TableHead>Arten</TableHead>
                        <TableHead>Flaechenanteil</TableHead>
                        <TableHead className="text-center">Prüfung</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topSpeciesTableRows.map((row) => (
                        <TableRow key={row.name} className="text-xs">
                          <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                          <TableCell>{row.habitatShareLabel}</TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${getReviewBadgeClass(
                                row.reviewLabel
                              )}`}
                            >
                              {row.reviewLabel}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {topSpeciesTableRows.length === 0 && (
                        <TableRow className="text-xs">
                          <TableCell className="text-muted-foreground" colSpan={3}>
                            Keine priorisierten Artrisiken ermittelt.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </UITable>
                </div>
              </div>

            </div>
          </div>
        </motion.section>

        {/* Map Section */}
        <motion.section
          id="results-map"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Karten- und Raumanalyse
          </h2>
          <ResultsMap
            results={results}
            selectedSpeciesId={selectedSpeciesId}
          />
        </motion.section>

        {/* Species List Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Priorisierte Artenliste
          </h2>
          <SpeciesListSection
            species={results.species}
            onShowOnMap={handleShowOnMap}
            selectedSpeciesId={selectedSpeciesId}
            areaShareBySpecies={speciesAreaShareByName}
            results={results}
          />
        </motion.section>

                {/* Additional Info Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {results.environmentalPredictors.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Habitatindikatoren & Umwelt-Prädiktoren
              </h2>
              <Card className="card-elevated overflow-hidden">
                <Collapsible open={isEnvOpen} onOpenChange={setIsEnvOpen}>
                  <div className="p-4 border-b border-border/50 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="gap-2 p-0 h-auto hover:bg-transparent">
                          <div className="flex items-center gap-3">
                            {isEnvOpen ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                            <span className="font-semibold text-foreground">
                              Habitatindikatoren & Umwelt-Prädiktoren
                            </span>
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        CSV Export
                      </Button>
                    </div>
                  </div>
                  <CollapsibleContent>
                    <div className="p-4 border-b border-border/50">
                      <div className="overflow-x-auto">
                        <UITable>
                          <TableHeader>
                            <TableRow className="bg-muted/30 text-xs">
                              <TableHead className="w-[180px]">Kategorie</TableHead>
                              <TableHead>Kenngrößen</TableHead>
                              <TableHead className="w-[240px]">Quelle</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {visibleEnvSections.map((section) => renderEnvRow(section))}
                            {previewEnvSection && renderEnvRow(previewEnvSection, true)}
                          </TableBody>
                        </UITable>
                      </div>
                      {environmentalSections.length > 2 && (
                        <div className="mt-4 flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setShowAllEnvRows((current) => !current)}
                            aria-label={showAllEnvRows ? "Weniger anzeigen" : "Alle anzeigen"}
                          >
                            {showAllEnvRows ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </>
          )}
        </motion.section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 mt-12 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <div className="text-base font-semibold text-foreground">kadia.earth</div>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="text-xs">Nature intelligence for project screening</div>
          </div>
        </div>
      </footer>

      {/* Export Modal */}
      <ExportModal open={showExportModal} onOpenChange={setShowExportModal} />
    </div>
  );
};

export default ResultsDashboard;
