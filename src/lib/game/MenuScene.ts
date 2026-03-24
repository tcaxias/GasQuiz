import { Text, Graphics, Container } from 'pixi.js';
import { Scene } from './Scene';
import { getTeamColors, defaultColors } from '$lib/data/teams';

export type OnStartCallback = () => void;

/**
 * Menu scene — title screen with player greeting and start button.
 * Features: breathing title animation, team-colored background.
 */
/** A floating background particle */
interface Particle {
  gfx: Graphics;
  x: number;
  y: number;
  speed: number;
  swayPhase: number;
  swaySpeed: number;
}

export class MenuScene extends Scene {
  private onStart: OnStartCallback;
  private onChangeSettings: (action: 'name' | 'team') => void;
  private playerName: string;
  private favoriteTeam: string;
  private titleText!: Text;
  private elapsedMs = 0;
  private particles: Particle[] = [];

  constructor(
    app: import('pixi.js').Application,
    playerName: string,
    favoriteTeam: string,
    onStart: OnStartCallback,
    onChangeSettings: (action: 'name' | 'team') => void,
  ) {
    super(app);
    this.playerName = playerName;
    this.favoriteTeam = favoriteTeam;
    this.onStart = onStart;
    this.onChangeSettings = onChangeSettings;
  }

  setup(): void {
    this.elapsedMs = 0;
    const colors = this.favoriteTeam ? getTeamColors(this.favoriteTeam) : defaultColors;
    const textColor = colors.text;

    // Title
    this.titleText = new Text({
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
    this.titleText.anchor.set(0.5);
    this.titleText.x = this.centerX;
    this.titleText.y = this.height * 0.18;
    this.container.addChild(this.titleText);

    // Subtitle
    const subtitle = new Text({
      text: 'Quiz de Futebol Português 2025-26',
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

    // Favorite team display
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
      teamBadge.alpha = 0.8;
      teamBadge.anchor.set(0.5);
      teamBadge.x = this.centerX;
      teamBadge.y = this.height * 0.46;
      this.container.addChild(teamBadge);
    }

    // Settings links — change name / change club
    const settingsY = this.height * 0.52;
    const settingsGap = this.s(12);

    const changeName = new Text({
      text: '✏️ Alterar nome',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(14),
        fill: textColor,
      },
    });
    changeName.alpha = 0.5;
    changeName.anchor.set(1, 0.5);
    changeName.x = this.centerX - settingsGap;
    changeName.y = settingsY;
    changeName.eventMode = 'static';
    changeName.cursor = 'pointer';
    changeName.on('pointerover', () => {
      changeName.alpha = 0.9;
    });
    changeName.on('pointerout', () => {
      changeName.alpha = 0.5;
    });
    changeName.on('pointerdown', () => this.onChangeSettings('name'));
    this.container.addChild(changeName);

    const changeTeam = new Text({
      text: '🔄 Alterar clube',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(14),
        fill: textColor,
      },
    });
    changeTeam.alpha = 0.5;
    changeTeam.anchor.set(0, 0.5);
    changeTeam.x = this.centerX + settingsGap;
    changeTeam.y = settingsY;
    changeTeam.eventMode = 'static';
    changeTeam.cursor = 'pointer';
    changeTeam.on('pointerover', () => {
      changeTeam.alpha = 0.9;
    });
    changeTeam.on('pointerout', () => {
      changeTeam.alpha = 0.5;
    });
    changeTeam.on('pointerdown', () => this.onChangeSettings('team'));
    this.container.addChild(changeTeam);

    // Instructions
    const instructions = new Text({
      text: 'Responde a perguntas sobre futebol português!\n3 minutos — quantas consegues acertar?',
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
    instructions.y = this.height * 0.62;
    this.container.addChild(instructions);

    // Start button
    // Floating background particles
    this.spawnParticles(colors.secondary);

    const button = this.createButton('⚽ Jogar', this.centerX, this.height * 0.78, colors.secondary);
    this.container.addChild(button);
  }

  private spawnParticles(color: number): void {
    this.particles = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const gfx = new Graphics();
      const size = this.s(3 + Math.random() * 5);
      gfx.circle(0, 0, size);
      gfx.fill(color);
      gfx.alpha = 0.06 + Math.random() * 0.06;

      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      gfx.x = x;
      gfx.y = y;

      // Insert particles behind other content
      this.container.addChildAt(gfx, 0);

      this.particles.push({
        gfx,
        x,
        y,
        speed: this.s(0.3 + Math.random() * 0.4),
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.001 + Math.random() * 0.002,
      });
    }
  }

  update(deltaMs: number): void {
    this.elapsedMs += deltaMs;

    // Gentle breathing effect on title
    const breath = 1 + 0.02 * Math.sin(this.elapsedMs * 0.002);
    this.titleText.scale.set(breath);

    // Animate floating particles
    for (const p of this.particles) {
      p.y -= p.speed * (deltaMs / 16);
      p.swayPhase += p.swaySpeed * deltaMs;
      p.gfx.x = p.x + Math.sin(p.swayPhase) * this.s(15);
      p.gfx.y = p.y;

      // Recycle at top
      if (p.y < -this.s(10)) {
        p.y = this.height + this.s(10);
        p.x = Math.random() * this.width;
      }
    }
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
      btnContainer.scale.set(1.06);
      bg.tint = 0xdddddd;
    });
    btnContainer.on('pointerout', () => {
      btnContainer.scale.set(1.0);
      bg.tint = 0xffffff;
    });
    btnContainer.on('pointerdown', () => {
      this.onStart();
    });

    return btnContainer;
  }
}
