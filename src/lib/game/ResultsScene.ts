import { Text, Graphics, Container } from 'pixi.js';
import { Scene } from './Scene';

export type OnRestartCallback = () => void;

/** A single confetti particle */
interface Confetti {
  gfx: Graphics;
  vx: number;
  vy: number;
  va: number; // angular velocity
  gravity: number;
}

/**
 * Results scene — shows final score, accuracy, rating, and confetti celebration.
 * Score counts up from 0. Confetti rains down for high scores.
 */
export class ResultsScene extends Scene {
  private onRestart: OnRestartCallback;
  private playerName: string;
  private targetScore: number;
  private correct: number;
  private total: number;

  // Animation
  private confettiParticles: Confetti[] = [];
  private displayedScore = 0;
  private scoreCountDone = false;
  private scoreText!: Text;
  private elapsedMs = 0;

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
    this.targetScore = score;
    this.correct = correct;
    this.total = total;
    this.onRestart = onRestart;
  }

  setup(): void {
    this.displayedScore = 0;
    this.scoreCountDone = false;
    this.elapsedMs = 0;
    this.confettiParticles = [];

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
    header.y = this.height * 0.1;
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
    nameText.y = this.height * 0.19;
    this.container.addChild(nameText);

    // Big score number — starts at 0, counts up (with glow effect)
    this.scoreText = new Text({
      text: '0',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(90),
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
        dropShadow: {
          color: 0x3498db,
          blur: 12,
          distance: 0,
          angle: 0,
        },
      },
    });
    this.scoreText.anchor.set(0.5);
    this.scoreText.x = this.centerX;
    this.scoreText.y = this.height * 0.32;
    this.container.addChild(this.scoreText);

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
    pointsLabel.y = this.height * 0.41;
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
    statsText.y = this.height * 0.54;
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
    ratingText.y = this.height * 0.65;
    this.container.addChild(ratingText);

    // Restart button
    const button = this.createButton('Jogar outra vez', this.centerX, this.height * 0.78);
    this.container.addChild(button);

    // Spawn confetti if score is decent
    if (this.targetScore >= 30) {
      this.spawnConfetti();
    }
  }

  private getRatingMessage(accuracy: number): string {
    if (accuracy >= 90) return '🏆 Craque absoluto! Sabes tudo!';
    if (accuracy >= 70) return '⭐ Muito bom! Grande conhecimento!';
    if (accuracy >= 50) return '👍 Nada mau! Continua a tentar!';
    if (accuracy >= 30) return '💪 Podes fazer melhor!';
    return '📺 Precisas de ver mais futebol!';
  }

  private spawnConfetti(): void {
    const colors = [0x2ecc71, 0x3498db, 0xe74c3c, 0xf1c40f, 0x9b59b6, 0xe67e22, 0xffffff];
    const count = Math.min(60, Math.floor(this.targetScore / 2));

    for (let i = 0; i < count; i++) {
      const gfx = new Graphics();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = this.s(4 + Math.random() * 6);

      // Random shape: rect or circle
      if (Math.random() > 0.5) {
        gfx.rect(-size / 2, -size / 4, size, size / 2);
      } else {
        gfx.circle(0, 0, size / 2);
      }
      gfx.fill(color);

      gfx.x = Math.random() * this.width;
      gfx.y = -this.s(20) - Math.random() * this.height * 0.5;
      gfx.rotation = Math.random() * Math.PI * 2;

      this.container.addChild(gfx);
      this.confettiParticles.push({
        gfx,
        vx: (Math.random() - 0.5) * this.s(2),
        vy: this.s(1 + Math.random() * 2),
        va: (Math.random() - 0.5) * 0.15,
        gravity: this.s(0.02 + Math.random() * 0.03),
      });
    }
  }

  update(deltaMs: number): void {
    this.elapsedMs += deltaMs;

    // ── Score count-up animation ────────────────────────
    if (!this.scoreCountDone && this.targetScore > 0) {
      const countDuration = 1200; // ms to count up
      const t = Math.min(this.elapsedMs / countDuration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      this.displayedScore = Math.round(ease * this.targetScore);
      this.scoreText.text = `${this.displayedScore}`;

      // Scale pulse as it counts
      const pulse = 1 + 0.08 * Math.sin(t * Math.PI * 4) * (1 - t);
      this.scoreText.scale.set(pulse);

      if (t >= 1) {
        this.scoreCountDone = true;
        this.scoreText.scale.set(1.0);
      }
    }

    // ── Confetti physics ────────────────────────────────
    for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
      const c = this.confettiParticles[i];
      c.vy += c.gravity;
      c.gfx.x += c.vx;
      c.gfx.y += c.vy;
      c.gfx.rotation += c.va;

      // Fade out near bottom
      if (c.gfx.y > this.height * 0.85) {
        c.gfx.alpha = Math.max(0, 1 - (c.gfx.y - this.height * 0.85) / (this.height * 0.15));
      }

      // Remove when off-screen
      if (c.gfx.y > this.height + this.s(20)) {
        this.container.removeChild(c.gfx);
        c.gfx.destroy();
        this.confettiParticles.splice(i, 1);
      }
    }
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
      btnContainer.scale.set(1.05);
      bg.tint = 0xdddddd;
    });
    btnContainer.on('pointerout', () => {
      btnContainer.scale.set(1.0);
      bg.tint = 0xffffff;
    });
    btnContainer.on('pointerdown', () => {
      this.onRestart();
    });

    return btnContainer;
  }
}
