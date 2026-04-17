"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Camera, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { useInventory } from "@/hooks/useInventory";
import { useBattleAdvisor } from "@/hooks/useBattleAdvisor";
import { CameraView } from "@/components/scanner/CameraView";
import { OpponentView } from "@/components/battle/OpponentView";
import { TeamPicker } from "@/components/battle/TeamPicker";

type BattleState = "intro" | "capturing" | "analyzing" | "results" | "error";

export default function BattlePage() {
  const [state, setState] = useState<BattleState>("intro");
  const camera = useCamera();
  const { tags: inventory, isLoading: inventoryLoading } = useInventory();
  const {
    advice,
    isAnalyzing,
    error,
    analyze,
    reset: resetAdvice,
  } = useBattleAdvisor();

  const hasEnoughTags = inventory.length >= 3;

  const startCapture = useCallback(async () => {
    setState("capturing");
    await camera.start();
  }, [camera]);

  const handleCapture = useCallback(async () => {
    const image = camera.capture();
    if (!image) {
      setState("error");
      return;
    }
    setState("analyzing");
    camera.stop();
    await analyze(image, inventory);
  }, [camera, analyze, inventory]);

  const resetToIntro = useCallback(() => {
    resetAdvice();
    camera.stop();
    setState("intro");
  }, [resetAdvice, camera]);

  useEffect(() => {
    if (state === "analyzing" && !isAnalyzing) {
      if (error) {
        setState("error");
      } else if (advice) {
        setState("results");
      }
    }
  }, [state, isAnalyzing, error, advice]);

  useEffect(() => {
    return () => {
      camera.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-6 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Battle Advisor</h1>
        <p className="mt-2 text-gray-400">
          Take a photo of the arcade screen to get team recommendations
        </p>
      </header>

      {state === "intro" && (
        <div className="space-y-6">
          {!inventoryLoading && !hasEnoughTags && (
            <div
              className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-yellow-200"
              role="alert"
            >
              <p className="font-semibold">Not enough tags</p>
              <p className="mt-1 text-sm">
                You need at least 3 tags in your collection. Scan some tags
                first!
              </p>
              <Link
                href="/scanner"
                className="mt-3 inline-flex min-h-[44px] items-center rounded-lg bg-yellow-500/20 px-4 py-2 text-sm font-semibold transition-colors hover:bg-yellow-500/30"
              >
                Go to Scanner
              </Link>
            </div>
          )}

          <button
            onClick={startCapture}
            disabled={!hasEnoughTags || inventoryLoading}
            className="flex min-h-[44px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/20 bg-[#1a1a2e] p-12 transition-colors hover:border-[#e94560]/60 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Start camera capture for battle analysis"
          >
            <Camera size={48} className="text-[#e94560]" aria-hidden />
            <span className="text-lg font-semibold">
              Capture Arcade Screen
            </span>
            <span className="text-sm text-gray-400">
              {inventoryLoading
                ? "Loading inventory..."
                : `${inventory.length} tag${inventory.length === 1 ? "" : "s"} in your collection`}
            </span>
          </button>
        </div>
      )}

      {state === "capturing" && (
        <div className="space-y-4">
          <CameraView
            videoRef={camera.videoRef}
            isActive={camera.isActive}
            onCapture={handleCapture}
            showStadium={false}
            instructionText="Point at the arcade screen"
          />
          {camera.error && (
            <p
              className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
              role="alert"
            >
              <AlertCircle size={18} className="shrink-0" aria-hidden />
              Camera error: {camera.error}
            </p>
          )}
        </div>
      )}

      {state === "analyzing" && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2
            size={48}
            className="animate-spin text-[#e94560]"
            aria-hidden
          />
          <p className="text-lg font-semibold">Analyzing opponents...</p>
          <p className="text-sm text-gray-400">
            Claude is identifying the 3 opposing Pokémon
          </p>
        </div>
      )}

      {state === "results" && advice && (
        <div className="space-y-6">
          <OpponentView opponents={advice.opponents} />
          <TeamPicker
            team={advice.team}
            reasoning={advice.reasoning}
            typeAdvantages={advice.typeAdvantages}
          />
          <button
            onClick={resetToIntro}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#e94560] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#d63d56]"
          >
            <RotateCcw size={18} aria-hidden />
            New Battle
          </button>
        </div>
      )}

      {state === "error" && (
        <div
          className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center"
          role="alert"
        >
          <AlertCircle size={48} className="text-red-400" aria-hidden />
          <div>
            <p className="text-lg font-semibold">Analysis failed</p>
            {error && <p className="mt-1 text-sm text-gray-400">{error}</p>}
          </div>
          <button
            onClick={resetToIntro}
            className="min-h-[44px] rounded-xl bg-[#e94560] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#d63d56]"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
