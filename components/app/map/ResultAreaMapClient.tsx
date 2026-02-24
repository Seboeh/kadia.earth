"use client";

import dynamic from "next/dynamic";

export const ResultAreaMapClient = dynamic(
  () => import("@/components/app/map/ResultAreaMap").then((mod) => mod.ResultAreaMap),
  { ssr: false }
);
