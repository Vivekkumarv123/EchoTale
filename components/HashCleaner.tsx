"use client";

import { useEffect } from "react";

/**
 * Global component that:
 * 1. Strips URL hash fragments cleanly on refresh.
 * 2. Catches ChunkLoadError (when browser holds stale chunk references after a server update)
 *    and seamlessly reloads the page once to pull the latest asset manifest.
 */
export function HashCleaner() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (window.location.hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    // Auto-recover from stale Webpack chunks across client navigation
    const handleError = (e: ErrorEvent | PromiseRejectionEvent) => {
      const msg = "message" in e ? e.message : (e as any)?.reason?.message || "";
      if (
        typeof msg === "string" &&
        (msg.includes("ChunkLoadError") ||
          msg.includes("Loading chunk") ||
          msg.includes("Failed to fetch dynamically imported module"))
      ) {
        const key = "echotale_chunk_reload_ts";
        const now = Date.now();
        const last = parseInt(sessionStorage.getItem(key) || "0", 10);
        if (now - last > 8000) {
          sessionStorage.setItem(key, now.toString());
          window.location.reload();
        }
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, []);

  return null;
}
