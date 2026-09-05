"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import {
  Sparkles,
  Layers,
  Wand2,
  Lock,
  Volume2,
  Mic,
  Image as ImageIcon,
  HelpCircle,
  ShieldCheck,
  Zap,
  Heart,
  BookOpen,
  ArrowRight,
  Sliders,
  Flame,
  CheckCircle2,
  Eye,
  Feather,
} from "lucide-react";

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = React.useState<"themes" | "moments" | "ai" | "security">("themes");
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const lenisRef = React.useRef<any | null>(null);

  // Initialize Lenis smooth scroll & GSAP ScrollTrigger
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let cleanup = () => {};

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("lenis"),
    ]).then(([{ gsap }, { ScrollTrigger }, { default: Lenis }]) => {
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
      });
      lenisRef.current = lenis;

      lenis.on("scroll", ScrollTrigger.update);
      const updateTicker = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(updateTicker);
      gsap.ticker.lagSmoothing(0);

      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>(".feature-grid-card").forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 40, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play reverse play reverse",
              },
            }
          );
        });
      });

      cleanup = () => {
        ctx.revert();
        gsap.ticker.remove(updateTicker);
        lenis.destroy();
      };
    });

    return () => {
      cleanup();
    };
  }, []);

  // Three.js 3D Feature Sphere / Hologram
  React.useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return;

    let cleanup = () => {};

    import("three").then((THREE) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.z = 4.5;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Icosahedron Core
      const geo = new THREE.IcosahedronGeometry(1.4, 2);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        wireframe: true,
        roughness: 0.1,
        metalness: 0.8,
        emissive: 0x831843,
        emissiveIntensity: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      // Inner Solid Core
      const innerGeo = new THREE.SphereGeometry(0.8, 32, 32);
      const innerMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.2,
        metalness: 0.5,
      });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      scene.add(innerMesh);

      // Lights
      const p1 = new THREE.PointLight(0xf472b6, 2, 50);
      p1.position.set(3, 3, 3);
      scene.add(p1);

      const p2 = new THREE.PointLight(0x38bdf8, 2, 50);
      p2.position.set(-3, -3, 3);
      scene.add(p2);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      let frameId: number;
      let clock = new THREE.Clock();

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        mesh.rotation.x = t * 0.3;
        mesh.rotation.y = t * 0.4;
        innerMesh.rotation.y = -t * 0.5;

        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!canvas) return;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      };
      window.addEventListener("resize", handleResize);

      cleanup = () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(frameId);
        renderer.dispose();
        geo.dispose();
        mat.dispose();
        innerGeo.dispose();
        innerMat.dispose();
      };
    });

    return () => {
      cleanup();
    };
  }, []);

  const featureCards = [
    {
      title: "Living Grimoire Mythic Themes",
      category: "themes",
      icon: Wand2,
      description:
        "Seamlessly switch between three handcrafted aesthetic universes: Vintage Grimoire with Magic Ink, Fairy Tale with Love & Wand Swing, and Kinetic Cyber with Mechanical Core.",
      badges: ["Vintage Grimoire", "Fairy Tale", "Kinetic Cyber"],
      color: "from-amber-700 to-amber-900",
    },
    {
      title: "3D Wax-Sealed Keepsake Moments",
      category: "moments",
      icon: Sparkles,
      description:
        "Craft unboxable keepsake links (`/m/[id]`). Recipients break a 3D Three.js wax seal, solve a personalized memory trivia quiz, view photo lightboxes, and listen to ambient music.",
      badges: ["3D Seal Break", "Memory Quiz", "Photo Lightbox"],
      color: "from-pink-600 to-purple-800",
    },
    {
      title: "Voice-to-Tale Speech Alchemy",
      category: "ai",
      icon: Mic,
      description:
        "Whisper your thoughts directly into EchoTale. Browser-native audio streaming records and transcribes your voice, which Gemini 3.8 Flash transforms into emotional prose.",
      badges: ["Speech Transcription", "Gemini 3.8 Flash", "Raw vs Polished"],
      color: "from-sky-600 to-blue-900",
    },
    {
      title: "Zero-Knowledge Vault Security",
      category: "security",
      icon: ShieldCheck,
      description:
        "Strict Firestore Security Rules isolate entries to authenticated UIDs. Secrets are stored in Secret Manager and loaded fail-closed on Cloud Run.",
      badges: ["UID Security Rules", "Secret Manager", "Rate-Limited API"],
      color: "from-emerald-600 to-teal-900",
    },
    {
      title: "Web Audio Procedural Synthesizer",
      category: "themes",
      icon: Volume2,
      description:
        "Integrated Web Audio synth generator and MP3 ambient pad player (`/audio/ambient-pad.mp3`) with smooth volume fade-in and fade-out transitions.",
      badges: ["Web Audio Synth", "Soundtrack Engine", "Fade Transitions"],
      color: "from-[#8A5A36] to-[#5C3317]",
    },
    {
      title: "Interactive Memory Trivia Quizzes",
      category: "moments",
      icon: HelpCircle,
      description:
        "Add a secret question to your keepsake moments. Recipients must answer correctly before unsealing the full memory letter.",
      badges: ["Identity Verification", "Confetti Burst", "Custom Question"],
      color: "from-violet-600 to-fuchsia-900",
    },
  ];

  const filteredFeatures =
    activeTab === "themes"
      ? featureCards
      : featureCards.filter((card) => card.category === activeTab);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#3D2C2E] selection:bg-amber-200 selection:text-amber-900 font-sans">
      <Navbar activeAct={1} />

      {/* Hero Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8A5A36]/10 text-[#5C3317] border border-[#8A5A36]/30 text-xs font-semibold mb-6">
          <Layers className="w-3.5 h-3.5 text-[#8A5A36]" />
          <span>Full Architectural Overview</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-display font-extrabold tracking-tight text-[#3D2C2E] max-w-4xl mx-auto leading-tight">
          Crafted for Memory, <span className="font-salted text-5xl sm:text-7xl lg:text-8xl text-[#5C3317] block sm:inline">Bound in Magic</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#6B5242] max-w-2xl mx-auto font-sans-ui leading-relaxed">
          Explore the complete feature suite of EchoTale—from real-time voice speech alchemy to 3D wax-sealed digital heirlooms.
        </p>

        {/* Tab Selection Filter */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3 p-1.5 bg-[#FAF1E4] border border-[#D7BEA8] rounded-2xl max-w-2xl mx-auto shadow-inner">
          {[
            { id: "themes", label: "All & Themes", icon: Sliders },
            { id: "moments", label: "Keepsake Moments", icon: Sparkles },
            { id: "ai", label: "AI & Voice Engine", icon: Wand2 },
            { id: "security", label: "Vault Security", icon: Lock },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#5C3317] text-[#FAF6F0] shadow-md scale-[1.02]"
                    : "text-[#6B5242] hover:text-[#3D2C2E] hover:bg-black/5"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3D Showcase & Feature Cards Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          
          {/* 3D Interactive Feature Orb */}
          <div className="lg:col-span-5 rounded-3xl p-6 bg-[#FAF1E4] border border-[#D7BEA8] shadow-xl text-center relative overflow-hidden">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8A5A36] block mb-2">
              Three.js 3D Core Engine
            </span>
            <h3 className="text-xl font-bold font-serif-display text-[#3D2C2E] mb-3">
              Kinetic Alchemy Core
            </h3>
            <div className="w-full h-64 rounded-2xl bg-[#090D16] overflow-hidden flex items-center justify-center relative shadow-inner">
              <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              <span className="absolute bottom-3 left-3 text-[10px] font-mono text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-full border border-sky-800">
                Interactive WebGL
              </span>
            </div>
            <p className="text-xs text-[#6B5242] font-sans-ui mt-4">
              Realtime hardware-accelerated shaders deliver tactile unboxing ceremonies on both desktop and mobile devices.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="feature-grid-card rounded-3xl p-6 bg-[#FAF1E4] border border-[#D7BEA8] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#5C3317] text-[#FAF6F0] flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-lg font-serif-display font-bold text-[#3D2C2E] mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-xs text-[#6B5242] font-sans-ui leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#D7BEA8]/50">
                    {feature.badges.map((b, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#8A5A36]/10 text-[#5C3317] border border-[#8A5A36]/20"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl p-10 bg-gradient-to-br from-[#5C3317] to-[#3D2C2E] text-[#FAF6F0] shadow-2xl relative overflow-hidden space-y-6">
          <h2 className="text-3xl sm:text-5xl font-serif-display font-extrabold">
            Experience the <span className="font-salted text-4xl sm:text-6xl text-amber-200">Living Grimoire</span>
          </h2>
          <p className="text-sm sm:text-base text-amber-100/90 max-w-xl mx-auto font-sans-ui">
            Start capturing your memories with AI prose alchemy and 3D wax-sealed unboxing ceremonies today.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/example"
              className="px-6 py-3.5 rounded-2xl bg-amber-200 text-[#5C3317] font-bold text-sm hover:bg-amber-100 transition-all shadow-lg flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>See Live Interactive Example</span>
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3.5 rounded-2xl bg-[#8A5A36] text-white font-bold text-sm hover:bg-[#73482A] transition-all flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer activeAct={1} />
    </div>
  );
}
