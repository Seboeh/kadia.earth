import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
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
          <div className="flex items-center gap-3">
            <Link
              href="/ueber-uns"
              className="hidden text-[13px] font-medium tracking-[0.02em] text-ink/80 transition hover:text-ink md:inline-flex"
            >
              Über uns
            </Link>
            <Link
              href="/kontakt"
              className="hidden text-[13px] font-medium tracking-[0.02em] text-ink/80 transition hover:text-ink md:inline-flex"
            >
              Kontakt
            </Link>
            <Button
              asChild
              className="ml-1 rounded-full bg-[#F7E7A6] px-4 py-1.5 text-xs font-medium tracking-[0.02em] text-ink shadow-[0_10px_26px_rgba(247,231,166,0.35)] transition hover:scale-[1.02] hover:bg-[#F2DC93]"
            >
              <Link href="/sign-in">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
