"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  debugInfo: string;
  start: () => Promise<void>;
  stop: () => void;
  capture: () => string | null;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("Camera not started");

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;

    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
    }
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStream(null);
    setIsActive(false);
  }, []);

  const start = useCallback(async () => {
    // Cancel any in-flight previous start so stale resolutions don't
    // stomp on the new one (React Strict Mode double-invoke scenario).
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    setError(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      const msg =
        "Camera requires HTTPS. Open this page using https:// on your iPad.";
      setDebugInfo(msg);
      setError(msg);
      setIsActive(false);
      return;
    }

    setDebugInfo("Requesting camera access...");
    let mediaStream: MediaStream | null = null;

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
    } catch (firstErr) {
      if (signal.aborted) return;
      const firstMsg =
        firstErr instanceof Error ? firstErr.message : String(firstErr);
      setDebugInfo(
        `First attempt failed: ${firstMsg}, trying fallback...`,
      );
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      } catch (err) {
        if (signal.aborted) return;
        const msg = err instanceof Error ? err.message : String(err);
        setDebugInfo(`Camera failed: ${msg}`);
        setError(msg);
        setIsActive(false);
        return;
      }
    }

    if (signal.aborted) {
      mediaStream.getTracks().forEach((t) => t.stop());
      return;
    }

    streamRef.current = mediaStream;
    setDebugInfo("Camera stream acquired, attaching to video...");

    const video = videoRef.current;
    if (video) {
      video.setAttribute("playsinline", "true");
      video.srcObject = mediaStream;
      try {
        await video.play();
        if (signal.aborted) return;
        setDebugInfo("Camera active");
      } catch (err) {
        if (signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") {
          setDebugInfo("Camera restarting...");
          mediaStream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
          return;
        }
        const msg = err instanceof Error ? err.message : String(err);
        setDebugInfo(`Error: ${msg}`);
      }
    } else {
      setDebugInfo("Camera active");
    }

    if (signal.aborted) return;
    setStream(mediaStream);
    setIsActive(true);
  }, []);

  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.92);
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    videoRef,
    stream,
    isActive,
    error,
    debugInfo,
    start,
    stop,
    capture,
  };
}
