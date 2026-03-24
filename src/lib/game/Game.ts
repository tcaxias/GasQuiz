import { Application } from 'pixi.js';
import { MenuScene } from './MenuScene';
import { QuizScene } from './QuizScene';
import { ResultsScene } from './ResultsScene';
import { Scene } from './Scene';
import { generateQuestion } from './questions';

/**
 * Main game controller.
 * Manages scene transitions and the PixiJS application lifecycle.
 */
export class Game {
  private app: Application;
  private currentScene: Scene | null = null;
  private tickerCallback: ((ticker: import('pixi.js').Ticker) => void) | null = null;

  constructor() {
    this.app = new Application();
  }

  async init(container: HTMLElement): Promise<void> {
    await this.app.init({
      resizeTo: container,
      background: '#1a1a2e',
      antialias: true,
    });

    container.appendChild(this.app.canvas);

    this.showMenu();
  }

  private switchScene(scene: Scene): void {
    // Clean up current scene
    if (this.currentScene) {
      this.currentScene.hide();
      this.currentScene.destroy();
    }

    // Remove previous ticker callback
    if (this.tickerCallback) {
      this.app.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }

    // Set up new scene
    this.currentScene = scene;
    scene.setup();
    scene.show();

    // Add update loop
    this.tickerCallback = (ticker) => {
      scene.update(ticker.deltaMS);
    };
    this.app.ticker.add(this.tickerCallback);
  }

  private showMenu(): void {
    const menuScene = new MenuScene(this.app, () => {
      this.startQuiz();
    });
    this.switchScene(menuScene);
  }

  private startQuiz(): void {
    const quizScene = new QuizScene(
      this.app,
      () => generateQuestion(),
      (_result) => {
        // Could track per-question stats here if needed
      },
      (score, correct, total) => {
        this.showResults(score, correct, total);
      },
    );
    this.switchScene(quizScene);
  }

  private showResults(score: number, correct: number, total: number): void {
    const resultsScene = new ResultsScene(this.app, score, correct, total, () => {
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
    this.app.destroy(true);
  }
}
