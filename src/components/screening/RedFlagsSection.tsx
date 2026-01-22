import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RedFlag } from "@/data/dummyData";

interface RedFlagsSectionProps {
  redFlags: RedFlag[];
}

const getStatusIcon = (status: RedFlag["status"]) => {
  switch (status) {
    case "high":
      return <AlertTriangle className="w-5 h-5" />;
    case "medium":
      return <AlertCircle className="w-5 h-5" />;
    case "low":
      return <CheckCircle className="w-5 h-5" />;
  }
};

const getStatusColor = (status: RedFlag["status"]) => {
  switch (status) {
    case "high":
      return "status-red";
    case "medium":
      return "status-yellow";
    case "low":
      return "status-green";
  }
};

const getStatusLabel = (status: RedFlag["status"]) => {
  switch (status) {
    case "high":
      return "Hoch";
    case "medium":
      return "Mittel";
    case "low":
      return "Niedrig";
  }
};

const getConfidenceBadge = (confidence: RedFlag["confidence"]) => {
  const colors = {
    hoch: "bg-status-green-bg text-status-green",
    mittel: "bg-status-yellow-bg text-status-yellow brightness-75",
    niedrig: "bg-status-red-bg text-status-red",
  };
  return colors[confidence];
};

const RedFlagsSection = ({ redFlags }: RedFlagsSectionProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {redFlags.map((flag, index) => (
        <motion.div
          key={flag.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="card-elevated overflow-hidden h-full">
            {/* Header with status color */}
            <div className={`h-1.5 ${getStatusColor(flag.status).replace("status-", "bg-status-")}`} />
            
            <div className="p-4">
              {/* Title and Score */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm leading-tight">
                    {flag.titleShort}
                  </h3>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flag.status)}`}>
                  {getStatusIcon(flag.status)}
                  <span>{getStatusLabel(flag.status)}</span>
                </div>
              </div>

              {/* Score and Confidence */}
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl font-bold text-foreground">{flag.score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
                <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${getConfidenceBadge(flag.confidence)}`}>
                  Konfidenz: {flag.confidence}
                </span>
              </div>

              {/* Sub-indicators (if any) */}
              {flag.subIndicators && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {flag.subIndicators.map((sub, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(sub.status)}`}
                    >
                      {sub.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Reasons */}
              <div className="space-y-1.5 mb-4">
                {flag.reasons.slice(0, 3).map((reason, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>

              {/* Expand Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-xs"
                onClick={() => setExpandedId(expandedId === flag.id ? null : flag.id)}
              >
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Details
                </span>
                {expandedId === flag.id ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === flag.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 mt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {flag.details}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-3 italic">
                        Hinweis: Diese Einschaetzung ersetzt keine Rechtsberatung oder behoerdliche Pruefung.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default RedFlagsSection;
