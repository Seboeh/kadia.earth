import Link from "next/link";
import { Bell, ChevronDown, CircleHelp, CreditCard, LogOut, Settings, ShieldCheck, UserCircle2 } from "lucide-react";
import { AppGridBackground } from "@/components/app/background/AppGridBackground";

export default function AppAreaLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-linen text-ink">
      <AppGridBackground />

      <header className="fixed inset-x-0 top-0 z-30 pt-2">
        <div className="mx-auto flex w-full items-center px-5 sm:px-6">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-white/45 bg-linen/55 px-4 py-2 shadow-[0_16px_40px_rgba(20,40,29,0.16),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl supports-[backdrop-filter]:bg-linen/50">
            <Link href="/" className="ml-2 inline-flex items-center whitespace-nowrap text-sm font-medium leading-none tracking-[0.01em] text-ink sm:ml-3">
              <span className="relative isolate inline-block px-0.5">
                <span className="pointer-events-none absolute -left-1 -right-1 bottom-0 h-[0.56em] rotate-[-2.8deg] rounded-[60%] bg-[linear-gradient(95deg,rgba(247,231,166,0.62)_0%,rgba(242,220,147,0.78)_48%,rgba(247,231,166,0.60)_100%)] blur-[0.1px]" />
                <span className="pointer-events-none absolute -left-0.5 -right-1.5 bottom-[-0.08em] h-[0.36em] rotate-[2.6deg] rounded-[58%] bg-[linear-gradient(100deg,rgba(247,231,166,0.50)_0%,rgba(242,220,147,0.62)_55%,rgba(247,231,166,0.44)_100%)] blur-[0.12px]" />
                <span className="relative z-10">
                  kadia<span className="text-[#2E5C55]">.</span>earth
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/38 text-ink/80 shadow-[0_14px_34px_rgba(20,40,29,0.18),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-xl transition hover:bg-white/46"
                aria-label="Benachrichtigungen"
              >
                <Bell className="h-4 w-4" />
              </button>

              <details className="group relative">
                <summary className="flex list-none cursor-pointer items-center gap-2 rounded-full border border-white/30 bg-white/40 px-2 py-1.5 shadow-[0_14px_34px_rgba(20,40,29,0.18),inset_0_1px_0_rgba(255,255,255,0.58)] backdrop-blur-xl transition hover:bg-white/50 [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/55 bg-[#2E5C55]/16 text-xs font-semibold text-[#2E5C55]">
                    M
                  </span>
                  <ChevronDown className="h-4 w-4 text-ink/60 transition group-open:rotate-180" />
                </summary>

                <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-white/55 bg-white/86 p-3 text-sm shadow-[0_20px_44px_rgba(20,40,29,0.16)] backdrop-blur-xl">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-300/30 bg-white/65 p-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-[#2E5C55]/16 text-sm font-semibold text-[#2E5C55]">
                      M
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">Mara Hoffmann</p>
                      <p className="truncate text-xs text-ink/65">mara.hoffmann@kadia.earth</p>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <Link href="/app/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-ink/85 transition hover:bg-white/70">
                      <UserCircle2 className="h-4 w-4 text-brand" />
                      Profil
                    </Link>
                    <Link href="/dashboard/security" className="flex items-center gap-2 rounded-lg px-3 py-2 text-ink/85 transition hover:bg-white/70">
                      <Settings className="h-4 w-4 text-brand" />
                      Einstellungen
                    </Link>
                    <Link href="/pricing" className="flex items-center gap-2 rounded-lg px-3 py-2 text-ink/85 transition hover:bg-white/70">
                      <CreditCard className="h-4 w-4 text-brand" />
                      Abrechnung
                    </Link>
                    <Link href="/kontakt" className="flex items-center gap-2 rounded-lg px-3 py-2 text-ink/85 transition hover:bg-white/70">
                      <CircleHelp className="h-4 w-4 text-brand" />
                      Hilfe
                    </Link>
                  </div>

                  <div className="mt-2 border-t border-slate-300/30 pt-2">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-ink/85 transition hover:bg-white/70"
                    >
                      <ShieldCheck className="h-4 w-4 text-brand" />
                      Datenschutz & Sicherheit
                    </button>
                    <Link
                      href="/"
                      className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-700 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Abmelden
                    </Link>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[90rem] px-3 py-24 sm:px-5 lg:px-8">
        {children}
      </main>
    </div>
  );
}
