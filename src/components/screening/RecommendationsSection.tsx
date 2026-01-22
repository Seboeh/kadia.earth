import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Calendar, AlertTriangle, Info, ChevronUp, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Recommendation } from "@/data/dummyData";

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
}

const getPriorityIcon = (priority: Recommendation["priority"]) => {
  switch (priority) {
    case "sehr_wahrscheinlich":
      return <AlertTriangle className="w-5 h-5 text-status-red" />;
    case "pruefen":
      return <AlertCircle className="w-5 h-5 text-status-yellow" />;
    case "eher_nicht":
      return <CheckCircle2 className="w-5 h-5 text-status-green" />;
  }
};

const getPriorityLabel = (priority: Recommendation["priority"]) => {
  switch (priority) {
    case "sehr_wahrscheinlich":
      return "Sehr wahrscheinlich erforderlich";
    case "pruefen":
      return "Prüfen";
    case "eher_nicht":
      return "Eher nicht erforderlich";
  }
};

const getPriorityColor = (priority: Recommendation["priority"]) => {
  switch (priority) {
    case "sehr_wahrscheinlich":
      return "border-l-status-red bg-status-red-bg/30";
    case "pruefen":
      return "border-l-status-yellow bg-status-yellow-bg/30";
    case "eher_nicht":
      return "border-l-status-green bg-status-green-bg/30";
  }
};

const RecommendationsSection = ({ recommendations }: RecommendationsSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const groupedRecommendations = {
    sehr_wahrscheinlich: recommendations.filter((r) => r.priority === "sehr_wahrscheinlich"),
    pruefen: recommendations.filter((r) => r.priority === "pruefen"),
    eher_nicht: recommendations.filter((r) => r.priority === "eher_nicht"),
  };

  const totalCount = recommendations.length;

  return (
    <Card className="card-elevated overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Header - Always visible */}
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="gap-2 p-0 h-auto hover:bg-transparent w-full justify-start">
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                <span className="font-semibold text-foreground">
                  Empfehlungen & Nächste Schritte ({totalCount})
                </span>
              </div>
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-6">
            {/* Priority Groups */}
            {(["sehr_wahrscheinlich", "pruefen", "eher_nicht"] as const).map((priority) => {
              const recs = groupedRecommendations[priority];
              if (recs.length === 0) return null;

              return (
                <div key={priority}>
                  <div className="flex items-center gap-2 mb-3">
                    {getPriorityIcon(priority)}
                    <h3 className="font-semibold text-foreground">{getPriorityLabel(priority)}</h3>
                    <span className="text-sm text-muted-foreground">({recs.length})</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {recs.map((rec, index) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={`p-4 border-l-4 ${getPriorityColor(priority)}`}>
                          <h4 className="font-medium text-foreground mb-2">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                          {rec.timing && (
                            <div className="flex items-center gap-2 text-xs text-primary">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{rec.timing}</span>
                            </div>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Disclaimer */}
            <Card className="p-4 bg-muted/30 border-border/50">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Wichtiger Hinweis</h4>
                  <p className="text-sm text-muted-foreground">
                    Dieses Screening ersetzt keine Kartierung. Es priorisiert Risiken und identifiziert 
                    Datenlücken für eine fundierte Planung der erforderlichen Untersuchungen.
                  </p>
                </div>
              </div>
            </Card>

            {/* Method Accordion */}
            <Accordion type="single" collapsible>
              <AccordionItem value="legal-context" className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline bg-card">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Typische Prüfregime in Deutschland</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 bg-card">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-foreground mb-1">Natura 2000 / FFH-Verträglichkeit</h5>
                      <p className="text-muted-foreground text-xs">
                        Prüfung bei Projekten in oder nahe FFH-/Vogelschutzgebieten nach § 34 BNatSchG.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground mb-1">Spezielle artenschutzrechtliche Prüfung (saP)</h5>
                      <p className="text-muted-foreground text-xs">
                        Prüfung der Verbotstatbestände nach § 44 BNatSchG für streng geschützte Arten.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground mb-1">Umweltverträglichkeitsprüfung (UVP)</h5>
                      <p className="text-muted-foreground text-xs">
                        Systematische Prüfung der Umweltauswirkungen bei bestimmten Vorhaben nach UVPG.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-foreground mb-1">Eingriffsregelung</h5>
                      <p className="text-muted-foreground text-xs">
                        Vermeidung, Minimierung und Kompensation von Eingriffen nach §§ 13-18 BNatSchG.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default RecommendationsSection;
