"use client";

import { useEffect } from "react";

/**
 * Global component that ensures URL hash fragments (e.g. #chapter-showcase)
 * are stripped cleanly on page load / refresh across all routes, keeping clean URLs.
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
  }, []);

  return null;
}
