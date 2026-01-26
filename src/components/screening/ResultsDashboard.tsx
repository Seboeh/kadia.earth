import { Fragment, useState } from "react";
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
  const [isCompTableOpen, setIsCompTableOpen] = useState(false);
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
  const getEignungBadgeClass = (score: number) => {
    if (score >= 85) return "status-green";
    return "status-orange";
  };
  const compensationTableRows = [
    {
      id: "c1",
      name: "🔴 Rebhuhn",
      scientificName: "Perdix perdix",
      legalLabel: "FFH-Vorschlag",
      habitatDetail: "Acker (29,8 ha)",
      shareLabel: "52%",
      score: 90,
      status: "saP-pflichtig",
    },
    {
      id: "c2",
      name: "🟠 Rotmilan",
      scientificName: "Milvus milvus",
      legalLabel: "Vogelschutz-RL",
      habitatDetail: "Wald (24,1 ha)",
      shareLabel: "42%",
      score: 88,
      status: "prüfrelevant",
    },
    {
      id: "c3",
      name: "🟠 Fledermäuse",
      scientificName: "Microchiroptera (alle Arten)",
      legalLabel: "FFH-Richtlinie Anhang IV(a)",
      habitatDetail: "Wald (24,1 ha)",
      shareLabel: "42%",
      score: 86,
      status: "prüfrelevant",
    },
    {
      id: "c4",
      name: "🟡 Feldlerche",
      scientificName: "Alauda arvensis",
      legalLabel: "Vogelschutz-RL",
      habitatDetail: "Acker (29,8 ha)",
      shareLabel: "52%",
      score: 80,
      status: "beachten",
    },
    {
      id: "c5",
      name: "🟡 Wachtel",
      scientificName: "Coturnix coturnix",
      legalLabel: "Rote Liste",
      habitatDetail: "Acker (29,8 ha)",
      shareLabel: "52%",
      score: 72,
      status: "beachten",
    },
    {
      id: "c6",
      name: "🟢 Waldameise",
      scientificName: "Formica rufa",
      legalLabel: "BArtSchV Anlage 1",
      habitatDetail: "Acker (29,8 ha)",
      shareLabel: "52%",
      score: 54,
      status: "sekundär",
    },
  ];
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
              <h1 className="text-xl font-semibold text-foreground">Kadia</h1>
              <p className="text-xs text-muted-foreground">AI powered Nature IO</p>
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
            <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row">
              <div className="flex-1 rounded-lg border border-border/40 bg-background px-3 py-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  Kompensation
                </div>
                <div className="mt-1 text-foreground">eB - Kompensation notwendig</div>
              </div>
              <div className="flex-1 rounded-lg border border-border/40 bg-background px-3 py-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Leaf className="w-4 h-4 text-primary" />
                  Oekopunkte
                </div>
                <div className="mt-1 text-foreground">
                  {formatPoints(compensationNeedPoints)}
                </div>
              </div>
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
          />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Kompensationsübersicht
          </h2>
          <Card className="card-elevated overflow-hidden">
            <div className="p-4">
              <div className="rounded-xl border border-border/40 bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${severityTone.badge}`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${severityTone.dot}`} />
                      {impactSeverity.abbr} - {impactSeverity.label}
                    </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">
                          Kompensation notwendig
                        </span>
                      </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-foreground">
                      {formatPoints(compensationNeedPoints)}
                    </div>
                    <div className="text-xs text-muted-foreground">Oekopunkte</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border/40 bg-background/70 p-4">
                <Collapsible open={isCompTableOpen} onOpenChange={setIsCompTableOpen}>
                  <div className="flex items-center justify-between gap-3 px-2 pb-3">
                    <div className="text-sm font-semibold text-foreground">
                      Artenbezogene Kompensationsliste
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        {isCompTableOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        {isCompTableOpen ? "Ausblenden" : "Einblenden"}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <div className="overflow-x-auto">
                      <UITable className="min-w-[980px]">
                          <TableHeader>
                            <TableRow className="bg-muted/30 text-xs">
                              <TableHead>Art</TableHead>
                              <TableHead>Habitat</TableHead>
                              <TableHead>Flächenanteil</TableHead>
                              <TableHead>Evidenz</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {compensationTableRows.map((row) => (
                              <TableRow key={row.id} className="text-xs">
                                <TableCell>
                                  <div className="font-medium text-foreground">{row.name}</div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {row.scientificName}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {row.legalLabel}
                                  </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {row.habitatDetail}
                                </TableCell>
                                <TableCell>
                                  <span className="rounded-full border border-border/50 bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground">
                                    {row.shareLabel}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getEignungBadgeClass(
                                      Math.max(75, row.score)
                                    )}`}
                                  >
                                    {Math.max(75, row.score)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                            {compensationTableRows.length === 0 && (
                              <TableRow className="text-xs">
                                <TableCell className="text-muted-foreground" colSpan={4}>
                                  Keine priorisierten Arten im Datensatz.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                      </UITable>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </Card>
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
