"use client";

import { useConvexAuth } from "convex/react";

/**
 * ConvexStatus displays a non-intrusive indicator when the Convex connection
 * is loading or unavailable. Renders nothing when fully connected.
 */
export function ConvexStatus() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-background/90 border border-border px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur-sm"
    >
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
      Connecting…
    </div>
  );
}
