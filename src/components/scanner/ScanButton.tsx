"use client";

interface ScanButtonProps {
  onCapture: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ScanButton({
  onCapture,
  disabled = false,
  isLoading = false,
}: ScanButtonProps) {
  const isIdle = !disabled && !isLoading;

  return (
    <button
      onClick={onCapture}
      disabled={disabled || isLoading}
      className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#e94560] transition-transform active:scale-95 active:animate-none disabled:opacity-50 ${
        isIdle ? "animate-scale-pulse" : ""
      }`}
      aria-label={isLoading ? "Scanning tag" : "Capture tag photo"}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"
          aria-hidden
        />
      ) : (
        <div className="h-12 w-12 rounded-full border-2 border-white/50" aria-hidden />
      )}
    </button>
  );
}
