import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import buffer from "@turf/buffer";
import { polygon as turfPolygon } from "@turf/helpers";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layers, Eye, BarChart3, Circle } from "lucide-react";
import { ScreeningResult } from "@/data/dummyData";

interface ResultsMapProps {
  results: ScreeningResult;
  selectedSpeciesId: string | null;
}

type EnvLayerKey = "landcover" | "climate" | "topography" | "anthropic";

const ResultsMap = ({ results, selectedSpeciesId }: ResultsMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [showObservations, setShowObservations] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showBuffers, setShowBuffers] = useState(true);
  const [showBufferPanel, setShowBufferPanel] = useState(false);
  const [selectedHeatmapSpecies, setSelectedHeatmapSpecies] = useState<string | null>(null);
  const [heatmapMode, setHeatmapMode] = useState<"single" | "all">("all");
  const [baseLayer, setBaseLayer] = useState<"light" | "satellite">("satellite");
  const [showEnvLayerPanel, setShowEnvLayerPanel] = useState(false);
  const [envOpacity, setEnvOpacity] = useState(35);
  const [mapZoom, setMapZoom] = useState(15);
  const [activeEnvLayers, setActiveEnvLayers] = useState<Record<EnvLayerKey, boolean>>({
    landcover: false,
    climate: false,
    topography: false,
    anthropic: false,
  });
  const [activeBufferZones, setActiveBufferZones] = useState({
    nb: true,
    zp: true,
    ep: true,
  });
  const layersRef = useRef<{
    polygon?: L.Polygon;
    observations: L.CircleMarker[];
    heatmapRects: L.Rectangle[];
    bufferCircles: L.Layer[];
    baseLayer?: L.TileLayer;
    envLayerGroups: Partial<Record<EnvLayerKey, L.LayerGroup>>;
  }>({
    observations: [],
    heatmapRects: [],
    bufferCircles: [],
    envLayerGroups: {},
  });

  const getHeatmapColor = (value: number) => {
    const hue = 210 - value * 200;
    const saturation = 85;
    const lightness = 55;
    const alpha = 0.75;
    return `hsla(${hue.toFixed(0)}, ${saturation}%, ${lightness}%, ${alpha})`;
  };

  const buildBufferPolygon = (ring: [number, number][], radiusMeters: number) => {
    if (ring.length < 3) return null;
    const first = ring[0];
    const last = ring[ring.length - 1];
    const isClosed = first[0] === last[0] && first[1] === last[1];
    const closedRing = isClosed ? ring : [...ring, first];
    const turfRing = closedRing.map(([lat, lng]) => [lng, lat]);
    const turfPoly = turfPolygon([turfRing]);
    return buffer(turfPoly, radiusMeters / 1000, { units: "kilometers" });
  };

  const heatmapSpeciesOptions = useMemo(
    () => Array.from(new Set(results.heatmapCells.map((cell) => cell.species))),
    [results.heatmapCells]
  );

  useEffect(() => {
    if (!heatmapSpeciesOptions.length || heatmapMode === "all") return;
    if (
      !selectedHeatmapSpecies ||
      !heatmapSpeciesOptions.includes(selectedHeatmapSpecies)
    ) {
      setSelectedHeatmapSpecies(heatmapSpeciesOptions[0]);
    }
  }, [heatmapSpeciesOptions, selectedHeatmapSpecies, heatmapMode]);

  useEffect(() => {
    if (!selectedSpeciesId) return;
    if (heatmapMode === "all") return;
    const selectedSpecies = results.species.find((species) => species.id === selectedSpeciesId);
    if (!selectedSpecies) return;
    if (heatmapSpeciesOptions.includes(selectedSpecies.name)) {
      setSelectedHeatmapSpecies(selectedSpecies.name);
    }
  }, [selectedSpeciesId, results.species, heatmapSpeciesOptions, heatmapMode]);

  useEffect(() => {
    if (!selectedSpeciesId) return;
    const selectedSpecies = results.species.find((species) => species.id === selectedSpeciesId);
    if (!selectedSpecies) return;
    if (heatmapSpeciesOptions.includes(selectedSpecies.name)) {
      setHeatmapMode("single");
      setSelectedHeatmapSpecies(selectedSpecies.name);
    }
  }, [selectedSpeciesId, results.species, heatmapSpeciesOptions]);


  const buildLandcoverLayer = (
    center: [number, number],
    minRadiusMeters: number,
    maxRadiusMeters: number,
    opacity: number,
    zoom: number
  ) => {
    const [lat, lng] = center;
    const latDelta = maxRadiusMeters / 111320;
    const lngDelta = maxRadiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
    const rows = getGridSize(16, zoom);
    const cols = rows;
    const heatStart = 110;
    const heatEnd = 40;

    const group = L.layerGroup();
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const cellLat = lat - latDelta + (r + 0.5) * ((latDelta * 2) / rows);
        const cellLng = lng - lngDelta + (c + 0.5) * ((lngDelta * 2) / cols);
        const dLat = (cellLat - lat) * 111320;
        const dLng = (cellLng - lng) * 111320 * Math.cos((lat * Math.PI) / 180);
        const distance = Math.sqrt(dLat ** 2 + dLng ** 2);
        if (distance > maxRadiusMeters || distance <= minRadiusMeters) continue;

        const value = getCellValue(r, c, rows, cols, 1.2);
        const rect = L.rectangle(
          [
            [cellLat - latDelta / rows, cellLng - lngDelta / cols],
            [cellLat + latDelta / rows, cellLng + lngDelta / cols],
          ],
          {
            pane: "env",
            color: "transparent",
            fillColor: getHeatColor(value, heatStart, heatEnd),
            fillOpacity: opacity,
            weight: 0,
          }
        );
        rect.bindPopup(`
          <div class="p-2">
            <div class="font-semibold">CORINE Land Cover</div>
            <div class="text-sm text-gray-600">${getHeatLabel(value)}</div>
            <div class="text-[11px] text-gray-500">Landbedeckung / Habitat</div>
          </div>
        `);
        group.addLayer(rect);
      }
    }
    return group;
  };

  const getGridSize = (baseSize: number, zoom: number) => {
    const factor = Math.max(1.2, Math.min(6.0, (zoom - 5) / 3 + 1.5));
    return Math.max(6, Math.round(baseSize * factor));
  };

  const getHeatColor = (value: number, startHue: number, endHue: number) => {
    const hue = startHue + (endHue - startHue) * value;
    return `hsl(${hue.toFixed(0)} 70% 50%)`;
  };

  const getHeatLabel = (value: number) => {
    if (value >= 0.8) return "sehr hoch";
    if (value >= 0.6) return "hoch";
    if (value >= 0.4) return "mittel";
    if (value >= 0.2) return "niedrig";
    return "sehr niedrig";
  };

  const getCellValue = (
    row: number,
    col: number,
    rows: number,
    cols: number,
    seed: number
  ) => {
    const x = row / rows;
    const y = col / cols;
    const noise = Math.sin((x + seed) * 12.9898 + (y + seed) * 78.233) * 43758.5453;
    const frac = noise - Math.floor(noise);
    const gradient = x * 0.6 + y * 0.4;
    return Math.max(0, Math.min(1, gradient * 0.6 + frac * 0.4));
  };

  const buildClimateLayer = (
    center: [number, number],
    minRadiusMeters: number,
    maxRadiusMeters: number,
    opacity: number,
    zoom: number
  ) => {
    const [lat, lng] = center;
    const latDelta = maxRadiusMeters / 111320;
    const lngDelta = maxRadiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
    const rows = getGridSize(14, zoom);
    const cols = rows;
    const heatStart = 210;
    const heatEnd = 20;

    const group = L.layerGroup();
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const cellLat = lat - latDelta + (r + 0.5) * ((latDelta * 2) / rows);
        const cellLng = lng - lngDelta + (c + 0.5) * ((lngDelta * 2) / cols);
        const dLat = (cellLat - lat) * 111320;
        const dLng = (cellLng - lng) * 111320 * Math.cos((lat * Math.PI) / 180);
        const distance = Math.sqrt(dLat ** 2 + dLng ** 2);
        if (distance > maxRadiusMeters || distance <= minRadiusMeters) continue;

        const value = getCellValue(r, c, rows, cols, 2.1);
        const rect = L.rectangle(
          [
            [cellLat - latDelta / rows, cellLng - lngDelta / cols],
            [cellLat + latDelta / rows, cellLng + lngDelta / cols],
          ],
          {
            pane: "env",
            color: "transparent",
            fillColor: getHeatColor(value, heatStart, heatEnd),
            fillOpacity: opacity,
            weight: 0,
          }
        );
        rect.bindPopup(`
          <div class="p-2">
            <div class="font-semibold">DWD Klimaraster</div>
            <div class="text-sm text-gray-600">${getHeatLabel(value)}</div>
            <div class="text-[11px] text-gray-500">Klima/Wetter - DWD CDC</div>
          </div>
        `);
        group.addLayer(rect);
      }
    }
    return group;
  };

  const buildTopographyLayer = (
    center: [number, number],
    minRadiusMeters: number,
    maxRadiusMeters: number,
    opacity: number,
    zoom: number
  ) => {
    const [lat, lng] = center;
    const latDelta = maxRadiusMeters / 111320;
    const lngDelta = maxRadiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
    const rows = getGridSize(14, zoom);
    const cols = rows;
    const heatStart = 140;
    const heatEnd = 30;

    const group = L.layerGroup();
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const cellLat = lat - latDelta + (r + 0.5) * ((latDelta * 2) / rows);
        const cellLng = lng - lngDelta + (c + 0.5) * ((lngDelta * 2) / cols);
        const dLat = (cellLat - lat) * 111320;
        const dLng = (cellLng - lng) * 111320 * Math.cos((lat * Math.PI) / 180);
        const distance = Math.sqrt(dLat ** 2 + dLng ** 2);
        if (distance > maxRadiusMeters || distance <= minRadiusMeters) continue;

        const value = getCellValue(r, c, rows, cols, 3.3);
        const rect = L.rectangle(
          [
            [cellLat - latDelta / rows, cellLng - lngDelta / cols],
            [cellLat + latDelta / rows, cellLng + lngDelta / cols],
          ],
          {
            pane: "env",
            color: "transparent",
            fillColor: getHeatColor(value, heatStart, heatEnd),
            fillOpacity: opacity,
            weight: 0,
          }
        );
        rect.bindPopup(`
          <div class="p-2">
            <div class="font-semibold">DGM / Hangneigung</div>
            <div class="text-sm text-gray-600">${getHeatLabel(value)}</div>
            <div class="text-[11px] text-gray-500">Topographie & Wasser - BKG</div>
          </div>
        `);
        group.addLayer(rect);
      }
    }
    return group;
  };

  const buildAnthropicLayer = (
    center: [number, number],
    minRadiusMeters: number,
    maxRadiusMeters: number,
    opacity: number,
    includeRings: boolean,
    zoom: number
  ) => {
    const [lat, lng] = center;
    const latDelta = maxRadiusMeters / 111320;
    const lngDelta = maxRadiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
    const rows = getGridSize(16, zoom);
    const cols = rows;
    const heatStart = 120;
    const heatEnd = 0;

    const group = L.layerGroup();

    if (includeRings) {
      const ringRadii = [200, 400, 700, maxRadiusMeters];
      ringRadii.forEach((ringRadius, index) => {
        const ring = L.circle(center as L.LatLngExpression, {
          radius: ringRadius,
          pane: "env",
          color: "#3b9a71",
          weight: 1,
          fillOpacity: 0,
          opacity: Math.max(0.2, opacity - index * 0.08),
          dashArray: "4 6",
        });
        ring.bindPopup(`
          <div class="p-2">
            <div class="font-semibold">Distanz zu Strassen/Siedlung</div>
            <div class="text-sm text-gray-600">~${ringRadius} m</div>
            <div class="text-[11px] text-gray-500">Störung/Nutzung - OSM</div>
          </div>
        `);
        group.addLayer(ring);
      });
    }

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const cellLat = lat - latDelta + (r + 0.5) * ((latDelta * 2) / rows);
        const cellLng = lng - lngDelta + (c + 0.5) * ((lngDelta * 2) / cols);
        const dLat = (cellLat - lat) * 111320;
        const dLng = (cellLng - lng) * 111320 * Math.cos((lat * Math.PI) / 180);
        const distance = Math.sqrt(dLat ** 2 + dLng ** 2);
        if (distance > maxRadiusMeters || distance <= minRadiusMeters) continue;

        const value = getCellValue(r, c, rows, cols, 4.7);
        const rect = L.rectangle(
          [
            [cellLat - latDelta / rows, cellLng - lngDelta / cols],
            [cellLat + latDelta / rows, cellLng + lngDelta / cols],
          ],
          {
            pane: "env",
            color: "transparent",
            fillColor: getHeatColor(value, heatStart, heatEnd),
            fillOpacity: Math.min(0.6, opacity),
            weight: 0,
          }
        );
        rect.bindPopup(`
          <div class="p-2">
            <div class="font-semibold">Sentinel-2 NDVI</div>
            <div class="text-sm text-gray-600">${getHeatLabel(value)}</div>
            <div class="text-[11px] text-gray-500">Satellitendaten - Copernicus</div>
          </div>
        `);
        group.addLayer(rect);
      }
    }

    return group;
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: results.area.coordinates,
      zoom: 15,
      zoomControl: true,
    });
    setMapZoom(map.getZoom());
    map.on("zoomend", () => {
      setMapZoom(map.getZoom());
    });
    const areaPane = map.createPane("area");
    areaPane.style.zIndex = "300";

    const bufferPane = map.createPane("buffers");
    bufferPane.style.zIndex = "320";

    const heatmapPane = map.createPane("heatmap");
    heatmapPane.style.zIndex = "400";
    heatmapPane.style.pointerEvents = "auto";

    const observationsPane = map.createPane("observations");
    observationsPane.style.zIndex = "500";

    const envPane = map.createPane("env");
    envPane.style.zIndex = "420";
    envPane.style.pointerEvents = "auto";

    const tileLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri",
        maxZoom: 20,
      }
    ).addTo(map);
    layersRef.current.baseLayer = tileLayer;

    mapInstanceRef.current = map;

    // Add polygon
    const polygon = L.polygon(
      results.area.polygon.map(([lat, lng]) => [lat, lng] as L.LatLngExpression),
      {
        pane: "area",
        color: "#3b9a71",
        weight: 3,
        fillOpacity: 0.15,
        fillColor: "#3b9a71",
        interactive: false,
      }
    ).addTo(map);
    layersRef.current.polygon = polygon;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [results.area]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersRef.current.baseLayer) {
      map.removeLayer(layersRef.current.baseLayer);
    }

    const layer =
      baseLayer === "satellite"
        ? L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              attribution: "Tiles &copy; Esri",
              maxZoom: 20,
            }
          )
        : L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            attribution: "&copy; OpenStreetMap &copy; CARTO",
            subdomains: "abcd",
            maxZoom: 20,
          });

    layer.addTo(map);
    layersRef.current.baseLayer = layer;
  }, [baseLayer]);

  // Update layers based on toggles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing observation markers
    layersRef.current.observations.forEach((marker) => marker.remove());
    layersRef.current.observations = [];

    // Add observation points
    if (showObservations) {
      results.mapPoints.forEach((point) => {
        const isSelected = results.species.find(
          (s) => s.name === point.species || s.name.includes(point.species)
        )?.id === selectedSpeciesId;
        const speciesDetails = results.species.find(
          (s) => s.name === point.species || s.name.includes(point.species)
        );

        const marker = L.circleMarker(point.coordinates as L.LatLngExpression, {
          pane: "observations",
          radius: isSelected ? 10 : 7,
          fillColor: point.type === "nest" ? "#ef4444" : "#3b9a71",
          color: isSelected ? "#000" : "#fff",
          weight: isSelected ? 3 : 2,
          fillOpacity: 0.9,
        }).addTo(map);

        marker.bindPopup(`
          <div class="p-2">
            <div class="font-semibold">${point.species}</div>
            <div class="text-sm text-gray-600">${point.source} (${point.year})</div>
            <div class="text-xs text-gray-500 capitalize">${point.type}</div>
            ${
              speciesDetails
                ? `<div class="mt-2 text-xs text-gray-600">
                    Evidenz: <span class="font-medium">${speciesDetails.evidenceScore}%</span>
                    <span class="mx-1">|</span>
                    Konfidenz: <span class="font-medium">${speciesDetails.confidence}</span>
                  </div>
                  <div class="text-[11px] text-gray-500">Status: ${speciesDetails.dataStatus}</div>`
                : ""
            }
          </div>
        `);

        layersRef.current.observations.push(marker);
      });
    }
  }, [showObservations, results.mapPoints, results.species, selectedSpeciesId]);

  // Heatmap rectangles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.heatmapRects.forEach((rect) => rect.remove());
    layersRef.current.heatmapRects = [];

    if (showHeatmap) {
      const visibleCells = selectedHeatmapSpecies && heatmapMode === "single"
        ? results.heatmapCells.filter((cell) => cell.species === selectedHeatmapSpecies)
        : results.heatmapCells;
      const heatOpacity = envOpacity / 100;
      visibleCells.forEach((cell) => {
        const color = getHeatmapColor(cell.sdmValue);
        const probability = Math.round(cell.sdmValue * 100);
        const rect = L.rectangle(cell.bounds as L.LatLngBoundsExpression, {
          pane: "heatmap",
          color: "transparent",
          fillColor: color,
          fillOpacity: heatOpacity,
          weight: 0,
        }).addTo(map);

        rect.bindPopup(`
          <div class="p-2">
            <div class="font-semibold">Artenkonzentration</div>
            <div class="text-lg font-bold">${probability}%</div>
            <div class="text-xs text-gray-500">${cell.species}</div>
            <div class="mt-2 text-[11px] text-gray-500">
              SDM-Wert: ${cell.sdmValue.toFixed(2)}
            </div>
          </div>
        `);
        rect.on("click", () => rect.openPopup());

        layersRef.current.heatmapRects.push(rect);
      });
    }
  }, [showHeatmap, results.heatmapCells, selectedHeatmapSpecies, heatmapMode, envOpacity]);

  const lowHeatColor = getHeatmapColor(0.2);
  const midHeatColor = getHeatmapColor(0.5);
  const highHeatColor = getHeatmapColor(0.85);

  // Environmental layers (Landbedeckung / Habitat)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const baseRadius = results.buffers[0]?.radius ?? 1000;
    const center = results.area.coordinates;
    const opacity = envOpacity / 100;
    const zoneDefs = [
      { key: "nb", min: 0, max: baseRadius },
      { key: "zp", min: baseRadius, max: baseRadius * 2 },
      { key: "ep", min: baseRadius * 2, max: baseRadius * 3 },
    ];
    const zones = zoneDefs.filter((zone) => activeBufferZones[zone.key]);

    const buildZonedLayer = (
      builder: (minRadius: number, maxRadius: number, index: number) => L.LayerGroup
    ) => {
      const group = L.layerGroup();
      zones.forEach((zone, index) => {
        group.addLayer(builder(zone.min, zone.max, index));
      });
      return group;
    };

    const syncLayer = (key: EnvLayerKey, enabled: boolean, builder: () => L.LayerGroup) => {
      const existing = layersRef.current.envLayerGroups[key];
      if (existing) {
        existing.remove();
        layersRef.current.envLayerGroups[key] = undefined;
      }
      if (enabled) {
        const layer = builder();
        layer.addTo(map);
        layersRef.current.envLayerGroups[key] = layer;
      }
    };

    syncLayer("landcover", activeEnvLayers.landcover, () =>
      buildZonedLayer((minRadius, maxRadius) =>
        buildLandcoverLayer(center, minRadius, maxRadius, opacity, mapZoom)
      )
    );
    syncLayer("climate", activeEnvLayers.climate, () =>
      buildZonedLayer((minRadius, maxRadius) =>
        buildClimateLayer(center, minRadius, maxRadius, opacity, mapZoom)
      )
    );
    syncLayer("topography", activeEnvLayers.topography, () =>
      buildZonedLayer((minRadius, maxRadius) =>
        buildTopographyLayer(center, minRadius, maxRadius, opacity, mapZoom)
      )
    );
    syncLayer("anthropic", activeEnvLayers.anthropic, () =>
      buildZonedLayer((minRadius, maxRadius, index) =>
        buildAnthropicLayer(center, minRadius, maxRadius, opacity, index === 0, mapZoom)
      )
    );
  }, [
    activeEnvLayers.landcover,
    activeEnvLayers.climate,
    activeEnvLayers.topography,
    activeEnvLayers.anthropic,
    activeBufferZones,
    envOpacity,
    mapZoom,
    results.buffers,
    results.area.coordinates,
  ]);

  useEffect(() => {
    const opacity = envOpacity / 100;
    const applyOpacity = (layer: L.Layer) => {
      if (layer instanceof L.LayerGroup) {
        layer.eachLayer(applyOpacity);
        return;
      }
      if ("setStyle" in layer) {
        if (layer instanceof L.Circle) {
          (layer as L.Circle).setStyle({ opacity, fillOpacity: 0 });
        } else {
          (layer as L.Path).setStyle({ opacity, fillOpacity: opacity });
        }
      }
    };

    Object.values(layersRef.current.envLayerGroups).forEach((group) => {
      group?.eachLayer(applyOpacity);
    });
  }, [envOpacity]);

  // Buffer circles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    layersRef.current.bufferCircles.forEach((circle) => circle.remove());
    layersRef.current.bufferCircles = [];

    if (showBuffers) {
      const baseRadius = results.buffers[0]?.radius ?? 1000;
      const ringBase = results.area.polygon;
      const bufferDefs = [
        {
          key: "nb",
          id: "NB",
          label: "NB (Nahbereich)",
          radius: baseRadius,
          color: "#3b9a71",
          fill: "#3b9a7125",
          note: "Bereich mit Heatmap und Artenvorkommen.",
        },
        {
          key: "zp",
          id: "ZP",
          label: "ZP (Zentraler Prüfbereich)",
          radius: baseRadius * 2,
          color: "#f59e0b",
          fill: "#f59e0b20",
          note: "Hinweis: Paragraph 45b Abs. 3 BNatSchG.",
        },
        {
          key: "ep",
          id: "EP",
          label: "EP (Erweiterter Prüfbereich)",
          radius: baseRadius * 3,
          color: "#ef4444",
          fill: "#ef444420",
          note: "Hinweis: Paragraph 45b Abs. 4 BNatSchG.",
        },
      ];

      bufferDefs.forEach((buffer) => {
        if (!activeBufferZones[buffer.key]) return;
        const bufferGeoJson = buildBufferPolygon(ringBase, buffer.radius);
        if (!bufferGeoJson) return;
        const bufferLayer = L.geoJSON(bufferGeoJson, {
          pane: "buffers",
          style: {
            color: buffer.color,
            weight: 2,
            dashArray: "6 6",
            fillColor: buffer.fill,
            fillOpacity: 0.06,
          },
        }).addTo(map);
        bufferLayer.bindPopup(`
          <div class="p-2">
            <div class="font-semibold">${buffer.label}</div>
            <div class="text-sm text-gray-600">~${Math.round(buffer.radius)} m</div>
            <div class="text-xs text-gray-500">${buffer.note}</div>
          </div>
        `);
        layersRef.current.bufferCircles.push(bufferLayer);
      });
    }
  }, [showBuffers, activeBufferZones, results.buffers, results.area.coordinates]);

  return (
    <Card className="card-elevated overflow-hidden">
      {/* Layer Controls */}
      <div className="p-4 border-b border-border/50 bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-2 py-1">
              <button
                type="button"
                onClick={() =>
                  setBaseLayer((current) => (current === "light" ? "satellite" : "light"))
                }
                className="flex items-center gap-2 rounded-full px-2 py-0.5 text-xs font-medium text-primary border border-primary/30 transition hover:bg-primary/10"
              >
                <Layers className="w-3.5 h-3.5" />
                {baseLayer === "light" ? "Light" : "Satellit"}
              </button>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEnvLayerPanel((current) => !current)}
                className="flex items-center gap-2 rounded-full px-2 py-0.5 text-xs font-medium text-primary border border-primary/30 transition hover:bg-primary/10"
                aria-expanded={showEnvLayerPanel}
              >
                <Layers className="w-3.5 h-3.5" />
                Umweltlayer
              </button>

              {showEnvLayerPanel ? (
                <div className="absolute left-0 mt-2 z-50 bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border/50 text-xs w-60">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between rounded-md border border-border/50 bg-background/70 px-2 py-1">
                      <Label htmlFor="env-landcover" className="text-[10px] text-muted-foreground">
                        Landbedeckung / Habitat
                      </Label>
                      <Switch
                        id="env-landcover"
                        className="scale-75"
                        checked={activeEnvLayers.landcover}
                        onCheckedChange={(checked) =>
                          setActiveEnvLayers((prev) => ({ ...prev, landcover: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/50 bg-background/70 px-2 py-1">
                      <Label htmlFor="env-climate" className="text-[10px] text-muted-foreground">
                        Klima / Wetter
                      </Label>
                      <Switch
                        id="env-climate"
                        className="scale-75"
                        checked={activeEnvLayers.climate}
                        onCheckedChange={(checked) =>
                          setActiveEnvLayers((prev) => ({ ...prev, climate: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/50 bg-background/70 px-2 py-1">
                      <Label htmlFor="env-topography" className="text-[10px] text-muted-foreground">
                        Topographie / Wasser
                      </Label>
                      <Switch
                        id="env-topography"
                        className="scale-75"
                        checked={activeEnvLayers.topography}
                        onCheckedChange={(checked) =>
                          setActiveEnvLayers((prev) => ({ ...prev, topography: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/50 bg-background/70 px-2 py-1">
                      <Label htmlFor="env-anthropic" className="text-[10px] text-muted-foreground">
                        Anthropolisch / Natur
                      </Label>
                      <Switch
                        id="env-anthropic"
                        className="scale-75"
                        checked={activeEnvLayers.anthropic}
                        onCheckedChange={(checked) =>
                          setActiveEnvLayers((prev) => ({ ...prev, anthropic: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-2 py-1 ml-auto">
            <button
              type="button"
              onClick={() => setShowObservations((current) => !current)}
              className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition ${
                showObservations
                  ? "gradient-hero text-primary-foreground"
                  : "text-primary border border-primary/30 hover:bg-primary/10"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Nachweise
            </button>
            <button
              type="button"
              onClick={() => setShowHeatmap((current) => !current)}
              className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition ${
                showHeatmap
                  ? "gradient-hero text-primary-foreground"
                  : "text-primary border border-primary/30 hover:bg-primary/10"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Heatmap
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBufferPanel((current) => !current)}
                className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition ${
                  showBuffers
                    ? "gradient-hero text-primary-foreground"
                    : "text-primary border border-primary/30 hover:bg-primary/10"
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                Puffer
              </button>
              {showBufferPanel ? (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border/50 bg-card/95 p-3 text-xs shadow-lg backdrop-blur-sm z-50">
                  <div className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                    Pufferzonen
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-md border border-border/50 bg-background/70 px-2 py-1">
                      <Label htmlFor="buffers-enabled" className="text-[10px] text-muted-foreground">
                        Puffer anzeigen
                      </Label>
                      <Switch
                        id="buffers-enabled"
                        className="scale-75"
                        checked={showBuffers}
                        onCheckedChange={(checked) => setShowBuffers(checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/50 bg-background/70 px-2 py-1">
                      <Label htmlFor="buffer-nb" className="text-[10px] text-muted-foreground">
                        NB (Nahbereich)
                      </Label>
                      <Switch
                        id="buffer-nb"
                        className="scale-75"
                        checked={activeBufferZones.nb}
                        onCheckedChange={(checked) =>
                          setActiveBufferZones((prev) => ({ ...prev, nb: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/50 bg-background/70 px-2 py-1">
                      <Label htmlFor="buffer-zp" className="text-[10px] text-muted-foreground">
                        ZP (Zentral)
                      </Label>
                      <Switch
                        id="buffer-zp"
                        className="scale-75"
                        checked={activeBufferZones.zp}
                        onCheckedChange={(checked) =>
                          setActiveBufferZones((prev) => ({ ...prev, zp: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-border/50 bg-background/70 px-2 py-1">
                      <Label htmlFor="buffer-ep" className="text-[10px] text-muted-foreground">
                        EP (Erweitert)
                      </Label>
                      <Switch
                        id="buffer-ep"
                        className="scale-75"
                        checked={activeBufferZones.ep}
                        onCheckedChange={(checked) =>
                          setActiveBufferZones((prev) => ({ ...prev, ep: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-[500px] relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Heatmap Spectrum */}
        {showHeatmap ? (
          <div className="absolute top-4 right-4 z-30 bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border/50 text-xs">
            <div className="font-medium text-foreground mb-2">Heatmap</div>
            <div className="flex items-center gap-3">
              <div className="h-24 w-4 rounded-full border border-border/50 overflow-hidden">
                <div
                  className="h-full w-full"
                  style={{
                    background: `linear-gradient(to top, ${lowHeatColor} 0%, ${midHeatColor} 50%, ${highHeatColor} 100%)`,
                  }}
                />
              </div>
              <div className="flex flex-col justify-between h-24 text-[10px] text-muted-foreground">
                <span>100%</span>
                <span>50%</span>
                <span>0%</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Bottom-left Stack */}
        <div className="absolute bottom-4 left-4 z-40">
          <div className="bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border/50 text-xs w-56">
            <div className="font-medium text-foreground mb-2">Layer-Transparenz</div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">niedrig</span>
              <Slider
                value={[envOpacity]}
                min={10}
                max={80}
                step={5}
                onValueChange={(value) => setEnvOpacity(value[0] ?? 35)}
              />
              <span className="text-[10px] text-muted-foreground">hoch</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResultsMap;
