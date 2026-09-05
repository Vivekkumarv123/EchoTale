"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase-client";
import { fetchUserProfile } from "@/lib/user-service";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Feather,
  Wand2,
  Zap,
  Lock,
  Compass,
  KeyRound,
  UserCheck,
  ArrowLeft,
  LogOut,
  UserPlus,
  LogIn,
  ExternalLink,
} from "lucide-react";

export default function LoginPage({ defaultMode = "login" }: { defaultMode?: "login" | "signup" }) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [signingIn, setSigningIn] = React.useState<boolean>(false);
  const [authMode, setAuthMode] = React.useState<"login" | "signup">(defaultMode);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isPopupBlocked, setIsPopupBlocked] = React.useState<boolean>(false);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = React.useState<"grimoire" | "fairytale" | "cyber">("grimoire");

  const envWarning = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  // Seamless intelligent post-authentication router with database verification
  const handlePostAuthRouting = React.useCallback(
    async (currentUser: User, mode: "login" | "signup") => {
      setSigningIn(true);
      setAuthError(null);
      try {
        const profile = await fetchUserProfile(currentUser.uid);

        if (mode === "login") {
          // LOG IN MODE: Enforce database check to provide access
          if (profile && profile.theme) {
            setSuccessNotice(
              `Verification match confirmed for ${currentUser.email || currentUser.displayName || "your account"}! Providing access...`
            );
            setTimeout(() => {
              router.push("/dashboard");
            }, 600);
          } else {
            // User profile does NOT exist in database!
            setSigningIn(false);
            setAuthError(
              `Access Denied: No account record found in our database for ${currentUser.email || "your account"}. Please click "Sign Up" below to register your profile.`
            );
          }
        } else {
          // SIGN UP MODE:
          if (profile && profile.theme) {
            // Account already registered in database
            setSuccessNotice(
              `Account already registered in database for ${currentUser.email || "your account"}! Granting access to dashboard...`
            );
            setTimeout(() => {
              router.push("/dashboard");
            }, 600);
          } else {
            // New user registration -> send to onboarding to initialize profile in Firestore
            setSuccessNotice("Identity verified! Directing to onboarding to setup your profile in database...");
            setTimeout(() => {
              router.push("/onboarding");
            }, 600);
          }
        }
      } catch (err) {
        setSigningIn(false);
        console.error("Could not retrieve profile during auth routing:", err);
        if (mode === "login") {
          setAuthError("Failed to query database for account record. Please try again or Sign Up.");
        } else {
          router.push("/onboarding");
        }
      }
    },
    [router]
  );

  React.useEffect(() => {
    // Check for incoming redirect authentication results
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          handlePostAuthRouting(result.user, authMode);
        }
      })
      .catch((err) => {
        console.warn("Redirect result note:", err);
      });

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authMode, handlePostAuthRouting]);

  const handleGoogleAuth = async (mode: "login" | "signup") => {
    setAuthError(null);
    setIsPopupBlocked(false);
    setSuccessNotice(null);
    setSigningIn(true);
    try {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          currentUser = result.user;
        } catch (popupErr: unknown) {
          const errCode = (popupErr as { code?: string })?.code || "";
          const errMsg = popupErr instanceof Error ? popupErr.message : String(popupErr);

          if (
            errCode === "auth/popup-blocked" ||
            errCode === "auth/cancelled-popup-request" ||
            errMsg.includes("popup-blocked") ||
            errMsg.includes("popup")
          ) {
            setIsPopupBlocked(true);
            setAuthError(
              "Google Sign-In popup was blocked by the browser. Click 'Open in New Tab' below to sign in directly with Google."
            );
            return;
          }
          throw popupErr;
        }
      }
      if (currentUser) {
        setUser(currentUser);
        await handlePostAuthRouting(currentUser, mode);
      }
    } catch (err: unknown) {
      console.error("Authentication error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unable to complete Google authentication. Please try again.";
      setAuthError(errorMessage);
    } finally {
      setSigningIn(false);
    }
  };

  const openInNewTab = () => {
    if (typeof window !== "undefined") {
      window.open(window.location.href, "_blank", "noopener,noreferrer");
    }
  };

  const themePreviews = {
    grimoire: {
      name: "Vintage Grimoire",
      tagline: "Act I · Classic Narrative",
      icon: Feather,
      quote: "“The ink breathes memory into timeless gold.”",
      accent: "#8A5A36",
      bgClass: "bg-[#FAF1E4] border-[#D7BEA8] text-[#5C3317]",
      pillClass: "bg-[#8A5A36]/10 text-[#5C3317] border-[#8A5A36]/30",
    },
    fairytale: {
      name: "Fairy Tale",
      tagline: "Act II · Romantic & Whimsical",
      icon: Wand2,
      quote: "“Once upon a quiet starlit reverie, a heart awoke.”",
      accent: "#EC4899",
      bgClass: "bg-gradient-to-br from-[#FAF5FF] via-[#FDF4FF] to-[#FCE7F3] border-[#F0ABFC] text-[#701A75]",
      pillClass: "bg-[#EC4899]/15 text-[#9333EA] border-[#F0ABFC]/60",
    },
    cyber: {
      name: "Cyber-Mechanical",
      tagline: "Act III · Superhero Fortitude",
      icon: Zap,
      quote: "“Armor forged through trials, memory encoded in light.”",
      accent: "#38BDF8",
      bgClass: "bg-[#0B1120] border-sky-500/40 text-slate-100",
      pillClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    },
  };

  const currentThemeData = themePreviews[previewTheme];

  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#FDF8F6] text-[#3D2C2E] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative overflow-hidden selection:bg-[#5C3317]/15">
      {/* Dynamic Ambient Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-radial from-amber-200/40 via-pink-100/20 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-radial from-rose-200/30 via-purple-100/20 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-radial from-amber-300/20 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Top Header & Return Home Navigation */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#7C5C5E15] relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-[#5C3317] text-[#FAF6F0] border border-[#8A5A36]/40 flex items-center justify-center shadow-lg shadow-[#5C331725] transition-transform duration-300 group-hover:scale-105">
            <BookOpen className="w-5 h-5 text-amber-200" />
          </div>
          <div className="flex flex-col">
            <span className="font-salted text-3xl sm:text-4xl leading-none text-[#5C3317] group-hover:text-[#43220F] transition-colors">
              EchoTale
            </span>
            <span className="font-note text-xs sm:text-sm tracking-wide text-[#8A5A36] opacity-85 -mt-0.5">
              Living Grimoire
            </span>
          </div>
        </Link>

        {/* Back to Home & Security Gateway Pill */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#7C5C5E] hover:text-[#3D2C2E] px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-[#7C5C5E15] transition-all hover:bg-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Realm</span>
          </Link>

          <Badge
            variant="outline"
            className="border-[#7C5C5E25] bg-white/50 backdrop-blur-md text-[#5C3317] text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-xs"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Google Auth & DB Verification</span>
          </Badge>
        </div>
      </header>

      {/* Main Dual-Winged Stage */}
      <div className="flex-1 max-w-6xl mx-auto w-full my-6 sm:my-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Wing: Atmospheric Narrative & Interactive Realm Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 flex flex-col justify-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#8A5A36]/10 text-[#5C3317] border border-[#8A5A36]/25 w-fit mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: "10s" }} />
            <span>
              {authMode === "login" ? "Authentication · Google Sign In" : "Registration · Google Sign Up"}
            </span>
          </div>

          <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#3D2C2E] leading-tight mb-4">
            {authMode === "login" ? (
              <>
                Log In to Your <span className="font-salted text-5xl sm:text-6xl lg:text-7xl block text-[#5C3317] my-1">Vault Account</span>
              </>
            ) : (
              <>
                Sign Up for Your <span className="font-salted text-5xl sm:text-6xl lg:text-7xl block text-[#5C3317] my-1">Living Journal</span>
              </>
            )}
          </h2>

          <p className="font-note text-xl sm:text-2xl text-[#6D4C41] leading-relaxed max-w-xl mb-8">
            {authMode === "login"
              ? "Existing users: We verify your profile in Cloud Firestore database before granting access to your journal vault."
              : "New authors: Register your profile with Google and select your preferred living aesthetic theme."}
          </p>

          {/* Interactive Realm Atmosphere Switcher */}
          <div className="p-5 rounded-3xl bg-white/70 backdrop-blur-md border border-[#D7BEA8]/80 shadow-lg shadow-[#5C331708] mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-[#8A5A36] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>3 Selectable Story Realms</span>
              </span>
              <div className="flex items-center gap-1">
                {(["grimoire", "fairytale", "cyber"] as const).map((thm) => (
                  <button
                    key={thm}
                    onClick={() => setPreviewTheme(thm)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      previewTheme === thm
                        ? "bg-[#5C3317] text-white shadow-xs"
                        : "text-[#7C5C5E] hover:bg-[#5C3317]/10"
                    }`}
                  >
                    {thm === "grimoire" ? "Grimoire" : thm === "fairytale" ? "Fairy Tale" : "Cyber"}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={previewTheme}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className={`p-4 rounded-2xl border transition-all duration-300 ${currentThemeData.bgClass}`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: currentThemeData.accent }}
                    >
                      <currentThemeData.icon className="w-4 h-4" />
                    </div>
                    <span className="font-serif-display font-bold text-sm">
                      {currentThemeData.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${currentThemeData.pillClass}`}>
                    {currentThemeData.tagline}
                  </span>
                </div>
                <p className="font-note text-lg leading-tight opacity-90 italic">
                  {currentThemeData.quote}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Privacy & Zero-Knowledge Trust Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/40 border border-white/80">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#3D2C2E]">UID Scoped Database</p>
                <p className="text-[11px] opacity-70">Firestore rules enforce private access</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/40 border border-white/80">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#3D2C2E]">Verified Google Auth</p>
                <p className="text-[11px] opacity-70">Direct, secure OAuth integration</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Wing: Google Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 w-full max-w-md mx-auto"
        >
          <div className="relative rounded-[36px] bg-white/85 backdrop-blur-xl border border-white/90 p-8 sm:p-10 shadow-2xl shadow-[#5C331718] overflow-hidden">
            {/* Ambient Corner Accent */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-amber-200/50 via-rose-200/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* SEPARATE LOGIN & SIGNUP MODE TOGGLE TABS */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#5C3317]/10 border border-[#8A5A36]/20 mb-6 relative z-10">
              <button
                type="button"
                id="tab-login-btn"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError(null);
                  setIsPopupBlocked(false);
                  setSuccessNotice(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === "login"
                    ? "bg-[#5C3317] text-[#FAF6F0] shadow-md shadow-[#5C331725]"
                    : "text-[#5C3317] hover:bg-[#5C3317]/10"
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>
              <button
                type="button"
                id="tab-signup-btn"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError(null);
                  setIsPopupBlocked(false);
                  setSuccessNotice(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === "signup"
                    ? "bg-[#5C3317] text-[#FAF6F0] shadow-md shadow-[#5C331725]"
                    : "text-[#5C3317] hover:bg-[#5C3317]/10"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </div>

            {/* Card Header */}
            <div className="text-center mb-6 relative z-10">
              <div className="mx-auto mb-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FAF1E4] to-[#F5E6D3] border-2 border-[#D7BEA8] flex items-center justify-center shadow-md shadow-[#5C331715]">
                <div className="w-9 h-9 rounded-xl bg-[#5C3317] flex items-center justify-center text-white shadow-inner">
                  {authMode === "login" ? (
                    <KeyRound className="w-5 h-5 text-amber-200" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-amber-200" />
                  )}
                </div>
              </div>

              <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#8A5A36] mb-1 block">
                {authMode === "login" ? "Sanctum Login Gate" : "Sanctum Signup Gate"}
              </span>
              <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#3D2C2E] tracking-tight mb-1">
                {authMode === "login" ? "Log In to EchoTale" : "Create New Account"}
              </h3>
              <p className="font-note text-base text-[#7C5C5E] opacity-90 leading-tight">
                {authMode === "login"
                  ? "Log in checks database records to provide instant access."
                  : "Sign up initializes your encrypted journal vault in our database."}
              </p>
            </div>

            {/* Error or Success Notices */}
            <div className="space-y-3 mb-6 relative z-10">
              {envWarning && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Firebase Connected</p>
                    <p className="text-amber-800 text-[11px]">Ready for Google Auth & Database queries.</p>
                  </div>
                </div>
              )}

              {/* POPUP BLOCKED RECOVERY */}
              {isPopupBlocked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 text-xs text-amber-950 space-y-3 shadow-md"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm text-amber-950">Popup Blocked in Preview Window</p>
                      <p className="text-amber-900 mt-1 text-[11px] leading-relaxed">
                        The browser blocked the Google login popup inside this frame. Click below to open the page in a new tab:
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={openInNewTab}
                    className="w-full bg-[#5C3317] hover:bg-[#43220F] text-white text-xs h-10 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-amber-200" />
                    <span>Open in New Tab to Sign In with Google</span>
                  </Button>
                </motion.div>
              )}

              {authError && !isPopupBlocked && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900 space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-rose-950">Database Access Note</p>
                      <p className="text-rose-800 mt-1 text-[11px] leading-relaxed">{authError}</p>
                    </div>
                  </div>

                  {/* Quick button to switch to Sign Up mode if Log In fails due to no DB record */}
                  {authMode === "login" && (
                    <Button
                      type="button"
                      onClick={() => {
                        setAuthMode("signup");
                        setAuthError(null);
                        setSuccessNotice(null);
                      }}
                      className="w-full bg-rose-700 hover:bg-rose-800 text-white text-xs py-2 h-9 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Switch to Sign Up Mode</span>
                    </Button>
                  )}
                </motion.div>
              )}

              {successNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-emerald-300 bg-emerald-50/95 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Verification Success</p>
                    <p className="text-emerald-800 mt-0.5 text-[11px]">{successNotice}</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Actions for current session or Google Auth */}
            <div className="relative z-10">
              {user ? (
                <div className="p-5 rounded-2xl bg-[#FAF1E4]/90 border border-[#D7BEA8] text-center space-y-3">
                  <div className="text-xs text-[#5C3317]">
                    <p className="font-bold">Authenticated as:</p>
                    <p className="font-mono text-[11px] opacity-80">{user.email || user.displayName}</p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <Button
                      onClick={() => handlePostAuthRouting(user, authMode)}
                      disabled={signingIn}
                      className="w-full bg-[#5C3317] hover:bg-[#43220F] disabled:bg-[#5C3317]/80 text-[#FAF6F0] py-5 rounded-2xl font-serif-display font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:pointer-events-none transition-all duration-300"
                    >
                      {signingIn ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-200 border-t-transparent shrink-0" />
                          <span className="font-sans font-semibold tracking-wide">Entering Sanctum...</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {authMode === "login" ? "Verify & Enter Sanctum" : "Proceed to Sign Up / Setup"}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => signOut(auth)}
                      className="text-xs text-[#7C5C5E] hover:text-[#3D2C2E] flex items-center justify-center gap-1.5 mx-auto pt-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Switch Account</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Primary Google Auth Action Button */}
                  <Button
                    onClick={() => handleGoogleAuth(authMode)}
                    disabled={signingIn || loading}
                    id={authMode === "login" ? "login-submit-btn" : "signup-submit-btn"}
                    className="w-full h-14 bg-[#5C3317] hover:bg-[#43220F] disabled:bg-[#5C3317]/80 text-[#FAF6F0] font-medium text-base rounded-2xl shadow-xl shadow-[#5C331725] transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-80 disabled:cursor-not-allowed disabled:pointer-events-none flex items-center justify-center gap-3.5 group cursor-pointer"
                  >
                    {signingIn ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-200 border-t-transparent shrink-0" />
                        <span className="font-sans font-semibold tracking-wide">
                          Entering Sanctum...
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center shadow-xs">
                          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                            <path
                              fill="#EA4335"
                              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                            />
                            <path
                              fill="#4285F4"
                              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 20.4 7.5 23 12 23z"
                            />
                          </svg>
                        </div>
                        <span className="font-serif-display font-semibold tracking-wide">
                          {authMode === "login" ? "Log In with Google" : "Sign Up with Google"}
                        </span>
                        <ArrowRight className="w-4 h-4 text-amber-200 opacity-70 group-hover:translate-x-1 transition-transform ml-0.5" />
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center text-xs text-[#7C5C5E] px-1 pt-1">
                    <button
                      type="button"
                      onClick={openInNewTab}
                      className="inline-flex items-center gap-1.5 hover:text-[#3D2C2E] underline cursor-pointer text-[11px] opacity-80 hover:opacity-100"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open in New Tab (Recommended if popup is blocked)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Micro Trust Stamp Footer */}
            <div className="mt-7 pt-5 border-t border-[#7C5C5E15] flex items-center justify-between text-[11px] text-[#7C5C5E] relative z-10">
              <div className="flex items-center gap-1.5 opacity-80">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>DB Verification Active</span>
              </div>
              <span className="font-mono text-[10px] opacity-60">
                Mode: {authMode === "login" ? "Log In" : "Sign Up"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Elegant Bottom Footer */}
      <footer className="max-w-6xl mx-auto w-full pt-4 border-t border-[#7C5C5E15] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#7C5C5E] opacity-70 relative z-10">
        <div className="flex items-center gap-2">
          <span>EchoTale &bull; Living Grimoire Journaling Platform</span>
        </div>
        <div className="font-mono">
          AES-256 Cloud Firestore &bull; Rules Version 2
        </div>
      </footer>
    </main>
  );
}

