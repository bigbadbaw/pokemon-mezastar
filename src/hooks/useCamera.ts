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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("Camera not started");

  const start = useCallback(async () => {
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
        video: { facingMode: { ideal: "environment" } },
      });
    } catch (firstErr) {
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
        const msg = err instanceof Error ? err.message : String(err);
        setDebugInfo(`Camera failed: ${msg}`);
        setError(msg);
        setIsActive(false);
        return;
      }
    }

    setDebugInfo("Camera stream acquired, attaching to video...");

    const video = videoRef.current;
    if (video) {
      video.setAttribute("playsinline", "true");
      video.srcObject = mediaStream;
      try {
        await video.play();
        setDebugInfo("Camera active");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setDebugInfo(`Error: ${msg}`);
      }
    } else {
      setDebugInfo("Camera active");
    }

    setStream(mediaStream);
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, [stream]);

  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.9);
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

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
