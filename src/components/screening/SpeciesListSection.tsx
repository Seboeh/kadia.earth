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
import { Species } from "@/data/dummyData";

interface SpeciesListSectionProps {
  species: Species[];
  onShowOnMap: (speciesId: string) => void;
  selectedSpeciesId: string | null;
}

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-status-red";
  if (score >= 50) return "text-status-yellow brightness-75";
  return "text-status-green";
};

const getConfidenceColor = (confidence: Species["confidence"]) => {
  const colors = {
    hoch: "bg-status-green-bg text-status-green",
    mittel: "bg-status-yellow/15 text-status-yellow",
    niedrig: "bg-status-red-bg text-status-red",
  };
  return colors[confidence];
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
  const band = score >= 75 ? "hoch" : score >= 50 ? "mittel" : "niedrig";
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
    const scoreNarrative = getScoreNarrative(s.evidenceScore);
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
        <TableCell className="py-2">
          <div className={cellClamp}>
            <span className={`text-lg font-bold ${getScoreColor(s.evidenceScore)}`}>
              {s.evidenceScore}
            </span>
          </div>
        </TableCell>
        <TableCell className="py-2 text-center">
          <div className={cellClamp}>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getDataStatusColor(s.dataStatus)}`}>
              {s.dataStatus} {s.year && `(${s.year})`}
            </span>
          </div>
        </TableCell>
        <TableCell className="py-2 text-center">
          <div className={cellClamp}>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getConfidenceColor(s.confidence)}`}>
              {s.confidence}
            </span>
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
                <TooltipContent>Details</TooltipContent>
              </Tooltip>
                              <DialogContent className="max-w-2xl p-0 overflow-hidden">
                                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-muted/20">
                                  <DialogTitle className="text-lg text-foreground">
                                    {s.name}
                                  </DialogTitle>
                                  <div className="text-sm text-muted-foreground italic">
                                    {s.scientificName}
                                  </div>
                                  <div className="mt-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                                      {s.legalLabels[0]}
                                    </span>
                                  </div>
                                </DialogHeader>

                                                                <div className="px-6 py-5 space-y-6">
                                  <div>
                                    <div className="text-base font-semibold text-foreground mb-3">
                                      Übersicht
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                      <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-3 text-center">
                                        <div className="text-muted-foreground">Evidenz</div>
                                        <div className={`text-lg font-semibold ${getScoreColor(s.evidenceScore)}`}>
                                          {s.evidenceScore}
                                        </div>
                                      </div>
                                      <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-3 text-center">
                                        <div className="text-muted-foreground">Status</div>
                                        <div className="text-base font-semibold text-foreground">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getDataStatusColor(s.dataStatus)}`}>
                                            {s.dataStatus} {s.year && `(${s.year})`}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-3 text-center">
                                        <div className="text-muted-foreground">Konfidenz</div>
                                        <div className="text-base font-semibold text-foreground">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getConfidenceColor(s.confidence)}`}>
                                            {s.confidence}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <Tabs defaultValue="evidence" className="space-y-4">
                                    <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted/30 p-1">
                                      <TabsTrigger value="evidence">Artenhinweise & Evidenz</TabsTrigger>
                                      <TabsTrigger value="context">Habitatindikatoren & Umwelt-Prädiktoren</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="context" className="space-y-6">
                                      <div>
                                        <div className="text-base font-semibold text-foreground mb-3">
                                          Räumliche Habitateignung (modellbasiert)
                                        </div>
                                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                          <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2 sm:col-span-2">
                                            <div className="text-sm font-semibold text-foreground mb-2">
                                              Landnutzung / Habitattypen
                                            </div>
                                            <div>
                                              Offene und halboffene Nutzungen werden als Nahrungs- und Jagdhabitate
                                              berücksichtigt (z. B. Grünland, niedrig bewachsene Ackerflächen). Wald
                                              wird v. a. für Brut- und Ruhebereiche einbezogen.
                                            </div>
                                            <div className="mt-2 text-[11px] text-muted-foreground">
                                              Offene Agrarlandschaften, Grünland, strukturreiche Feldflur
                                            </div>
                                          </div>
                                          <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2 sm:col-span-2">
                                            <div className="text-sm font-semibold text-foreground mb-2">
                                              Landschaftsstruktur / Fragmentierung
                                            </div>
                                            <div>
                                              Entscheidend sind Größe und Vernetzung offener Flächen sowie strukturgebende
                                              Elemente (z. B. Gehölzsäume, Feldraine). Stark fragmentierte oder isolierte
                                              Flächen mindern die Habitateignung.
                                            </div>
                                            <div className="mt-2 text-[11px] text-muted-foreground">
                                              Flächengröße, Vernetzung, Strukturvielfalt
                                            </div>
                                          </div>
                                          <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2 sm:col-span-2">
                                            <div className="text-sm font-semibold text-foreground mb-2">
                                              Distanz zu Infrastruktur (Störungsproxy)
                                            </div>
                                            <div>
                                              Abstand zu Straßen, Siedlungen und stark frequentierten Wegen dient als
                                              Störungsproxy. Je näher die Infrastruktur, desto geringer die
                                              Habitateignung.
                                            </div>
                                            <div className="mt-2 text-[11px] text-muted-foreground">
                                              Abstand zu Straßen und Siedlungen (Störungsnähe)
                                            </div>
                                          </div>
                                          <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2 sm:col-span-2">
                                            <div className="text-sm font-semibold text-foreground mb-2">
                                              Topographie / Klima
                                            </div>
                                            <div>
                                              Geländeneigung, Höhenlage und regionale Klimawerte erfassen
                                              artspezifische Präferenzen für offene, übersichtliche Landschaften.
                                            </div>
                                            <div className="mt-2 text-[11px] text-muted-foreground">
                                              Relief, Höhenlage, regionale Klimaparameter
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-base font-semibold text-foreground mb-3">
                                          Habitatindikatoren & Umwelt-Prädiktoren
                                        </div>
                                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                          <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
                                            <div className="text-[11px] text-muted-foreground mb-1">Klima</div>
                                            <div className="flex flex-wrap gap-1">
                                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-green-bg text-status-green">
                                                9.8?C Jahresmittel
                                              </span>
                                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-green-bg text-status-green">
                                                640 mm/Jahr
                                              </span>
                                            </div>
                                          </div>
                                          <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
                                            <div className="text-[11px] text-muted-foreground mb-1">Topografie</div>
                                            <div className="flex flex-wrap gap-1">
                                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-green-bg text-status-green">
                                                148 m
                                              </span>
                                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-green-bg text-status-green">
                                                6.2?
                                              </span>
                                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-green-bg text-status-green">
                                                Exposition SW
                                              </span>
                                            </div>
                                          </div>
                                          <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
                                            <div className="text-[11px] text-muted-foreground mb-1">Landbedeckung</div>
                                            <div className="flex flex-wrap gap-1">
                                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-green-bg text-status-green">
                                                Wald 18%
                                              </span>
                                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-green-bg text-status-green">
                                                Acker 52%
                                              </span>
                                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-green-bg text-status-green">
                                                Siedlung 24%
                                              </span>
                                            </div>
                                          </div>
                                          <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
                                            <div className="text-[11px] text-muted-foreground mb-1">Druck</div>
                                            <div className="flex flex-wrap gap-1">
                                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-green-bg text-status-green">
                                                Versiegelung 22%
                                              </span>
                                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-status-green-bg text-status-green">
                                                Straßennähe 95 m
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </TabsContent>
                                    <TabsContent value="evidence" className="space-y-6">
                                      <div>
                                        <div className="text-base font-semibold text-foreground mb-3">
                                          Evidenz
                                        </div>
                                        <div className="rounded-xl border border-border/50 bg-background/70 p-4">
                                          <div className="flex items-center justify-between mb-3">
                                            <div className="text-sm font-semibold text-foreground">Quellen</div>
                                            <div className="text-xs text-muted-foreground">2 Links</div>
                                          </div>
                                          <div className="grid gap-2 sm:grid-cols-2">
                                            {s.evidenceSourceUrl && (
                                              <a
                                                href={s.evidenceSourceUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group rounded-lg border border-primary/35 bg-primary/10 p-3 text-left text-primary transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/15"
                                                onClick={(event) => event.stopPropagation()}
                                              >
                                                <div className="flex items-center justify-between">
                                                  <span className="text-sm font-semibold text-foreground">
                                                    {s.evidenceSourceLabel ?? "GBIF Datenquelle"}
                                                  </span>
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                  Vorkommensnachweise und Beobachtungen
                                                </div>
                                                <div className="mt-2 text-[11px] text-primary/80 truncate">
                                                  {s.evidenceSourceUrl}
                                                </div>
                                              </a>
                                            )}
                                            <a
                                              href="https://artenschutz.naturschutzinformationen.nrw.de/artenschutz/de/arten/gruppe/voegel/rasterkarten/103013"
                                              target="_blank"
                                              rel="noreferrer"
                                              className="group rounded-lg border border-primary/35 bg-primary/10 p-3 text-left text-primary transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/15"
                                              onClick={(event) => event.stopPropagation()}
                                            >
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-foreground">
                                                  LANUV Rasterkarte (NRW)
                                                </span>
                                              </div>
                                              <div className="mt-1 text-xs text-muted-foreground">
                                                Landesweite Rasterdaten und Fachinfo
                                              </div>
                                              <div className="mt-2 text-[11px] text-primary/80 truncate">
                                                artenschutz.naturschutzinformationen.nrw.de/…/103013
                                              </div>
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-base font-semibold text-foreground mb-3">
                                          Hinweise
                                        </div>
                                        <div className="space-y-4">
                                          <div className="rounded-xl border border-border/50 bg-background/70 p-4">
                                            <div className="flex items-center justify-between gap-3">
                                              <div className="text-sm font-semibold text-foreground">
                                                Score-Kontext
                                              </div>
                                              <div className={`text-sm font-semibold ${getScoreColor(s.evidenceScore)}`}>
                                                {s.evidenceScore} ({scoreNarrative.band})
                                              </div>
                                            </div>
                                            <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                              <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2 sm:col-span-2">
                                                <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">
                                                  Eingangsdaten & Modellannahmen
                                                </div>
                                                <div>{scoreNarrative.inputModel}</div>
                                              </div>
                                              <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
                                                <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">
                                                  Gütemaße
                                                </div>
                                                <div>{scoreNarrative.quality}</div>
                                              </div>
                                              <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-2">
                                                <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">
                                                  Unsicherheit
                                                </div>
                                                <div>{scoreNarrative.uncertainty}</div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                            {s.reasons.slice(0, 5).map((reason, i) => {
                                              const [label, ...rest] = reason.split(":");
                                              const hasLabel = rest.length > 0;
                                              const body = hasLabel ? rest.join(":").trim() : reason;
                                              return (
                                                <div
                                                  key={i}
                                                  className="rounded-lg border border-border/40 bg-background/60 px-3 py-2"
                                                >
                                                  {hasLabel && (
                                                    <div className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide">
                                                      {label}
                                                    </div>
                                                  )}
                                                  <div>{body}</div>
                                                </div>
                                              );
                                            })}
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
        <TableCell className="py-2" />
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
                    <TableHead>Score</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Konfidenz</TableHead>
                      <TableHead className="text-center">Details</TableHead>
                      <TableHead className="w-[90px]"></TableHead>
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
