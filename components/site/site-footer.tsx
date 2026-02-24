import Link from "next/link";
import { Linkedin, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer id="contact" className="relative z-10 mt-16 border-t border-ink/10 bg-white/70">
      <div className="mx-auto w-full max-w-[96rem] px-8 py-12 sm:px-10 lg:px-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center whitespace-nowrap text-lg font-medium leading-none tracking-[0.01em] text-ink">
              <span className="relative isolate inline-block px-0.5">
                <span className="pointer-events-none absolute -left-1 -right-1 bottom-0 h-[0.56em] rotate-[-2.8deg] rounded-[60%] bg-[linear-gradient(95deg,rgba(247,231,166,0.62)_0%,rgba(242,220,147,0.78)_48%,rgba(247,231,166,0.60)_100%)] blur-[0.1px]" />
                <span className="pointer-events-none absolute -left-0.5 -right-1.5 bottom-[-0.08em] h-[0.36em] rotate-[2.6deg] rounded-[58%] bg-[linear-gradient(100deg,rgba(247,231,166,0.50)_0%,rgba(242,220,147,0.62)_55%,rgba(247,231,166,0.44)_100%)] blur-[0.12px]" />
                <span className="relative z-10">
                  kadia<span className="text-[#2E5C55]">.</span>earth
                </span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-ink/70">
              Artenschutzanalyse in wenigen Klicks - von der Flächenauswahl zur artenschutzrechtlichen Relevanzprüfung in wenigen Minuten.
            </p>
            <div className="mt-8 flex flex-wrap gap-7 text-base text-ink/70">
              <Link href="/impressum" className="transition hover:text-ink">
                Impressum
              </Link>
              <Link href="/datenschutz" className="transition hover:text-ink">
                Datenschutz
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-ink/10 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-ink/60">{"\u00a9 2026 kadia. All rights reserved."}</span>
            <div className="flex items-center gap-4 text-ink/45">
              <Link
                href="https://www.linkedin.com/company/kadiaearth/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="transition hover:text-ink"
              >
                <Linkedin className="h-6 w-6" />
              </Link>
              <Link
                href="mailto:sebastian@kadia.earth"
                aria-label="E-Mail"
                className="transition hover:text-ink"
              >
                <Mail className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
