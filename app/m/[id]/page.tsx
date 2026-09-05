"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Volume2, VolumeX, Moon, BookOpen, RefreshCw } from "lucide-react";
import { PublicSanctumMoment, OCCASION_CONFIGS } from "@/lib/moments-types";
import MomentCardRenderer from "@/components/moments/moment-card-renderer";
import MomentPasscodeLock from "@/components/moments/moment-passcode-lock";
import MomentParticles from "@/components/moments/moment-particles";
import { ambientAudioEngine, stopAllAudio } from "@/lib/ambient-audio";
import { getMomentById } from "@/lib/moments-service";

export default function PublicMomentPage() {
  const params = useParams();
  const momentId = typeof params?.id === "string" ? params.id : "";

  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [moment, setMoment] = React.useState<PublicSanctumMoment | null>(null);
  const [soundPlaying, setSoundPlaying] = React.useState<boolean>(false);
  const [retryNonce, setRetryNonce] = React.useState<number>(0);

  // Audio cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // 1. Fetch sanitized moment from Firestore via public-read API with timeout and fallback
  React.useEffect(() => {
    if (!momentId) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    async function fetchMoment() {
      setLoading(true);
      setError(null);
      try {
        const savedPasscode =
          typeof sessionStorage !== "undefined"
            ? sessionStorage.getItem(`echotale_passcode_${momentId}`)
            : null;

        const headers: Record<string, string> = {};
        if (savedPasscode) {
          headers["x-keepsake-password"] = savedPasscode;
        }

        const res = await fetch(`/api/moments/${momentId}`, {
          headers,
          signal: controller.signal,
        });
        const data = await res.json();

        if (!res.ok) {
          // If 401 because of incorrect stored passcode, clear stale passcode & fetch locked stub
          if (res.status === 401 && savedPasscode) {
            sessionStorage.removeItem(`echotale_passcode_${momentId}`);
            const retryRes = await fetch(`/api/moments/${momentId}`);
            const retryData = await retryRes.json();
            if (retryRes.ok && retryData.moment) {
              setMoment(retryData.moment);
              return;
            }
          }
          throw new Error(data.message || "Failed to find this Sanctum Moment.");
        }

        if (data.moment) {
          setMoment(data.moment);
          return;
        }
        throw new Error("Sanctum Moment data was empty.");
      } catch (err: unknown) {
        // Fallback: Check local storage for moment if offline or network failure
        const localMoment = getMomentById(momentId);
        if (localMoment) {
          const sanitizedQuizzes = (localMoment.quizzes || []).map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
          }));
          const displayMessage =
            localMoment.usePolished && localMoment.polishedMessage
              ? localMoment.polishedMessage
              : localMoment.rawMessage;

          setMoment({
            id: localMoment.id,
            occasion: localMoment.occasion,
            recipientName: localMoment.recipientName,
            senderName: localMoment.senderName,
            displayMessage,
            hasPolishedOption: Boolean(
              localMoment.polishedMessage &&
                localMoment.polishedMessage !== localMoment.rawMessage
            ),
            photoPaths: localMoment.photoPaths || [],
            quizzes: sanitizedQuizzes,
            createdAt: localMoment.createdAt,
            viewCount: localMoment.viewCount || 0,
            isPasswordProtected: Boolean(localMoment.isPasswordProtected),
            isUnlocked: !localMoment.isPasswordProtected,
            passwordHint: localMoment.passwordHint,
          });
          return;
        }

        const msg =
          err instanceof Error
            ? err.name === "AbortError"
              ? "Connection took longer than expected. Please retry."
              : err.message
            : "This moment has faded into the ether.";
        setError(msg);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }

    fetchMoment();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [momentId, retryNonce]);

  // Audio atmosphere toggle
  const handleToggleSound = async () => {
    const isNowPlaying = await ambientAudioEngine.toggle(
      moment?.ambientAudioTrack || "/audio/ambient-pad.mp3"
    );
    setSoundPlaying(isNowPlaying);
  };

  const handleUnlockSuccess = (unlockedMoment: PublicSanctumMoment) => {
    setMoment(unlockedMoment);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-950 text-white select-none">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin mb-4" />
        <p className="font-serif italic text-sm text-amber-200/80">
          Unfolding the Sanctum chamber...
        </p>
      </div>
    );
  }

  if (error || !moment) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-950 text-white text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Moon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold tracking-tight">
          Moment Not Found
        </h2>
        <p className="text-sm opacity-70 mt-2 max-w-sm mx-auto font-serif italic mb-6">
          {error || "This keepsake link does not exist or has dissolved into the ether."}
        </p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoading(true);
            setRetryNonce((n) => n + 1);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-200 text-xs tracking-wider uppercase font-sans font-medium transition-all cursor-pointer shadow-lg active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Unfolding</span>
        </button>
      </div>
    );
  }

  const isLocked = Boolean(moment.isPasswordProtected && !moment.isUnlocked);
  const config = OCCASION_CONFIGS[moment.occasion] || OCCASION_CONFIGS.love;

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden bg-slate-950 text-white selection:bg-amber-500/30 flex flex-col">
      {/* Recipient-Facing Chrome: Top-left mark & Audio Atmosphere toggle only */}
      <header className="fixed top-4 left-4 right-4 z-40 max-w-4xl mx-auto flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md pointer-events-auto shadow-md">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-serif italic text-white/90">
            EchoTale Sanctum
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleSound}
          className="p-2.5 rounded-full bg-black/40 border border-white/10 hover:bg-black/60 text-white/80 transition-all backdrop-blur-md cursor-pointer pointer-events-auto shadow-md active:scale-95"
          title={soundPlaying ? "Mute Atmosphere" : "Play Atmosphere"}
        >
          {soundPlaying ? (
            <Volume2 className="w-4 h-4 text-amber-400" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
      </header>

      {/* Render Locked Experience OR Interactive Card Renderer */}
      {isLocked ? (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8">
          {/* Background Ambient Gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${config.bgGradient} opacity-90 pointer-events-none z-0`}
          />
          {/* Floating Atmospheric Particles */}
          <MomentParticles occasion={moment.occasion} density="low" />

          {/* Passcode Lock Challenge */}
          <MomentPasscodeLock
            occasion={moment.occasion}
            recipientName={moment.recipientName}
            senderName={moment.senderName}
            passwordHint={moment.passwordHint}
            onUnlockSuccess={handleUnlockSuccess}
            momentId={moment.id}
          />
        </div>
      ) : (
        /* Authoritative Shared Renderer: Owns 100% of visuals, motion & theme */
        <MomentCardRenderer moment={moment} fullScreen={true} />
      )}
    </div>
  );
}
