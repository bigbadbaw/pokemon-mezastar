import { ScanLine, Archive, Swords, BookOpen } from "lucide-react";
import Link from "next/link";

const modules = [
  { href: "/scanner", label: "Tag Scanner", description: "Scan and identify Meza Tags with your camera", icon: ScanLine, color: "bg-blue-500/20 text-blue-400" },
  { href: "/inventory", label: "Tag Inventory", description: "Browse and manage your tag collection", icon: Archive, color: "bg-purple-500/20 text-purple-400" },
  { href: "/battle", label: "Battle Advisor", description: "Get team recommendations from game photos", icon: Swords, color: "bg-red-500/20 text-red-400" },
  { href: "/strategy", label: "Strategy Guide", description: "Arcade tips, type charts, and game strategies", icon: BookOpen, color: "bg-green-500/20 text-green-400" },
];

export default function HomePage() {
  return (
    <div className="px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mezastar Companion</h1>
        <p className="mt-2 text-gray-400">
          Your toolkit for Pokémon Mezastar arcade battles
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group min-h-[44px] rounded-2xl border border-white/10 bg-[#1a1a2e] p-6 transition-colors hover:border-[#e94560]/40"
          >
            <div className={`mb-3 inline-flex rounded-xl p-3 ${mod.color}`}>
              <mod.icon size={24} aria-hidden />
            </div>
            <h2 className="text-lg font-bold group-hover:text-[#e94560]">
              {mod.label}
            </h2>
            <p className="mt-1 text-sm text-gray-400">{mod.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
