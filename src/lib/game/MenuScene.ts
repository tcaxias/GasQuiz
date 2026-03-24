import { Text, Graphics, Container } from 'pixi.js';
import { Scene } from './Scene';
import { getTeamColors, defaultColors } from '$lib/data/teams';

export type OnStartCallback = () => void;

/**
 * Menu scene — title screen with player greeting and start button.
 * Background matches the favorite team colors.
 * Fully responsive: scales text and buttons to any screen size.
 */
export class MenuScene extends Scene {
  private onStart: OnStartCallback;
  private playerName: string;
  private favoriteTeam: string;

  constructor(
    app: import('pixi.js').Application,
    playerName: string,
    favoriteTeam: string,
    onStart: OnStartCallback,
  ) {
    super(app);
    this.playerName = playerName;
    this.favoriteTeam = favoriteTeam;
    this.onStart = onStart;
  }

  setup(): void {
    const colors = this.favoriteTeam ? getTeamColors(this.favoriteTeam) : defaultColors;
    const textColor = colors.text;

    // Title
    const title = new Text({
      text: 'GasQuiz',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(72),
        fontWeight: 'bold',
        fill: textColor,
        align: 'center',
        dropShadow: {
          color: 0x000000,
          blur: this.s(4),
          distance: this.s(3),
          angle: Math.PI / 4,
        },
      },
    });
    title.anchor.set(0.5);
    title.x = this.centerX;
    title.y = this.height * 0.18;
    this.container.addChild(title);

    // Subtitle
    const subtitle = new Text({
      text: 'Quiz da Primeira Liga 2025-26',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(22),
        fill: textColor,
        align: 'center',
      },
    });
    subtitle.alpha = 0.7;
    subtitle.anchor.set(0.5);
    subtitle.x = this.centerX;
    subtitle.y = this.height * 0.27;
    this.container.addChild(subtitle);

    // Player greeting
    const greeting = new Text({
      text: `Olá, ${this.playerName}!`,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(26),
        fontWeight: 'bold',
        fill: colors.secondary,
        align: 'center',
      },
    });
    greeting.anchor.set(0.5);
    greeting.x = this.centerX;
    greeting.y = this.height * 0.38;
    this.container.addChild(greeting);

    // Favorite team badge
    if (this.favoriteTeam) {
      const teamBadge = new Text({
        text: this.favoriteTeam,
        style: {
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: this.s(20),
          fontWeight: 'bold',
          fill: textColor,
          align: 'center',
        },
      });
      teamBadge.anchor.set(0.5);
      teamBadge.x = this.centerX;
      teamBadge.y = this.height * 0.46;
      this.container.addChild(teamBadge);
    }

    // Instructions
    const instructions = new Text({
      text: 'Responde a perguntas sobre futebol português!\n1 minuto — quantas consegues acertar?',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(16),
        fill: textColor,
        align: 'center',
        lineHeight: this.s(24),
        wordWrap: true,
        wordWrapWidth: this.width * 0.85,
      },
    });
    instructions.alpha = 0.6;
    instructions.anchor.set(0.5);
    instructions.x = this.centerX;
    instructions.y = this.height * 0.58;
    this.container.addChild(instructions);

    // Start button
    const button = this.createButton('Jogar', this.centerX, this.height * 0.74, colors.secondary);
    this.container.addChild(button);
  }

  private createButton(label: string, x: number, y: number, color: number): Container {
    const btnContainer = new Container();
    btnContainer.x = x;
    btnContainer.y = y;

    const w = this.buttonWidth;
    const h = this.buttonHeight;

    const bg = new Graphics();
    bg.roundRect(-w / 2, -h / 2, w, h, this.s(12));
    bg.fill(color);
    btnContainer.addChild(bg);

    // Use dark text on light buttons, white on dark
    const btnTextColor = color === 0xffffff || color > 0xcccccc ? 0x1a1a2e : 0xffffff;

    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(28),
        fontWeight: 'bold',
        fill: btnTextColor,
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
