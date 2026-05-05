"use client";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE: Record<Size, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-[3px]",
  lg: "h-10 w-10 border-4",
  xl: "h-14 w-14 border-[5px]",
};

export default function Spinner({
  size = "md",
  label,
  className = "",
  fullScreen = false,
}: {
  size?: Size;
  label?: string;
  className?: string;
  fullScreen?: boolean;
}) {
  const ring = (
    <span
      role="status"
      aria-label={label || "Loading"}
      className={`inline-block animate-spin rounded-full border-gray-200 border-t-[#4b7eff] ${SIZE[size]} ${className}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-[calc(100dvh-64px)] grid place-items-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
        <div className="flex flex-col items-center gap-3 text-center">
          {ring}
          {label && <p className="text-sm text-gray-500">{label}</p>}
        </div>
      </div>
    );
  }

  if (label) {
    return (
      <div className="inline-flex items-center gap-2">
        {ring}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
    );
  }

  return ring;
}