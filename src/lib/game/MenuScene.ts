import { Text, Graphics, Container } from 'pixi.js';
import { Scene } from './Scene';

/** Callback when the player presses "Jogar" */
export type OnStartCallback = () => void;

/**
 * Menu scene — title screen with a start button.
 * Shows: GasQuiz title, subtitle, "Jogar" button.
 */
export class MenuScene extends Scene {
  private onStart: OnStartCallback;

  constructor(app: import('pixi.js').Application, onStart: OnStartCallback) {
    super(app);
    this.onStart = onStart;
  }

  setup(): void {
    // Title
    const title = new Text({
      text: 'GasQuiz',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 72,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
        dropShadow: {
          color: 0x000000,
          blur: 4,
          distance: 3,
          angle: Math.PI / 4,
        },
      },
    });
    title.anchor.set(0.5);
    title.x = this.centerX;
    title.y = this.height * 0.25;
    this.container.addChild(title);

    // Subtitle
    const subtitle = new Text({
      text: 'Quiz da Primeira Liga 2025-26',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 24,
        fill: 0xaaaacc,
        align: 'center',
      },
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.centerX;
    subtitle.y = this.height * 0.35;
    this.container.addChild(subtitle);

    // Instructions
    const instructions = new Text({
      text: 'Responde a perguntas sobre futebol português!\n1 minuto — quantas consegues acertar?',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 18,
        fill: 0x888899,
        align: 'center',
        lineHeight: 26,
      },
    });
    instructions.anchor.set(0.5);
    instructions.x = this.centerX;
    instructions.y = this.height * 0.48;
    this.container.addChild(instructions);

    // Start button
    const button = this.createButton('Jogar', this.centerX, this.height * 0.65);
    this.container.addChild(button);
  }

  private createButton(label: string, x: number, y: number): Container {
    const btnContainer = new Container();
    btnContainer.x = x;
    btnContainer.y = y;

    const btnWidth = 220;
    const btnHeight = 60;

    const bg = new Graphics();
    bg.roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 12);
    bg.fill(0x2ecc71);
    btnContainer.addChild(bg);

    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 28,
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
      this.onStart();
    });

    return btnContainer;
  }
}
