"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const CONSENT_KEY = "kadia_cookie_consent";
const COOKIE_NAME = "kadia_cookie_consent";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type ConsentChoice = "essential" | "all";

function persistConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // no-op
  }
  document.cookie = `${COOKIE_NAME}=${choice}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax; Secure`;
}

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored === "essential" || stored === "all") {
        setIsVisible(false);
        return;
      }
    } catch {
      // ignore storage errors and still show banner
    }
    setIsVisible(true);
  }, []);

  const acceptChoice = (choice: ConsentChoice) => {
    persistConsent(choice);
    setIsVisible(false);
  };

  return (
    <>
      {isVisible ? (
        <div className="fixed inset-x-0 bottom-3 z-[80] px-4 sm:bottom-5 sm:px-6">
          <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/65 bg-linen/90 p-4 text-ink shadow-[0_22px_56px_rgba(20,40,29,0.24),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl supports-[backdrop-filter]:bg-linen/82 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-3.5">
              <span className="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#2E5C55]/12 text-[#2E5C55] sm:h-9 sm:w-9">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0 pt-0.5 sm:pt-0">
                <p className="text-sm font-semibold leading-[1.3] text-ink sm:text-base">Cookie-Einstellungen</p>
                <p className="mt-2 text-xs leading-[1.6] text-ink/75 sm:text-sm">
                  Wir verwenden nur notwendige Cookies für die technische Funktion der Website. Optionale Cookies
                  helfen uns, die Nutzung zu verbessern. Details finden Sie in unserer{" "}
                  <Link href="/datenschutz" className="underline decoration-ink/40 underline-offset-2 hover:text-ink">
                    Datenschutzerklärung
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => acceptChoice("essential")}
                className="rounded-full border border-ink/15 bg-white/85 px-4 py-2 text-xs font-medium tracking-[0.01em] text-ink transition hover:bg-white sm:text-sm"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={() => acceptChoice("all")}
                className="rounded-full border border-white/55 bg-[#F7E7A6]/82 px-4 py-2 text-xs font-medium tracking-[0.02em] text-ink shadow-[0_12px_26px_rgba(247,231,166,0.34)] transition hover:scale-[1.01] hover:bg-[#F2DC93] sm:text-sm"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </>
  );
}
