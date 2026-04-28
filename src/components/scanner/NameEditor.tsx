"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { POKEMON_NAMES } from "@/data/pokemon-names";
import { type PokemonType } from "@/lib/types";

interface PokemonLookupSuccess {
  types: PokemonType[];
  moves: string[];
  imageUrl?: string;
}

interface NameEditorProps {
  initialName: string;
  onCancel: () => void;
  onConfirm: (name: string, lookup: PokemonLookupSuccess) => void;
}

const MAX_SUGGESTIONS = 6;

export function NameEditor({
  initialName,
  onCancel,
  onConfirm,
}: NameEditorProps) {
  const [value, setValue] = useState(initialName);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (query.length === 0) return [];
    return POKEMON_NAMES.filter((n) => n.toLowerCase().includes(query)).slice(
      0,
      MAX_SUGGESTIONS,
    );
  }, [value]);

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0 && !isLookingUp;

  async function handleConfirm(name: string) {
    setError(null);
    setIsLookingUp(true);
    try {
      const res = await fetch("/api/pokemon-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json()) as
        | { types: PokemonType[]; moves: string[]; imageUrl?: string }
        | { error: string };

      if (!res.ok || "error" in data) {
        const message = "error" in data ? data.error : `HTTP ${res.status}`;
        setError(message);
        return;
      }

      onConfirm(name, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLookingUp(false);
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor="name-edit" className="sr-only">
        Pokémon name
      </label>
      <input
        id="name-edit"
        type="text"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type Pokémon name…"
        className="min-h-[44px] w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-lg font-bold text-white placeholder:text-gray-500 focus:border-[#e94560] focus:outline-none"
        aria-label="Edit Pokémon name"
      />

      {suggestions.length > 0 && (
        <ul
          className="flex flex-col gap-1 rounded-xl border border-white/10 bg-black/30 p-1"
          role="listbox"
          aria-label="Name suggestions"
        >
          {suggestions.map((name) => (
            <li key={name}>
              <button
                onClick={() => setValue(name)}
                disabled={isLookingUp}
                className="min-h-[44px] w-full rounded-lg px-3 py-2 text-left text-sm text-gray-200 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => handleConfirm(trimmed)}
          disabled={!canSubmit}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#e94560] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#d63d56] disabled:opacity-50"
          aria-label="Confirm new name and refresh data"
        >
          {isLookingUp ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden />
              Looking up…
            </>
          ) : (
            "Confirm"
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isLookingUp}
          className="min-h-[44px] rounded-xl border border-white/20 px-4 py-2 font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
          aria-label="Cancel name edit"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
