"use client";

import dynamic from "next/dynamic";

export const MapEditorClient = dynamic(
  () => import("@/components/app/map/MapEditor").then((mod) => mod.MapEditor),
  { ssr: false }
);
