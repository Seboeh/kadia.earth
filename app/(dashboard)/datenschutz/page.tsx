"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

function useMouseFollower() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const scrollY = useMotionValue(0);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };
    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };

    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);
    scrollY.set(window.scrollY);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mouseX, mouseY, scrollY]);

  return { mouseX, mouseY, scrollY };
}

export default function DatenschutzPage() {
  const { mouseX, mouseY, scrollY } = useMouseFollower();
  const pageMouseY = useTransform(mouseY, (y) => y + scrollY.get());
  const spotlight = useMotionTemplate`radial-gradient(280px at ${mouseX}px ${pageMouseY}px, rgba(10, 10, 10, 0.42), transparent 70%)`;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white font-sans text-ink">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-transparent" />
        <div
          className="absolute inset-0 opacity-28"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(46,92,85,0.18) 1.1px, transparent 1.2px)",
            backgroundSize: "18px 18px"
          }}
        />
        <motion.div
          className="absolute inset-0 opacity-92"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(46,92,85,0.5) 1.3px, transparent 1.4px)",
            backgroundSize: "18px 18px",
            WebkitMaskImage: spotlight,
            maskImage: spotlight
          }}
        />
      </div>

      <SiteHeader />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 pt-36 sm:pt-40">
        <h1 className="text-4xl font-semibold leading-[1.1] tracking-[-0.01em] text-ink sm:text-5xl">Datenschutzerklärung</h1>

        <div className="mt-10 grid gap-10 border-t border-ink/10 pt-10 text-base leading-[1.65] text-ink/80 sm:text-lg">
          <section>
            <p className="italic text-ink/70">
              Diese Datenschutzerklärung klärt Nutzer über die Art, den Umfang und Zwecke der Verarbeitung
              personenbezogener Daten innerhalb unserer Website <strong>kadia.earth</strong> auf. Stand: 15. Februar
              2026.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">1. Verantwortlicher im Sinne der DSGVO</h2>
            <p className="mt-3">
              <strong>kadia.earth</strong>
              <br />
              Sebastian Öhmann
              <br />
              Teichweg 16
              <br />
              48653 Coesfeld
              <br />
              <strong>E-Mail:</strong> sebastian@kadia.earth
              <br />
              <strong>Telefon:</strong> +49 15234625477
              <br />
              <strong>Website:</strong>{" "}
              <Link href="https://www.kadia.earth/" target="_blank" rel="noreferrer" className="underline hover:text-ink">
                www.kadia.earth
              </Link>
            </p>
            <p className="mt-3">
              Verantwortlicher für Datenschutzfragen: Sebastian Öhmann (E-Mail: sebastian@kadia.earth).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">2. Allgemeine Informationen zur Datenverarbeitung</h2>
            <p className="mt-3">
              Wir verarbeiten personenbezogene Daten (z. B. IP-Adresse, E-Mail, Name) nur, soweit dies für die
              Bereitstellung der Website, rechtliche Pflichten oder berechtigte Interessen erforderlich ist.
              Rechtsgrundlagen: Art. 6 Abs. 1 a (Einwilligung), b (Vertrag), f (berechtigtes Interesse) DSGVO.
              Alle Verarbeitungen erfolgen mit SSL-Verschlüsselung (HTTPS). Speicherfristen: Angaben siehe jeweilige
              Abschnitte; Löschung bei Zweckerfüllung oder Widerruf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">3. Spezifische Verarbeitungsvorgänge</h2>

            <h3 className="mt-5 text-lg font-semibold text-ink sm:text-xl">3.1 Server-Logfiles</h3>
            <p className="mt-3">
              Bei jedem Zugriff speichern wir automatisch: IP-Adresse (anonymisiert), Datum/Uhrzeit, Browser, Referrer
              (max. 7 Tage). Zweck: Sicherheit, Optimierung. Keine Zusammenführung mit anderen Daten. Rechtsgrundlage:
              Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-ink sm:text-xl">3.2 Kontaktformular & E-Mail</h3>
            <p className="mt-3">
              Bei Kontaktaufnahme erfassen wir: Name, E-Mail, Nachricht, IP-Adresse. Zweck: Bearbeitung (Speicherung
              bis Abschluss der Anfrage, max. 6 Monate danach). SSL-verschlüsselt. Rechtsgrundlage: Art. 6 Abs. 1 lit.
              b/f DSGVO. Kein automatisierter Export an Dritte.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-ink sm:text-xl">3.3 Newsletter</h3>
            <p className="mt-3">
              Bei Anmeldung: Double-Opt-in (E-Mail-Bestätigung). Erfasst: E-Mail, IP-Adresse, Anmeldedatum. Zweck:
              Informationsversand (inkl. Öffnungs-/Klick-Tracking zur Optimierung). Abmeldung jederzeit per Link.
              Tool: Brevo (EU-Server, AVV vorliegend; siehe{" "}
              <Link
                href="https://www.brevo.com/de/company/datenschutz/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-ink"
              >
                brevo.com/de/company/datenschutz
              </Link>
              ). Speicherung bis Abmeldung + 12 Monate. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO. Widerruf:
              sebastian@kadia.earth.
            </p>

            <h3 className="mt-5 text-lg font-semibold text-ink sm:text-xl">3.4 Cookies</h3>
            <p className="mt-3">
              Wir nutzen ausschließlich technisch notwendige Session-Cookies (z. B. Session-ID, Zweck: Funktionalität
              der E-Mail-Eingabe; Löschung beim Browser-Schließen). Keine Analyse-, Marketing- oder Tracking-Cookies.
              Kein Consent-Banner erforderlich. Verwalten über Browser-Einstellungen. Rechtsgrundlage: Art. 6 Abs. 1
              lit. f DSGVO. Bei zukünftigen nicht-notwendigen Cookies: Opt-in-Banner mit Granularität (z. B.
              Analyse/Marketing).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">4. Empfänger personenbezogener Daten</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>
                Hosting-Provider: Hetzner Online GmbH (EU, AVV vorliegend; siehe{" "}
                <Link
                  href="https://www.hetzner.com/de/legal/privacy-policy/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-ink"
                >
                  hetzner.com/de/legal/privacy-policy
                </Link>
                ).
              </li>
              <li>Newsletter-Tool: Brevo (AVV).</li>
              <li>Keine Weitergabe an Dritte, außer gesetzlich vorgeschrieben.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">5. Datenübermittlung in Drittländer</h2>
            <p className="mt-3">
              Keine Übermittlung außerhalb EU/EEA. Bei zukünftigen Tools: Standardvertragsklauseln (SCCs).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">6. Ihre Rechte (Art. 15-22 DSGVO)</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>
                <strong>Auskunft</strong> über gespeicherte Daten.
              </li>
              <li>
                <strong>Berichtigung/Löschung</strong> unrichtiger oder unrechtmäßiger Daten.
              </li>
              <li>
                <strong>Einschränkung</strong> der Verarbeitung.
              </li>
              <li>
                <strong>Datenübertragbarkeit</strong> in einem strukturierten Format.
              </li>
              <li>
                <strong>Widerspruch</strong> gegen die Verarbeitung (z. B. Newsletter).
              </li>
              <li>
                <strong>Widerruf Einwilligung</strong> jederzeit (rückwirkend unwirksam).
              </li>
            </ul>
            <p className="mt-3">
              Kontakt: sebastian@kadia.earth. Beschwerde: Landesbeauftragte für Datenschutz NRW ({" "}
              <Link href="https://ldi.nrw.de" target="_blank" rel="noreferrer" className="underline hover:text-ink">
                ldi.nrw.de
              </Link>
              ).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">7. Automatisierte Entscheidungen</h2>
            <p className="mt-3">Keine (kein Profiling).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink sm:text-2xl">8. Aktualisierungen</h2>
            <p className="mt-3">
              Wir informieren bei wesentlichen Änderungen dieser Datenschutzerklärung per E-Mail oder über die Website.
            </p>
          </section>

          <section>
            <p>
              <strong>Glossar:</strong> Personenbezogene Daten: Alle Informationen zu identifizierbaren Personen (Art.
              4 Nr. 1 DSGVO). AVV: Auftragsverarbeitungsvertrag.
            </p>
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
