"use client";

export default function SuspenseFallback() {
  return (
    <div className="animate-pulse p-6 space-y-4">
      {/* Top loading bar */}
      <div className="h-1 w-full bg-gray-200 overflow-hidden rounded-full">
        <div className="h-full w-1/3 bg-black animate-loading-bar"></div>
      </div>

      {/* Page title skeleton */}
      <div className="h-8 w-1/3 rounded bg-gray-200"></div>

      {/* Content blocks */}
      <div className="h-4 w-full rounded bg-gray-200"></div>
      <div className="h-4 w-5/6 rounded bg-gray-200"></div>
      <div className="h-4 w-2/3 rounded bg-gray-200"></div>
      <div className="h-4 w-full rounded bg-gray-200"></div>
    </div>
  );
}
