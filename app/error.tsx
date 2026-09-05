"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BookOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF6F0] dark:bg-[#1C1714] text-[#3D2C2E] dark:text-[#FAF6F0] text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-300 mb-6">
        <BookOpen className="w-8 h-8 opacity-80" />
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
        A Disturbance in the Chronicle
      </h1>

      <p className="text-sm sm:text-base max-w-md text-[#7C5C5E] dark:text-[#CBB2A3] leading-relaxed mb-8">
        An unexpected anomaly occurred while reading this chapter. You can attempt to restore the page session.
      </p>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => {
            if (
              error?.message?.includes("ChunkLoadError") ||
              error?.message?.includes("Loading chunk")
            ) {
              window.location.reload();
            } else {
              reset();
            }
          }}
          className="px-6 py-3 rounded-2xl bg-[#5C3317] hover:bg-[#43220F] text-[#FAF6F0] font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Session</span>
        </Button>

        <Link href="/">
          <Button variant="outline" className="px-6 py-3 rounded-2xl text-sm font-semibold cursor-pointer">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
