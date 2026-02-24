"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import { Search, ChevronRight, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SCREENING_SESSION_KEY,
  PolygonFeature,
  calculatePolygonAreaHa,
  createAnalysisId,
  getPolygonCenter
} from "@/lib/app/screeningSession";

type GeomanMap = L.Map & {
  pm?: {
    addControls: (options: Record<string, unknown>) => void;
    removeControls: () => void;
    setGlobalOptions: (options: Record<string, unknown>) => void;
  };
};

type GeomanLayerEvent = L.LeafletEvent & {
  layer?: L.Layer;
  layers?: L.LayerGroup;
};

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type FocusTarget = { lat: number; lng: number } | null;

const WIRKFAKTOR_GROUPS = [
  {
    title: "Wohnbau",
    items: [
      "Einfamilienhaus / Reihenhaus",
      "Mehrfamilienhaus / Wohnanlage",
      "Garage / Carport / Parkplatz"
    ]
  },
  {
    title: "Gewerbe & Industrie",
    items: [
      "Gewerbegebäude / Halle",
      "Produktions-/Lagerhalle",
      "Einzelhandel / Supermarkt"
    ]
  },
  {
    title: "Öffentliche Bauten",
    items: [
      "Schule / Kindergarten",
      "Sporthalle / Schwimmbad",
      "Verwaltungsgebäude / Rathaus"
    ]
  },
  {
    title: "Infrastruktur",
    items: [
      "Straßenbau / Erweiterung",
      "Rad-/Fußwege / Bürgersteig",
      "Kanalisation / Entwässerung",
      "Strom-/Gasleitungen",
      "Mobilfunkmast / Strommast"
    ]
  },
  {
    title: "Energie & Freiflächen",
    items: [
      "Windkraftanlage",
      "Freiflächen-PV-Anlage",
      "Biogasanlage"
    ]
  },
  {
    title: "Freizeit & Grün",
    items: [
      "Sportplatz / Bolzplatz",
      "Friedhofserweiterung",
      "Campingplatz / Wochenendhaus",
      "Kleingartenanlage"
    ]
  },
  {
    title: "Geländeeingriffe",
    items: [
      "Wald-/Baumrodung (ohne Bau)",
      "Gewässerregulierung / Uferbefestigung",
      "Kies-/Sand-/Torfabbau",
      "Geländemodellierung / Erdaushub"
    ]
  },
  {
    title: "Sicherheit & Sonstiges",
    items: [
      "Zaun / Mauer / Lärmschutzwand",
      "Brunnen / Teichanlage",
      "Freizeit-/Wasserpark",
      "Freiflächenrodung (Grünland)"
    ]
  }
] as const;

const ANALYSIS_STEPS = [
  "Wirkfaktoren werden auf Arten abgestimmt...",
  "Potenzielle Konflikte werden geprÃ¼ft...",
  "VorprÃ¼fungsergebnis wird dokumentiert...",
  "Analyse abgeschlossen - Ergebnis wird angezeigt!"
];

function polygonToFeature(layer: L.Layer): PolygonFeature | null {
  if (!(layer instanceof L.Polygon)) return null;

  const rings = layer.getLatLngs();
  if (!Array.isArray(rings) || rings.length === 0 || !Array.isArray(rings[0])) {
    return null;
  }

  const firstRing = rings[0] as L.LatLng[];
  if (firstRing.length < 3) return null;

  const coordinates = firstRing.map((point) => [point.lng, point.lat]);
  const isClosed =
    coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
    coordinates[0][1] === coordinates[coordinates.length - 1][1];

  if (!isClosed) {
    coordinates.push([coordinates[0][0], coordinates[0][1]]);
  }

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [coordinates]
    },
    properties: {
      source: "geoman"
    }
  };
}

function GeomanController({
  onPolygonChange
}: {
  onPolygonChange: (feature: PolygonFeature | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const geomanMap = map as GeomanMap;
    if (!geomanMap.pm) return;

    geomanMap.pm.setGlobalOptions({ continueDrawing: false });

    geomanMap.pm.addControls({
      position: "topright",
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: true,
      drawCircle: false,
      drawText: false,
      drawPolygon: true,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true
    });

    const handleCreate = (event: L.LeafletEvent) => {
      const geomanEvent = event as GeomanLayerEvent;
      if (!geomanEvent.layer) return;
      onPolygonChange(polygonToFeature(geomanEvent.layer));
    };

    const handleEdit = (event: L.LeafletEvent) => {
      const geomanEvent = event as GeomanLayerEvent;
      if (geomanEvent.layer) {
        onPolygonChange(polygonToFeature(geomanEvent.layer));
        return;
      }
      if (geomanEvent.layers) {
        let updated: PolygonFeature | null = null;
        geomanEvent.layers.eachLayer((layer) => {
          const candidate = polygonToFeature(layer);
          if (candidate) updated = candidate;
        });
        onPolygonChange(updated);
      }
    };

    const handleRemove = () => onPolygonChange(null);

    // Geoman attaches custom lifecycle events on the map instance.
    map.on("pm:create", handleCreate as L.LeafletEventHandlerFn);
    map.on("pm:edit", handleEdit as L.LeafletEventHandlerFn);
    map.on("pm:remove", handleRemove as L.LeafletEventHandlerFn);

    return () => {
      map.off("pm:create", handleCreate as L.LeafletEventHandlerFn);
      map.off("pm:edit", handleEdit as L.LeafletEventHandlerFn);
      map.off("pm:remove", handleRemove as L.LeafletEventHandlerFn);
      geomanMap.pm?.removeControls();
    };
  }, [map, onPolygonChange]);

  return null;
}

function FocusController({ target }: { target: FocusTarget }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.setView([target.lat, target.lng], 14);
  }, [map, target]);

  return null;
}

export function MapEditor() {
  const router = useRouter();
  const [polygon, setPolygon] = useState<PolygonFeature | null>(null);
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("AusgewÃ¤hlte Gemeinde");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<FocusTarget>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [selectedWirkfaktoren, setSelectedWirkfaktoren] = useState<string[]>([]);
  const [wirkfaktorenExpanded, setWirkfaktorenExpanded] = useState(false);
  const analysisTimersRef = useRef<number[]>([]);
  const progressRafRef = useRef<number | null>(null);

  const hasGeometry = useMemo(() => Boolean(polygon), [polygon]);
  const canStartScreening = hasGeometry && selectedWirkfaktoren.length > 0;

  const clearAnalysisTimers = () => {
    analysisTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    analysisTimersRef.current = [];
    if (progressRafRef.current !== null) {
      window.cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearAnalysisTimers();
  }, []);

  const toggleWirkfaktor = (factor: string) => {
    setSelectedWirkfaktoren((current) =>
      current.includes(factor) ? current.filter((item) => item !== factor) : [...current, factor]
    );
  };

  const handleSearch = async () => {
    const query = search.trim();
    if (!query) return;

    setSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
      );
      const data: SearchResult[] = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setSearchError("Ort nicht gefunden.");
        return;
      }

      const lat = Number.parseFloat(data[0].lat);
      const lng = Number.parseFloat(data[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setSearchError("Koordinaten konnten nicht gelesen werden.");
        return;
      }

      setFocusTarget({ lat, lng });
      setSelectedLocation(data[0].display_name.split(",")[0] ?? data[0].display_name);
    } catch {
      setSearchError("Suche fehlgeschlagen.");
    } finally {
      setSearching(false);
    }
  };

  const handleStartScreening = () => {
    if (!polygon || selectedWirkfaktoren.length === 0 || isAnalyzing) return;

    const sessionPayload = {
      selectedLocation,
      polygon,
      selectedWirkfaktoren,
      center: getPolygonCenter(polygon),
      areaHa: calculatePolygonAreaHa(polygon),
      analysisTimestamp: new Date().toISOString(),
      analysisId: createAnalysisId()
    };

    try {
      sessionStorage.setItem(SCREENING_SESSION_KEY, JSON.stringify(sessionPayload));
    } catch {
      // Ignore storage errors and continue navigation.
    }

    setIsAnalyzing(true);
    setCompletedSteps(0);
    setProgressPercent(0);
    clearAnalysisTimers();

    const totalProgressDuration = ANALYSIS_STEPS.length * 1150;
    const progressStart = performance.now();
    const animateProgress = (now: number) => {
      const elapsed = now - progressStart;
      const nextProgress = Math.min(100, (elapsed / totalProgressDuration) * 100);
      setProgressPercent(nextProgress);

      if (nextProgress < 100) {
        progressRafRef.current = window.requestAnimationFrame(animateProgress);
      } else {
        progressRafRef.current = null;
      }
    };
    progressRafRef.current = window.requestAnimationFrame(animateProgress);

    ANALYSIS_STEPS.forEach((_, index) => {
      const timerId = window.setTimeout(() => {
        setCompletedSteps(index + 1);

        if (index === ANALYSIS_STEPS.length - 1) {
          const redirectTimerId = window.setTimeout(() => {
            router.push("/app/results");
          }, 650);
          analysisTimersRef.current.push(redirectTimerId);
        }
      }, (index + 1) * 1150);

      analysisTimersRef.current.push(timerId);
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_18px_48px_rgba(20,40,29,0.10)] sm:p-7">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[2rem] font-semibold tracking-[-0.02em] text-ink sm:text-[2.2rem]">
            FlÃ¤che auswÃ¤hlen
            </h2>
            <p className="mt-1 text-sm text-ink/65 sm:text-base">
              Zeichnen Sie ein Polygon oder suchen Sie einen Ort
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto">
            <div className="flex w-full gap-2 md:min-w-[420px]">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleSearch();
                    }
                  }}
                  placeholder="Stadt oder Ort"
                  className="h-11 rounded-xl border-white bg-white pl-9"
                />
              </div>
              <Button
                type="button"
                onClick={() => void handleSearch()}
                disabled={searching}
                className="h-11 rounded-xl bg-brand px-6 text-white hover:bg-brand/90"
              >
                {searching ? "Suche..." : "Suchen"}
              </Button>
            </div>
            {searchError ? <p className="text-xs text-red-600">{searchError}</p> : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-ink/10">
          <div className="h-[44vh] min-h-[340px] w-full">
            <MapContainer
              center={[49.9195, 8.1234]}
              zoom={13}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <FocusController target={focusTarget} />
              <GeomanController onPolygonChange={setPolygon} />
            </MapContainer>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-base text-ink/65">
            {hasGeometry ? "Standort erfasst. WÃ¤hlen Sie nun die Wirkfaktoren aus." : "Zeichnen Sie ein Polygon auf der Karte"}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_18px_48px_rgba(20,40,29,0.10)] sm:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[2rem] font-semibold tracking-[-0.02em] text-ink sm:text-[2.2rem]">
              Wirkfaktoren
            </h2>
            <p className="mt-1 text-sm text-ink/65 sm:text-base">
              WÃ¤hlen Sie die relevanten Wirkfaktoren fÃ¼r die VorprÃ¼fung aus
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#eef6f3] px-3 py-1 text-xs font-medium text-[#2f6f64]">
              {selectedWirkfaktoren.length} ausgewÃ¤hlt
            </span>
            <button
              type="button"
              onClick={() => setWirkfaktorenExpanded((current) => !current)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300/65 bg-white/60 text-ink/70 transition hover:bg-white/90"
              aria-label={wirkfaktorenExpanded ? "Wirkfaktoren einklappen" : "Wirkfaktoren ausklappen"}
            >
              {wirkfaktorenExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="relative grid gap-4 lg:grid-cols-3">
          {WIRKFAKTOR_GROUPS.map((group) => (
            <div key={group.title} className="rounded-xl border border-[#e1ebe8] bg-white/80 p-3.5">
              <p className="text-sm font-semibold text-[#1f3f38]">{group.title}</p>
              <div className="mt-3 space-y-2">
                {(wirkfaktorenExpanded ? group.items : group.items.slice(0, 3)).map((item) => {
                  const inputId = `wirkfaktor-${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                  const checked = selectedWirkfaktoren.includes(item);

                  return (
                    <label
                      key={item}
                      htmlFor={inputId}
                      className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm text-ink/80 transition hover:bg-[#f6fbf9]"
                    >
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleWirkfaktor(item)}
                        className="mt-[2px] h-4 w-4 rounded border-[#aacdc5] text-[#1f8f82] focus:ring-[#1f8f82]/35"
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
              {!wirkfaktorenExpanded && group.items.length > 3 ? (
                <p className="mt-2 px-2 text-xs text-ink/50">+{group.items.length - 3} weitere</p>
              ) : null}
            </div>
          ))}
          {!wirkfaktorenExpanded ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white/95 via-white/70 to-transparent" />
          ) : null}
        </div>

        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setWirkfaktorenExpanded((current) => !current)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300/65 bg-white/60 text-ink/70"
            aria-label={wirkfaktorenExpanded ? "Wirkfaktoren einklappen" : "Wirkfaktoren ausklappen"}
          >
            {wirkfaktorenExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_18px_48px_rgba(20,40,29,0.10)] sm:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-base text-ink/65">
            {!hasGeometry
              ? "Bitte zuerst einen Standort auf der Karte auswÃ¤hlen."
              : selectedWirkfaktoren.length === 0
                ? "Bitte mindestens einen Wirkfaktor auswÃ¤hlen."
                : "Standort und Wirkfaktoren erfasst. Sie kÃ¶nnen das Screening starten."}
          </p>

          <Button
            type="button"
            onClick={handleStartScreening}
            disabled={!canStartScreening || isAnalyzing}
            className={`h-12 rounded-2xl px-8 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-80 ${
              canStartScreening ? "bg-[#1f8f82] hover:bg-[#187367]" : "bg-[#9fd1c8]"
            }`}
          >
            Screening starten
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {isAnalyzing ? (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-white/96 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl rounded-3xl border border-[#dce9e5] bg-white p-6 text-[#173c35] shadow-[0_20px_55px_rgba(15,50,40,0.14)] sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[#3d7f73]">Artenschutzrechtliche RelevanzprÃ¼fung Stufe 1</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.01em] text-[#123a33]">Screening wird vorbereitet</h3>
            <p className="mt-2 text-sm text-[#4c6e67]">Bitte warten Sie kurz. Die VorprÃ¼fung wird Schritt fÃ¼r Schritt ausgefÃ¼hrt.</p>

            <div className="mt-6 space-y-3">
              {ANALYSIS_STEPS.map((step, index) => {
                const isDone = index < completedSteps;
                const isCurrent = index === completedSteps;

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      isDone
                        ? "border-[#bfe4d7] bg-[#eef9f4]"
                        : isCurrent
                          ? "border-[#f1d47c] bg-[#fff9e8]"
                          : "border-[#e5ece9] bg-white"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-[#1f8f82]" />
                    ) : (
                      <Circle className={`h-5 w-5 ${isCurrent ? "text-[#b98a13]" : "text-[#b8c8c4]"}`} />
                    )}
                    <span className={`${isDone || isCurrent ? "text-[#173c35]" : "text-[#79948e]"}`}>{step}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs text-[#4c6e67]">
                <span>Fortschritt</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#edf3f1]">
                <div
                  className="h-full rounded-full bg-[#1f8f82]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

