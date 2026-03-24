import { Text, Graphics, Container } from 'pixi.js';
import { Scene } from './Scene';

export type OnRestartCallback = () => void;

/**
 * Results scene — shows final score after time runs out.
 */
export class ResultsScene extends Scene {
  private onRestart: OnRestartCallback;
  private score: number;
  private correct: number;
  private total: number;

  constructor(
    app: import('pixi.js').Application,
    score: number,
    correct: number,
    total: number,
    onRestart: OnRestartCallback,
  ) {
    super(app);
    this.score = score;
    this.correct = correct;
    this.total = total;
    this.onRestart = onRestart;
  }

  setup(): void {
    // "Tempo esgotado!" header
    const header = new Text({
      text: 'Tempo esgotado!',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 48,
        fontWeight: 'bold',
        fill: 0xe74c3c,
        align: 'center',
      },
    });
    header.anchor.set(0.5);
    header.x = this.centerX;
    header.y = this.height * 0.15;
    this.container.addChild(header);

    // Score
    const scoreText = new Text({
      text: `${this.score}`,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 96,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
      },
    });
    scoreText.anchor.set(0.5);
    scoreText.x = this.centerX;
    scoreText.y = this.height * 0.32;
    this.container.addChild(scoreText);

    const pointsLabel = new Text({
      text: 'pontos',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 24,
        fill: 0x888899,
        align: 'center',
      },
    });
    pointsLabel.anchor.set(0.5);
    pointsLabel.x = this.centerX;
    pointsLabel.y = this.height * 0.4;
    this.container.addChild(pointsLabel);

    // Stats
    const accuracy = this.total > 0 ? Math.round((this.correct / this.total) * 100) : 0;

    const statsText = new Text({
      text: `Respostas corretas: ${this.correct} / ${this.total}\nPrecisão: ${accuracy}%`,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 22,
        fill: 0xaaaacc,
        align: 'center',
        lineHeight: 32,
      },
    });
    statsText.anchor.set(0.5);
    statsText.x = this.centerX;
    statsText.y = this.height * 0.53;
    this.container.addChild(statsText);

    // Rating message
    const ratingMsg = this.getRatingMessage(accuracy);
    const ratingText = new Text({
      text: ratingMsg,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 20,
        fontStyle: 'italic',
        fill: 0x2ecc71,
        align: 'center',
      },
    });
    ratingText.anchor.set(0.5);
    ratingText.x = this.centerX;
    ratingText.y = this.height * 0.64;
    this.container.addChild(ratingText);

    // "Jogar outra vez" button
    const button = this.createButton('Jogar outra vez', this.centerX, this.height * 0.78);
    this.container.addChild(button);
  }

  private getRatingMessage(accuracy: number): string {
    if (accuracy >= 90) return 'Craque absoluto! Sabes tudo!';
    if (accuracy >= 70) return 'Muito bom! Grande conhecimento!';
    if (accuracy >= 50) return 'Nada mau! Continua a tentar!';
    if (accuracy >= 30) return 'Podes fazer melhor!';
    return 'Precisas de ver mais futebol!';
  }

  private createButton(label: string, x: number, y: number): Container {
    const btnContainer = new Container();
    btnContainer.x = x;
    btnContainer.y = y;

    const btnWidth = 280;
    const btnHeight = 60;

    const bg = new Graphics();
    bg.roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 12);
    bg.fill(0x3498db);
    btnContainer.addChild(bg);

    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xffffff,
      },
    });
    text.anchor.set(0.5);
    btnContainer.addChild(text);

    btnContainer.eventMode = 'static';
    btnContainer.cursor = 'pointer';

    btnContainer.on('pointerover', () => {
      bg.tint = 0xdddddd;
    });
    btnContainer.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    btnContainer.on('pointerdown', () => {
      this.onRestart();
    });

    return btnContainer;
  }
}
