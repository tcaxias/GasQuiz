/**
 * Manages all game audio: sound effects and background music.
 * Uses the Web Audio API for low-latency playback.
 * Falls back gracefully if audio is unavailable.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGain: AudioNode | null = null;
  private musicPlaying = false;
  private muted = false;

  /** Initialize the AudioContext (must be called from a user gesture) */
  async init(): Promise<void> {
    try {
      this.ctx = new AudioContext();
      await Promise.all([
        this.loadSound('goal', '/sounds/goal.mp3'),
        this.loadSound('fail', '/sounds/fail.mp3'),
        this.loadSound('music', '/sounds/music.mp3'),
      ]);
    } catch {
      // Audio not available — game works fine without it
      console.warn('Audio not available');
    }
  }

  private async loadSound(name: string, url: string): Promise<void> {
    if (!this.ctx) return;
    try {
      const response = await fetch(url);
      if (!response.ok) return;
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(name, audioBuffer);
    } catch {
      console.warn(`Could not load sound: ${name}`);
    }
  }

  /** Play a one-shot sound effect */
  play(name: string): void {
    if (this.muted || !this.ctx || !this.buffers.has(name)) return;

    // Resume context if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers.get(name)!;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.6;
    source.connect(gain);
    gain.connect(this.ctx.destination);

    source.start(0);
  }

  /** Start looping background music */
  startMusic(): void {
    if (this.muted || !this.ctx || !this.buffers.has('music') || this.musicPlaying) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers.get('music')!;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.15; // Background music should be quiet
    source.connect(gain);
    gain.connect(this.ctx.destination);

    source.start(0);
    this.musicSource = source;
    this.musicGain = gain;
    this.musicPlaying = true;
  }

  /** Stop background music */
  stopMusic(): void {
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch {
        // Already stopped
      }
      this.musicSource = null;
      this.musicGain = null;
      this.musicPlaying = false;
    }
  }

  /** Play the goal celebration sound */
  playGoal(): void {
    this.play('goal');
  }

  /** Play the wrong answer sound */
  playFail(): void {
    this.play('fail');
  }

  /** Toggle mute */
  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopMusic();
    }
    return this.muted;
  }

  /** Check if muted */
  isMuted(): boolean {
    return this.muted;
  }

  /** Clean up */
  destroy(): void {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.buffers.clear();
  }
}
