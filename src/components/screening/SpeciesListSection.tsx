import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ChevronDown, ChevronUp, Database, Download, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScreeningResult, Species } from "@/data/dummyData";
import ResultsMap from "./ResultsMap";

interface SpeciesListSectionProps {
  species: Species[];
  onShowOnMap: (speciesId: string) => void;
  selectedSpeciesId: string | null;
  areaShareBySpecies?: Record<string, string>;
  results: ScreeningResult;
}

const getDisplayScore = (score: number) => Math.max(75, score);

const getScoreColor = (score: number) => {
  return getDisplayScore(score) >= 85
    ? "text-status-green"
    : "text-[hsl(var(--status-orange))]";
};

const getConfidenceColor = (confidence: Species["confidence"]) => {
  const colors = {
    hoch: "bg-status-green-bg text-status-green",
    mittel: "bg-status-yellow/15 text-status-yellow",
    niedrig: "bg-status-red-bg text-status-red",
  };
  return colors[confidence];
};

const getCompStatusBadgeClass = (status?: string) => {
  if (!status) return "bg-muted/40 text-muted-foreground";
  if (status === "saP-relevant") return "status-red";
  if (status === "Pruefrelevant") return "status-orange";
  if (status === "Lokale Ma?nahmen") return "status-yellow";
  if (status === "Nicht pruefrelevant") return "status-green";
  return "status-yellow";
};

const compensationStatusByName: Record<string, string> = {
  Rebhuhn: "saP-relevant",
  Rotmilan: "Pruefrelevant",
  "Flederm??use": "Pruefrelevant",
  "Fledermaeuse (alle Arten)": "Pruefrelevant",
  Feldlerche: "Lokale Ma?nahmen",
  Grasfrosch: "Lokale Ma?nahmen",
  Mauersegler: "Lokale Ma?nahmen",
  Wachtel: "Lokale Ma?nahmen",
  Hornisse: "Nicht pruefrelevant",
  Waldameise: "Nicht pruefrelevant",
  "Rote Waldameise": "Nicht pruefrelevant",
};

const getDataStatusColor = (status: Species["dataStatus"]) => {
  const colors = {
    Nachweis: "bg-status-green-bg text-status-green",
    Modellhinweis: "bg-accent text-accent-foreground",
    Datenlücke: "bg-status-red-bg text-status-red",
  };
  return colors[status];
};

const getScoreNarrative = (score: number) => {
  const displayScore = getDisplayScore(score);
  const band = displayScore >= 85 ? "hoch" : "mittel";
  return {
    band,
    inputModel:
      "Mehrere aktuelle, raeumlich zuordenbare Nachweise und passende Umwelt- bzw. Habitatpraediktoren aus der Habitatpotenzialanalyse sprechen fuer eine plausible Uebertragbarkeit der Modellierung.",
    quality:
      "Das SDM/MSDM zeigt eine robuste Habitateignung mit klarem raeumlichem Signal und entsprechend hohem Evidenz-Score.",
    uncertainty:
      "Unsicherheiten bleiben v. a. bei der Aktualitaet der Nachweise sowie bei lokalen Stoer- und Nutzungsaenderungen.",
  };
};

const SpeciesListSection = ({
  species,
  onShowOnMap,
  selectedSpeciesId,
  areaShareBySpecies = {},
  results,
}: SpeciesListSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<
    "all" | "Voegel" | "Saeugetiere" | "Reptilien" | "Insekten"
  >("all");
  const [sortBy, setSortBy] = useState<"score" | "confidence" | "year">("score");
  const [showFilters, setShowFilters] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showAllRows, setShowAllRows] = useState(false);

  const filteredAndSortedSpecies = useMemo(() => {
    let filtered = [...species];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.scientificName.toLowerCase().includes(query)
      );
    }

    if (selectedGroup !== "all") {
      filtered = filtered.filter((s) => {
        if (selectedGroup === "Saeugetiere") {
          return s.group === "Saeugetiere" || s.group === "Fledermaeuse";
        }
        return s.group === selectedGroup;
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.evidenceScore - a.evidenceScore;
        case "confidence":
          const confOrder = { hoch: 3, mittel: 2, niedrig: 1 };
          return confOrder[b.confidence] - confOrder[a.confidence];
        case "year":
          return (b.year || 0) - (a.year || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [species, searchQuery, selectedGroup, sortBy]);
  const visibleSpecies = showAllRows
    ? filteredAndSortedSpecies
    : filteredAndSortedSpecies.slice(0, 4);
  const previewSpecies = !showAllRows ? filteredAndSortedSpecies[4] : undefined;
  const renderSpeciesRow = (s: Species, isPreview = false) => {
    const cellClamp = isPreview ? "max-h-6 overflow-hidden" : "";
    const displayScore = getDisplayScore(s.evidenceScore);
    const scoreNarrative = getScoreNarrative(displayScore);
    const areaShareLabel = areaShareBySpecies[s.name] ?? "-";
    return (
      <TableRow
        key={s.id}
        className={`text-xs ${isPreview ? "opacity-60" : "cursor-pointer"} ${
          selectedSpeciesId === s.id && !isPreview ? "bg-accent/50" : ""
        }`}
        onClick={() => !isPreview && onShowOnMap(s.id)}
      >
        <TableCell className="py-2" />
        <TableCell className="py-2">
          <div className={cellClamp}>
            <div className="font-medium text-foreground">{s.name}</div>
            <div className="text-[11px] text-muted-foreground italic">{s.scientificName}</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {s.legalLabels.slice(0, 1).map((label, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-primary/10 text-primary"
                >
                  {label}
                </span>
              ))}
              {s.legalLabels.length > 1 && (
                <span className="text-[9px] text-muted-foreground">+{s.legalLabels.length - 1}</span>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="py-2 text-center">
          <div className={cellClamp}>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-medium ${getCompStatusBadgeClass(
                compensationStatusByName[s.name]
              )}`}
            >
              {compensationStatusByName[s.name] ?? "-"}
            </span>
          </div>
        </TableCell>
        <TableCell className="py-2 text-center">
          <div className={cellClamp}>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted/40 text-foreground">
              {areaShareLabel}
            </span>
          </div>
        </TableCell>
        <TableCell className="py-2 text-center">
          <div className={cellClamp}>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-3 text-[11px]"
                  onClick={(event) => event.stopPropagation()}
                  disabled={isPreview}
                >
                  Info
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl p-0 overflow-hidden">
                                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-muted/20">
                                  <DialogTitle className="text-lg text-foreground">
                                    {s.name}
                                  </DialogTitle>
                                  <div className="text-sm text-muted-foreground italic">
                                    {s.scientificName}
                                  </div>
                                </DialogHeader>
                                <div className="max-h-[80vh] overflow-y-auto">
                                  <div className="p-6 space-y-6">
                                    <div className="rounded-xl border border-border/50 overflow-hidden">
                                      <ResultsMap results={results} selectedSpeciesId={s.id} />
                                    </div>
                                    <div className="rounded-lg border border-border/50 bg-background/70 p-4">
                                      <div className="text-sm font-semibold text-foreground">Kompensationsmassnahmen</div>
                                      {s.name === "Rebhuhn" ? (
                                        <div className="mt-3 space-y-4 text-sm text-muted-foreground">
                                          <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                                            <div className="text-sm font-semibold text-foreground">Rebhuhn - Habitatoptimierungen</div>
                                            <div className="mt-1 text-xs text-foreground">
                                              Für das Rebhuhn (Perdix perdix) als lokale Kompensationsmaßnahme müssen Sie
                                              Habitatoptimierungen im Acker oder Grünland umsetzen, um Brut-, Nahrungs- und
                                              Deckungsflächen zu schaffen. Diese Maßnahmen gleichen Beeinträchtigungen aus
                                              und sind nach LANUV-Leitfaden hoch geeignet.
                                            </div>
                                          </div>

                                          <div className="rounded-lg border border-border/50 bg-background p-3">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="text-xs font-semibold text-foreground">Maßnahmen im Acker</div>
                                            </div>
                                            <div className="mt-2 text-xs text-foreground">
                                              Legen Sie mindestens 1 ha Brache- oder Blühstreifen pro Paar an (ideal nach
                                              Göttinger Modell: 1 ha halb einjährig, halb zweijährig einsäen; Breite
                                              min. 15-20 m).
                                            </div>
                                            <ul className="mt-3 list-disc space-y-1 pl-4 text-xs">
                                              <li>Halten Sie Abstand &gt;120 m zu W?ldern, Wegen, Siedlungen</li>
                                              <li>Vermeiden Sie Dünger, Pestizide und Mahd April bis Mitte August</li>
                                              <li>Rotieren Sie Flächen jährlich im 500-m-Radius</li>
                                              <li>Kombinieren Sie mit Schwarzbrache für offene Böden</li>
                                              <li>Kleine Büsche an Ecken, keine großen Gehölze</li>
                                            </ul>
                                          </div>

                                          <div className="rounded-lg border border-border/50 bg-background p-3">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="text-xs font-semibold text-foreground">Maßnahmen im Grünland</div>
                                            </div>
                                            <div className="mt-2 text-xs text-foreground">
                                              Errichten Sie 1 ha extensives Grünland pro Paar: keine intensive Mahd/Beweidung
                                              in der Brutzeit, Kräuteranteil erhöhen, max. 2 Rinder/ha nach August.
                                            </div>
                                            <ul className="mt-3 list-disc space-y-1 pl-4 text-xs">
                                              <li>Gleiche Standortregeln wie im Acker</li>
                                              <li>Mahd nur früh (bis Mai) oder spät (ab Mitte August), jährlich wiederholen</li>
                                              <li>Trockene Standorte bevorzugen</li>
                                            </ul>
                                          </div>

                                          <div className="rounded-lg border border-border/50 bg-background p-3">
                                            <div className="text-[11px] font-semibold text-foreground">Wichtige Hinweise</div>
                                            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                                              <li>Maßnahmen wirken nach ca. 2 Jahren</li>
                                              <li>Monitoring (maßnahmen- und populationsbezogen) erforderlich</li>
                                              <li>Flächige vor streifenförmigen Varianten priorisieren</li>
                                              <li>Ideal als Mosaik aus Acker und Grünland</li>
                                            </ul>
                                          </div>
                                        </div>
                                      ) : s.name === "Rotmilan" ? (
                                        <div className="mt-3 space-y-4 text-sm text-muted-foreground">
                                          <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                                            <div className="text-sm font-semibold text-foreground">Rotmilan - Habitatoptimierungen</div>
                                            <div className="mt-1 text-xs">Strukturierter ?berblick zu Brutplatz, Nahrung und Biotopverbund.</div>
                                          </div>

                                          <div className="rounded-lg border border-border/50 bg-background p-3">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="text-xs font-semibold text-foreground">W1.1 Brutplatz + O1.1 Nahrung</div>
                                              <span className="rounded-full bg-status-red-bg px-2 py-0.5 text-[10px] font-semibold text-status-red">Prioritaet 1</span>
                                            </div>
                                            <div className="mt-2 text-[11px] font-semibold text-foreground">W1.1 Brutplatz</div>
                                            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                                              <li>1 ha Einzelbaeume/Waldrand schuetzen</li>
                                              <li>max. 200 m zum Wald</li>
                                            </ul>
                                            <div className="mt-3 text-[11px] font-semibold text-foreground">O1.1 Nahrung</div>
                                            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                                              <li>5 ha Extensivgruenland pro Paar</li>
                                              <li>Gr?nland priorisieren! (Expertenworkshop)</li>
                                              <li>max. 1 km zum Horst</li>
                                            </ul>
                                          </div>

                                          <div className="rounded-lg border border-border/50 bg-background p-3">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="text-xs font-semibold text-foreground">B1.1 Biotopverbund</div>
                                              <span className="rounded-full bg-status-yellow/20 px-2 py-0.5 text-[10px] font-semibold text-status-yellow">Prioritaet 2</span>
                                            </div>
                                            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
                                              <li>3 ha Waldrand-Saeume/Brachen an Acker in Waldnaehe</li>
                                              <li>Randstreifen (3-10 m): Wildkraeuter, keine Duengung/Pestizide</li>
                                              <li>Prognose: Wert 2-&gt;5 (LANUK), unterstuetzt Nahrung/Jagdhabitat</li>
                                            </ul>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="mt-2 text-sm text-muted-foreground">Keine spezifischen Ma?nahmen hinterlegt.</div>
                                      )}
                                    </div>
                                    <div className="rounded-lg border border-border/50 bg-background/70 p-4">
                                      <div className="text-sm font-semibold text-foreground">Quellen</div>
                                      {s.name === "Rotmilan" ? (
                                        <div className="mt-2 grid gap-1 text-sm">
                                          <a className="text-xs text-primary underline" href="https://artenschutz.naturschutzinformationen.nrw.de/artenschutz/de/arten/gruppe/voegel/massn/103024" target="_blank" rel="noreferrer">Arten-Information</a>
                                          <a className="text-xs text-primary underline" href="https://www.lanuk.nrw.de/publikationen/publikation/numerische-bewertung-von-biotoptypen-fuer-die-eingriffsregelung-in-nrw" target="_blank" rel="noreferrer">Biotop-Bewertung</a>
                                        </div>
                                      ) : s.name === "Rebhuhn" ? (
                                        <div className="mt-2 grid gap-1 text-sm">
                                          <a className="text-xs text-primary underline" href="https://artenschutz.naturschutzinformationen.nrw.de/artenschutz/de/arten/gruppe/voegel/massn/103024" target="_blank" rel="noreferrer">Arten-Information</a>
                                        </div>
                                      ) : (
                                        <div className="mt-2 text-sm text-muted-foreground">Keine Quellen hinterlegt.</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
            </Dialog>
          </div>
        </TableCell>
        <TableCell className="py-2">
          <div className={`flex items-center justify-center gap-1 ${cellClamp}`}>
            <Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(event) => event.stopPropagation()}
                      disabled={isPreview}
                    >
                      <Info className="w-3.5 h-3.5" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Info</TooltipContent>
              </Tooltip>
              <DialogContent className="max-w-2xl p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-muted/20">
                  <DialogTitle className="text-lg text-foreground">{s.name} - Quellen</DialogTitle>
                  <div className="text-sm text-muted-foreground italic">{s.scientificName}</div>
                </DialogHeader>
                <div className="px-6 py-5">
                  <Tabs defaultValue="evidence" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted/30 p-1">
                      <TabsTrigger value="evidence">Artenhinweise & Evidenz</TabsTrigger>
                      <TabsTrigger value="context">Habitatindikatoren & Umwelt-Praediktoren</TabsTrigger>
                    </TabsList>

                    <TabsContent value="evidence" className="space-y-4">
                      <div className="rounded-xl border border-border/50 bg-background/70 p-4">
                        <div className="text-sm font-semibold text-foreground">Quellen</div>
                        <div className="mt-1 text-xs font-medium uppercase tracking-wide text-primary">LANUK</div>
                        {s.name === "Rotmilan" ? (
                          <div className="mt-3 grid gap-2 text-sm">
                            <a className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md" href="https://artenschutz.naturschutzinformationen.nrw.de/artenschutz/de/arten/gruppe/voegel/massn/103024" target="_blank" rel="noreferrer">Arten-Information NRW</a>
                            <a className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md" href="https://artenschutz.naturschutzinformationen.nrw.de/artenschutz/de/arten/gruppe/voegel/rasterkarten/103024" target="_blank" rel="noreferrer">NRW Rasterkarte 103024</a>
                            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-primary">GBIF</div>
                            <a className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md" href="https://www.gbif.org/species/5229168" target="_blank" rel="noreferrer">GBIF Artprofil 5229168</a>
                          </div>
                        ) : s.name === "Rebhuhn" ? (
                          <div className="mt-3 grid gap-2 text-sm">
                            <a className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md" href="https://artenschutz.naturschutzinformationen.nrw.de/artenschutz/de/arten/gruppe/voegel/massn/103024" target="_blank" rel="noreferrer">Arten-Information NRW</a>
                            <a className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md" href="https://artenschutz.naturschutzinformationen.nrw.de/artenschutz/de/arten/gruppe/voegel/rasterkarten/103024" target="_blank" rel="noreferrer">NRW Rasterkarte 103024</a>
                            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-primary">GBIF</div>
                            <a className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md" href="https://www.gbif.org/species/2473958" target="_blank" rel="noreferrer">GBIF Artprofil 2473958</a>
                          </div>
                        ) : s.evidenceSourceUrl ? (
                          <div className="mt-3 grid gap-2 text-sm">
                            <a className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md" href={s.evidenceSourceUrl} target="_blank" rel="noreferrer">
                              {s.evidenceSourceLabel ?? "Datenquelle"}
                            </a>
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-muted-foreground">Keine Quellen hinterlegt.</div>
                        )}
                      </div>

                      <div className="rounded-xl border border-border/50 bg-background/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-foreground">Scoring</div>
                          <div className={`text-sm font-semibold ${getScoreColor(displayScore)}`}>
                            {displayScore} ({scoreNarrative.band})
                          </div>
                        </div>
                        <div className="mt-3 rounded-lg border border-border/40 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
                          {scoreNarrative.inputModel} {scoreNarrative.quality} {scoreNarrative.uncertainty}
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/50 bg-background/70 p-4">
                        <div className="text-sm font-semibold text-foreground">Hinweise</div>
                        <div className="mt-2 grid gap-2 text-sm text-muted-foreground">
                          {s.reasons.slice(0, 5).map((reason, i) => {
                            const [label, ...rest] = reason.split(":");
                            const hasLabel = rest.length > 0;
                            const body = hasLabel ? rest.join(":").trim() : reason;
                            return (
                              <div key={i} className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
                                {hasLabel && <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">{label}</div>}
                                <div>{body}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="context" className="space-y-4">
                      <div className="rounded-xl border border-border/50 bg-background/70 p-4">
                        <div className="text-sm font-semibold text-foreground">Raeumliche Habitateignung (modellbasiert)</div>
                        <div className="mt-2 grid gap-2 text-sm text-muted-foreground">
                          <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
                            <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">Landnutzung / Habitattypen</div>
                            <div>Offene und halboffene Nutzungen als Nahrungs- und Jagdhabitat, Wald fuer Brut- und Ruhebereiche.</div>
                          </div>
                          <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
                            <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">Landschaftsstruktur / Fragmentierung</div>
                            <div>Groesse, Vernetzung und Strukturvielfalt beeinflussen die Habitateignung wesentlich.</div>
                          </div>
                          <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
                            <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">Distanz zu Infrastruktur</div>
                            <div>Abstand zu Strassen und Siedlungen als Stoerungsproxy.</div>
                          </div>
                          <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
                            <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">Topographie / Klima</div>
                            <div>Relief, Hoehenlage und regionale Klimaparameter fliessen in die Eignung ein.</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Card className="card-elevated overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Header - Always visible */}
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="gap-2 p-0 h-auto hover:bg-transparent">
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  <span className="font-semibold text-foreground">Artenliste</span>
                </div>
              </Button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              {/* Download Button (Dummy) */}
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                CSV Export
              </Button>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          {/* Filter Bar */}
          <div className="p-4 border-b border-border/50 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Art suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sortierung" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Nach Score</SelectItem>
                  <SelectItem value="confidence">Nach Konfidenz</SelectItem>
                  <SelectItem value="year">Nach Aktualität</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {[
                      { value: "all", label: "Alle" },
                      { value: "Voegel", label: "Vögel" },
                      { value: "Saeugetiere", label: "Säugetiere" },
                      { value: "Reptilien", label: "Reptilien" },
                      { value: "Insekten", label: "Insekten" },
                    ].map((group) => (
                      <button
                        key={group.value}
                        type="button"
                        onClick={() => setSelectedGroup(group.value as typeof selectedGroup)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          selectedGroup === group.value
                            ? "gradient-hero text-primary-foreground"
                            : "border border-border/60 text-foreground/80 hover:bg-muted/40"
                        }`}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Table View */}
          {filteredAndSortedSpecies.length > 0 && (
            <TooltipProvider delayDuration={150}>
              <div className="overflow-x-auto">
                <UITable>
                  <TableHeader>
                    <TableRow className="bg-muted/30 text-xs">
                      <TableHead className="w-[44px]"></TableHead>
                      <TableHead>Art</TableHead>
                      <TableHead className="text-center">{"Pr\u00fcfung"}</TableHead>
                      <TableHead className="text-center">{"Fl\u00e4chenanteil"}</TableHead>
                      <TableHead className="text-center">Kompensation</TableHead>
                      <TableHead className="text-center">Quelle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleSpecies.map((s) => renderSpeciesRow(s))}
                    {!showAllRows && previewSpecies && renderSpeciesRow(previewSpecies, true)}
                  </TableBody>
                </UITable>
              </div>
              {filteredAndSortedSpecies.length > 4 && (
                <div className="p-4 border-t border-border/50 flex justify-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowAllRows((current) => !current)}
                        aria-label={showAllRows ? "Weniger anzeigen" : "Alle Arten anzeigen"}
                      >
                        {showAllRows ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {showAllRows ? "Weniger anzeigen" : "Alle Arten anzeigen"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </TooltipProvider>
          )}

          {/* Empty State */}
          {filteredAndSortedSpecies.length === 0 && (
            <div className="p-8 text-center">
              <Database className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Keine Arten gefunden</p>
              <p className="text-sm text-muted-foreground/70">
                Passen Sie die Filter an oder ändern Sie die Suche
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SpeciesListSection;
