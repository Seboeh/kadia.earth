import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportPage() {
  return (
    <div className="space-y-4">
      <Card className="border-white/60 bg-white/80 shadow-[0_16px_45px_rgba(20,40,29,0.10)]">
        <CardHeader>
          <CardTitle className="text-xl text-ink">Bericht (Dummy)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-ink/80">
          <div className="rounded-2xl border border-ink/10 bg-linen/65 p-4">
            <p className="font-medium">Vorschau</p>
            <p>Projektflaeche: 42.3 ha (mock)</p>
            <p>ASP-Fall: 3 (mock)</p>
            <p>Pruefstand: Entwurf</p>
          </div>

          <Button type="button" disabled className="rounded-full">
            Gutachten (PDF) herunterladen - coming soon
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
