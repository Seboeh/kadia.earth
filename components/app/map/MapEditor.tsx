"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import { Search, ChevronRight, CheckCircle2, Circle, Hourglass } from "lucide-react";
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
    title: "Wohnen",
    items: [
      "Einfamilienhaus",
      "Reihenhaus",
      "Mehrfamilienhaus",
      "Wohnanlage",
      "Quartier",
      "Garage",
      "Carport",
      "Tiefgarage",
      "Parkhaus",
      "Wohnsanierung",
      "Wohnneubau modular"
    ]
  },
  {
    title: "Gewerbe & Industrie",
    items: [
      "Gewerbegebäude",
      "Bürogebäude",
      "Open Space",
      "Produktionshalle",
      "Lagerhalle",
      "Logistikzentrum",
      "Hochregallager",
      "Distributionszentrum",
      "Einzelhandel",
      "Supermarkt",
      "Ladenbau",
      "Retail Park",
      "Große Produktionshalle"
    ]
  },
  {
    title: "Öffentliche Bauten",
    items: [
      "Schule",
      "Kindergarten",
      "Universitätsgebäude",
      "Sporthalle",
      "Schwimmbad",
      "Stadion",
      "Feuerwehrhaus",
      "Verwaltungsgebäude",
      "Rathaus",
      "Klinik",
      "Polizeistation"
    ]
  },
  {
    title: "Infrastruktur",
    items: [
      "Straßenbau",
      "Straßen Erweiterung",
      "Umgehungsstraße",
      "Radweg",
      "Fußweg",
      "Bürgersteig",
      "Brückenbau",
      "Tunnelbau",
      "Kanalisation",
      "Entwässerung",
      "Kläranlage",
      "Stromleitungen",
      "Gasleitungen",
      "Wasserleitungen",
      "Mobilfunkmast",
      "Strommast",
      "Freileitung"
    ]
  },
  {
    title: "Energie & Freiflächen",
    items: [
      "Windkraftanlage Onshore",
      "Freiflächen PV Anlage",
      "Solarpark",
      "Biogasanlage",
      "Biomassekraftwerk",
      "H2 Elektrolyseur",
      "Umspannwerk",
      "Trafostation",
      "Energiespeicher"
    ]
  },
  {
    title: "Freizeit & Grünflächen",
    items: [
      "Sportplatz",
      "Bolzplatz",
      "Tennisanlage",
      "Friedhofserweiterung",
      "Campingplatz",
      "Wochenendhausanlage",
      "Kleingartenanlage",
      "Schrebergarten",
      "Spielplatz",
      "Fitnesspark",
      "Urbanes Grün"
    ]
  },
  {
    title: "Geländeeingriffe",
    items: [
      "Waldrodung",
      "Baumrodung",
      "Flächenrodung",
      "Gewässerregulierung",
      "Uferbefestigung",
      "Kiesabbau",
      "Sandabbau",
      "Torfabbau",
      "Steinbruch",
      "Geländemodellierung",
      "Erdaushub",
      "Sprengung"
    ]
  },
  {
    title: "Anlagenbetrieb",
    items: [
      "Industrieanlage",
      "Gewerbeanlage",
      "Deponie",
      "Abfalllager",
      "Recyclinghof",
      "Landwirtschaft Stall",
      "Landwirtschaft Silage",
      "Landwirtschaft Bewässerung",
      "Forstbetrieb Holzernte",
      "Forstbetrieb Kahlschlag"
    ]
  },
  {
    title: "Sonstige Vorhaben",
    items: [
      "Abriss",
      "Rückbau",
      "Stilllegung",
      "Ruhestellung",
      "Zaunbau",
      "Mauerbau",
      "Lärmschutzwand",
      "Brunnenbau",
      "Teichanlage",
      "Wasserspiel",
      "Freizeitpark",
      "Wasserpark",
      "Tierpark",
      "Temporäre Nutzung"
    ]
  }
] as const;

const ANALYSIS_STEPS = [
  "Wirkfaktoren werden auf Arten abgestimmt...",
  "Potenzielle Konflikte werden geprüft...",
  "Vorprüfungsergebnis wird dokumentiert...",
  "Analyse abgeschlossen - Ergebnis wird angezeigt!"
];

const toCategoryId = (title: string) =>
  title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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
  const [selectedLocation, setSelectedLocation] = useState("Ausgewählte Gemeinde");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<FocusTarget>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [selectedWirkfaktoren, setSelectedWirkfaktoren] = useState<string[]>([]);
  const [measureSearch, setMeasureSearch] = useState("");
  const [activeMeasureCategory, setActiveMeasureCategory] = useState<
    (typeof WIRKFAKTOR_GROUPS)[number]["title"] | null
  >(null);
  const analysisTimersRef = useRef<number[]>([]);
  const progressRafRef = useRef<number | null>(null);

  const hasGeometry = useMemo(() => Boolean(polygon), [polygon]);
  const canStartScreening = hasGeometry && selectedWirkfaktoren.length > 0;
  const categoryGroups = WIRKFAKTOR_GROUPS;
  const measureCountByCategory = useMemo(() => {
    return Object.fromEntries(
      WIRKFAKTOR_GROUPS.map((group) => [
        group.title,
        group.items.filter((item) => selectedWirkfaktoren.includes(item)).length
      ])
    ) as Record<string, number>;
  }, [selectedWirkfaktoren]);
  const activeGroup = useMemo(
    () => categoryGroups.find((group) => group.title === activeMeasureCategory) ?? null,
    [activeMeasureCategory, categoryGroups]
  );
  const measureSearchMatch = useMemo(() => {
    const query = measureSearch.trim().toLowerCase();
    if (!query) return null;
    return (
      WIRKFAKTOR_GROUPS.find((group) =>
        group.items.some((item) => item.toLowerCase().includes(query))
      ) ?? null
    );
  }, [measureSearch]);
  const filteredMeasures = useMemo(() => {
    if (!activeGroup) return [];
    const query = measureSearch.trim().toLowerCase();
    if (!query) return activeGroup.items;
    return activeGroup.items.filter((item) => item.toLowerCase().includes(query));
  }, [activeGroup, measureSearch]);
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

  useEffect(() => {
    if (activeMeasureCategory && !categoryGroups.some((group) => group.title === activeMeasureCategory)) {
      setActiveMeasureCategory(null);
    }
  }, [activeMeasureCategory, categoryGroups]);

  useEffect(() => {
    if (!measureSearchMatch) return;
    if (activeMeasureCategory !== measureSearchMatch.title) {
      setActiveMeasureCategory(measureSearchMatch.title);
    }
  }, [activeMeasureCategory, measureSearchMatch]);

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
      <section className="rounded-3xl bg-white/82 p-5 shadow-[0_10px_28px_rgba(17,24,39,0.08)] sm:p-7">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-[2rem] font-semibold tracking-[-0.02em] text-ink sm:text-[2.2rem]">
            Fläche auswählen
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
                  className="h-11 rounded-xl border-white bg-white pl-9 focus-visible:border-[#e7cf7a] focus-visible:ring-[#F7E7A6]/55"
                />
              </div>
              <Button
                type="button"
                onClick={() => void handleSearch()}
                disabled={searching}
                className="h-11 rounded-xl bg-[#F7E7A6] px-6 text-ink hover:bg-[#F2DC93]"
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
            {hasGeometry ? "Standort erfasst. Wählen Sie nun die Maßnahmen aus." : "Zeichnen Sie ein Polygon auf der Karte"}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_10px_28px_rgba(17,24,39,0.08)] sm:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[2rem] font-semibold tracking-[-0.02em] text-ink sm:text-[2.2rem]">
              Maßnahmen auswählen
            </h2>
            <p className="mt-1 text-sm text-ink/65 sm:text-base">
              Wählen Sie ihre geplanten Maßnahmen für das eingezeichnete Projektgebiet aus
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.05)]">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-base font-semibold text-[#2b352f]">Maßnahme suchen</p>
              <p className="text-xs text-ink/55">Öffnet automatisch die passende Kategorie</p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
              <Input
                value={measureSearch}
                onChange={(event) => setMeasureSearch(event.target.value)}
                placeholder="z. B. Windkraftanlage, Straßenbau, Rückbau"
                className="h-10 rounded-xl border-[#e6eaf0] bg-white pl-9 focus-visible:border-[#e7cf7a] focus-visible:ring-[#F7E7A6]/55"
              />
            </div>
            {measureSearch.trim().length > 0 && !measureSearchMatch ? (
              <p className="mt-2 text-xs text-ink/55">Keine passende Maßnahme gefunden.</p>
            ) : null}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.05)]">
            <div className="mb-3">
              <p className="text-base font-semibold text-[#2b352f]">1. Kategorie wählen</p>
            </div>
            <div role="tablist" aria-label="Maßnahmen-Kategorien" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {categoryGroups.map((group) => {
                const isActive = group.title === activeMeasureCategory;
                const categoryId = toCategoryId(group.title);
                const selectedCount = measureCountByCategory[group.title] ?? 0;
                return (
                  <button
                    key={group.title}
                    id={`measures-tab-${categoryId}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`measures-panel-${categoryId}`}
                    onClick={() => setActiveMeasureCategory(group.title)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-[#e7cf7a] bg-[#fff8dc] shadow-[0_8px_18px_rgba(247,231,166,0.35)]"
                        : "border-[#e6eaf0] bg-[#fafbfc] hover:border-[#cfd8e3]"
                    }`}
                  >
                    <p className={`text-sm font-semibold ${isActive ? "text-[#6b4b0f]" : "text-[#394450]"}`}>{group.title}</p>
                    <p className="mt-1 text-xs text-ink/55">{selectedCount} ausgewählt</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id="measures-main-panel"
            role="tabpanel"
            aria-labelledby={activeMeasureCategory ? `measures-tab-${toCategoryId(activeMeasureCategory)}` : undefined}
            className={`rounded-2xl p-4 shadow-[0_5px_16px_rgba(15,23,42,0.05)] ${activeGroup ? "bg-white" : "bg-[#f8fafc]"}`}
          >
            <div className="mb-3">
              <p className="text-base font-semibold text-[#2b352f]">2. Maßnahmen auswählen</p>
            </div>
            {activeGroup ? (
              <div
                id={`measures-panel-${toCategoryId(activeGroup.title)}`}
                role="tabpanel"
                aria-labelledby={`measures-tab-${toCategoryId(activeGroup.title)}`}
                className="space-y-3"
              >
                <div className="grid gap-2.5 md:grid-cols-2">
                  {filteredMeasures.map((item) => {
                    const checked = selectedWirkfaktoren.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleWirkfaktor(item)}
                        aria-pressed={checked}
                        className={`relative rounded-2xl border px-4 py-3 text-left transition ${
                          checked
                            ? "border-[#e7cf7a] bg-[#fff8dc] shadow-[0_6px_14px_rgba(247,231,166,0.30)]"
                            : "border-[#e6eaf0] bg-white hover:border-[#cfd8e3]"
                        }`}
                      >
                        {checked ? (
                          <span className="absolute right-2.5 top-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f7e7a6] text-[11px] font-semibold text-[#6b4b0f]">
                            x
                          </span>
                        ) : null}
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded border ${checked ? "border-[#F2DC93] bg-[#F2DC93]" : "border-[#b6c2d0] bg-white"}`}>
                            {checked ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                          </span>
                          <div>
                            <p className={`text-sm font-medium ${checked ? "text-[#6b4b0f]" : "text-[#334155]"}`}>{item}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {filteredMeasures.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d4dbe5] bg-[#fafbfc] px-4 py-6 text-sm text-ink/60">
                    Keine Maßnahme zum Suchbegriff gefunden.
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#d4dbe5] bg-[#fafbfc] px-4 py-6 text-sm text-ink/60">
                Bitte zuerst in Schritt 1 eine Kategorie auswählen.
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-[0_5px_16px_rgba(15,23,42,0.05)]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-base font-semibold text-[#2b352f]">3. Ausgewählte Maßnahmen</p>
              <p className="text-xs text-ink/55">{selectedWirkfaktoren.length} insgesamt</p>
            </div>
            {selectedWirkfaktoren.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedWirkfaktoren.map((item) => (
                    <button
                      key={`selected-${item}`}
                      type="button"
                      onClick={() => toggleWirkfaktor(item)}
                      className="relative inline-flex items-center rounded-full border border-[#eadca8] bg-[#fff8dc] pl-3 pr-7 py-1.5 text-xs text-[#6b4b0f] transition hover:border-[#dfcd88] hover:bg-[#fff3cd]"
                      aria-label={`${item} entfernen`}
                    >
                      <span>{item}</span>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#8a6a17]">x</span>
                    </button>
                  ))}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedWirkfaktoren([])}
                    className="rounded-xl border border-[#e6eaf0] bg-white px-3 py-1.5 text-xs font-medium text-ink/70 transition hover:bg-[#f8fafc]"
                  >
                    Alle entfernen
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#d4dbe5] bg-[#fafbfc] px-4 py-6 text-sm text-ink/60">
                Noch keine Maßnahme ausgewählt. Wählen Sie in Schritt 2 passende Maßnahmen aus.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_10px_28px_rgba(17,24,39,0.08)] sm:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-base text-ink/65">
            {!hasGeometry
              ? "Bitte zuerst einen Standort auf der Karte auswählen."
              : selectedWirkfaktoren.length === 0
                ? "Bitte mindestens eine Maßnahme auswählen."
                : "Standort und Maßnahmen erfasst. Sie können das Screening starten."}
          </p>

          <Button
            type="button"
            onClick={handleStartScreening}
            disabled={!canStartScreening || isAnalyzing}
            className={`h-12 rounded-2xl px-8 text-lg font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-80 ${
              canStartScreening ? "bg-[#F7E7A6] hover:bg-[#F2DC93]" : "bg-[#e5e7eb] text-[#9ca3af]"
            }`}
          >
            Analyse starten
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {isAnalyzing ? (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-white/96 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl rounded-3xl border border-[#e5e7eb] bg-white p-6 text-[#3a372e] shadow-[0_16px_40px_rgba(17,24,39,0.10)] sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#ffffff_0%,#f8fafc_70%,#eef2f7_100%)] shadow-[0_6px_18px_rgba(17,24,39,0.08)]">
                <span className="pointer-events-none absolute inset-[3px] rounded-full border border-white/70" />
                <Hourglass className="relative h-8 w-8 text-[#F2DC93] drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)] animate-[spin_1.8s_ease-in-out_infinite]" />
              </div>
              <h3 className="mt-3 text-2xl font-light tracking-[-0.005em] text-[#3a372e]">Artenschutzanalyse wird durchgeführt</h3>
            </div>

            <div className="mt-6 space-y-3">
              {ANALYSIS_STEPS.map((step, index) => {
                const isDone = index < completedSteps;
                const isCurrent = index === completedSteps;

                return (
                  <div
                    key={step}
                    className="flex items-center gap-3 px-1 py-2"
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-[#2E5C55]" />
                    ) : (
                      <Circle className={`h-5 w-5 ${isCurrent ? "text-[#F2DC93]" : "text-[#b8c8c4]"}`} />
                    )}
                    <span className={`${isDone || isCurrent ? "text-[#3a372e]" : "text-[#94a3b8]"}`}>{step}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs text-[#64748b]">
                <span>Fortschritt</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#e5e7eb]">
                <div
                  className="h-full rounded-full bg-[#2E5C55]"
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
