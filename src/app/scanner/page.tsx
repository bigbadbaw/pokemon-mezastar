"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { useInventory } from "@/hooks/useInventory";
import { CameraView } from "@/components/scanner/CameraView";
import { TagPreview } from "@/components/scanner/TagPreview";
import { type ScanResult, type MezaTag } from "@/lib/types";

type ScanState = "camera" | "scanning" | "preview" | "error" | "success";

const MOCK_SCAN: ScanResult = {
  tag: {
    pokemonName: "Pikachu",
    collectionNumber: "025",
    energy: 1000,
    grade: 3,
    types: ["electric"],
    moves: ["Thunderbolt", "Quick Attack"],
    stats: {
      hp: 100,
      attack: 85,
      defense: 60,
      specialAttack: 95,
      specialDefense: 75,
      speed: 120,
    },
  },
  confidence: 0.95,
  rawResponse: "mock test data",
};

const IS_DEV = process.env.NODE_ENV === "development";

export default function ScannerPage() {
  const [state, setState] = useState<ScanState>("camera");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const camera = useCamera();
  const { addTag } = useInventory();

  useEffect(() => {
    void camera.start();
    return () => {
      camera.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state === "camera" && camera.stream && camera.videoRef.current) {
      camera.videoRef.current.srcObject = camera.stream;
    }
  }, [state, camera.stream, camera.videoRef]);

  const resetToCamera = useCallback(() => {
    setScanResult(null);
    setErrorMsg(null);
    setState("camera");
  }, []);

  const handleCapture = useCallback(async () => {
    const image = camera.capture();
    if (!image) {
      setErrorMsg("Could not capture image from camera");
      setState("error");
      return;
    }

    setState("scanning");
    try {
      const res = await fetch("/api/scan-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMsg(data.error ?? `Scan failed (HTTP ${res.status})`);
        setState("error");
        return;
      }

      setScanResult(data as ScanResult);
      setState("preview");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
      setState("error");
    }
  }, [camera]);

  const handleSave = useCallback(async () => {
    if (!scanResult) return;
    const newTag: Omit<MezaTag, "id"> = {
      ...scanResult.tag,
      scannedAt: new Date(),
    };
    await addTag(newTag);
    setState("success");
    setTimeout(() => {
      resetToCamera();
    }, 1500);
  }, [scanResult, addTag, resetToCamera]);

  const handleUseTestData = useCallback(() => {
    setScanResult(MOCK_SCAN);
    setErrorMsg(null);
    setState("preview");
  }, []);

  return (
    <div className="px-6 py-8">
      <p className="p-2 font-mono text-xs text-yellow-400">
        Protocol:{" "}
        {typeof window !== "undefined" ? window.location.protocol : "unknown"}{" "}
        | Host:{" "}
        {typeof window !== "undefined" ? window.location.host : "unknown"} |
        Camera: {camera.debugInfo}
      </p>

      <header className="mb-6">
        <h1 className="text-3xl font-bold">Tag Scanner</h1>
        <p className="mt-2 text-gray-400">
          Point your camera at a Meza Tag to scan and identify it
        </p>
      </header>

      {state === "camera" && (
        <div className="space-y-4">
          <CameraView
            videoRef={camera.videoRef}
            isActive={camera.isActive}
            onCapture={handleCapture}
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

          {IS_DEV && (
            <button
              onClick={handleUseTestData}
              className="min-h-[44px] w-full rounded-xl border border-dashed border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm font-semibold text-yellow-300 transition-colors hover:bg-yellow-500/20"
              aria-label="Load Pikachu test data to preview the flow without camera"
            >
              Use Test Data (dev only)
            </button>
          )}
        </div>
      )}

      {state === "scanning" && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2
            size={48}
            className="animate-spin text-[#e94560]"
            aria-hidden
          />
          <p className="text-lg font-semibold">Analyzing tag...</p>
          <p className="text-sm text-gray-400">
            Claude is reading the QR code and stats
          </p>
        </div>
      )}

      {state === "preview" && scanResult && (
        <TagPreview
          result={scanResult}
          onConfirm={handleSave}
          onRetry={resetToCamera}
        />
      )}

      {state === "error" && (
        <div
          className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center"
          role="alert"
        >
          <AlertCircle size={48} className="text-red-400" aria-hidden />
          <div>
            <p className="text-lg font-semibold">Scan failed</p>
            {errorMsg && (
              <p className="mt-1 text-sm text-gray-400">{errorMsg}</p>
            )}
          </div>
          <button
            onClick={resetToCamera}
            className="min-h-[44px] rounded-xl bg-[#e94560] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#d63d56]"
          >
            Try Again
          </button>
        </div>
      )}

      {state === "success" && (
        <div
          className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
          role="status"
        >
          <CheckCircle2 size={64} className="text-green-400" aria-hidden />
          <p className="text-lg font-semibold">Tag saved to collection!</p>
        </div>
      )}
    </div>
  );
}
