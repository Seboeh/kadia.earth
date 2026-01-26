export interface RedFlag {
  id: string;
  title: string;
  titleShort: string;
  status: 'high' | 'medium' | 'low';
  score: number;
  confidence: 'hoch' | 'mittel' | 'niedrig';
  reasons: string[];
  details: string;
  subIndicators?: { label: string; status: 'high' | 'medium' | 'low' }[];
}

export interface Species {
  id: string;
  name: string;
  scientificName: string;
  group: string;
  groupIcon: string;
  legalLabels: string[];
  evidenceScore: number;
  confidence: 'hoch' | 'mittel' | 'niedrig';
  dataStatus: 'Nachweis' | 'Modellhinweis' | 'Datenluecke';
  year?: number;
  effects: string[];
  evidenceLayers: {
    observations: boolean;
    habitatProxy: boolean;
    sdm: boolean;
  };
  reasons: string[];
  evidenceSourceLabel?: string;
  evidenceSourceUrl?: string;
  sdmValue?: number;
  coordinates?: [number, number];
}

export interface MapPoint {
  id: string;
  coordinates: [number, number];
  species: string;
  year: number;
  source: string;
  type: 'observation' | 'nest' | 'roost';
}

export interface HeatmapCell {
  id: string;
  bounds: [[number, number], [number, number]];
  sdmValue: number;
  species: string;
}

export interface EnvironmentalPredictor {
  id: string;
  category: string;
  name: string;
  source: string;
  resolution: string;
  update: string;
}

export interface AnalysisMetadata {
  id: string;
  timestamp: string;
}

export interface AreaData {
  name: string;
  bundesland: string;
  landkreis: string;
  gemeinde: string;
  flaeche_ha: number;
  perimeter_m: number;
  crs: string;
  coordinates: [number, number];
  polygon: [number, number][];
}

export interface ScreeningResult {
  area: AreaData;
  analysis: AnalysisMetadata;
  redFlags: RedFlag[];
  species: Species[];
  mapPoints: MapPoint[];
  heatmapCells: HeatmapCell[];
  environmentalPredictors: EnvironmentalPredictor[];
  buffers: { radius: number; color: string }[];
  recommendations: Recommendation[];
}

export interface Recommendation {
  id: string;
  title: string;
  priority: 'sehr_wahrscheinlich' | 'pruefen' | 'eher_nicht';
  description: string;
  timing?: string;
}

const getPolygonBounds = (polygon: [number, number][]) => {
  const lats = polygon.map(([lat]) => lat);
  const lngs = polygon.map(([, lng]) => lng);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
};

const getPolygonCentroid = (polygon: [number, number][]) => {
  const total = polygon.reduce(
    (acc, [lat, lng]) => [acc[0] + lat, acc[1] + lng],
    [0, 0]
  );
  return [total[0] / polygon.length, total[1] / polygon.length] as [number, number];
};

const isPointInPolygon = (point: [number, number], polygon: [number, number][]) => {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];
    const intersects =
      lngI > lng !== lngJ > lng &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;
    if (intersects) inside = !inside;
  }
  return inside;
};

const haversineDistance = (a: [number, number], b: [number, number]) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const r = 6371000;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
};

const getPolygonArea = (polygon: [number, number][]) => {
  const radius = 6378137;
  let sum = 0;
  if (polygon.length < 3) return 0;
  for (let i = 0; i < polygon.length; i += 1) {
    const [lat1, lng1] = polygon[i];
    const [lat2, lng2] = polygon[(i + 1) % polygon.length];
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const lambda1 = (lng1 * Math.PI) / 180;
    const lambda2 = (lng2 * Math.PI) / 180;
    sum += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2));
  }
  return Math.abs(sum) * (radius * radius) / 2;
};

const getPolygonPerimeter = (polygon: [number, number][]) => {
  let perimeter = 0;
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];
    perimeter += haversineDistance(current, next);
  }
  return perimeter;
};

const getCandidatePoints = (polygon: [number, number][], count: number) => {
  const bounds = getPolygonBounds(polygon);
  const fractions: [number, number][] = [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.5, 0.4],
    [0.25, 0.65],
    [0.7, 0.7],
    [0.4, 0.55],
    [0.6, 0.35],
    [0.5, 0.2],
    [0.2, 0.5],
    [0.8, 0.5],
  ];
  const points: [number, number][] = [];
  const centroid = getPolygonCentroid(polygon);
  for (let i = 0; i < fractions.length && points.length < count; i++) {
    const [fLat, fLng] = fractions[i];
    const point: [number, number] = [
      bounds.minLat + (bounds.maxLat - bounds.minLat) * fLat,
      bounds.minLng + (bounds.maxLng - bounds.minLng) * fLng,
    ];
    if (isPointInPolygon(point, polygon)) {
      points.push(point);
    }
  }
  while (points.length < count) {
    points.push(centroid);
  }
  return points;
};

const getEdgePoints = (polygon: [number, number][], count: number) => {
  const centroid = getPolygonCentroid(polygon);
  const points: [number, number][] = [];
  for (let i = 0; i < polygon.length - 1 && points.length < count; i += 1) {
    const [latA, lngA] = polygon[i];
    const [latB, lngB] = polygon[i + 1];
    const midLat = (latA + latB) / 2;
    const midLng = (lngA + lngB) / 2;
    const point: [number, number] = [
      midLat + (centroid[0] - midLat) * 0.08,
      midLng + (centroid[1] - midLng) * 0.08,
    ];
    if (isPointInPolygon(point, polygon)) {
      points.push(point);
    }
  }
  while (points.length < count) {
    points.push(centroid);
  }
  return points;
};

const getOffsetPoint = (
  center: [number, number],
  distanceMeters: number,
  bearingDegrees: number
) => {
  const [lat, lng] = center;
  const bearing = (bearingDegrees * Math.PI) / 180;
  const latDelta = (distanceMeters * Math.cos(bearing)) / 111320;
  const lngDelta =
    (distanceMeters * Math.sin(bearing)) / (111320 * Math.cos((lat * Math.PI) / 180));
  return [lat + latDelta, lng + lngDelta] as [number, number];
};

const clampValue = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const buildHeatmapCells = (
  polygon: [number, number][],
  speciesList: { name: string; base: number }[],
  rows: number = 12,
  cols: number = 12
) => {
  const bounds = getPolygonBounds(polygon);
  const centroid = getPolygonCentroid(polygon);
  const latStep = (bounds.maxLat - bounds.minLat) / rows;
  const lngStep = (bounds.maxLng - bounds.minLng) / cols;
  const hotspots = getCandidatePoints(polygon, 10);
  const maxDistance = Math.max(
    haversineDistance(centroid, [bounds.minLat, bounds.minLng]),
    haversineDistance(centroid, [bounds.minLat, bounds.maxLng]),
    haversineDistance(centroid, [bounds.maxLat, bounds.minLng]),
    haversineDistance(centroid, [bounds.maxLat, bounds.maxLng])
  );
  const sigma = Math.max(100, maxDistance * 0.35);
  const shrinkLat = latStep * 0.49;
  const shrinkLng = lngStep * 0.49;
  const gridCells = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const centerLat = bounds.minLat + latStep * (row + 0.5);
      const centerLng = bounds.minLng + lngStep * (col + 0.5);
      if (!isPointInPolygon([centerLat, centerLng], polygon)) continue;
      const rect: [[number, number], [number, number]] = [
        [centerLat - shrinkLat, centerLng - shrinkLng],
        [centerLat + shrinkLat, centerLng + shrinkLng],
      ];
      gridCells.push({ rect, row, col, center: [centerLat, centerLng] as [number, number] });
    }
  }

  return speciesList.flatMap((species, speciesIndex) =>
    gridCells.map((cell) => {
      const speciesHotspots = [
        hotspots[(speciesIndex * 2) % hotspots.length],
        hotspots[(speciesIndex * 2 + 3) % hotspots.length],
        hotspots[(speciesIndex * 2 + 6) % hotspots.length],
      ];
      const influence = Math.max(
        ...speciesHotspots.map((hotspot) => {
          const distance = haversineDistance(hotspot, cell.center);
          return Math.exp(-(distance ** 2) / (2 * sigma ** 2));
        })
      );
      const distance = haversineDistance(centroid, cell.center);
      const distanceFactor = maxDistance > 0 ? 1 - distance / maxDistance : 0.5;
      const variation = Math.sin((cell.row + 1) * (cell.col + 1) * (speciesIndex + 2)) * 0.06;
      const value = clampValue(
        0.12 + influence * 0.55 + distanceFactor * 0.2 + species.base * 0.2 + variation,
        0.12,
        0.98
      );
      return {
        id: `h-${speciesIndex + 1}-${cell.row + 1}-${cell.col + 1}`,
        bounds: cell.rect,
        sdmValue: value,
        species: species.name,
      };
    })
  );
};

export const generateDummyResult = (
  areaName: string = "Projektflaeche Neustadt",
  polygonInput?: [number, number][]
): ScreeningResult => {
  const defaultPolygon: [number, number][] = [
    [49.9182, 8.1265],
    [49.9204, 8.1260],
    [49.9216, 8.1294],
    [49.9200, 8.1332],
    [49.9178, 8.1320],
    [49.9174, 8.1287],
    [49.9182, 8.1265],
  ];
  const polygon =
    polygonInput && polygonInput.length > 2 ? polygonInput : defaultPolygon;
  const centerCoord = getPolygonCentroid(polygon);
  const analysisTimestamp = new Date().toISOString();
  const analysisId = "ANL-" + analysisTimestamp.replace(/[-:TZ.]/g, "").slice(0, 12);
  const perimeter = Math.round(getPolygonPerimeter(polygon));
  const areaSqMeters = getPolygonArea(polygon);
  const areaHectares = Math.round((areaSqMeters / 10000) * 100) / 100;
  const mapPointCoords = getCandidatePoints(polygon, 8);
  const edgePoints = getEdgePoints(polygon, 4);
  const extendedBufferPoint = getOffsetPoint(centerCoord, 1600, 135);
  const heatmapSpecies = [
    { name: "Fledermaeuse (alle Arten)", base: 0.72 },
    { name: "Kammmolch", base: 0.42 },
    { name: "Kreuzkroete", base: 0.36 },
    { name: "Laubfrosch", base: 0.33 },
    { name: "Zauneidechse", base: 0.58 },
    { name: "Rotmilan", base: 0.81 },
    { name: "Feldlerche", base: 0.76 },
    { name: "Mauersegler", base: 0.52 },
    { name: "Hornisse", base: 0.29 },
    { name: "Rote Waldameise", base: 0.31 },
  ];
  const species = [
      {
        id: "1",
        name: "Fledermaeuse (alle Arten)",
        scientificName: "Microchiroptera (alle Arten)",
        group: "Fledermaeuse",
        groupIcon: "FM",
        legalLabels: ["FFH-Richtlinie Anhang IV(a)"],
        evidenceScore: 86,
        confidence: "mittel",
        dataStatus: "Nachweis",
        year: 2023,
        effects: ["Stoerung", "Quartierverlust"],
        evidenceLayers: { observations: true, habitatProxy: true, sdm: true },
        reasons: [
          "Regulatorische Einheit: FFH-Richtlinie Anhang IV(a)",
          "Quelle: FFH-Richtlinie 92/43/EWG (EUR-Lex), Anhang IV: MICROCHIROPTERA - alle Arten",
        ],
        sdmValue: 0.72,
        coordinates: mapPointCoords[0],
      },
      {
        id: "2",
        name: "Kammmolch",
        scientificName: "Triturus cristatus",
        group: "Amphibien",
        groupIcon: "Am",
        legalLabels: ["FFH-Richtlinie Anhang IV(a)"],
        evidenceScore: 59,
        confidence: "mittel",
        dataStatus: "Modellhinweis",
        effects: ["Habitatverlust", "Barriere"],
        evidenceLayers: { observations: false, habitatProxy: true, sdm: true },
        reasons: [
          "Regulatorische Einheit: FFH-Richtlinie Anhang IV(a)",
          "Quelle: FFH-Richtlinie 92/43/EWG (EUR-Lex), Anhang IV: Triturus cristatus",
        ],
        sdmValue: 0.42,
      },
      {
        id: "3",
        name: "Kreuzkroete",
        scientificName: "Bufo calamita",
        group: "Amphibien",
        groupIcon: "Am",
        legalLabels: ["FFH-Richtlinie Anhang IV(a)"],
        evidenceScore: 58,
        confidence: "hoch",
        dataStatus: "Modellhinweis",
        effects: ["Habitatverlust", "Barriere"],
        evidenceLayers: { observations: false, habitatProxy: true, sdm: true },
        reasons: [
          "Regulatorische Einheit: FFH-Richtlinie Anhang IV(a)",
          "Quelle: FFH-Richtlinie 92/43/EWG (EUR-Lex), Anhang IV: Bufo calamita",
        ],
        sdmValue: 0.36,
      },
      {
        id: "4",
        name: "Laubfrosch",
        scientificName: "Hyla arborea",
        group: "Amphibien",
        groupIcon: "Am",
        legalLabels: ["FFH-Richtlinie Anhang IV(a)"],
        evidenceScore: 55,
        confidence: "hoch",
        dataStatus: "Modellhinweis",
        effects: ["Habitatverlust", "Barriere"],
        evidenceLayers: { observations: false, habitatProxy: true, sdm: true },
        reasons: [
          "Regulatorische Einheit: FFH-Richtlinie Anhang IV(a)",
          "Quelle: FFH-Richtlinie 92/43/EWG (EUR-Lex), Anhang IV: Hyla arborea",
        ],
        sdmValue: 0.33,
      },
      {
        id: "5",
        name: "Zauneidechse",
        scientificName: "Lacerta agilis",
        group: "Reptilien",
        groupIcon: "Rp",
        legalLabels: ["FFH-Richtlinie Anhang IV(a)"],
        evidenceScore: 78,
        confidence: "hoch",
        dataStatus: "Nachweis",
        year: 2021,
        effects: ["Habitatverlust", "Toetung", "Barriere"],
        evidenceLayers: { observations: true, habitatProxy: true, sdm: true },
        reasons: [
          "Regulatorische Einheit: FFH-Richtlinie Anhang IV(a)",
          "Quelle: FFH-Richtlinie 92/43/EWG (EUR-Lex), Anhang IV: Lacerta agilis",
        ],
        sdmValue: 0.58,
        coordinates: mapPointCoords[2],
      },
      {
        id: "6",
        name: "Rotmilan",
        scientificName: "Milvus milvus",
        group: "Voegel",
        groupIcon: "Vg",
        legalLabels: ["Europaeische Vogelarten (Vogelschutz-RL)"],
        evidenceScore: 88,
        confidence: "hoch",
        dataStatus: "Nachweis",
        year: 2024,
        effects: ["Kollision", "Brutplatzstoerung"],
        evidenceLayers: { observations: true, habitatProxy: true, sdm: false },
        reasons: [
          "Regulatorische Einheit: Europaeische Vogelarten (Vogelschutz-RL)",
          "Quelle: Vogelschutzrichtlinie 2009/147/EG, Art. 1 (EUR-Lex)",
        ],
        evidenceSourceLabel: "GBIF Artenprofil",
        evidenceSourceUrl: "https://www.gbif.org/species/5229168",
        coordinates: edgePoints[0],
      },
      {
        id: "7",
        name: "Feldlerche",
        scientificName: "Alauda arvensis",
        group: "Voegel",
        groupIcon: "Vg",
        legalLabels: ["Europaeische Vogelarten (Vogelschutz-RL)"],
        evidenceScore: 80,
        confidence: "hoch",
        dataStatus: "Nachweis",
        year: 2024,
        effects: ["Brutplatzstoerung", "Habitatverlust"],
        evidenceLayers: { observations: true, habitatProxy: true, sdm: true },
        reasons: [
          "Regulatorische Einheit: Europaeische Vogelarten (Vogelschutz-RL)",
          "Quelle: Vogelschutzrichtlinie 2009/147/EG, Art. 1 (EUR-Lex)",
        ],
        sdmValue: 0.76,
        coordinates: edgePoints[1],
      },
      {
        id: "8",
        name: "Mauersegler",
        scientificName: "Apus apus",
        group: "Voegel",
        groupIcon: "Vg",
        legalLabels: ["Europaeische Vogelarten (Vogelschutz-RL)"],
        evidenceScore: 64,
        confidence: "hoch",
        dataStatus: "Nachweis",
        year: 2022,
        effects: ["Brutplatzstoerung", "Quartierverlust"],
        evidenceLayers: { observations: true, habitatProxy: true, sdm: false },
        reasons: [
          "Regulatorische Einheit: Europaeische Vogelarten (Vogelschutz-RL)",
          "Quelle: Vogelschutzrichtlinie 2009/147/EG, Art. 1 (EUR-Lex)",
        ],
        coordinates: extendedBufferPoint,
      },
      {
        id: "9",
        name: "Hornisse",
        scientificName: "Vespa crabro",
        group: "Insekten",
        groupIcon: "In",
        legalLabels: ["BArtSchV Anlage 1 (BNatSchG Paragraph 54)"],
        evidenceScore: 52,
        confidence: "hoch",
        dataStatus: "Modellhinweis",
        effects: ["Stoerung", "Habitatverlust"],
        evidenceLayers: { observations: false, habitatProxy: true, sdm: false },
        reasons: [
          "Regulatorische Einheit: Rechtsverordnung nach BNatSchG Paragraph 54",
          "Quelle: BArtSchV (Gesetze im Internet), Anlage 1: Vespa crabro",
        ],
      },
      {
        id: "10",
        name: "Rote Waldameise",
        scientificName: "Formica rufa",
        group: "Insekten",
        groupIcon: "In",
        legalLabels: ["BArtSchV Anlage 1 (BNatSchG Paragraph 54)"],
        evidenceScore: 54,
        confidence: "hoch",
        dataStatus: "Modellhinweis",
        effects: ["Stoerung", "Habitatverlust"],
        evidenceLayers: { observations: false, habitatProxy: true, sdm: false },
        reasons: [
          "Regulatorische Einheit: Rechtsverordnung nach BNatSchG Paragraph 54",
          "Quelle: BArtSchV (Gesetze im Internet), Anlage 1: Formica rufa",
        ],
      },
  ];
  const mapPoints = species
    .filter((item) => item.evidenceLayers.observations && item.coordinates)
    .map((item, index) => ({
      id: `p${index + 1}`,
      coordinates: item.coordinates!,
      species: item.name,
      year: item.year ?? 2023,
      source: "Kartierung",
      type: "observation",
    }));

  
  return {
    area: {
      name: areaName,
      bundesland: "Rheinland-Pfalz",
      landkreis: "Mainz-Bingen",
      gemeinde: areaName,
      flaeche_ha: areaHectares,
      perimeter_m: perimeter,
      crs: "EPSG:4326",
      coordinates: centerCoord,
      polygon,
    },
    analysis: { id: analysisId, timestamp: analysisTimestamp },
    redFlags: [
      {
        id: "natura2000",
        title: "Natura 2000 / FFH-Vertraeglichkeit",
        titleShort: "Natura 2000",
        status: "high",
        score: 78,
        confidence: "hoch",
        reasons: [
          "FFH-Gebiet Rheinauen in 1,2 km Entfernung",
          "Funktionale Verbindung ueber Gewaessersystem",
          "3 FFH-Anhang-II-Arten im Einwirkbereich",
        ],
        details: "Die Flaeche liegt im funktionalen Einwirkbereich des FFH-Gebiets DE-6016-301 Rheinauen bei Mainz. Eine FFH-Vorpruefung wird dringend empfohlen.",
      },
      {
        id: "artenschutz",
        title: "Besonderer Artenschutz (saP-Risikoindikator)",
        titleShort: "Artenschutz saP",
        status: "high",
        score: 85,
        confidence: "hoch",
        reasons: [
          "14 streng geschuetzte Arten mit Nachweisen",
          "Habitateignung fuer weitere 8 Arten (Modell)",
          "Brutzeit-Ueberlappung bei 6 Vogelarten",
        ],
        details: "Aufgrund der hohen Artendichte und Habitateignung ist eine spezielle artenschutzrechtliche Pruefung (saP) erforderlich.",
        subIndicators: [
          { label: "Toetung/Verletzung", status: "high" },
          { label: "Stoerung", status: "medium" },
          { label: "Fortpflanzungs-/Ruhestaetten", status: "high" },
        ],
      },
      {
        id: "uvp",
        title: "UVP-Trigger (Indikator)",
        titleShort: "UVP-Indikator",
        status: "medium",
        score: 52,
        confidence: "mittel",
        reasons: [
          "Flaechengroesse unter Schwellenwert, aber Vorpruefung moeglich",
          "Kumulierung mit bestehenden Vorhaben pruefen",
          "Schutzgut Tiere/Pflanzen erhoeht relevant",
        ],
        details: "Die Vorpruefung des Einzelfalls sollte die kumulativen Wirkungen beruecksichtigen.",
      },
      {
        id: "eingriffsregelung",
        title: "Eingriffsregelung / Kompensation",
        titleShort: "Kompensation",
        status: "medium",
        score: 61,
        confidence: "hoch",
        reasons: [
          "Biotoptyp Streuobst (Paragraph 30 BNatSchG) betroffen",
          "Hoher Kompensationsfaktor wahrscheinlich (1:2 bis 1:3)",
          "CEF-Massnahmen fuer 3 Arten empfohlen",
        ],
        details: "Eingriffe in geschuetzte Biotope erfordern Ausgleichs- oder Ersatzmassnahmen. Funktionserhaltende Massnahmen (CEF) koennen Verbote vermeiden.",
      },
    ],
    species,
    mapPoints,
    heatmapCells: buildHeatmapCells(polygon, heatmapSpecies),
    environmentalPredictors: [
      {
        id: "env-landcover",
        category: "Landbedeckung/Habitat",
        name: "CORINE Land Cover",
        source: "Copernicus",
        resolution: "100 m",
        update: "Stand 2018",
      },
      {
        id: "env-sentinel",
        category: "Satellitendaten",
        name: "Sentinel-2 NDVI",
        source: "Copernicus",
        resolution: "10 m",
        update: "Letzte Szene: 2024-05",
      },
      {
        id: "env-climate",
        category: "Klima/Wetter",
        name: "DWD Klimaraster",
        source: "DWD CDC",
        resolution: "1 km",
        update: "Norm 1991-2020",
      },
      {
        id: "env-topo",
        category: "Topographie & Wasser",
        name: "DGM / Hangneigung",
        source: "BKG",
        resolution: "10 m",
        update: "Stand 2022",
      },
      {
        id: "env-disturb",
        category: "Stoerung/Nutzung",
        name: "Distanz zu Strassen/Siedlung",
        source: "OSM",
        resolution: "Vektor",
        update: "Q1 2024",
      },
    ],
    buffers: [
      { radius: 1000, color: "#3b9a7125" },
    ],
    recommendations: [
      {
        id: "r1",
        title: "Brutvogelkartierung (Offenland)",
        priority: "sehr_wahrscheinlich",
        description: "Aufgrund der hohen Evidenz fuer Feldlerche, Kiebitz und Rebhuhn ist eine systematische Brutvogelkartierung auf der Flaeche und im 200-m-Umfeld dringend empfohlen.",
        timing: "Maerz - Juli",
      },
      {
        id: "r2",
        title: "Horstsuche Greifvoegel",
        priority: "sehr_wahrscheinlich",
        description: "Rotmilan-Horst in unter 1 km bestaetigt. Horstsuche und Raumnutzungsanalyse zur Abschaetzung der Kollisionsgefaehrdung.",
        timing: "Winter / Fruehjahr (unbelaubt)",
      },
      {
        id: "r3",
        title: "Fledermaus-Aktivitaetserfassung",
        priority: "pruefen",
        description: "Mehrere Fledermausarten nachgewiesen. Bei Eingriffen in Gehoelze/Gebaeude sollte eine Aktivitaetserfassung erfolgen.",
        timing: "Mai - September",
      },
      {
        id: "r4",
        title: "Feldhamster-Baukartierung",
        priority: "sehr_wahrscheinlich",
        description: "Aktueller Nachweis in unmittelbarer Naehe. Systematische Baukartierung auf der Ackerflaeche erforderlich.",
        timing: "April - Mai oder August - September",
      },
      {
        id: "r5",
        title: "Reptilienerfassung (Zauneidechse)",
        priority: "pruefen",
        description: "Nachweis am Bahndamm in Reichweite. Bei Eingriffen in Saum-/Randstrukturen sollte eine Erfassung erfolgen.",
        timing: "April - September (sonnige Tage)",
      },
      {
        id: "r6",
        title: "FFH-Vorpruefung",
        priority: "sehr_wahrscheinlich",
        description: "Naehe zum FFH-Gebiet Rheinauen erfordert Pruefung auf erhebliche Beeintraechtigung der Erhaltungsziele.",
      },
      {
        id: "r7",
        title: "Amphibienerfassung",
        priority: "eher_nicht",
        description: "Keine Gewaesser auf der Flaeche, Amphibien-Evidenz gering. Nur bei Hinweisen auf Wanderkorridore relevant.",
        timing: "Maerz - Juni",
      },
    ],
  };
};

export const loadingSteps = [
  { id: 1, label: "Kontext ableiten...", duration: 600 },
  { id: 2, label: "Regulatorik-Scope setzen...", duration: 800 },
  { id: 3, label: "Daten fusionieren...", duration: 1200 },
  { id: 4, label: "Arten priorisieren...", duration: 700 },
  { id: 5, label: "Red Flags ableiten...", duration: 500 },
];



