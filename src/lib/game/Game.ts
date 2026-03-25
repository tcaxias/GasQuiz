import { Application, Ticker } from 'pixi.js';
import { MenuScene } from './MenuScene';
import { QuizScene } from './QuizScene';
import { ResultsScene } from './ResultsScene';
import { AudioManager } from './AudioManager';
import { Scene } from './Scene';
import { QuestionGenerator } from './questions';
import { getTeamColors, defaultColors } from '$lib/data/teams';
import { flags } from '$lib/config';

/** Callback to push game state updates for ARIA live region */
export type OnAriaUpdate = (text: string) => void;

/**
 * Main game controller.
 * Manages scene transitions, audio, and the PixiJS application lifecycle.
 */
export class Game {
  private app: Application;
  private audio: AudioManager;
  private playerName: string;
  private favoriteTeam: string;
  private currentScene: Scene | null = null;
  private tickerCallback: ((ticker: Ticker) => void) | null = null;
  private onSettings?: (action: 'name' | 'team') => void;
  private onAriaUpdate?: OnAriaUpdate;
  private resizeHandler: (() => void) | null = null;
  private resizeRafId: number | null = null;

  constructor(
    playerName: string,
    favoriteTeam: string,
    onSettings?: (action: 'name' | 'team') => void,
    onAriaUpdate?: OnAriaUpdate,
  ) {
    this.app = new Application();
    this.audio = new AudioManager();
    this.playerName = playerName;
    this.favoriteTeam = favoriteTeam;
    this.onSettings = onSettings;
    this.onAriaUpdate = onAriaUpdate;
  }

  /**
   * Pre-create the AudioContext inside a user gesture.
   * Call this from a click/tap handler before init() to comply with autoplay policy.
   */
  initAudio(): void {
    this.audio.init();
  }

  async init(container: HTMLElement): Promise<void> {
    const colors = this.favoriteTeam ? getTeamColors(this.favoriteTeam) : defaultColors;

    await this.app.init({
      resizeTo: container,
      background: colors.primary,
      antialias: true,
    });

    container.appendChild(this.app.canvas);

    // Set ARIA attributes on the canvas
    this.app.canvas.setAttribute('role', 'application');
    this.app.canvas.setAttribute('aria-label', 'Quiz de futebol portugues');

    // Init audio if not already done (fallback — may be suspended)
    this.audio.init();

    // Listen for viewport resize to re-layout the current scene (debounced via rAF)
    this.resizeHandler = () => {
      if (this.resizeRafId !== null) return;
      this.resizeRafId = requestAnimationFrame(() => {
        this.resizeRafId = null;
        if (this.currentScene) {
          this.currentScene.resize();
        }
      });
    };
    window.addEventListener('resize', this.resizeHandler);

    this.showMenu();
  }

  private switchScene(scene: Scene): void {
    if (this.currentScene) {
      this.currentScene.hide();
      this.currentScene.destroy();
    }

    if (this.tickerCallback) {
      this.app.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }

    this.currentScene = scene;
    scene.setup();
    scene.show();

    this.tickerCallback = (ticker) => {
      scene.update(ticker.deltaMS);
    };
    this.app.ticker.add(this.tickerCallback);
  }

  private showMenu(): void {
    this.ariaAnnounce(`Menu principal. Ola, ${this.playerName}!`);

    const menuScene = new MenuScene(
      this.app,
      this.playerName,
      this.favoriteTeam,
      () => this.startQuiz(),
      (action) => {
        if (this.onSettings) {
          this.destroy();
          this.onSettings(action);
        }
      },
    );
    this.switchScene(menuScene);
  }

  private startQuiz(): void {
    if (flags.audio) this.audio.startMusic();

    const generator = new QuestionGenerator(this.favoriteTeam);
    const quizScene = new QuizScene(
      this.app,
      () => generator.next(),
      (result) => {
        if (flags.audio) {
          if (result.wasCorrect) {
            this.audio.playGoal();
          } else {
            this.audio.playFail();
          }
        }
      },
      (score, correct, total) => {
        if (flags.audio) {
          this.audio.stopMusic();
          this.audio.playEnd();
        }
        this.showResults(score, correct, total);
      },
      (text) => this.ariaAnnounce(text),
    );
    this.switchScene(quizScene);
  }

  private showResults(score: number, correct: number, total: number): void {
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    this.ariaAnnounce(
      `Tempo esgotado! ${this.playerName}, fizeste ${score} pontos. ${correct} de ${total} corretas, ${accuracy}% de precisao.`,
    );

    const resultsScene = new ResultsScene(this.app, this.playerName, score, correct, total, () => {
      this.showMenu();
    });
    this.switchScene(resultsScene);
  }

  private ariaAnnounce(text: string): void {
    if (this.onAriaUpdate) {
      this.onAriaUpdate(text);
    }
  }

  destroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.resizeRafId !== null) {
      cancelAnimationFrame(this.resizeRafId);
      this.resizeRafId = null;
    }
    if (this.currentScene) {
      this.currentScene.hide();
      this.currentScene.destroy();
    }
    if (this.tickerCallback) {
      this.app.ticker.remove(this.tickerCallback);
    }
    this.audio.destroy();
    this.app.destroy(true);
  }
}
