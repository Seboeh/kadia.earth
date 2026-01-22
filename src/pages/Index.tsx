import { useState, useCallback } from "react";
import { ScreeningResult, generateDummyResult, loadingSteps } from "@/data/dummyData";
import LandingView from "@/components/screening/LandingView";
import LoadingView from "@/components/screening/LoadingView";
import ResultsDashboard from "@/components/screening/ResultsDashboard";

export type AppView = "landing" | "loading" | "results";

const Index = () => {
  const [view, setView] = useState<AppView>("landing");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [results, setResults] = useState<ScreeningResult | null>(null);

  const handleStartScreening = useCallback((areaName: string, polygon: [number, number][]) => {
    setSelectedArea(areaName);
    setView("loading");
    
    // Simulate loading
    const totalDuration = loadingSteps.reduce((acc, step) => acc + step.duration, 0);
    setTimeout(() => {
      setResults(generateDummyResult(areaName, polygon));
      setView("results");
    }, totalDuration + 500);
  }, []);

  const handleReset = useCallback(() => {
    setView("landing");
    setSelectedArea(null);
    setResults(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {view === "landing" && (
        <LandingView onStartScreening={handleStartScreening} />
      )}
      {view === "loading" && (
        <LoadingView areaName={selectedArea || "Projektflaeche"} />
      )}
      {view === "results" && results && (
        <ResultsDashboard results={results} onReset={handleReset} />
      )}
    </div>
  );
};

export default Index;
