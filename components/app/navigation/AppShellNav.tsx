"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/app", label: "Map" },
  { href: "/app/results", label: "Dashboard" },
  { href: "/app/report", label: "Bericht" }
] as const;

export function AppShellNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            className={cn(
              "rounded-full px-4 text-xs tracking-[0.02em]",
              isActive
                ? "bg-[#F7E7A6] text-ink shadow-[0_8px_22px_rgba(247,231,166,0.35)] hover:bg-[#F2DC93]"
                : "text-ink/75 hover:bg-white/80 hover:text-ink"
            )}
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
