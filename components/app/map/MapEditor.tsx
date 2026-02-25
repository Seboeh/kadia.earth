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
    section: "planung",
    title: "Planungsvorhaben",
    items: [
      "Bebauungsplan §30 BauGB (Wohngebiet, Gewerbegebiet, Mischgebiet)",
      "Flächennutzungsplan (FNP)",
      "Innenbaugebiete (Änderung/Umbau bestehender B-Pläne)",
      "Außenbereichsvorhaben §35 BauGB",
      "Vorhabenplanverfahren §32 BauGB"
    ]
  },
  {
    section: "bau",
    title: "Wohnen",
    items: [
      "Einfamilienhaus / Reihenhaus",
      "Mehrfamilienhaus / Wohnanlage",
      "Garage / Carport / Parkplatz",
      "Wohngebäude-Sanierung/Dachstuhl (Bestand)"
    ]
  },
  {
    section: "bau",
    title: "Gewerbe & Industrie",
    items: [
      "Gewerbegebäude / Bürogebäude",
      "Produktions-/Lagerhalle",
      "Einzelhandel / Supermarkt / Ladenbau",
      "Logistikzentrum / Hochregallager"
    ]
  },
  {
    section: "bau",
    title: "Öffentliche Bauten",
    items: [
      "Schule / Kindergarten / Universitätsgebäude",
      "Sporthalle / Schwimmbad / Stadion",
      "Verwaltungsgebäude / Rathaus / Klinik",
      "Feuerwache / Polizeistation"
    ]
  },
  {
    section: "bau",
    title: "Infrastruktur",
    items: [
      "Straßenbau / Erweiterung / Umgehungsstraße",
      "Rad-/Fußwege / Bürgersteig",
      "Brücken-/Tunnelbau",
      "Kanalisation / Entwässerung / Kläranlage",
      "Strom-/Gas-/Wasserleitungen (KfW)",
      "Mobilfunkmast / Strommast / Freileitung"
    ]
  },
  {
    section: "bau",
    title: "Energie & Freiflächen",
    items: [
      "Windkraftanlage (Onshore/Offshore)",
      "Freiflächen-PV-Anlage / Solarpark",
      "Biogasanlage / Biomassekraftwerk",
      "Umspannwerk / Trafostation"
    ]
  },
  {
    section: "bau",
    title: "Freizeit & Grünflächen",
    items: [
      "Sportplatz / Bolzplatz / Tennisanlage",
      "Friedhofserweiterung",
      "Campingplatz / Wochenendhaus-Anlage",
      "Kleingartenanlage / Schrebergarten",
      "Spielplatz / Fitnesspark"
    ]
  },
  {
    section: "bau",
    title: "Geländeeingriffe",
    items: [
      "Wald-/Baumrodung (ohne Bau)",
      "Freiflächenrodung (Grünland/Äcker)",
      "Gewässerregulierung / Uferbefestigung",
      "Kies-/Sand-/Torfabbau / Steinbruch",
      "Geländemodellierung / Erdaushub / Sprengung"
    ]
  },
  {
    section: "bau",
    title: "Anlagenbetrieb",
    items: [
      "Industrie-/Gewerbeanlagen §4 BImSchG",
      "Deponie / Abfalllager / Recyclinghof",
      "Landwirtschaft (Stallbau, Silage, Bewässerung)",
      "Forstbetrieb (Holzernte, Kahlschlag)"
    ]
  },
  {
    section: "bau",
    title: "Sonstige Vorhaben",
    items: [
      "Abriss/Rückbau von Gebäuden",
      "Stilllegung/Ruhestellung von Anlagen",
      "Zaun/Mauer/Lärmschutzwand",
      "Brunnen/Teichanlage/Wasserspiel",
      "Freizeit-/Wasserpark / Tierpark",
      "Temporäre Nutzung (Baustelle, Eventgelände)"
    ]
  }
] as const;

const MAIN_MEASURE_SECTIONS = [
  { id: "planung", label: "Planungsvorhaben" },
  { id: "bau", label: "Bauvorhaben" }
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
  const [activeMainSection, setActiveMainSection] = useState<(typeof MAIN_MEASURE_SECTIONS)[number]["id"]>("planung");
  const [activeMeasureCategory, setActiveMeasureCategory] = useState<
    (typeof WIRKFAKTOR_GROUPS)[number]["title"] | null
  >(null);
  const analysisTimersRef = useRef<number[]>([]);
  const progressRafRef = useRef<number | null>(null);

  const hasGeometry = useMemo(() => Boolean(polygon), [polygon]);
  const canStartScreening = hasGeometry && selectedWirkfaktoren.length > 0;
  const categoryGroups = useMemo(
    () => WIRKFAKTOR_GROUPS.filter((group) => group.section === activeMainSection),
    [activeMainSection]
  );
  const measureCountByCategory = useMemo(() => {
    return Object.fromEntries(
      WIRKFAKTOR_GROUPS.map((group) => [
        group.title,
        group.items.filter((item) => selectedWirkfaktoren.includes(item)).length
      ])
    ) as Record<string, number>;
  }, [selectedWirkfaktoren]);
  const measureCountBySection = useMemo(() => {
    return Object.fromEntries(
      MAIN_MEASURE_SECTIONS.map((section) => [
        section.id,
        WIRKFAKTOR_GROUPS
          .filter((group) => group.section === section.id)
          .flatMap((group) => group.items)
          .filter((item) => selectedWirkfaktoren.includes(item)).length
      ])
    ) as Record<(typeof MAIN_MEASURE_SECTIONS)[number]["id"], number>;
  }, [selectedWirkfaktoren]);
  const activeGroup = useMemo(
    () => categoryGroups.find((group) => group.title === activeMeasureCategory) ?? null,
    [activeMeasureCategory, categoryGroups]
  );

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

        <div className="space-y-3">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f4f6] text-xs font-semibold text-[#4b5563]">
                1
              </span>
              <p className="text-sm font-semibold text-[#3a372e]">Bereich wählen</p>
            </div>
            <div>
              <div
                role="tablist"
                aria-label="Maßnahmen-Hauptkategorien"
                className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#e5e7eb] bg-white p-1"
              >
                {MAIN_MEASURE_SECTIONS.map((section) => {
                  const isActive = section.id === activeMainSection;
                  const selectedCount = measureCountBySection[section.id] ?? 0;
                  return (
                    <button
                      key={section.id}
                      id={`measures-main-tab-${section.id}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`measures-main-panel-${section.id}`}
                      onClick={() => {
                        setActiveMainSection(section.id);
                        setActiveMeasureCategory(null);
                      }}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                        isActive
                          ? "bg-[#F7E7A6] text-ink shadow-[0_8px_20px_rgba(247,231,166,0.35)]"
                          : "text-[#4c4a41] hover:bg-[#f8fafc]"
                      }`}
                    >
                      <span>{section.label}</span>
                      <span
                        className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-none ${
                          isActive
                            ? "bg-white/45 text-[#6b4b0f]"
                            : "bg-[#e5e7eb] text-[#6b7280]"
                        }`}
                      >
                        {selectedCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f4f6] text-xs font-semibold text-[#4b5563]">
                2
              </span>
              <p className="text-sm font-semibold text-[#3a372e]">Kategorie wählen</p>
            </div>
            <div>
              <div
                role="tablist"
                aria-label="Maßnahmen-Kategorien"
                className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#e5e7eb] bg-white p-1"
              >
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
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                        isActive
                          ? "bg-[#F7E7A6] text-ink shadow-[0_8px_20px_rgba(247,231,166,0.35)]"
                          : "text-[#4c4a41] hover:bg-[#f8fafc]"
                      }`}
                    >
                      <span>{group.title}</span>
                      <span
                        className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] leading-none ${
                          isActive
                            ? "bg-white/45 text-[#6b4b0f]"
                            : "bg-[#e5e7eb] text-[#6b7280]"
                        }`}
                      >
                        {selectedCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            id={`measures-main-panel-${activeMainSection}`}
            role="tabpanel"
            aria-labelledby={`measures-main-tab-${activeMainSection}`}
            className="rounded-2xl border border-[#e5e7eb] bg-white p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f4f6] text-xs font-semibold text-[#4b5563]">
                3
              </span>
              <p className="text-sm font-semibold text-[#3a372e]">Maßnahmen auswählen</p>
            </div>
            {activeGroup ? (
              <div
                id={`measures-panel-${toCategoryId(activeGroup.title)}`}
                role="tabpanel"
                aria-labelledby={`measures-tab-${toCategoryId(activeGroup.title)}`}
              >
                <div className="flex flex-wrap gap-2.5">
                  {activeGroup.items.map((item) => {
                    const checked = selectedWirkfaktoren.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleWirkfaktor(item)}
                        aria-pressed={checked}
                        className={`rounded-full border px-3.5 py-2 text-sm transition ${
                          checked
                            ? "border-[#e7cf7a] bg-[#F7E7A6] text-ink shadow-[0_10px_24px_rgba(247,231,166,0.35)]"
                            : "border-[#e5e7eb] bg-white text-[#3a372e] hover:border-[#d1d5db] hover:bg-[#f8fafc]"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink/60">Bitte zuerst in Schritt 2 eine Kategorie auswählen.</p>
            )}
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f3f4f6] text-xs font-semibold text-[#4b5563]">
                4
              </span>
              <p className="text-sm font-semibold text-[#3a372e]">
                Ausgewählte Maßnahmen ({selectedWirkfaktoren.length})
              </p>
            </div>
            {selectedWirkfaktoren.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedWirkfaktoren.map((item) => (
                  <button
                    key={`selected-${item}`}
                    type="button"
                    onClick={() => toggleWirkfaktor(item)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs text-[#3a372e] transition hover:border-[#d1d5db] hover:bg-[#f8fafc]"
                    aria-label={`${item} entfernen`}
                  >
                    <span>{item}</span>
                    <span className="text-[#6b7280]">×</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-sm text-ink/55">Noch keine Maßnahme ausgewählt.</p>
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
            Screening starten
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
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.01em] text-[#3a372e]">Artenschutzanalyse wird durchgeführt</h3>
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
