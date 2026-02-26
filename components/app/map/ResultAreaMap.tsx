"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageOverlay, MapContainer, Polygon, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { PolygonFeature } from "@/lib/app/screeningSession";

type HeatOverlay = {
  imageUrl: string;
  bounds: [[number, number], [number, number]];
};

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isPointInPolygon(lng: number, lat: number, ring: [number, number][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function getBounds(ring: [number, number][]) {
  const lngValues = ring.map(([lng]) => lng);
  const latValues = ring.map(([, lat]) => lat);
  return {
    minLng: Math.min(...lngValues),
    maxLng: Math.max(...lngValues),
    minLat: Math.min(...latValues),
    maxLat: Math.max(...latValues)
  };
}

function sampleSuitability(relLng: number, relLat: number, rng: () => number) {
  const centerDistance = Math.hypot(relLng - 0.5, relLat - 0.5) / 0.71;
  const centerScore = 1 - Math.min(1, centerDistance);

  // Smooth pseudo-noise based on layered trig waves.
  const phaseA = rng() * Math.PI * 2;
  const phaseB = rng() * Math.PI * 2;
  const phaseC = rng() * Math.PI * 2;
  const waveA = Math.sin(relLng * 7.2 + phaseA) * Math.cos(relLat * 6.8 + phaseB);
  const waveB = Math.sin(relLng * 13.4 + phaseC) * Math.cos(relLat * 11.6 + phaseA);
  const noise = ((waveA * 0.65 + waveB * 0.35) + 1) / 2;

  return Math.max(0, Math.min(1, centerScore * 0.58 + noise * 0.42));
}

function getHeatRgba(suitability: number) {
  // Increase contrast so critical (red) and highly suitable (green) zones are clearer.
  const contrasted = Math.max(0, Math.min(1, (suitability - 0.5) * 1.55 + 0.5));
  const inverted = 1 - contrasted;

  // red -> orange -> yellow -> green (inverted meaning in UI:
  // red = better for compensation, green = less suitable)
  const stops = [
    { t: 0, c: [239, 68, 68] },
    { t: 0.3, c: [249, 115, 22] },
    { t: 0.55, c: [234, 179, 8] },
    { t: 1, c: [34, 197, 94] }
  ] as const;

  let lower = stops[0];
  let upper = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i += 1) {
    if (inverted >= stops[i].t && inverted <= stops[i + 1].t) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const span = upper.t - lower.t || 1;
  const p = (inverted - lower.t) / span;
  const r = Math.round(lower.c[0] + (upper.c[0] - lower.c[0]) * p);
  const g = Math.round(lower.c[1] + (upper.c[1] - lower.c[1]) * p);
  const b = Math.round(lower.c[2] + (upper.c[2] - lower.c[2]) * p);
  const a = 0.78;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function buildHeatOverlay(polygon: PolygonFeature, seedValue: string): HeatOverlay | null {
  const ring = polygon.geometry.coordinates[0] as [number, number][];
  const sanitizedRing = ring.length > 1 ? ring.slice(0, -1) : ring;
  if (sanitizedRing.length < 3) return null;
  const { minLng, maxLng, minLat, maxLat } = getBounds(sanitizedRing);

  const rng = mulberry32(hashSeed(seedValue));
  const phaseRng = mulberry32(hashSeed(`${seedValue}-phase`));

  const sourceWidth = 120;
  const sourceHeight = 120;
  const targetWidth = 512;
  const targetHeight = 512;
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = sourceWidth;
  sourceCanvas.height = sourceHeight;
  const sourceCtx = sourceCanvas.getContext("2d");
  if (!sourceCtx) return null;

  for (let y = 0; y < sourceHeight; y += 1) {
    for (let x = 0; x < sourceWidth; x += 1) {
      const relLng = x / (sourceWidth - 1);
      const relLat = 1 - y / (sourceHeight - 1);
      const lng = minLng + (maxLng - minLng) * relLng;
      const lat = minLat + (maxLat - minLat) * relLat;

      if (!isPointInPolygon(lng, lat, sanitizedRing)) continue;

      const suitability = sampleSuitability(relLng, relLat, () => phaseRng() + rng() * 0.35);
      sourceCtx.fillStyle = getHeatRgba(suitability);
      sourceCtx.fillRect(x, y, 1, 1);
    }
  }

  const targetCanvas = document.createElement("canvas");
  targetCanvas.width = targetWidth;
  targetCanvas.height = targetHeight;
  const targetCtx = targetCanvas.getContext("2d");
  if (!targetCtx) return null;
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.imageSmoothingQuality = "high";
  targetCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);

  return {
    imageUrl: targetCanvas.toDataURL("image/png"),
    bounds: [
      [minLat, minLng],
      [maxLat, maxLng]
    ]
  };
}

function FitPolygon({ polygon }: { polygon: PolygonFeature }) {
  const map = useMap();

  useEffect(() => {
    const coords = polygon.geometry.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
    if (coords.length === 0) return;

    const bounds = L.latLngBounds(coords);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [map, polygon]);

  return null;
}

export function ResultAreaMap({
  polygon,
  showCompensationHeatmap = false,
  heatmapSeed = "default"
}: {
  polygon: PolygonFeature;
  showCompensationHeatmap?: boolean;
  heatmapSeed?: string;
}) {
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.88);
  const positions = polygon.geometry.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
  const heatOverlay = useMemo(() => {
    if (!showCompensationHeatmap) return null;
    return buildHeatOverlay(polygon, heatmapSeed);
  }, [heatmapSeed, polygon, showCompensationHeatmap]);

  return (
    <div className="relative h-[420px] overflow-hidden rounded-2xl border border-ink/10">
      <MapContainer center={[49.9195, 8.1234]} zoom={13} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <Polygon
          positions={positions}
          pathOptions={{
            color: "#0f766e",
            weight: 3,
            fillColor: "#34d399",
            fillOpacity: 0.3
          }}
        />
        {showCompensationHeatmap && heatOverlay ? (
          <ImageOverlay
            url={heatOverlay.imageUrl}
            bounds={heatOverlay.bounds}
            opacity={heatmapOpacity}
          />
        ) : null}
        <FitPolygon polygon={polygon} />
      </MapContainer>
      {showCompensationHeatmap ? (
        <div className="pointer-events-auto absolute right-3 top-3 z-[450] w-52 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2.5 text-[11px] text-ink/85 shadow-[0_8px_18px_rgba(15,23,42,0.10)] backdrop-blur-sm">
          <p className="mb-1.5 text-[11px] font-semibold tracking-[0.01em]">Kompensations-Eignung</p>
          <div className="mb-1.5 h-2.5 w-full rounded-full bg-[linear-gradient(90deg,#ef4444_0%,#f97316_25%,#eab308_50%,#65a30d_75%,#16a34a_100%)]" />
          <div className="mb-2.5 flex items-center justify-between text-[10px] text-ink/65">
            <span>gut geeignet</span>
            <span>weniger geeignet</span>
          </div>
          <div className="border-t border-slate-200/80 pt-2">
            <label className="mb-1.5 block text-[10px] text-ink/70">
              Transparenz: {Math.round(heatmapOpacity * 100)}%
            </label>
            <input
              type="range"
              min={0.35}
              max={1}
              step={0.05}
              value={heatmapOpacity}
              onChange={(event) => setHeatmapOpacity(Number(event.target.value))}
              className="w-full accent-slate-400"
              aria-label="Heatmap-Transparenz"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
