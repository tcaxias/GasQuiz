/**
 * Manages all game audio: sound effects and background music.
 * Uses the Web Audio API for low-latency playback.
 * Falls back gracefully if audio is unavailable.
 *
 * The AudioContext must be created from a user gesture (click/tap)
 * to comply with browser autoplay policies.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGain: GainNode | null = null;
  private musicPlaying = false;
  private muted = false;
  private readyPromise: Promise<void> | null = null;
  private pendingMusicStart = false;

  /**
   * Initialize the AudioContext and load all sounds.
   * Must be called from a direct user gesture handler (click, tap, keydown)
   * or the AudioContext will be created in a suspended state.
   */
  init(): void {
    if (this.readyPromise) return; // Already initialized

    this.readyPromise = this.loadAll();
  }

  private async loadAll(): Promise<void> {
    try {
      this.ctx = new AudioContext();
      await Promise.all([
        this.loadSound('goal', '/sounds/goal.mp3'),
        this.loadSound('fail', '/sounds/fail.mp3'),
        this.loadSound('music', '/sounds/music.mp3'),
        this.loadSound('end', '/sounds/end.mp3'),
      ]);

      // If music was requested before loading finished, start it now
      if (this.pendingMusicStart) {
        this.pendingMusicStart = false;
        this.startMusic();
      }
    } catch {
      // Audio not available — game works fine without it
      console.warn('Audio not available');
    }
  }

  /** Wait until all sounds are loaded. Resolves immediately if already ready. */
  async whenReady(): Promise<void> {
    if (this.readyPromise) {
      await this.readyPromise;
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

  /** Play a one-shot sound effect at the given volume (0–1) */
  play(name: string, volume = 0.5): void {
    if (this.muted || !this.ctx || !this.buffers.has(name)) return;

    // Resume context if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers.get(name)!;

    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(this.ctx.destination);

    source.start(0);
  }

  /** Start looping background music. If sounds are still loading, defers until ready. */
  startMusic(): void {
    if (this.muted || this.musicPlaying) return;

    // If buffers haven't loaded yet, defer
    if (!this.ctx || !this.buffers.has('music')) {
      this.pendingMusicStart = true;
      return;
    }

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
    this.pendingMusicStart = false;
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
    this.play('goal', 0.5);
  }

  /** Play the wrong answer sound */
  playFail(): void {
    this.play('fail', 0.25);
  }

  /** Play the end-game celebration sound */
  playEnd(): void {
    this.play('end', 0.5);
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
