import { Application } from 'pixi.js';
import { MenuScene } from './MenuScene';
import { QuizScene } from './QuizScene';
import { ResultsScene } from './ResultsScene';
import { AudioManager } from './AudioManager';
import { Scene } from './Scene';
import { generateQuestion } from './questions';
import { getTeamColors, defaultColors } from '$lib/data/teams';

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
  private tickerCallback: ((ticker: import('pixi.js').Ticker) => void) | null = null;

  constructor(playerName: string, favoriteTeam: string) {
    this.app = new Application();
    this.audio = new AudioManager();
    this.playerName = playerName;
    this.favoriteTeam = favoriteTeam;
  }

  async init(container: HTMLElement): Promise<void> {
    const colors = this.favoriteTeam ? getTeamColors(this.favoriteTeam) : defaultColors;

    await this.app.init({
      resizeTo: container,
      background: colors.primary,
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
    const menuScene = new MenuScene(this.app, this.playerName, this.favoriteTeam, () => {
      this.startQuiz();
    });
    this.switchScene(menuScene);
  }

  private startQuiz(): void {
    this.audio.startMusic();

    const team = this.favoriteTeam;
    const quizScene = new QuizScene(
      this.app,
      () => generateQuestion(team),
      (result) => {
        if (result.wasCorrect) {
          this.audio.playGoal();
        } else {
          this.audio.playFail();
        }
      },
      (score, correct, total) => {
        this.audio.stopMusic();
        this.audio.playEnd();
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
