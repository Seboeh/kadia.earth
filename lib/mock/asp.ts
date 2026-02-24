export type AspAmpel = "green" | "yellow" | "orange" | "red";

export type AspSpecies = {
  id: string;
  name: string;
  schutzstatus: string;
  score: number;
};

export type AspWirkfaktor = {
  id: string;
  name: string;
  level: "niedrig" | "mittel" | "hoch";
  hinweis: string;
};

export type AspMockResult = {
  fallNumber: 1 | 2 | 3 | 4;
  ampel: AspAmpel;
  begruendung: string[];
  arten: AspSpecies[];
  wirkfaktoren: AspWirkfaktor[];
};

export const aspQueryKeys = {
  result: ["asp", "result"] as const
};

const MOCK_RESULT: AspMockResult = {
  fallNumber: 3,
  ampel: "orange",
  begruendung: [
    "Polygon liegt nahe an einem bekannten Brutareal.",
    "Mehrere planungsrelevante Arten mit mittlerer Konfliktdichte.",
    "Feldbegehung fuer saisonale Verifizierung empfohlen."
  ],
  arten: [
    { id: "a1", name: "Rotmilan", schutzstatus: "streng geschuetzt", score: 78 },
    { id: "a2", name: "Feldlerche", schutzstatus: "besonders geschuetzt", score: 64 },
    { id: "a3", name: "Kammmolch", schutzstatus: "Anhang IV", score: 55 }
  ],
  wirkfaktoren: [
    {
      id: "w1",
      name: "Flaechenverlust",
      level: "hoch",
      hinweis: "Baubedingte Inanspruchnahme von Offenland."
    },
    {
      id: "w2",
      name: "Laerm",
      level: "mittel",
      hinweis: "Temporar waehrend Bauphase, Monitoring vorsehen."
    },
    {
      id: "w3",
      name: "Lichtemission",
      level: "niedrig",
      hinweis: "Abschirmung und warmweisse Leuchtmittel vorsehen."
    }
  ]
};

export async function fetchAspMockResult(): Promise<AspMockResult> {
  const delay = 300 + Math.floor(Math.random() * 301);
  await new Promise((resolve) => setTimeout(resolve, delay));
  return MOCK_RESULT;
}
