import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Code, Map, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const exportOptions = [
  {
    id: "pdf",
    title: "PDF Report",
    description: "Vollständiger Bericht als PDF-Dokument",
    icon: FileText,
  },
  {
    id: "html",
    title: "HTML Report",
    description: "Interaktiver Bericht für den Browser",
    icon: Code,
  },
  {
    id: "gis",
    title: "GIS-Export",
    description: "GeoJSON/Shapefile für GIS-Software",
    icon: Map,
  },
];

const ExportModal = ({ open, onOpenChange }: ExportModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = () => {
    if (!selectedFormat) return;
    
    setIsExporting(true);
    
    // Simulate export
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      
      // Reset after showing success
      setTimeout(() => {
        setExportComplete(false);
        setSelectedFormat(null);
        onOpenChange(false);
      }, 2000);
    }, 1500);
  };

  const handleClose = () => {
    setSelectedFormat(null);
    setExportComplete(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report exportieren</DialogTitle>
          <DialogDescription>
            Wählen Sie ein Format für den Export der Screening-Ergebnisse
          </DialogDescription>
        </DialogHeader>

        {!exportComplete ? (
          <>
            <div className="grid gap-3 py-4">
              {exportOptions.map((option) => (
                <Card
                  key={option.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedFormat === option.id
                      ? "border-primary bg-accent"
                      : "hover:border-primary/50 hover:bg-muted/30"
                  }`}
                  onClick={() => setSelectedFormat(option.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedFormat === option.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <option.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{option.title}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button
                disabled={!selectedFormat || isExporting}
                onClick={handleExport}
                className="gap-2"
              >
                {isExporting ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Exportiere...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Exportieren
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-status-green-bg flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-status-green" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Export erfolgreich
            </h3>
            <p className="text-sm text-muted-foreground">
              Der Report wurde vorbereitet (Mock)
            </p>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
