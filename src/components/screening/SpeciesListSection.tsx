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
  if (status === "Lokale Massnahmen") return "status-yellow";
  if (status === "Nicht pruefrelevant") return "status-green";
  return "status-yellow";
};

const compensationStatusByName: Record<string, string> = {
  Rebhuhn: "saP-relevant",
  Rotmilan: "Pruefrelevant",
  "Flederm??use": "Pruefrelevant",
  "Fledermaeuse (alle Arten)": "Pruefrelevant",
  Feldlerche: "Lokale Massnahmen",
  Grasfrosch: "Lokale Massnahmen",
  Mauersegler: "Lokale Massnahmen",
  Wachtel: "Lokale Massnahmen",
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
      "Es liegen mehrere aktuelle und räumlich zuordenbare Nachweise vor, und die einbezogenen Umwelt- und Habitatprädiktoren zeigen ein zur Artökologie konsistentes Muster; die Modellierung stützt sich dabei auf fachlich etablierte Habitatpräferenzen, die im Betrachtungsraum als plausibel übertragbar angenommen werden.",
    quality:
      "Das SDM/MSDM leitet daraus eine robuste Habitateignung mit einem klar ausgeprägten räumlichen Signal ab, was sich in einem Evidenz-Score im oberen Bereich widerspiegelt.",
    uncertainty:
      "Verbleibende Unsicherheiten werden transparent ausgewiesen und betreffen insbesondere zeitliche Dynamiken (Aktualität der Nachweise) sowie mögliche lokale Stör- und Nutzungsänderungen.",
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
        <Dialog>
          <TableCell className="py-2 text-center">
            <div className={cellClamp}>
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
            </div>
          </TableCell>
          <TableCell className="py-2">
            <div className={`flex items-center justify-center gap-1 ${cellClamp}`}>
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
                                            <div className="mt-1 text-xs">Strukturierter Ueberblick fuer Acker- und Gruenlandmassnahmen.</div>
                                          </div>

                                          <div className="rounded-lg border border-border/50 bg-background p-3">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="text-xs font-semibold text-foreground">O2.1/O2.2 Habitatoptimierungen im Acker</div>
                                              <span className="rounded-full bg-status-red-bg px-2 py-0.5 text-[10px] font-semibold text-status-red">Prioritaet 1</span>
                                            </div>
                                            <div className="mt-1 text-xs">Orientierungswert: 1 ha pro Paar (flaechige Massnahmen bevorzugt)</div>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                              <div>
                                                <div className="text-[11px] font-semibold text-foreground">Massnahmen</div>
                                                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                                                  <li>Nutzungsextensivierung Intensivaecker + Ackerbrachen (Goettinger Modell)</li>
                                                  <li>Mindestbreite Streifen: 15-20 m</li>
                                                  <li>Keine Duengemittel, Biozide oder Beikrautregulierung</li>
                                                  <li>Bei fehlenden offenen Boeden mit Schwarzbrachestreifen kombinieren</li>
                                                  <li>Rotation: jaehrlich 1/2 Flaeche neu oder alle 3-5 Jahre komplett</li>
                                                </ul>
                                              </div>
                                              <div>
                                                <div className="text-[11px] font-semibold text-foreground">Standortanforderungen</div>
                                                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                                                  <li>&gt;120 m Abstand zu Waldrand, Siedlung und stark frequentierten Wegen</li>
                                                  <li>Trockene Boeden priorisieren</li>
                                                  <li>Keine Gruenlandumwandlung, ackergepraegte Gebiete bevorzugen</li>
                                                  <li>Verteilte Streifen statt isolierter Inseln</li>
                                                </ul>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="rounded-lg border border-border/50 bg-background p-3">
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="text-xs font-semibold text-foreground">O1.1 Habitatoptimierungen im Gruenland</div>
                                              <span className="rounded-full bg-status-yellow/20 px-2 py-0.5 text-[10px] font-semibold text-status-yellow">Prioritaet 2</span>
                                            </div>
                                            <div className="mt-1 text-xs">Orientierungswert: 1 ha pro Paar</div>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                              <div>
                                                <div className="text-[11px] font-semibold text-foreground">Massnahmen</div>
                                                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                                                  <li>Extensivmahd oder Beweidung (max. 2 Rinder/ha bis Mitte August)</li>
                                                  <li>Keine Mahd waehrend der Brutzeit (April bis Mitte August)</li>
                                                  <li>Kraeuteranteil erhoehen (autochthones Saatgut, nicht dichtwuechsig)</li>
                                                  <li>Keine Pestizide und kein Duenger</li>
                                                </ul>
                                              </div>
                                              <div>
                                                <div className="text-[11px] font-semibold text-foreground">Standortanforderungen</div>
                                                <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                                                  <li>&gt;120 m zu Wald, Wegen und Siedlungen; trockene Standorte bevorzugen</li>
                                                  <li>Keine wuechsigen Flaechen (ggf. vorher ausmagern)</li>
                                                  <li>Gruenlandgebiete priorisieren, kein Umbruch</li>
                                                  <li>Mosaik aus kurz- und langrasigen Strukturen</li>
                                                </ul>
                                              </div>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                                              <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5">Wirksamkeit: 2 Jahre (Optimierung), 5 Jahre (Neuanlage)</span>
                                              <span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5">Eignung: hoch</span>
                                            </div>
                                          </div>

                                          <div className="rounded-lg border border-border/50 bg-background p-3">
                                            <div className="text-[11px] font-semibold text-foreground">Allgemeine Hinweise</div>
                                            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                                              <li>Monitoring: massnahmen- und populationsbezogen erforderlich</li>
                                              <li>Pflege: jaehrliche Rotation und Brutzeitschonung</li>
                                              <li>Kombination: Acker + Gruenland als Mosaik ist optimal</li>
                                              <li>Risiko: niedrige Populationsdichte kann Besiedlung verzoegern</li>
                                            </ul>
                                          </div>
                                        </div>
                                      ) : s.name === "Rotmilan" ? (
                                        <div className="mt-3 space-y-4 text-sm text-muted-foreground">
                                          <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                                            <div className="text-sm font-semibold text-foreground">Rotmilan - Habitatoptimierungen</div>
                                            <div className="mt-1 text-xs">Strukturierter Ueberblick zu Brutplatz, Nahrung und Biotopverbund.</div>
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
                                              <li>Gruenland priorisieren! (Expertenworkshop)</li>
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
                                        <div className="mt-2 text-sm text-muted-foreground">Keine spezifischen Massnahmen hinterlegt.</div>
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
          </div>
        </TableCell>
        </Dialog>
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
