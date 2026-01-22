import { useEffect, useRef, useCallback, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

// Fix for leaflet-draw readableArea bug
if (L.GeometryUtil && !L.GeometryUtil.readableArea) {
  L.GeometryUtil.readableArea = function (area: number, isMetric: boolean) {
    let areaStr: string;
    if (isMetric) {
      if (area >= 10000) {
        areaStr = (area / 10000).toFixed(2) + ' ha';
      } else {
        areaStr = area.toFixed(2) + ' m²';
      }
    } else {
      area *= 0.836127;
      if (area >= 3097600) {
        areaStr = (area / 3097600).toFixed(2) + ' mi²';
      } else {
        areaStr = area.toFixed(2) + ' yd²';
      }
    }
    return areaStr;
  };
}

interface AreaSelectionMapProps {
  onAreaDrawn: (name: string, polygon: [number, number][]) => void;
  searchLocation?: { lat: number; lng: number } | null;
  areaLabel?: string;
}

const AreaSelectionMap = ({ onAreaDrawn, searchLocation, areaLabel }: AreaSelectionMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSatellite, setIsSatellite] = useState(true);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  const handlePolygonCreated = useCallback((e: L.DrawEvents.Created) => {
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
      drawnItemsRef.current.addLayer(e.layer);
      const latLngs = (e.layer as L.Polygon).getLatLngs() as L.LatLngExpression[] | L.LatLngExpression[][];
      const ring = Array.isArray(latLngs[0]) ? (latLngs[0] as L.LatLngExpression[]) : (latLngs as L.LatLngExpression[]);
      const polygon = ring.map((latLng) => {
        const point = latLng as L.LatLng;
        return [point.lat, point.lng] as [number, number];
      });
      const label = areaLabel?.trim() || "Ausgewählte Gemeinde";
      onAreaDrawn(label, polygon);
    }
  }, [onAreaDrawn, areaLabel]);

  const toggleSatellite = useCallback(() => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;
    
    const map = mapInstanceRef.current;
    map.removeLayer(baseTileLayerRef.current);
    
    const newLayer = isSatellite
      ? L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: "abcd",
          maxZoom: 20,
        })
      : L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
          attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19,
        });
    
    newLayer.addTo(map);
    baseTileLayerRef.current = newLayer;
    setIsSatellite(!isSatellite);
  }, [isSatellite]);

  useEffect(() => {
    if (!mapInstanceRef.current || !searchLocation) return;
    const position = L.latLng(searchLocation.lat, searchLocation.lng);
    mapInstanceRef.current.setView(position, 13);

    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }
    searchMarkerRef.current = L.marker(position).addTo(mapInstanceRef.current);
  }, [searchLocation]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [49.9195, 8.1234],
      zoom: 14,
      zoomControl: true,
    });

    // Add tile layer
    const tileLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19,
      }
    ).addTo(map);
    baseTileLayerRef.current = tileLayer;

    // Initialize feature group for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Initialize draw control with showArea disabled to avoid the bug
    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: false, // Disabled to avoid leaflet-draw bug
          shapeOptions: {
            color: "#3b9a71",
            weight: 2,
            fillOpacity: 0.2,
          },
        },
        rectangle: {
          showArea: false, // Disabled to avoid leaflet-draw bug
          shapeOptions: {
            color: "#3b9a71",
            weight: 2,
            fillOpacity: 0.2,
          },
        },
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });

    map.addControl(drawControl);

    // Handle draw events
    map.on(L.Draw.Event.CREATED, handlePolygonCreated as L.LeafletEventHandlerFn);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    // Cleanup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [handlePolygonCreated]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full" />
      
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-pulse text-muted-foreground">Karte wird geladen...</div>
        </div>
      )}
    </div>
  );
};

export default AreaSelectionMap;
