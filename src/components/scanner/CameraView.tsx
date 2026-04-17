"use client";

import { ScanButton } from "./ScanButton";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onCapture?: () => void;
  isCapturing?: boolean;
  showStadium?: boolean;
  instructionText?: string;
}

export function CameraView({
  videoRef,
  isActive,
  onCapture,
  isCapturing = false,
  showStadium = true,
  instructionText = "Position your Meza Tag in the frame",
}: CameraViewProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
        aria-label="Camera viewfinder"
      />

      {isActive && (
        <>
          {showStadium && (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 1600 900"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <mask id="tag-viewfinder-cutout">
                  <rect width="1600" height="900" fill="white" />
                  <rect
                    x="687.5"
                    y="250"
                    width="225"
                    height="400"
                    rx="28"
                    ry="28"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                width="1600"
                height="900"
                fill="rgba(0, 0, 0, 0.6)"
                mask="url(#tag-viewfinder-cutout)"
              />
              <rect
                x="687.5"
                y="250"
                width="225"
                height="400"
                rx="28"
                ry="28"
                fill="none"
                stroke="#e94560"
                strokeWidth="3"
              />
            </svg>
          )}

          {instructionText && (
            <p className="pointer-events-none absolute left-1/2 top-[12%] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white">
              {instructionText}
            </p>
          )}

          {onCapture && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <ScanButton onCapture={onCapture} isLoading={isCapturing} />
            </div>
          )}
        </>
      )}

      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          Camera inactive
        </div>
      )}
    </div>
  );
}
