// Procedural Web Audio Synthesizer for Sanctum Moments
import type { MomentOccasion } from "./moments-types";

class MomentsAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeGains: GainNode[] = [];
  private loopInterval: NodeJS.Timeout | null = null;
  private currentOccasion: MomentOccasion = "love";

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public play(occasion: MomentOccasion = "love") {
    try {
      this.initContext();
      if (!this.ctx) return;

      this.stop();
      this.currentOccasion = occasion;
      this.isPlaying = true;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 2.5);
      this.masterGain.connect(this.ctx.destination);

      this.startOccasionLoop(occasion);
    } catch (e) {
      console.warn("Moments audio error:", e);
    }
  }

  public stop() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }

    if (this.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      } catch {
        // Ignore ramp error
      }
    }

    setTimeout(() => {
      this.activeOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // already stopped
        }
      });
      this.activeGains.forEach((g) => {
        try {
          g.disconnect();
        } catch {
          // already disconnected
        }
      });
      this.activeOscillators = [];
      this.activeGains = [];
    }, 1250);

    this.isPlaying = false;
  }

  public toggle(occasion: MomentOccasion = "love"): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play(occasion);
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private startOccasionLoop(occasion: MomentOccasion) {
    if (!this.ctx || !this.masterGain) return;

    // Trigger immediate chord
    this.playChord(occasion);

    // Schedule harmonic cycle every 4.8 seconds
    this.loopInterval = setInterval(() => {
      if (this.isPlaying && this.ctx) {
        this.playChord(occasion);
      }
    }, 4800);
  }

  private playChord(occasion: MomentOccasion) {
    if (!this.ctx || !this.masterGain) return;

    const chords: Record<MomentOccasion, number[][]> = {
      love: [
        [261.63, 329.63, 392.0, 523.25], // C Major / E / G / C
        [220.0, 261.63, 329.63, 440.0],  // A Minor
        [174.61, 220.0, 261.63, 349.23], // F Major
        [196.0, 246.94, 293.66, 392.0],  // G Major
      ],
      birthday: [
        [329.63, 392.0, 493.88, 587.33], // E minor 7
        [392.0, 493.88, 587.33, 783.99], // G Major vibrant
        [440.0, 554.37, 659.25, 880.0],  // A Major celebratory
      ],
      apology: [
        [220.0, 261.63, 329.63, 392.0],  // A minor 7 somber
        [174.61, 220.0, 261.63, 329.63], // F Major 7 gentle
        [146.83, 174.61, 220.0, 261.63], // D minor 7
      ],
      family: [
        [196.0, 246.94, 293.66, 392.0],  // G Major warm
        [220.0, 261.63, 329.63, 440.0],  // A minor
        [261.63, 329.63, 392.0, 523.25], // C Major
      ],
      missing: [
        [196.0, 293.66, 392.0, 587.33],  // Deep 5ths Open Space
        [220.0, 329.63, 440.0, 659.25],  // Ethereal Minor
        [174.61, 261.63, 349.23, 523.25],// Distant Horizon
      ],
    };

    const palette = chords[occasion] || chords.love;
    const selectedChord = palette[Math.floor(Math.random() * palette.length)];

    selectedChord.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      // Soft waveform selection
      osc.type = occasion === "birthday" ? "triangle" : occasion === "missing" ? "sine" : "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle detune for shimmer
      osc.detune.setValueAtTime((idx - 1.5) * 4, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.06 / selectedChord.length, now + 1.2 + idx * 0.15);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 4.8);

      this.activeOscillators.push(osc);
      this.activeGains.push(noteGain);
    });
  }
}

export const momentsAudio = new MomentsAudioEngine();
