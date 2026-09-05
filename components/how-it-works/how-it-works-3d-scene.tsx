"use client";

import * as React from "react";
import { Sparkles, RefreshCw, Hand, Zap, ShieldCheck, Wand2, Mic, Lock, Compass } from "lucide-react";

interface HowItWorks3DSceneProps {
  activeStep: number;
  onStepChange: (step: number) => void;
}

export function HowItWorks3DScene({ activeStep, onStepChange }: HowItWorks3DSceneProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const triggerActionRef = React.useRef<(() => void) | null>(null);
  const [isInteracting, setIsInteracting] = React.useState(false);
  const [autoRotate, setAutoRotate] = React.useState(true);
  const [actionFeedback, setActionFeedback] = React.useState<string | null>(null);

  const stageMeta = {
    1: {
      name: "Stage 1 · Living Grimoire & Voice Quill",
      subtitle: "3D Open Grimoire & Voice Soundwave Rings",
      icon: Mic,
      actionBtn: "Inscribe & Dip Quill",
      hint: "Click canvas or button to inscribe ink ripple",
      accent: "text-amber-300",
    },
    2: {
      name: "Stage 2 · Gemini AI Neural Alchemy Core",
      subtitle: "3D Alchemical Prism & Gyroscopic Weaving Rings",
      icon: Wand2,
      actionBtn: "Trigger Alchemy Surge",
      hint: "Click canvas to unleash neural synthesis surge",
      accent: "text-pink-300",
    },
    3: {
      name: "Stage 3 · Sanctum Keepsake & Wax Seal",
      subtitle: "3D Embossed Gold Crest & Organic Melted Wax Seal",
      icon: Compass,
      actionBtn: "Stamp Press & Resonate",
      hint: "Click canvas to test stamp rebound & gold glitter",
      accent: "text-amber-400",
    },
    4: {
      name: "Stage 4 · Zero-Knowledge Cryptographic Vault",
      subtitle: "3D Armored Cryptex & Radiant Keyhole Unseal",
      icon: Lock,
      actionBtn: "Unseal Vault & Reveal Light",
      hint: "Click canvas to spin cipher lock & beam sanctuary light",
      accent: "text-emerald-300",
    },
  }[activeStep as 1 | 2 | 3 | 4] || {
    name: "3D Interactive Alchemy Engine",
    subtitle: "Realtime WebGL Hardware Accelerated",
    icon: Sparkles,
    actionBtn: "Interact",
    hint: "Drag to rotate · Click to interact",
    accent: "text-amber-200",
  };

  React.useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return;

    let cleanup = () => {};

    import("three").then((THREE) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const width = canvas.clientWidth || 400;
      const height = canvas.clientHeight || 300;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 0, 5.2);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Common Ambient & Directional Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffffff, 1.6);
      mainLight.position.set(5, 7, 6);
      scene.add(mainLight);

      const rimLight = new THREE.PointLight(0xf59e0b, 2.5, 20);
      rimLight.position.set(-4, -2, -3);
      scene.add(rimLight);

      // Master container for the active step model
      const stageGroup = new THREE.Group();
      scene.add(stageGroup);

      // Clean tracking array for disposal
      const disposables: { geometry?: any; material?: any }[] = [];
      const registerMesh = <T extends any>(obj: T): T => {
        obj.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) disposables.push({ geometry: child.geometry });
            if (child.material) disposables.push({ material: child.material });
          }
        });
        return obj;
      };

      // Global action trigger hooks
      let stepActionTrigger = () => {};

    // ─────────────────────────────────────────────────────────────
    // BUILD STAGE-SPECIFIC 3D MODELS
    // ─────────────────────────────────────────────────────────────

    if (activeStep === 1) {
      // ═══════════════════════════════════════════════════════════
      // STAGE 1: LIVING GRIMOIRE BOOK & MAGIC QUILL & VOICE RINGS
      // ═══════════════════════════════════════════════════════════
      const bookGroup = new THREE.Group();

      // Leather Cover
      const coverGeo = new THREE.BoxGeometry(2.6, 0.12, 2.0);
      const coverMat = new THREE.MeshStandardMaterial({
        color: 0x3d2112,
        roughness: 0.7,
        metalness: 0.2,
      });
      const coverMesh = registerMesh(new THREE.Mesh(coverGeo, coverMat));
      coverMesh.position.y = -0.06;
      bookGroup.add(coverMesh);

      // Left Parchment Page
      const pageGeo = new THREE.BoxGeometry(1.15, 0.08, 1.8);
      const pageMat = new THREE.MeshStandardMaterial({
        color: 0xf6eee0,
        roughness: 0.6,
        metalness: 0.05,
      });
      const leftPage = registerMesh(new THREE.Mesh(pageGeo, pageMat));
      leftPage.position.set(-0.6, 0.04, 0);
      leftPage.rotation.z = 0.06;
      bookGroup.add(leftPage);

      // Right Parchment Page
      const rightPage = registerMesh(new THREE.Mesh(pageGeo, pageMat.clone()));
      rightPage.position.set(0.6, 0.04, 0);
      rightPage.rotation.z = -0.06;
      bookGroup.add(rightPage);

      // Golden Spine & Corner Ornaments
      const spineGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.0, 16);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.9,
        roughness: 0.2,
      });
      const spineMesh = registerMesh(new THREE.Mesh(spineGeo, goldMat));
      spineMesh.rotation.x = Math.PI / 2;
      spineMesh.position.set(0, -0.02, 0);
      bookGroup.add(spineMesh);

      // Golden Quill
      const quillGroup = new THREE.Group();
      const quillStemGeo = new THREE.CylinderGeometry(0.02, 0.05, 1.4, 16);
      const quillStemMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.85,
        roughness: 0.2,
      });
      const quillStem = registerMesh(new THREE.Mesh(quillStemGeo, quillStemMat));
      quillStem.position.y = 0.7;
      quillGroup.add(quillStem);

      // Quill Feather Plume
      const featherGeo = new THREE.ConeGeometry(0.2, 0.9, 8);
      const featherMat = new THREE.MeshStandardMaterial({
        color: 0x8a5a36,
        roughness: 0.5,
        metalness: 0.2,
      });
      const feather = registerMesh(new THREE.Mesh(featherGeo, featherMat));
      feather.position.set(0.08, 0.9, 0);
      feather.rotation.z = -0.2;
      quillGroup.add(feather);

      // Glowing Ink Bead Nib
      const nibGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const nibMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.2,
      });
      const nib = registerMesh(new THREE.Mesh(nibGeo, nibMat));
      nib.position.y = 0.02;
      quillGroup.add(nib);

      quillGroup.position.set(0.4, 0.4, 0.3);
      quillGroup.rotation.set(-0.4, 0.2, -0.5);
      bookGroup.add(quillGroup);

      // Soundwave Orbit Rings
      const waveRings: THREE.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const ringGeo = new THREE.TorusGeometry(1.6 + i * 0.35, 0.02, 16, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.6 - i * 0.15,
          emissive: 0xd97706,
          emissiveIntensity: 0.5,
        });
        const waveRing = registerMesh(new THREE.Mesh(ringGeo, ringMat));
        waveRing.rotation.x = Math.PI / 2.5 + i * 0.15;
        bookGroup.add(waveRing);
        waveRings.push(waveRing);
      }

      // Ink particle motes
      const particleGeo = new THREE.BufferGeometry();
      const pCount = 60;
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 2.2;
        pPos[i + 1] = Math.random() * 1.5;
        pPos[i + 2] = (Math.random() - 0.5) * 1.8;
      }
      particleGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.04,
        transparent: true,
        opacity: 0.7,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      disposables.push({ geometry: particleGeo, material: particleMat });
      bookGroup.add(particles);

      bookGroup.rotation.x = 0.5;
      stageGroup.add(bookGroup);

      // Inscribe Action Animation
      let inscribeProgress = 0;
      let isInscribing = false;
      stepActionTrigger = () => {
        isInscribing = true;
        inscribeProgress = 0;
        setActionFeedback("Ink Ripple Inscribed! Voice Transcribing...");
        setTimeout(() => setActionFeedback(null), 2500);
      };

      (stageGroup as any).stepUpdate = (time: number) => {
        // Floating quill gentle bobbing
        if (isInscribing) {
          inscribeProgress += 0.06;
          quillGroup.position.y = 0.15 + Math.sin(inscribeProgress * 4) * 0.08;
          quillGroup.position.x = 0.4 + Math.sin(inscribeProgress * 3) * 0.2;
          nibMat.emissiveIntensity = 2.0;
          if (inscribeProgress > Math.PI * 2) {
            isInscribing = false;
            nibMat.emissiveIntensity = 1.0;
          }
        } else {
          quillGroup.position.y = 0.35 + Math.sin(time * 2.5) * 0.04;
          quillGroup.rotation.z = -0.5 + Math.cos(time * 2.0) * 0.05;
        }

        // Concentric soundwave pulsing
        waveRings.forEach((r, idx) => {
          const s = 1 + Math.sin(time * 3 + idx * 0.8) * 0.06;
          r.scale.set(s, s, s);
          r.rotation.z = time * 0.2 * (idx % 2 === 0 ? 1 : -1);
        });

        particles.rotation.y = time * 0.1;
      };

    } else if (activeStep === 2) {
      // ═══════════════════════════════════════════════════════════
      // STAGE 2: GEMINI NEURAL ALCHEMY CORE & GYROSCOPIC RINGS
      // ═══════════════════════════════════════════════════════════
      const geminiGroup = new THREE.Group();

      // Outer Crystal Prism (Icosahedron)
      const prismGeo = new THREE.IcosahedronGeometry(1.3, 0);
      const prismMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        roughness: 0.15,
        metalness: 0.4,
        wireframe: true,
        emissive: 0x9333ea,
        emissiveIntensity: 0.6,
      });
      const outerPrism = registerMesh(new THREE.Mesh(prismGeo, prismMat));
      geminiGroup.add(outerPrism);

      // Inner Glowing Sentiment Sphere
      const coreGeo = new THREE.SphereGeometry(0.7, 32, 32);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
      });
      const innerCore = registerMesh(new THREE.Mesh(coreGeo, coreMat));
      geminiGroup.add(innerCore);

      // Gyroscopic Celestial Ring X
      const ringXGeo = new THREE.TorusGeometry(1.7, 0.05, 16, 64);
      const gyroMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.15,
      });
      const gyroRingX = registerMesh(new THREE.Mesh(ringXGeo, gyroMat));
      geminiGroup.add(gyroRingX);

      // Gyroscopic Celestial Ring Y
      const ringYGeo = new THREE.TorusGeometry(1.9, 0.05, 16, 64);
      const gyroMatY = new THREE.MeshStandardMaterial({
        color: 0xc084fc,
        metalness: 0.85,
        roughness: 0.2,
      });
      const gyroRingY = registerMesh(new THREE.Mesh(ringYGeo, gyroMatY));
      geminiGroup.add(gyroRingY);

      // Double-helix sentiment particles
      const helixCount = 100;
      const helixGeo = new THREE.BufferGeometry();
      const helixPos = new Float32Array(helixCount * 3);
      for (let i = 0; i < helixCount; i++) {
        const theta = (i / helixCount) * Math.PI * 6;
        const radius = 1.4 + Math.sin(theta * 2) * 0.3;
        helixPos[i * 3] = Math.cos(theta) * radius;
        helixPos[i * 3 + 1] = (i / helixCount - 0.5) * 3;
        helixPos[i * 3 + 2] = Math.sin(theta) * radius;
      }
      helixGeo.setAttribute("position", new THREE.BufferAttribute(helixPos, 3));
      const helixMat = new THREE.PointsMaterial({
        color: 0xf43f5e,
        size: 0.05,
        transparent: true,
        opacity: 0.85,
      });
      const helixPoints = new THREE.Points(helixGeo, helixMat);
      disposables.push({ geometry: helixGeo, material: helixMat });
      geminiGroup.add(helixPoints);

      stageGroup.add(geminiGroup);

      // Alchemy Surge Animation
      let surgeActive = false;
      let surgeIntensity = 0;
      stepActionTrigger = () => {
        surgeActive = true;
        surgeIntensity = 2.5;
        setActionFeedback("Gemini Synthesis Surge! Chapter Weaving...");
        setTimeout(() => setActionFeedback(null), 2500);
      };

      (stageGroup as any).stepUpdate = (time: number) => {
        let speedMult = 1.0;
        if (surgeActive) {
          surgeIntensity = Math.max(0, surgeIntensity - 0.05);
          speedMult = 1.0 + surgeIntensity * 3;
          prismMat.emissiveIntensity = 0.6 + surgeIntensity * 0.8;
          coreMat.emissiveIntensity = 0.8 + surgeIntensity;
          if (surgeIntensity <= 0.01) surgeActive = false;
        }

        outerPrism.rotation.x = time * 0.4 * speedMult;
        outerPrism.rotation.y = time * 0.6 * speedMult;

        innerCore.rotation.y = -time * 0.5;
        const coreScale = 1 + Math.sin(time * 3) * 0.05 + (surgeActive ? surgeIntensity * 0.15 : 0);
        innerCore.scale.set(coreScale, coreScale, coreScale);

        gyroRingX.rotation.x = time * 0.8 * speedMult;
        gyroRingX.rotation.z = time * 0.3;

        gyroRingY.rotation.y = -time * 0.7 * speedMult;
        gyroRingY.rotation.z = time * 0.5;

        helixPoints.rotation.y = time * 0.5 * speedMult;
      };

    } else if (activeStep === 3) {
      // ═══════════════════════════════════════════════════════════
      // STAGE 3: EMBOSSED GOLD WAX SEAL MEDALLION & WAX DROPLETS
      // ═══════════════════════════════════════════════════════════
      const sealGroup = new THREE.Group();

      // Main Wax Disc
      const waxBaseGeo = new THREE.CylinderGeometry(1.55, 1.6, 0.22, 64);
      const waxMat = new THREE.MeshStandardMaterial({
        color: 0x881337,
        roughness: 0.25,
        metalness: 0.15,
        emissive: 0x4c0519,
        emissiveIntensity: 0.2,
      });
      const waxBase = registerMesh(new THREE.Mesh(waxBaseGeo, waxMat));
      waxBase.rotation.x = Math.PI / 3;
      sealGroup.add(waxBase);

      // Organic Melted Wax Rim Droplets (Scalloped Edge)
      const rimGroup = new THREE.Group();
      rimGroup.rotation.x = Math.PI / 3;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const r = 1.52 + Math.sin(i * 3.7) * 0.12;
        const beadGeo = new THREE.SphereGeometry(0.24 + Math.cos(i * 2) * 0.06, 16, 16);
        const beadMesh = registerMesh(new THREE.Mesh(beadGeo, waxMat));
        beadMesh.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
        beadMesh.scale.z = 0.5;
        rimGroup.add(beadMesh);
      }
      sealGroup.add(rimGroup);

      // Inner Recessed Gold Stamp Emblem Ring
      const emblemRingGeo = new THREE.TorusGeometry(1.05, 0.08, 16, 64);
      const goldCrestMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.12,
        emissive: 0xd97706,
        emissiveIntensity: 0.3,
      });
      const emblemRing = registerMesh(new THREE.Mesh(emblemRingGeo, goldCrestMat));
      emblemRing.rotation.x = Math.PI / 3;
      emblemRing.position.z = 0.08;
      sealGroup.add(emblemRing);

      // Center Crest: 8-Point Compass Star Insignia
      const starGroup = new THREE.Group();
      starGroup.rotation.x = Math.PI / 3;
      starGroup.position.z = 0.1;
      for (let i = 0; i < 4; i++) {
        const rayGeo = new THREE.ConeGeometry(0.12, 1.4, 4);
        const ray = registerMesh(new THREE.Mesh(rayGeo, goldCrestMat));
        ray.rotation.z = (i * Math.PI) / 4;
        starGroup.add(ray);
      }
      const centerGemGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const gemMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0xfacc15,
        emissiveIntensity: 0.6,
      });
      const centerGem = registerMesh(new THREE.Mesh(centerGemGeo, gemMat));
      starGroup.add(centerGem);
      sealGroup.add(starGroup);

      // Shimmering Gold Flakes
      const flakeCount = 70;
      const flakeGeo = new THREE.BufferGeometry();
      const flakePos = new Float32Array(flakeCount * 3);
      for (let i = 0; i < flakeCount * 3; i += 3) {
        flakePos[i] = (Math.random() - 0.5) * 4.5;
        flakePos[i + 1] = (Math.random() - 0.5) * 4.5;
        flakePos[i + 2] = (Math.random() - 0.5) * 3.5;
      }
      flakeGeo.setAttribute("position", new THREE.BufferAttribute(flakePos, 3));
      const flakeMat = new THREE.PointsMaterial({
        color: 0xfde047,
        size: 0.04,
        transparent: true,
        opacity: 0.8,
      });
      const flakes = new THREE.Points(flakeGeo, flakeMat);
      disposables.push({ geometry: flakeGeo, material: flakeMat });
      sealGroup.add(flakes);

      stageGroup.add(sealGroup);

      // Stamp Press & Resonate Animation
      let stampBounce = 0;
      let isStamping = false;
      stepActionTrigger = () => {
        isStamping = true;
        stampBounce = 1.0;
        setActionFeedback("Wax Seal Stamped! Keepsake Bound in Gold!");
        setTimeout(() => setActionFeedback(null), 2500);
      };

      (stageGroup as any).stepUpdate = (time: number) => {
        if (isStamping) {
          stampBounce = Math.max(0, stampBounce - 0.04);
          const zOffset = -Math.sin(stampBounce * Math.PI) * 0.4;
          sealGroup.position.z = zOffset;
          goldCrestMat.emissiveIntensity = 0.3 + stampBounce * 0.9;
          if (stampBounce <= 0.01) isStamping = false;
        }

        sealGroup.rotation.y = time * 0.4;
        rimGroup.rotation.z = time * 0.1;
        starGroup.rotation.z = -time * 0.2;
        flakes.rotation.y = -time * 0.15;
      };

    } else if (activeStep === 4) {
      // ═══════════════════════════════════════════════════════════
      // STAGE 4: ZERO-KNOWLEDGE CRYPTOGRAPHIC VAULT CRYPTEX
      // ═══════════════════════════════════════════════════════════
      const vaultGroup = new THREE.Group();

      // Main Armored Chest Body
      const chestGeo = new THREE.BoxGeometry(2.0, 1.4, 1.6);
      const ironMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.4,
        metalness: 0.85,
      });
      const chestMesh = registerMesh(new THREE.Mesh(chestGeo, ironMat));
      vaultGroup.add(chestMesh);

      // Gilded Reinforcement Bands & Corners
      const bandMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.9,
        roughness: 0.2,
      });

      // Front & Side Bands
      const hBandGeo = new THREE.BoxGeometry(2.05, 0.15, 1.65);
      const hBand = registerMesh(new THREE.Mesh(hBandGeo, bandMat));
      vaultGroup.add(hBand);

      const vBandGeo = new THREE.BoxGeometry(0.18, 1.45, 1.65);
      const vBand = registerMesh(new THREE.Mesh(vBandGeo, bandMat));
      vaultGroup.add(vBand);

      // Cipher Lock Dial Assembly (Front Center)
      const cipherGroup = new THREE.Group();
      cipherGroup.position.set(0, 0, 0.82);

      const dialBaseGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 32);
      dialBaseGeo.rotateX(Math.PI / 2);
      const dialBase = registerMesh(new THREE.Mesh(dialBaseGeo, bandMat));
      cipherGroup.add(dialBase);

      const dialRingGeo = new THREE.TorusGeometry(0.42, 0.04, 16, 32);
      const dialRing = registerMesh(new THREE.Mesh(dialRingGeo, bandMat));
      cipherGroup.add(dialRing);

      // Glowing Keyhole Aperture
      const keyholeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 16);
      keyholeGeo.rotateX(Math.PI / 2);
      const keyholeMat = new THREE.MeshStandardMaterial({
        color: 0xfde047,
        emissive: 0xfacc15,
        emissiveIntensity: 1.5,
      });
      const keyhole = registerMesh(new THREE.Mesh(keyholeGeo, keyholeMat));
      keyhole.position.z = 0.05;
      cipherGroup.add(keyhole);

      vaultGroup.add(cipherGroup);

      // Emerald Security Shield Orbit Rings
      const shieldRingGeo = new THREE.TorusGeometry(1.8, 0.03, 16, 64);
      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.7,
      });
      const shieldRing1 = registerMesh(new THREE.Mesh(shieldRingGeo, shieldMat));
      shieldRing1.rotation.x = Math.PI / 4;
      vaultGroup.add(shieldRing1);

      const shieldRing2 = registerMesh(new THREE.Mesh(shieldRingGeo, shieldMat.clone()));
      shieldRing2.rotation.y = Math.PI / 3;
      vaultGroup.add(shieldRing2);

      // Vault Sanctuary Light Rays
      const rayGeo = new THREE.ConeGeometry(0.08, 1.8, 8);
      const rayMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfacc15,
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.6,
      });
      const lightRay = registerMesh(new THREE.Mesh(rayGeo, rayMat));
      lightRay.position.set(0, 0, 1.3);
      lightRay.rotation.x = -Math.PI / 2;
      lightRay.scale.set(0.2, 0.2, 0.2);
      vaultGroup.add(lightRay);

      vaultGroup.rotation.y = -0.3;
      stageGroup.add(vaultGroup);

      // Vault Unseal Animation
      let unsealProgress = 0;
      let isUnsealing = false;
      stepActionTrigger = () => {
        isUnsealing = true;
        unsealProgress = 1.0;
        setActionFeedback("Cipher Solved! Sanctuary Light Released!");
        setTimeout(() => setActionFeedback(null), 2500);
      };

      (stageGroup as any).stepUpdate = (time: number) => {
        if (isUnsealing) {
          unsealProgress = Math.max(0, unsealProgress - 0.03);
          cipherGroup.rotation.z += 0.2;
          keyholeMat.emissiveIntensity = 1.5 + unsealProgress * 2.5;
          const rayScale = 1.0 + unsealProgress * 2.0;
          lightRay.scale.set(rayScale, rayScale, rayScale);
          lightRay.visible = true;
          if (unsealProgress <= 0.01) isUnsealing = false;
        } else {
          cipherGroup.rotation.z = Math.sin(time * 1.5) * 0.3;
          lightRay.scale.set(0.4, 0.4, 0.4);
        }

        shieldRing1.rotation.z = time * 0.3;
        shieldRing2.rotation.x = -time * 0.25;
        vaultGroup.rotation.y = Math.sin(time * 0.5) * 0.4 - 0.2;
      };
    }

    triggerActionRef.current = stepActionTrigger;

    // ─────────────────────────────────────────────────────────────
    // POINTER INTERACTION & DRAG ROTATION
    // ─────────────────────────────────────────────────────────────
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;
    let currentRotationY = 0;
    let currentRotationX = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      setIsInteracting(true);
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousPointerX;
      const deltaY = e.clientY - previousPointerY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      // Clamp vertical tilt
      targetRotationX = Math.max(-0.6, Math.min(0.6, targetRotationX));

      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
      setTimeout(() => setIsInteracting(false), 500);
    };

    const handleCanvasClick = (e: MouseEvent) => {
      // Trigger the active stage's interaction
      stepActionTrigger();
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("click", handleCanvasClick);

    // ─────────────────────────────────────────────────────────────
    // RENDER ANIMATION LOOP
    // ─────────────────────────────────────────────────────────────
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Damped rotation inertia
      currentRotationY += (targetRotationY - currentRotationY) * 0.08;
      currentRotationX += (targetRotationX - currentRotationX) * 0.08;

      if (autoRotate && !isDragging) {
        stageGroup.rotation.y = currentRotationY + elapsedTime * 0.25;
        stageGroup.rotation.x = currentRotationX + Math.sin(elapsedTime * 0.8) * 0.05;
      } else {
        stageGroup.rotation.y = currentRotationY;
        stageGroup.rotation.x = currentRotationX;
      }

      // Step-specific mesh updates
      if ((stageGroup as any).stepUpdate) {
        (stageGroup as any).stepUpdate(elapsedTime);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener("resize", handleResize);

      cleanup = () => {
        window.removeEventListener("resize", handleResize);
        canvas.removeEventListener("pointerdown", handlePointerDown);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        canvas.removeEventListener("click", handleCanvasClick);
        cancelAnimationFrame(animationFrameId);

        renderer.dispose();
        disposables.forEach(({ geometry, material }) => {
          if (geometry) geometry.dispose();
          if (material) material.dispose();
        });
      };
    });

    return () => {
      cleanup();
    };
  }, [activeStep, autoRotate]);

  return (
    <div className="rounded-3xl p-6 bg-[#FAF1E4] border border-[#D7BEA8] shadow-xl text-center relative overflow-hidden transition-all duration-300">
      {/* Top Header Information */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8A5A36] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#8A5A36]" />
          <span>Interactive 3D Engine</span>
        </span>

        {/* Auto Rotate Switch */}
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
            autoRotate
              ? "bg-[#5C3317] text-white border-[#5C3317]"
              : "bg-black/5 text-[#6B5242] border-[#D7BEA8]"
          }`}
          title="Toggle Model Auto-Rotation"
        >
          {autoRotate ? "Auto-Spin: ON" : "Auto-Spin: OFF"}
        </button>
      </div>

      <h3 className="text-xl font-bold font-serif-display text-[#3D2C2E] mb-1">
        {stageMeta.name}
      </h3>
      <p className="text-xs text-[#6B5242] font-sans-ui mb-4">
        {stageMeta.subtitle}
      </p>

      {/* 3D Canvas Box */}
      <div className="relative w-full h-72 rounded-2xl bg-[#110B07] border border-[#D7BEA8]/50 overflow-hidden shadow-2xl flex items-center justify-center group select-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        />

        {/* Top Floating Hint */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-amber-200/90 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-amber-900/40 pointer-events-none">
          <span className="flex items-center gap-1">
            <Hand className="w-3 h-3 text-amber-400" />
            <span>Drag to rotate 360°</span>
          </span>
          <span className="hidden sm:inline-block text-amber-300">
            Click canvas to trigger action
          </span>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="absolute inset-x-4 top-12 z-20 py-2 px-3 rounded-xl bg-[#5C3317]/95 border border-amber-300 text-amber-100 text-xs font-bold font-serif-display text-center shadow-lg animate-fadeIn">
            ✨ {actionFeedback}
          </div>
        )}

        {/* Bottom Status Bar */}
        <div className="absolute bottom-3 left-3 right-3 text-[10px] text-amber-200/80 font-mono bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center justify-between border border-amber-900/40">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>WebGL 3D Active</span>
          </span>

          {/* Direct Tap Action Button on Canvas */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (triggerActionRef.current) triggerActionRef.current();
            }}
            className="px-3 py-0.5 rounded-full bg-[#5C3317] hover:bg-[#8A5A36] text-white font-sans text-[11px] font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-300" />
            <span>{stageMeta.actionBtn}</span>
          </button>
        </div>
      </div>

      {/* Stage Selector Buttons with Labels */}
      <div className="mt-5 space-y-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8A5A36] block">
          Select Stage Model to Inspect:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { num: 1, label: "1. Voice Quill" },
            { num: 2, label: "2. AI Alchemy" },
            { num: 3, label: "3. Wax Seal" },
            { num: 4, label: "4. Secret Vault" },
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => onStepChange(item.num)}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center cursor-pointer ${
                activeStep === item.num
                  ? "bg-[#5C3317] text-white border-[#5C3317] shadow-md scale-[1.03]"
                  : "bg-[#FAF6F0] text-[#6B5242] border-[#D7BEA8] hover:bg-[#F3E5D8] hover:text-[#3D2C2E]"
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Tip */}
      <p className="text-[11px] text-[#8A5A36] font-mono mt-3">
        💡 {stageMeta.hint}
      </p>
    </div>
  );
}
