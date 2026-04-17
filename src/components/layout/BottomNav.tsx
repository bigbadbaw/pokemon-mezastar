"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ScanLine, Archive, Swords, BookOpen } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";

const iconMap = {
  home: Home,
  scan: ScanLine,
  archive: Archive,
  swords: Swords,
  "book-open": BookOpen,
} as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#1a1a2e]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      aria-label="Main navigation"
    >
      <ul className="flex items-center justify-around px-2 py-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = iconMap[item.icon];

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? "text-[#e94560]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
