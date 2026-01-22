import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, CheckCircle2 } from "lucide-react";
import { loadingSteps } from "@/data/dummyData";

interface LoadingViewProps {
  areaName: string;
}

const LoadingView = ({ areaName }: LoadingViewProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let cumulativeTime = 0;
    
    loadingSteps.forEach((step, index) => {
      // Start step
      setTimeout(() => {
        setCurrentStep(index);
      }, cumulativeTime);
      
      // Complete step
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, index]);
      }, cumulativeTime + step.duration);
      
      cumulativeTime += step.duration;
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-6 shadow-lg">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Leaf className="w-10 h-10 text-primary-foreground" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Analyse gestartet
          </h2>
          <p className="text-muted-foreground">
            Wir bestimmen Gemeinde, Fläche und Umweltkontext und bereiten die Ergebnisse vor
          </p>
        </motion.div>

        <div className="space-y-3">
          {loadingSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                currentStep === index && !completedSteps.includes(index)
                  ? "bg-accent"
                  : completedSteps.includes(index)
                  ? "bg-status-green-bg"
                  : "bg-muted/50"
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {completedSteps.includes(index) ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-status-green" />
                    </motion.div>
                  ) : currentStep === index ? (
                    <motion.div
                      key="spinner"
                      className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  )}
                </AnimatePresence>
              </div>
              <span
                className={`text-sm ${
                  completedSteps.includes(index)
                    ? "text-status-green font-medium"
                    : currentStep === index
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-hero"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: loadingSteps.reduce((acc, s) => acc + s.duration, 0) / 1000,
                ease: "linear"
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingView;
