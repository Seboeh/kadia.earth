import { useState, useCallback, type FormEvent } from "react";
import { motion } from "framer-motion";
import { MapPin, Leaf, Shield, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AreaSelectionMap from "./AreaSelectionMap";

interface LandingViewProps {
  onStartScreening: (areaName: string, polygon: [number, number][]) => void;
}

const LandingView = ({ onStartScreening }: LandingViewProps) => {
  const [areaSelected, setAreaSelected] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [areaPolygon, setAreaPolygon] = useState<[number, number][]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const handleAreaDrawn = useCallback((name: string, polygon: [number, number][]) => {
    setAreaName(name);
    setAreaPolygon(polygon);
    setAreaSelected(true);
  }, []);

  const handleSearch = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          query
        )}`
      );
      if (!response.ok) {
        throw new Error("search failed");
      }
      const data = (await response.json()) as Array<{ lat: string; lon: string }>;
      if (!data.length) {
        setSearchError("Kein Treffer");
        return;
      }
      setSearchLocation({ lat: Number(data[0].lat), lng: Number(data[0].lon) });
    } catch (error) {
      setSearchError("Suche fehlgeschlagen");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleStartScreening = useCallback(() => {
    if (areaSelected && areaName) {
      onStartScreening(areaName, areaPolygon);
    }
  }, [areaSelected, areaName, areaPolygon, onStartScreening]);

  return (
    <div className="min-h-screen">
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
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Dokumentation
            </Button>
            <Button variant="outline" size="sm">
              Anmelden
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm mb-6">
              <Shield className="w-4 h-4" />
              <span>One-Click Arten- & Genehmigungs-Screening</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Standortanalyse in Sekunden
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Wählen Sie eine Fläche und erhalten Sie in Sekunden ein Screening zu
              planungsrelevanten Arten und Kompensationsmaßnahmen.
            </p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="card-elevated-lg overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Flaeche auswaehlen
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Zeichnen Sie ein Polygon oder suchen Sie einen Ort
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                      <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Stadt oder Ort"
                        className="h-9 w-56 rounded-md border border-border/60 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSearching}
                        className="gap-2"
                      >
                        {isSearching ? "Suche..." : "Suchen"}
                      </Button>
                    </form>
                  </div>
                </div>
                {searchError && (
                  <div className="mt-2 text-xs text-muted-foreground">{searchError}</div>
                )}
              </div>

              {/* Map */}
              <div className="h-[400px] relative">
                <AreaSelectionMap
                  onAreaDrawn={handleAreaDrawn}
                  searchLocation={searchLocation}
                  areaLabel={searchQuery}
                />
                {areaSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-status-green-bg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-status-green" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{areaName}</p>
                        <p className="text-xs text-muted-foreground">Flaeche ausgewaehlt</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Bar */}
              <div className="p-6 bg-muted/30 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {areaSelected ? (
                      <span className="text-status-green">Bereit fuer Analyse</span>
                    ) : (
                      "Zeichnen Sie ein Polygon auf der Karte"
                    )}
                  </div>
                  <Button
                    size="lg"
                    disabled={!areaSelected}
                    onClick={handleStartScreening}
                    className="gap-2 gradient-hero text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Screening starten
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Info Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Accordion type="single" collapsible className="bg-card rounded-xl border border-border/50">
              <AccordionItem value="how-it-works" className="border-none">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-primary" />
                    <span className="font-medium">Wie Kadia arbeitet</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="grid md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">1. Automatische Kontextableitung</h4>
                        <p className="text-muted-foreground">
                          Bundesland, Saison und Pufferzonen werden automatisch aus dem Polygon abgeleitet.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">2. Regulatorik-Filter</h4>
                        <p className="text-muted-foreground">
                          Pruefung auf FFH Anhang IV, Europaeische Vogelarten, VSG-Relevanz und landesspezifische Planungsrelevanz.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">3. Drei-Ebenen-Datenfusion</h4>
                        <p className="text-muted-foreground">
                          Kombination aus Nachweisen (Observations), Habitat-Proxies und Species Distribution Models (SDM).
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">4. Species Distribution Models</h4>
                        <p className="text-muted-foreground">
                          SDMs sind statistische Modelle, die Artenvorkommen mit Umweltvariablen verknuepfen. 
                          Sie liefern Rasterkarten mit Habitat-Eignung - kein Ersatz fuer Feldnachweise.
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Mockup-Version - Die Anzeige ersetzt keine behoerdliche Pruefung, Kartierung oder Gutachten.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingView;
