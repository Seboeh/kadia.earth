export const SCREENING_SESSION_KEY = "kadia_screening_session_v1";

export type PolygonFeature = {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  properties: {
    source: string;
  };
};

export type LatLng = {
  lat: number;
  lng: number;
};

export type ScreeningSessionData = {
  selectedLocation: string;
  polygon: PolygonFeature;
  center: LatLng;
  areaHa: number;
  analysisTimestamp: string;
  analysisId: string;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function projectToMeters(lat: number, lng: number, latReference: number) {
  const earthRadius = 6378137;
  const x = earthRadius * toRadians(lng) * Math.cos(toRadians(latReference));
  const y = earthRadius * toRadians(lat);
  return { x, y };
}

export function getPolygonCenter(polygon: PolygonFeature): LatLng {
  const ring = polygon.geometry.coordinates[0];
  if (!ring || ring.length === 0) {
    return { lat: 0, lng: 0 };
  }

  let sumLat = 0;
  let sumLng = 0;
  for (const [lng, lat] of ring) {
    sumLat += lat;
    sumLng += lng;
  }

  return {
    lat: sumLat / ring.length,
    lng: sumLng / ring.length
  };
}

export function calculatePolygonAreaHa(polygon: PolygonFeature): number {
  const ring = polygon.geometry.coordinates[0];
  if (!ring || ring.length < 4) return 0;

  const latReference = ring.reduce((sum, [, lat]) => sum + lat, 0) / ring.length;
  const projected = ring.map(([lng, lat]) => projectToMeters(lat, lng, latReference));

  let area = 0;
  for (let i = 0; i < projected.length - 1; i += 1) {
    const current = projected[i];
    const next = projected[i + 1];
    area += current.x * next.y - next.x * current.y;
  }

  const areaSquareMeters = Math.abs(area) / 2;
  return areaSquareMeters / 10000;
}

export function createAnalysisId(date = new Date()) {
  const padded = (value: number) => `${value}`.padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = padded(date.getMonth() + 1);
  const dd = padded(date.getDate());
  const hh = padded(date.getHours());
  const min = padded(date.getMinutes());
  const sec = padded(date.getSeconds());
  return `ANL-${yyyy}${mm}${dd}${hh}${min}${sec}`;
}
