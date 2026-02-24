"use client";

import { useEffect } from "react";
import { MapContainer, Polygon, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { PolygonFeature } from "@/lib/app/screeningSession";

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

export function ResultAreaMap({ polygon }: { polygon: PolygonFeature }) {
  const positions = polygon.geometry.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);

  return (
    <div className="h-[420px] overflow-hidden rounded-2xl border border-ink/10">
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
        <FitPolygon polygon={polygon} />
      </MapContainer>
    </div>
  );
}
