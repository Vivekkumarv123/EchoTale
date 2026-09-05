"use client";

import * as React from "react";
import type { MomentOccasion } from "@/lib/moments-types";

interface MomentThreeSceneProps {
  occasion: MomentOccasion;
  className?: string;
}

// Check for WebGL availability safely
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function MomentThreeScene({
  occasion,
  className = "",
}: MomentThreeSceneProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [webGLSupported, setWebGLSupported] = React.useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = React.useState<boolean>(false);

  React.useEffect(() => {
    // 1. Check prefers-reduced-motion
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      if (!isWebGLAvailable()) {
        setWebGLSupported(false);
        return () => mediaQuery.removeEventListener("change", listener);
      }
    }

    let cleanup = () => {};

    import("three").then((THREE) => {
      const container = containerRef.current;
      if (!container) return;

      let animFrameId: number;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      // 2. Setup Three.js Scene, Camera, Renderer
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
      camera.position.z = 20;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);

      container.appendChild(renderer.domElement);

      // Track objects for disposal
      const disposables: { geometry?: any; material?: any }[] = [];

      // 3. Construct the ONE signature accent per occasion
      let updateFn: (delta: number) => void = () => {};

      if (occasion === "love") {
        // SIGNATURE: Warm floating golden-rose light dust / bokeh motes
        const particleCount = 140;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);
        const speeds = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 35;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 35;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
          scales[i] = 0.5 + Math.random() * 1.5;
          speeds[i] = 0.2 + Math.random() * 0.4;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
          color: 0xf472b6,
          size: 0.35,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        disposables.push({ geometry, material });

        updateFn = (elapsed: number) => {
          const pos = geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < particleCount; i++) {
            pos[i * 3 + 1] += speeds[i] * 0.03;
            pos[i * 3] += Math.sin(elapsed * 0.8 + i) * 0.015;
            if (pos[i * 3 + 1] > 18) {
              pos[i * 3 + 1] = -18;
              pos[i * 3] = (Math.random() - 0.5) * 35;
            }
          }
          geometry.attributes.position.needsUpdate = true;
          points.rotation.y = elapsed * 0.04;
        };
      } else if (occasion === "gratitude") {
        // SIGNATURE: Soft drifting amber/gold embers rising serenely
        const emberCount = 120;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(emberCount * 3);
        const speeds = new Float32Array(emberCount);

        for (let i = 0; i < emberCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 32;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 32;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
          speeds[i] = 0.15 + Math.random() * 0.35;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
          color: 0xfbbf24,
          size: 0.4,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
        });

        const embers = new THREE.Points(geometry, material);
        scene.add(embers);
        disposables.push({ geometry, material });

        updateFn = (elapsed: number) => {
          const pos = geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < emberCount; i++) {
            pos[i * 3 + 1] += speeds[i] * 0.04;
            pos[i * 3] += Math.cos(elapsed * 0.5 + i) * 0.02;
            if (pos[i * 3 + 1] > 18) {
              pos[i * 3 + 1] = -18;
            }
          }
          geometry.attributes.position.needsUpdate = true;
        };
      } else if (occasion === "milestone") {
        // SIGNATURE: Prismatic slow-rotating geometric diamond core with gold light
        const group = new THREE.Group();

        const outerGeo = new THREE.OctahedronGeometry(4.5, 0);
        const outerMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          wireframe: true,
          transparent: true,
          opacity: 0.4,
        });
        const outer = new THREE.Mesh(outerGeo, outerMat);
        group.add(outer);
        disposables.push({ geometry: outerGeo, material: outerMat });

        const innerGeo = new THREE.IcosahedronGeometry(2.5, 0);
        const innerMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          wireframe: true,
          transparent: true,
          opacity: 0.35,
        });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        group.add(inner);
        disposables.push({ geometry: innerGeo, material: innerMat });

        scene.add(group);

        updateFn = (elapsed: number) => {
          outer.rotation.x = elapsed * 0.12;
          outer.rotation.y = elapsed * 0.18;
          inner.rotation.x = -elapsed * 0.16;
          inner.rotation.y = elapsed * 0.22;
          group.position.y = Math.sin(elapsed * 0.6) * 0.5;
        };
      } else if (occasion === "capsule") {
        // SIGNATURE: Orbiting cryptographic rings / planetary vault rings
        const group = new THREE.Group();

        const ringMat1 = new THREE.MeshBasicMaterial({
          color: 0x818cf8,
          wireframe: true,
          transparent: true,
          opacity: 0.35,
        });
        const ringGeo1 = new THREE.TorusGeometry(5, 0.08, 12, 64);
        const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
        ring1.rotation.x = Math.PI / 3;
        group.add(ring1);
        disposables.push({ geometry: ringGeo1, material: ringMat1 });

        const ringMat2 = new THREE.MeshBasicMaterial({
          color: 0xc084fc,
          wireframe: true,
          transparent: true,
          opacity: 0.3,
        });
        const ringGeo2 = new THREE.TorusGeometry(7, 0.06, 12, 64);
        const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
        ring2.rotation.y = Math.PI / 4;
        group.add(ring2);
        disposables.push({ geometry: ringGeo2, material: ringMat2 });

        scene.add(group);

        updateFn = (elapsed: number) => {
          ring1.rotation.z = elapsed * 0.15;
          ring2.rotation.x = elapsed * 0.08;
          group.rotation.y = elapsed * 0.05;
        };
      } else if (occasion === "courage") {
        // SIGNATURE: Pulsing flame-colored particle vortex
        const count = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const angles = new Float32Array(count);
        const radii = new Float32Array(count);

        for (let i = 0; i < count; i++) {
          angles[i] = Math.random() * Math.PI * 2;
          radii[i] = 1.5 + Math.random() * 7;
          positions[i * 3] = Math.cos(angles[i]) * radii[i];
          positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
          positions[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
          color: 0xf97316,
          size: 0.45,
          transparent: true,
          opacity: 0.75,
          blending: THREE.AdditiveBlending,
        });

        const vortex = new THREE.Points(geometry, material);
        scene.add(vortex);
        disposables.push({ geometry, material });

        updateFn = (elapsed: number) => {
          const pos = geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < count; i++) {
            angles[i] += 0.015;
            pos[i * 3] = Math.cos(angles[i]) * radii[i];
            pos[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
          }
          geometry.attributes.position.needsUpdate = true;
          vortex.rotation.y = elapsed * 0.1;
        };
      } else if (occasion === "holiday") {
        // SIGNATURE: Festive glittering stardust in emerald & champagne
        const starCount = 150;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        const emerald = new THREE.Color(0x10b981);
        const gold = new THREE.Color(0xfcd34d);

        for (let i = 0; i < starCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 36;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 36;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
          const col = Math.random() > 0.5 ? emerald : gold;
          colors[i * 3] = col.r;
          colors[i * 3 + 1] = col.g;
          colors[i * 3 + 2] = col.b;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
          vertexColors: true,
          size: 0.35,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
        });

        const stars = new THREE.Points(geometry, material);
        scene.add(stars);
        disposables.push({ geometry, material });

        updateFn = (elapsed: number) => {
          stars.rotation.y = elapsed * 0.05;
          stars.rotation.x = Math.sin(elapsed * 0.03) * 0.1;
        };
      }

      // 4. Resize listener
      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener("resize", handleResize);

      // 5. Animation loop (respects prefers-reduced-motion)
      let clock = new THREE.Clock();
      if (reducedMotion) {
        renderer.render(scene, camera);
      } else {
        const animate = () => {
          animFrameId = requestAnimationFrame(animate);
          const elapsedTime = clock.getElapsedTime();
          updateFn(elapsedTime);
          renderer.render(scene, camera);
        };
        animate();
      }

      cleanup = () => {
        cancelAnimationFrame(animFrameId);
        window.removeEventListener("resize", handleResize);
        disposables.forEach((d) => {
          if (d.geometry) d.geometry.dispose();
          if (d.material) d.material.dispose();
        });
        scene.clear();
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    });

    // 6. Cleanup & Complete Disposal on Unmount
    return () => {
      cleanup();
    };
  }, [occasion, reducedMotion]);

  if (!webGLSupported) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
