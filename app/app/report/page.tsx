import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportPage() {
  return (
    <div className="space-y-4">
      <Card className="app-glass-card">
        <CardHeader>
          <CardTitle className="text-xl text-ink">Bericht (Dummy)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-ink/80">
          <div className="app-glass-panel rounded-2xl p-4">
            <p className="font-medium">Vorschau</p>
            <p>Projektflaeche: 42.3 ha (mock)</p>
            <p>ASP-Fall: 3 (mock)</p>
            <p>Pruefstand: Entwurf</p>
          </div>

          <Button type="button" disabled className="app-brand-button rounded-full">
            Gutachten (PDF) herunterladen - coming soon
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
