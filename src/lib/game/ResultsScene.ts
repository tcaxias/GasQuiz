import { Text, Graphics, Container } from 'pixi.js';
import { Scene } from './Scene';

export type OnRestartCallback = () => void;

/**
 * Results scene — shows final score, accuracy, and a rating message.
 * Fully responsive.
 */
export class ResultsScene extends Scene {
  private onRestart: OnRestartCallback;
  private playerName: string;
  private score: number;
  private correct: number;
  private total: number;

  constructor(
    app: import('pixi.js').Application,
    playerName: string,
    score: number,
    correct: number,
    total: number,
    onRestart: OnRestartCallback,
  ) {
    super(app);
    this.playerName = playerName;
    this.score = score;
    this.correct = correct;
    this.total = total;
    this.onRestart = onRestart;
  }

  setup(): void {
    // Header
    const header = new Text({
      text: 'Tempo esgotado!',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(40),
        fontWeight: 'bold',
        fill: 0xe74c3c,
        align: 'center',
      },
    });
    header.anchor.set(0.5);
    header.x = this.centerX;
    header.y = this.height * 0.12;
    this.container.addChild(header);

    // Player name
    const nameText = new Text({
      text: this.playerName,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(22),
        fill: 0x3498db,
        align: 'center',
      },
    });
    nameText.anchor.set(0.5);
    nameText.x = this.centerX;
    nameText.y = this.height * 0.22;
    this.container.addChild(nameText);

    // Big score number
    const scoreText = new Text({
      text: `${this.score}`,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(90),
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
      },
    });
    scoreText.anchor.set(0.5);
    scoreText.x = this.centerX;
    scoreText.y = this.height * 0.35;
    this.container.addChild(scoreText);

    const pointsLabel = new Text({
      text: 'pontos',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(20),
        fill: 0x888899,
        align: 'center',
      },
    });
    pointsLabel.anchor.set(0.5);
    pointsLabel.x = this.centerX;
    pointsLabel.y = this.height * 0.43;
    this.container.addChild(pointsLabel);

    // Stats
    const accuracy = this.total > 0 ? Math.round((this.correct / this.total) * 100) : 0;

    const statsText = new Text({
      text: `Respostas corretas: ${this.correct} / ${this.total}\nPrecisão: ${accuracy}%`,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(18),
        fill: 0xaaaacc,
        align: 'center',
        lineHeight: this.s(28),
      },
    });
    statsText.anchor.set(0.5);
    statsText.x = this.centerX;
    statsText.y = this.height * 0.56;
    this.container.addChild(statsText);

    // Rating
    const ratingMsg = this.getRatingMessage(accuracy);
    const ratingText = new Text({
      text: ratingMsg,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(18),
        fontStyle: 'italic',
        fill: 0x2ecc71,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.width * 0.85,
      },
    });
    ratingText.anchor.set(0.5);
    ratingText.x = this.centerX;
    ratingText.y = this.height * 0.67;
    this.container.addChild(ratingText);

    // Restart button
    const button = this.createButton('Jogar outra vez', this.centerX, this.height * 0.8);
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

    const w = this.buttonWidth;
    const h = this.buttonHeight;

    const bg = new Graphics();
    bg.roundRect(-w / 2, -h / 2, w, h, this.s(12));
    bg.fill(0x3498db);
    btnContainer.addChild(bg);

    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(22),
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
