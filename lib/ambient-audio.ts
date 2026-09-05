// Ambient Audio Relaxation Engine for EchoTale Grimoire
// Primary Source: /audio/ambient-pad.mp3 (in /public/audio/ambient-pad.mp3)
// Fallback: Procedural Web Audio API synthesizer

export class AmbientAudioEngine {
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private synthNodes: { oscs: OscillatorNode[]; filter: BiquadFilterNode } | null = null;
  private isPlaying: boolean = false;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private currentMode: "mp3" | "synth" | null = null;

  private initContext() {
    if (!this.audioContext && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0; // Starts muted
        this.gainNode.connect(this.audioContext.destination);
      }
    }
  }

  public async toggle(trackUrl: string = "/audio/ambient-pad.mp3"): Promise<boolean> {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      return await this.play(trackUrl);
    }
  }

  public async play(trackUrl: string = "/audio/ambient-pad.mp3"): Promise<boolean> {
    if (typeof window === "undefined") return false;

    this.isPlaying = true;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    try {
      // 1. Try playing the physical audio file first
      const resolvedUrl = trackUrl.startsWith("/") ? trackUrl : `/${trackUrl}`;
      
      if (!this.audioElement) {
        this.audioElement = new Audio(resolvedUrl);
        this.audioElement.loop = true;
        this.audioElement.preload = "auto";
      } else {
        if (!this.audioElement.src.endsWith(resolvedUrl)) {
          this.audioElement.pause();
          this.audioElement.src = resolvedUrl;
        }
      }

      this.audioElement.volume = 0;
      const playPromise = this.audioElement.play();

      if (playPromise !== undefined) {
        await playPromise;
      }

      this.currentMode = "mp3";
      this.fadeAudioElementIn(0.4, 1500);
      return true;
    } catch (err) {
      console.warn("Direct MP3 playback not available, engaging procedural synth fallback:", err);
      // Fallback: Start Web Audio API procedural soothing synthesizer
      this.startProceduralSynth();
      this.currentMode = "synth";
      return true;
    }
  }

  private fadeAudioElementIn(targetVolume: number = 0.4, durationMs: number = 1500) {
    if (!this.audioElement) return;
    const startTime = Date.now();
    const startVol = this.audioElement.volume;

    if (this.fadeInterval) clearInterval(this.fadeInterval);

    this.fadeInterval = setInterval(() => {
      if (!this.audioElement || !this.isPlaying) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        return;
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      this.audioElement.volume = Math.min(1, Math.max(0, startVol + (targetVolume - startVol) * progress));

      if (progress >= 1) {
        this.audioElement.volume = targetVolume;
        if (this.fadeInterval) clearInterval(this.fadeInterval);
      }
    }, 40);
  }

  private fadeAudioElementOut(durationMs: number = 1000) {
    if (!this.audioElement) return;
    const startTime = Date.now();
    const startVol = this.audioElement.volume;

    if (this.fadeInterval) clearInterval(this.fadeInterval);

    this.fadeInterval = setInterval(() => {
      if (!this.audioElement) {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
        return;
      }

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      this.audioElement.volume = Math.max(0, startVol * (1 - progress));

      if (progress >= 1 || this.audioElement.volume <= 0.01) {
        this.audioElement.volume = 0;
        this.audioElement.pause();
        if (this.fadeInterval) clearInterval(this.fadeInterval);
      }
    }, 40);
  }

  private startProceduralSynth() {
    this.initContext();
    if (!this.audioContext || !this.gainNode || this.synthNodes) return;

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }

    const ctx = this.audioContext;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    // Ambient chords (D3, A3, C#4, F#4)
    const freqs = [146.83, 220.0, 277.18, 369.99];
    const oscs: OscillatorNode[] = [];

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(f, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1 + i * 0.05, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(3, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      osc.connect(filter);
      osc.start();
      oscs.push(osc);
    });

    filter.connect(this.gainNode);
    this.synthNodes = { oscs, filter };

    // Ramp up synth gain
    const now = ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0.35, now + 1.5);
  }

  private stopProceduralSynth() {
    if (!this.audioContext || !this.gainNode || !this.synthNodes) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0.0001, now + 1.0);

    setTimeout(() => {
      if (this.synthNodes) {
        this.synthNodes.oscs.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        try {
          this.synthNodes.filter.disconnect();
        } catch {}
        this.synthNodes = null;
      }
    }, 1100);
  }

  public getState(): boolean {
    return this.isPlaying;
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.currentMode === "mp3" || this.audioElement) {
      this.fadeAudioElementOut(1000);
    }
    if (this.currentMode === "synth" || this.synthNodes) {
      this.stopProceduralSynth();
    }
    this.currentMode = null;
  }
}

// Singleton ambient audio engine instance
export const ambientAudioEngine = new AmbientAudioEngine();

const NOTE_FREQS: Record<string, number> = {
  C3: 130.81,
  E3: 164.81,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
};

/**
 * Procedurally play an ethereal musical chime/bell note using Web Audio API
 */
export function playNote(
  note: string,
  duration: number = 0.3,
  type: OscillatorType = "sine",
  volume: number = 0.15
): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const freq = NOTE_FREQS[note] || 440;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, (duration + 0.1) * 1000);
  } catch (e) {
    console.warn("Web audio note playback skipped:", e);
  }
}

/**
 * Stop all active ambient audio
 */
export function stopAllAudio(): void {
  ambientAudioEngine.stop();
}

