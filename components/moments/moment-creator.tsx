"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "qrcode";
import {
  Heart,
  Sparkles,
  Feather,
  Home,
  Moon,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  Copy,
  Share2,
  Smartphone,
  Monitor,
  Download,
  Printer,
  Mail,
  MessageCircle,
  Wand2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  X,
  Gift,
  RotateCcw,
  Lock,
  KeyRound,
  ShieldCheck,
  EyeOff,
} from "lucide-react";
import {
  MomentOccasion,
  QuizQuestion,
  SanctumMoment,
  MomentRenderableData,
  OCCASION_CONFIGS,
  cleanSenderName,
} from "@/lib/moments-types";
import {
  createSanctumMoment,
  uploadMomentPhotos,
} from "@/lib/moment-service";
import { saveFinalizedMoment } from "@/lib/moments-service";
import MomentCardRenderer from "@/components/moments/moment-card-renderer";
import { auth } from "@/lib/firebase-client";

interface MomentCreatorProps {
  onCancel?: () => void;
  onClose?: () => void;
  onMomentCreated?: (moment: SanctumMoment) => void;
  onSave?: (moment?: SanctumMoment) => void;
  sourceChapterId?: string;
  initialOccasion?: MomentOccasion;
  initialMoment?: SanctumMoment;
}

interface PhotoItem {
  id: string;
  file?: File;
  previewUrl: string;
}

export default function MomentCreator({
  onCancel,
  onClose,
  onMomentCreated,
  onSave,
  sourceChapterId,
  initialOccasion = "love",
  initialMoment,
}: MomentCreatorProps) {
  const handleDismiss = onClose || onCancel;
  const handleCreated = onMomentCreated || onSave;

  // ─── WIZARD STEP STATE (1: Write, 2: Preview, 3: Share) ─────────────────────
  const [step, setStep] = React.useState<1 | 2 | 3>(1);

  // ─── OCCASION & CORE MESSAGE STATE ──────────────────────────────────────────
  const [occasion, setOccasion] = React.useState<MomentOccasion>(initialMoment?.occasion || initialOccasion);
  const [recipientName, setRecipientName] = React.useState<string>(initialMoment?.recipientName || "");
  const [senderName, setSenderName] = React.useState<string>(
    initialMoment?.senderName || cleanSenderName(auth.currentUser?.displayName) || ""
  );
  const [rawMessage, setRawMessage] = React.useState<string>(initialMoment?.rawMessage || "");
  const [polishedMessage, setPolishedMessage] = React.useState<string>(initialMoment?.polishedMessage || "");
  const [polishedTitle, setPolishedTitle] = React.useState<string>("");
  const [usePolished, setUsePolished] = React.useState<boolean>(initialMoment?.usePolished || false);

  // AI Polish Loading & Error States
  const [isPolishing, setIsPolishing] = React.useState<boolean>(false);
  const [polishError, setPolishError] = React.useState<string | null>(null);

  // ─── PHOTO DROPZONE STATE ───────────────────────────────────────────────────
  const [photos, setPhotos] = React.useState<PhotoItem[]>([]);
  const [isDraggingPhoto, setIsDraggingPhoto] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // ─── TRIVIA QUIZ BUILDER STATE ──────────────────────────────────────────────
  const [quizzes, setQuizzes] = React.useState<QuizQuestion[]>([]);

  // ─── STEP 2 PREVIEW STATE ───────────────────────────────────────────────────
  const [previewViewport, setPreviewViewport] = React.useState<"mobile" | "full">("mobile");
  const [previewEnvelopeOpened, setPreviewEnvelopeOpened] = React.useState<boolean>(true);
  const [previewQuizAnswers, setPreviewQuizAnswers] = React.useState<Record<string, number>>({});
  const [activePhotoIndex, setActivePhotoIndex] = React.useState<number>(0);
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true);

  // ─── STEP 3 SHARING & PUBLISHING STATE ──────────────────────────────────────
  const [isPublishing, setIsPublishing] = React.useState<boolean>(false);
  const [publishError, setPublishError] = React.useState<string | null>(null);
  const [finalMoment, setFinalMoment] = React.useState<SanctumMoment | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState<string>("");
  const [copiedLink, setCopiedLink] = React.useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = React.useState<boolean>(false);

  // ─── PASSCODE PROTECTION STATE ──────────────────────────────────────────────
  const [isPasswordProtected, setIsPasswordProtected] = React.useState<boolean>(
    Boolean(initialMoment?.isPasswordProtected)
  );
  const [passcode, setPasscode] = React.useState<string>("");
  const [passcodeHint, setPasscodeHint] = React.useState<string>(
    initialMoment?.passwordHint || ""
  );
  const [showPasscode, setShowPasscode] = React.useState<boolean>(false);
  const [copiedPasscode, setCopiedPasscode] = React.useState<boolean>(false);
  const [copiedBoth, setCopiedBoth] = React.useState<boolean>(false);

  // ─── LOCAL DRAFT BUFFER STATUS ──────────────────────────────────────────────
  const [lastSavedTime, setLastSavedTime] = React.useState<string>("Just now");

  const activeTheme = OCCASION_CONFIGS[occasion];

  // Auto-fill starter message when changing occasion if raw message is empty
  const handleSelectOccasion = (occ: MomentOccasion) => {
    setOccasion(occ);
    if (!rawMessage || rawMessage.trim() === "") {
      setRawMessage(OCCASION_CONFIGS[occ].defaultPromptStarter);
    }
  };

  // Update draft buffer indicator
  React.useEffect(() => {
    const timer = setInterval(() => {
      setLastSavedTime("Just now");
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // ─── AI POLISH TRIGGER (PERSONA D) ──────────────────────────────────────────
  const handleTriggerPolish = async () => {
    if (!rawMessage || rawMessage.trim().length < 5) {
      setPolishError("Please write at least a few words before polishing.");
      return;
    }

    setIsPolishing(true);
    setPolishError(null);

    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : null;

      const response = await fetch("/api/moments/polish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rawMessage,
          occasion,
          recipientName: recipientName.trim() || "My Dear Friend",
          senderName: cleanSenderName(senderName.trim()) || cleanSenderName(user?.displayName) || "Someone Who Cares",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to refine moment.");
      }

      if (data.polishedMessage) {
        setPolishedMessage(data.polishedMessage);
        setPolishedTitle(data.title || `${activeTheme.title} for ${recipientName || "You"}`);
        setUsePolished(true); // Default to using the polished version once generated
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to refine with Gemini.";
      setPolishError(msg);
    } finally {
      setIsPolishing(false);
    }
  };

  // ─── PHOTO HANDLING ─────────────────────────────────────────────────────────
  const handlePhotoFiles = (files: FileList | null) => {
    if (!files) return;
    const remainingSlots = 4 - photos.length;
    if (remainingSlots <= 0) return;

    const newPhotos: PhotoItem[] = [];
    const validCount = Math.min(files.length, remainingSlots);

    for (let i = 0; i < validCount; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) continue; // 5MB limit

      const previewUrl = URL.createObjectURL(file);
      newPhotos.push({
        id: `photo_${Date.now()}_${i}`,
        file,
        previewUrl,
      });
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.previewUrl && item.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // ─── QUIZ BUILDER HANDLERS ──────────────────────────────────────────────────
  const handleAddQuizQuestion = () => {
    if (quizzes.length >= 3) return;
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}`,
      question: "",
      options: ["", "", ""],
      correctIndex: 0,
    };
    setQuizzes((prev) => [...prev, newQ]);
  };

  const handleUpdateQuestion = (index: number, questionText: string) => {
    setQuizzes((prev) => {
      const updated = [...prev];
      updated[index].question = questionText;
      return updated;
    });
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, optText: string) => {
    setQuizzes((prev) => {
      const updated = [...prev];
      updated[qIndex].options[optIndex] = optText;
      return updated;
    });
  };

  const handleSetCorrectIndex = (qIndex: number, optIndex: number) => {
    setQuizzes((prev) => {
      const updated = [...prev];
      updated[qIndex].correctIndex = optIndex;
      return updated;
    });
  };

  const handleRemoveQuizQuestion = (qIndex: number) => {
    setQuizzes((prev) => prev.filter((_, i) => i !== qIndex));
  };

  // ─── STEP 3 PUBLISH ACTION ──────────────────────────────────────────────────
  const handleFinalPublish = async () => {
    setIsPublishing(true);
    setPublishError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be signed in to preserve and share this moment.");
      }

      // 1. Upload photo files to Storage or create fallback URLs
      const filesToUpload = photos.map((p) => p.file).filter(Boolean) as File[];
      let uploadedPhotoUrls: string[] = [];

      if (filesToUpload.length > 0) {
        const tempId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
        uploadedPhotoUrls = await uploadMomentPhotos(user.uid, tempId, filesToUpload);
      } else {
        uploadedPhotoUrls = photos.map((p) => p.previewUrl);
      }

      // Filter out empty trivia questions
      const validQuizzes = quizzes.filter(
        (q) => q.question.trim().length > 0 && q.options.some((opt) => opt.trim().length > 0)
      );

      // 2. Write finalized SanctumMoment to Firestore
      const createdMoment = await createSanctumMoment(
        {
          occasion,
          recipientName: recipientName.trim() || "My Dear Friend",
          senderName: cleanSenderName(senderName.trim()) || cleanSenderName(user.displayName) || "Someone Who Cares",
          rawMessage: rawMessage.trim(),
          polishedMessage: polishedMessage.trim() ? polishedMessage.trim() : undefined,
          usePolished,
          quizzes: validQuizzes,
          sourceChapterId: sourceChapterId ? sourceChapterId.trim() : undefined,
          isPasswordProtected: Boolean(isPasswordProtected && passcode.trim()),
          password: passcode.trim(),
          passwordHint: passcodeHint.trim() || undefined,
        },
        uploadedPhotoUrls,
        initialMoment?.id
      );

      setFinalMoment(createdMoment);

      // 3. Generate QR Code Canvas Data URL
      const shareUrl = `${window.location.origin}/m/${createdMoment.id}`;
      const qrUrl = await QRCode.toDataURL(shareUrl, {
        width: 380,
        margin: 2,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      });
      setQrCodeDataUrl(qrUrl);

      setStep(3);
      try {
        saveFinalizedMoment(createdMoment);
      } catch {
        // non-blocking
      }
      if (handleCreated) {
        handleCreated(createdMoment);
      }
    } catch (err: unknown) {
      console.error("Publishing error:", err);
      const msg = err instanceof Error ? err.message : "Failed to publish moment.";
      setPublishError(msg);
    } finally {
      setIsPublishing(false);
    }
  };

  // ─── SHARING HANDLERS ───────────────────────────────────────────────────────
  const getMomentShareUrl = () => {
    if (!finalMoment) return "";
    return `${window.location.origin}/m/${finalMoment.id}`;
  };

  const handleCopyLink = async () => {
    const url = getMomentShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyPasscode = async () => {
    if (!passcode.trim()) return;
    try {
      await navigator.clipboard.writeText(passcode.trim());
      setCopiedPasscode(true);
      setTimeout(() => setCopiedPasscode(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyLinkAndPasscode = async () => {
    const url = getMomentShareUrl();
    if (!url) return;
    const text = `Here is a private digital keepsake crafted for you on EchoTale:
${url}

🔒 Secret Passcode to unlock: ${passcode.trim()}${passcodeHint.trim() ? `\n(Clue: ${passcodeHint.trim()})` : ""}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBoth(true);
      setTimeout(() => setCopiedBoth(false), 2500);
    } catch {
      // Fallback
    }
  };

  const getWhatsAppShareUrl = () => {
    const url = getMomentShareUrl();
    let message = `I crafted a private keepsake for you on EchoTale: ${url}`;
    if (isPasswordProtected && passcode.trim()) {
      message += `\n\n🔒 Passcode to unlock: ${passcode.trim()}`;
      if (passcodeHint.trim()) {
        message += ` (Clue: ${passcodeHint.trim()})`;
      }
    }
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };

  const getEmailShareUrl = () => {
    const url = getMomentShareUrl();
    const subject = `A Sanctum Moment for ${recipientName || "You"}`;
    let body = `Dearest ${recipientName || "Friend"},\n\nI crafted a personal digital keepsake for you:\n${url}`;
    if (isPasswordProtected && passcode.trim()) {
      body += `\n\n🔒 Secret Passcode to unlock: ${passcode.trim()}`;
      if (passcodeHint.trim()) {
        body += `\nClue: ${passcodeHint.trim()}`;
      }
    }
    body += `\n\nWith love,\n${senderName || "Someone Special"}`;
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleNativeShare = async () => {
    const url = getMomentShareUrl();
    if (!url) return;

    let text = `${senderName || "Someone"} crafted a personal digital keepsake for you on EchoTale.`;
    if (isPasswordProtected && passcode.trim()) {
      text += ` Passcode to unlock: ${passcode.trim()}`;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `A Sanctum Moment for ${recipientName || "You"}`,
          text,
          url,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQrPng = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeDataUrl;
    a.download = `SanctumMoment-${recipientName || "Keepsake"}-QR.png`;
    a.click();
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* ─── STICKY WIZARD STEP HEADER ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 p-4 sm:p-6 border-b border-white/10 shrink-0 bg-slate-950/90 backdrop-blur-md z-20">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Sanctum Moments
            </span>
            <span className="text-xs opacity-50 font-mono hidden sm:inline">
              Step {step} of 3 &bull; Draft buffer {lastSavedTime}
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-serif font-bold tracking-tight text-amber-100">
            {step === 1 && "Write Your Heart Out"}
            {step === 2 && "Preview & Perfect"}
            {step === 3 && "Share the Keepsake"}
          </h2>
        </div>

        {/* Step Indicator Badges & Close Action */}
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: "Write" },
            { num: 2, label: "Preview" },
            { num: 3, label: "Share" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              disabled={s.num === 3 && !finalMoment}
              onClick={() => {
                if (s.num === 1) setStep(1);
                if (s.num === 2) setStep(2);
                if (s.num === 3 && finalMoment) setStep(3);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                step === s.num
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : step > s.num
                  ? "bg-white/10 opacity-90 hover:opacity-100 text-white"
                  : "bg-white/5 opacity-40 cursor-not-allowed text-white"
              }`}
            >
              {step > s.num ? <Check className="w-3.5 h-3.5" /> : <span>{s.num}.</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}

          {handleDismiss && (
            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
              title="Close Wizard"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ─── SCROLLABLE WIZARD CONTENT CONTAINER ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-8 space-y-8">
        {/* Step Subtitle / Guidance */}
        <p className="text-xs sm:text-sm text-slate-300 font-serif italic -mt-2">
          {step === 1 && "Pour out your unfiltered feelings or let Gemini elevate the emotional resonance."}
          {step === 2 && "Inspect the exact experience your recipient will unfold on their screen."}
          {step === 3 && "Your digital keepsake is sealed with a unique cryptographic link and QR code."}
        </p>

      {/* ═══════════════════════════════════════════════════════════════════════
          STEP 1: WRITE YOUR HEART OUT (Theme & Content Creation)
      ═══════════════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-8"
        >
          {/* 1. OCCASION SELECTOR (5 Cards) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-3">
              1. Choose Life Occasion & Atmosphere
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(Object.keys(OCCASION_CONFIGS) as MomentOccasion[]).map((occKey) => {
                const conf = OCCASION_CONFIGS[occKey];
                const isSelected = occasion === occKey;
                return (
                  <button
                    key={occKey}
                    type="button"
                    onClick={() => handleSelectOccasion(occKey)}
                    style={
                      isSelected
                        ? {
                            backgroundColor: conf.palette.cardBase,
                            borderColor: conf.palette.accent,
                            boxShadow: `0 8px 24px -4px ${conf.glowColor}`,
                          }
                        : undefined
                    }
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? "text-white ring-2 ring-amber-400/60 scale-[1.02]"
                        : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{conf.emoji}</span>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm"
                          style={{
                            color: conf.palette.accent,
                            borderColor: `${conf.palette.accent}66`,
                            backgroundColor: `${conf.palette.primaryBg}aa`,
                          }}
                        >
                          {occKey === "birthday"
                            ? "🎁 Gift Box"
                            : occKey === "love"
                            ? "💌 Wax Seal"
                            : occKey === "apology"
                            ? "🕊️ Lotus Water"
                            : occKey === "family"
                            ? "🏡 Hearth Chest"
                            : "🌙 Star Lantern"}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm tracking-tight">{conf.title}</h4>
                      <p className="text-[11px] opacity-75 mt-1 line-clamp-2 leading-relaxed">
                        {conf.subtitle}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-medium opacity-90">
                      <span className="truncate">{conf.sealLabel}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. RECIPIENT & SENDER NAMES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-2">
                Recipient&apos;s Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Maya, Mom & Dad, My Dearest Alex"
                maxLength={60}
                className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-2">
                Your Name / Sign-off <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Jordan, Your Grateful Son"
                maxLength={60}
                className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* 3. MESSAGE COMPOSER & AI POLISH CHOICE (PERSONA D) */}
          <div className="rounded-3xl p-6 border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-3">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
                <Feather className="w-4 h-4 text-amber-400" />
                <span>2. Your Raw Narrative or Unfiltered Thoughts</span>
              </label>
              <span className="text-xs font-mono opacity-50">
                {rawMessage.length} characters
              </span>
            </div>

            <textarea
              rows={6}
              value={rawMessage}
              onChange={(e) => setRawMessage(e.target.value)}
              placeholder="Write your raw, unpolished feelings here. Don't worry about perfect grammar or structure—pour your heart out..."
              className="w-full p-4 rounded-2xl bg-white/50 dark:bg-black/40 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm leading-relaxed font-serif"
            />

            {/* AI POLISHING ACTION BAR */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-500/10 dark:bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-sm">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Let Gemini Refine It</h4>
                  <p className="text-[11px] opacity-75">
                    Transforms raw thoughts into a refined keepsake while preserving your exact truths and voice.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleTriggerPolish}
                  disabled={isPolishing || rawMessage.trim().length < 5}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isPolishing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Refining Tone...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Refine Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {polishError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{polishError}</span>
              </div>
            )}

            {/* SIDE-BY-SIDE POLISHED COMPARISON IF GENERATED */}
            {polishedMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Gemini Polished Version ({polishedTitle || "Keepsake"})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUsePolished(!usePolished)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        usePolished
                          ? "bg-amber-500 text-black"
                          : "bg-black/20 dark:bg-white/10 text-white/80"
                      }`}
                    >
                      {usePolished ? "✓ Using Polished" : "Using Raw Draft"}
                    </button>
                  </div>
                </div>

                <p className="text-xs font-serif leading-relaxed italic opacity-90 p-3 rounded-xl bg-black/20 dark:bg-black/40 border border-white/5 whitespace-pre-wrap">
                  {polishedMessage}
                </p>
              </motion.div>
            )}
          </div>

          {/* 4. PHOTO DROPZONE (Max 4 Memory Images) */}
          <div className="rounded-3xl p-6 border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <label className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span>3. Memory Photos ({photos.length}/4)</span>
              </label>
              <span className="text-xs opacity-50 font-mono">PNG, JPG, WebP up to 5MB</span>
            </div>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handlePhotoFiles(e.target.files)}
              className="hidden"
            />

            {/* Dropzone Container */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPhoto(true);
              }}
              onDragLeave={() => setIsDraggingPhoto(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingPhoto(false);
                handlePhotoFiles(e.dataTransfer.files);
              }}
              onClick={() => {
                if (photos.length < 4 && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                isDraggingPhoto
                  ? "border-amber-400 bg-amber-500/10"
                  : photos.length >= 4
                  ? "border-black/10 dark:border-white/10 opacity-50 cursor-not-allowed"
                  : "border-black/20 dark:border-white/20 hover:border-amber-400 hover:bg-amber-500/5"
              }`}
            >
              <ImageIcon className="w-8 h-8 opacity-60 text-amber-400" />
              <p className="text-xs font-semibold">
                {photos.length >= 4
                  ? "Maximum 4 memory photos attached"
                  : "Drag & drop photos here, or click to browse"}
              </p>
              <p className="text-[11px] opacity-60">
                These will illuminate the recipient&apos;s digital keepsake gallery.
              </p>
            </div>

            {/* Photo Thumbnails */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {photos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-xl overflow-hidden aspect-square border border-black/10 dark:border-white/10 bg-black/40"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.previewUrl}
                      alt={`Memory ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto(photo.id);
                      }}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 hover:bg-red-500 text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/60 text-white">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. INTERACTIVE TRIVIA QUIZ BUILDER (1-3 Questions) */}
          <div className="rounded-3xl p-6 border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>4. Interactive Memory Trivia Quiz (Optional)</span>
                </label>
                <p className="text-[11px] opacity-60 mt-0.5">
                  Test your recipient on shared memories or inside jokes before they unlock the message.
                </p>
              </div>

              {quizzes.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddQuizQuestion}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question ({quizzes.length}/3)</span>
                </button>
              )}
            </div>

            {quizzes.length === 0 ? (
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/10 text-center text-xs opacity-60">
                No trivia questions added. Click &quot;Add Question&quot; above to create a playful memory test.
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-amber-400">
                        Question #{qIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuizQuestion(qIdx)}
                        className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(qIdx, e.target.value)}
                      placeholder="e.g. What song was playing during our spontaneous midnight drive?"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/60 dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />

                    <div className="space-y-2 pt-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block">
                        Options (select the radio button next to the correct answer)
                      </label>
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct_${q.id}`}
                            checked={q.correctIndex === optIdx}
                            onChange={() => handleSetCorrectIndex(qIdx, optIdx)}
                            className="w-4 h-4 accent-amber-500 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white/40 dark:bg-black/30 border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── SECTION 6: PASSCODE PROTECTION (LOCK KEEPSAKE) ───────── */}
          <div className="rounded-3xl p-6 border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
                    <span>Passcode Protection</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Privacy Seal
                    </span>
                  </h3>
                  <p className="text-xs opacity-60">
                    Lock your keepsake with a secret passcode so only your chosen recipient can open it.
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isPasswordProtected}
                onClick={() => setIsPasswordProtected(!isPasswordProtected)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  isPasswordProtected ? "bg-amber-500" : "bg-black/20 dark:bg-white/20"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isPasswordProtected ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <AnimatePresence>
              {isPasswordProtected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-3 border-t border-black/10 dark:border-white/10"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-1.5 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                        <span>Secret Passcode *</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPasscode ? "text" : "password"}
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder="e.g. secret2024, ourfirsttrip"
                          className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-white/50 dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasscode(!showPasscode)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
                          title={showPasscode ? "Hide Passcode" : "Show Passcode"}
                        >
                          {showPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[11px] opacity-50 mt-1">
                        Choose a memorable word, date, or phrase only they will know.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-1.5 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Passcode Clue / Hint (Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={passcodeHint}
                        onChange={(e) => setPasscodeHint(e.target.value)}
                        placeholder="e.g. The nickname you gave me in college"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/50 dark:bg-black/40 border border-black/10 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <p className="text-[11px] opacity-50 mt-1">
                        Shown on the unlock screen to give them a hint without revealing the answer.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200/90 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      Protected with PBKDF2 cryptographic hashing. Anyone without this passcode will be blocked from reading your letter or opening memories.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STEP 1 NAVIGATION CONTROLS */}
          <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold opacity-70 hover:opacity-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {isPasswordProtected && !passcode.trim() && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  Enter a secret passcode to continue
                </span>
              )}
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={rawMessage.trim().length < 5 || (isPasswordProtected && !passcode.trim())}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span>Preview & Perfect</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          STEP 2: PREVIEW & PERFECT (Live Interactive Renderer)
      ═══════════════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="space-y-6"
        >
          {/* Top Preview Control Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Live Recipient Experience
              </span>
              <span className="text-xs opacity-60 font-mono">
                Theme: {activeTheme.title}
              </span>
            </div>

            {/* Viewport Switcher & Polished Version Toggle */}
            <div className="flex items-center gap-2">
              {isPasswordProtected && passcode.trim() && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 font-mono">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Passcode: {passcode.trim()}</span>
                </span>
              )}

              {polishedMessage && (
                <button
                  type="button"
                  onClick={() => setUsePolished(!usePolished)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    usePolished
                      ? "bg-amber-500 text-black border-amber-500"
                      : "bg-black/20 text-white/80 border-white/10"
                  }`}
                >
                  {usePolished ? "✨ Gemini Polished View" : "📝 Raw Draft View"}
                </button>
              )}

              {/* Unboxing Ceremony Test vs Keepsake Card Toggle */}
              <button
                type="button"
                onClick={() => setPreviewEnvelopeOpened((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  !previewEnvelopeOpened
                    ? "bg-amber-500 text-black border-amber-500 shadow-md"
                    : "bg-black/20 dark:bg-black/40 text-white/80 border-white/10 hover:bg-black/40"
                }`}
                title="Test interactive recipient unboxing experience"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{!previewEnvelopeOpened ? "Testing Unboxing..." : "Test Unboxing Ceremony"}</span>
              </button>

              <div className="flex items-center bg-black/20 dark:bg-black/40 rounded-xl p-0.5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewViewport("mobile")}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    previewViewport === "mobile" ? "bg-amber-500 text-black font-bold" : "opacity-60"
                  }`}
                  title="Mobile Viewport"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("full")}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    previewViewport === "full" ? "bg-amber-500 text-black font-bold" : "opacity-60"
                  }`}
                  title="Full Viewport"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* PREVIEW FRAME CONTAINER */}
          <div className="flex justify-center w-full py-2">
            <div
              className={`transition-all duration-500 relative overflow-hidden rounded-[2.5rem] shadow-2xl border ${
                previewViewport === "mobile"
                  ? "w-full max-w-[420px] min-h-[720px] border-black/40 dark:border-white/20 bg-slate-950"
                  : "w-full max-w-4xl min-h-[640px] border-black/20 dark:border-white/10 bg-slate-950"
              }`}
            >
              {/* Mobile Frame Speaker / Notch Bar */}
              {previewViewport === "mobile" && (
                <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-3 pb-1 pointer-events-none">
                  <div className="w-24 h-4 bg-black/60 rounded-full flex items-center justify-center">
                    <div className="w-10 h-1 bg-white/20 rounded-full" />
                  </div>
                </div>
              )}

              {/* Authoritative Shared Moment Card Renderer */}
              <MomentCardRenderer
                moment={{
                  occasion,
                  recipientName: recipientName.trim() || "My Dear Friend",
                  senderName: cleanSenderName(senderName) || "Someone Special",
                  rawMessage,
                  polishedMessage,
                  usePolished,
                  displayMessage:
                    usePolished && polishedMessage ? polishedMessage : rawMessage,
                  photoPaths: photos.map((p) => p.previewUrl),
                  quizzes: quizzes.filter((q) => q.question.trim().length > 0),
                  createdAt: new Date().toISOString(),
                }}
                fullScreen={false}
              />
            </div>
          </div>

          {publishError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{publishError}</span>
            </div>
          )}

          {/* STEP 2 NAVIGATION CONTROLS */}
          <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-2xl bg-black/10 dark:bg-white/10 hover:bg-black/20 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit</span>
            </button>

            <button
              type="button"
              onClick={handleFinalPublish}
              disabled={isPublishing}
              className="px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sealing Moment & Uploading...</span>
                </>
              ) : (
                <>
                  <span>Seal & Generate Share Link</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          STEP 3: SHARE THE LOVE (Distribution Engine)
      ═══════════════════════════════════════════════════════════════════════ */}
      {step === 3 && finalMoment && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="space-y-8"
        >
          {/* Success Banner */}
          <div className="text-center space-y-2 py-4">
            <div className="w-14 h-14 rounded-3xl bg-amber-500 text-black flex items-center justify-center mx-auto shadow-xl">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-serif font-bold tracking-tight">
              Your Sanctum Moment is Sealed & Ready!
            </h3>
            <p className="text-xs sm:text-sm opacity-75 font-serif italic max-w-md mx-auto">
              A private digital sanctuary has been generated for {recipientName || "your recipient"}. Share the unique link or QR code below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: QR CODE CARD & DOWNLOAD (5 Cols) */}
            <div className="lg:col-span-5 rounded-3xl p-6 border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 flex flex-col items-center text-center space-y-4 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                High-Resolution QR Code
              </span>

              {qrCodeDataUrl ? (
                <div className="p-3 bg-white rounded-2xl shadow-md border border-black/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeDataUrl}
                    alt="Sanctum Moment QR Code"
                    className="w-52 h-52 object-contain"
                  />
                </div>
              ) : (
                <div className="w-52 h-52 rounded-2xl bg-black/10 animate-pulse" />
              )}

              <div className="flex flex-col gap-2 w-full pt-2">
                <button
                  type="button"
                  onClick={handleDownloadQrPng}
                  className="w-full py-2.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR Code PNG</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Keepsake Card</span>
                </button>
              </div>
            </div>

            {/* RIGHT: SHARE ACTIONS & UNIQUE LINK (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Secret Passcode Card (When Password Protected) */}
              {(finalMoment?.isPasswordProtected || isPasswordProtected) && passcode.trim() && (
                <div className="rounded-3xl p-6 border bg-amber-500/10 border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <label className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-300 block">
                        Keepsake Secret Passcode
                      </label>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      Required To Open
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    This keepsake is sealed. Share this passcode with your recipient so they can unlock it.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPasscode ? "text" : "password"}
                        readOnly
                        value={passcode}
                        className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-black/10 dark:bg-black/30 border border-amber-500/30 font-mono text-sm font-bold text-amber-700 dark:text-amber-200 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        title={showPasscode ? "Hide Passcode" : "Show Passcode"}
                      >
                        {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyPasscode}
                      className="px-4 py-3 rounded-2xl bg-white/80 dark:bg-black/40 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copiedPasscode ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span>Passcode Copied!</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4 text-amber-500" />
                          <span>Copy Passcode</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLinkAndPasscode}
                      className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                    >
                      {copiedBoth ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Link + Code Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Link & Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {passcodeHint.trim() && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200/90 font-serif italic">
                      Recipient Clue: &ldquo;{passcodeHint.trim()}&rdquo;
                    </div>
                  )}
                </div>
              )}

              {/* Unique Link Input Box */}
              <div className="rounded-3xl p-6 border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70 block">
                  Unique Bearer Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getMomentShareUrl()}
                    className="w-full px-4 py-3 rounded-2xl bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 font-mono text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Native & Direct Quick Share Buttons */}
              <div className="rounded-3xl p-6 border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider opacity-70 block">
                  One-Click Quick Share
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* WhatsApp */}
                  <a
                    href={getWhatsAppShareUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Email */}
                  <a
                    href={getEmailShareUrl()}
                    className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>

                  {/* Native Device Share */}
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer col-span-2 sm:col-span-1"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Device Share</span>
                  </button>
                </div>
              </div>

              {/* Moment Metadata Summary Card */}
              <div className="rounded-3xl p-6 border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="opacity-60">Occasion:</span>
                  <span className="font-bold">{activeTheme.title}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="opacity-60">Recipient:</span>
                  <span className="font-bold">{recipientName || "Friend"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="opacity-60">Protection:</span>
                  <span className="font-bold flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    {(finalMoment?.isPasswordProtected || isPasswordProtected) ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Password Protected</span>
                      </>
                    ) : (
                      <span>Open Link</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="opacity-60">Version Delivered:</span>
                  <span className="font-bold">
                    {usePolished ? "Gemini Refined" : "Original Raw Draft"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="opacity-60">Memory Photos:</span>
                  <span className="font-bold">{photos.length} attached</span>
                </div>
              </div>
            </div>
          </div>

          {/* PRINTABLE CARD MODAL */}
          {showPrintModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl bg-white text-slate-900 p-8 shadow-2xl border space-y-6 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                    Printable Gift Card
                  </span>
                  <h3 className="text-xl font-serif font-bold text-slate-900">
                    A Keepsake for {recipientName || "Someone Special"}
                  </h3>
                  <p className="text-xs font-serif italic text-slate-600">
                    Scan with your phone camera to unfold this digital sanctuary.
                  </p>
                </div>

                {qrCodeDataUrl && (
                  <div className="p-4 bg-slate-50 rounded-2xl border inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeDataUrl}
                      alt="Printable QR Code"
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                )}

                <p className="text-xs font-mono text-slate-500 break-all">
                  {getMomentShareUrl()}
                </p>

                {(finalMoment?.isPasswordProtected || isPasswordProtected) && passcode.trim() && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-left text-xs text-amber-900">
                    <span className="font-bold block">🔒 Secret Passcode:</span>
                    <span className="font-mono text-sm font-bold text-amber-800">{passcode.trim()}</span>
                    {passcodeHint.trim() && (
                      <p className="text-[11px] text-amber-700 italic mt-0.5">Clue: {passcodeHint.trim()}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Print Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(false)}
                    className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
      </div>
    </div>
  );
}
