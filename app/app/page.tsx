import { Shield, Info } from "lucide-react";
import { MapEditorClient } from "@/components/app/map/MapEditorClient";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function AppPage() {
  return (
    <div className="mx-auto w-full max-w-[1280px] pb-10 pt-6">
      <section className="px-2 pb-10 pt-4 text-center sm:px-4">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#dce8e4] px-5 py-2 text-sm text-brand">
          <Shield className="h-4 w-4" />
          <span>One-Click Arten- &amp; Genehmigungs-Screening</span>
        </div>

        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-6xl">
          Standortanalyse in Sekunden
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-xl leading-relaxed text-ink/60">
          Wählen Sie eine Fläche und erhalten Sie in Sekunden ein Screening zu
          planungsrelevanten Arten und Kompensationsmaßnahmen.
        </p>
      </section>

      <MapEditorClient />

      <section className="mt-6 rounded-2xl border border-white/65 bg-white/70 px-6 py-2 shadow-[0_10px_28px_rgba(20,40,29,0.06)]">
        <Accordion type="single" collapsible>
          <AccordionItem value="how-it-works" className="border-b-0">
            <AccordionTrigger className="text-lg font-medium text-ink no-underline hover:no-underline">
              <span className="flex items-center gap-3">
                <Info className="h-5 w-5 text-brand" />
                Wie Kadia arbeitet
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-ink/75">
              Kadia kombiniert Geodaten, Habitatindikatoren und Artenhinweise zu einer
              schnellen Ersteinschätzung (Mock-Version). Das Ergebnis ersetzt keine
              behördliche Prüfung, hilft aber bei einer frühen Standortbewertung.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <p className="mt-12 text-center text-sm text-ink/45">
        Mockup-Version - Die Anzeige ersetzt keine behoerdliche Pruefung, Kartierung oder Gutachten.
      </p>
    </div>
  );
}
