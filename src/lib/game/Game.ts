import { Application } from 'pixi.js';
import { MenuScene } from './MenuScene';
import { QuizScene } from './QuizScene';
import { ResultsScene } from './ResultsScene';
import { AudioManager } from './AudioManager';
import { Scene } from './Scene';
import { generateQuestion } from './questions';

/**
 * Main game controller.
 * Manages scene transitions, audio, and the PixiJS application lifecycle.
 */
export class Game {
  private app: Application;
  private audio: AudioManager;
  private playerName: string;
  private currentScene: Scene | null = null;
  private tickerCallback: ((ticker: import('pixi.js').Ticker) => void) | null = null;

  constructor(playerName: string) {
    this.app = new Application();
    this.audio = new AudioManager();
    this.playerName = playerName;
  }

  async init(container: HTMLElement): Promise<void> {
    await this.app.init({
      resizeTo: container,
      background: '#1a1a2e',
      antialias: true,
    });

    container.appendChild(this.app.canvas);

    // Init audio (will load sounds in the background)
    this.audio.init();

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
    const menuScene = new MenuScene(this.app, this.playerName, () => {
      this.startQuiz();
    });
    this.switchScene(menuScene);
  }

  private startQuiz(): void {
    this.audio.startMusic();

    const quizScene = new QuizScene(
      this.app,
      () => generateQuestion(),
      (result) => {
        if (result.wasCorrect) {
          this.audio.playGoal();
        } else {
          this.audio.playFail();
        }
      },
      (score, correct, total) => {
        this.audio.stopMusic();
        this.showResults(score, correct, total);
      },
    );
    this.switchScene(quizScene);
  }

  private showResults(score: number, correct: number, total: number): void {
    const resultsScene = new ResultsScene(this.app, this.playerName, score, correct, total, () => {
      this.showMenu();
    });
    this.switchScene(resultsScene);
  }

  destroy(): void {
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
