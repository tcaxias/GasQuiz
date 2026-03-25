import { Text, Graphics, Container, Sprite, Assets } from 'pixi.js';
import { Scene, prefersReducedMotion } from './Scene';
import type { Question, AnswerResult } from '$lib/types/quiz';

const GAME_DURATION_MS = 180_000;
const FEEDBACK_DURATION_MS = 800;

const COLOR_CORRECT = 0x2ecc71;
const COLOR_WRONG = 0xe74c3c;
const COLOR_BUTTON_DEFAULT = 0x34495e;
const COLOR_TIMER_BAR = 0x3498db;
const COLOR_TIMER_BAR_LOW = 0xe74c3c;

/** Threshold in ms for "low time" effects */
const LOW_TIME_MS = 10_000;

export type OnAnswerCallback = (result: AnswerResult) => void;
export type OnTimeUpCallback = (score: number, correct: number, total: number) => void;
export type OnAriaCallback = (text: string) => void;

/** Floating score pop-up data */
interface ScorePopup {
  text: Text;
  age: number;
  startY: number;
}

/**
 * Quiz scene — shows questions with 3 answers, timer bar, and score.
 * Features: score pop-ups, button shake on wrong, timer pulse, fade transitions.
 * Keyboard: press 1/2/3 to select answers.
 */
export class QuizScene extends Scene {
  private onAnswer: OnAnswerCallback;
  private onTimeUp: OnTimeUpCallback;
  private onAria: OnAriaCallback;

  private score = 0;
  private questionsCorrect = 0;
  private questionsAnswered = 0;
  private timeRemainingMs = GAME_DURATION_MS;
  private feedbackTimeMs = 0;
  private inFeedback = false;
  private gameEnded = false;
  private isDestroyed = false;
  private currentQuestion: Question | null = null;
  private getNextQuestion: () => Question;

  // Display objects
  private timerBar!: Graphics;
  private timerText!: Text;
  private scoreText!: Text;
  private questionText!: Text;
  private answerButtons: Container[] = [];
  private questionCountText!: Text;

  // Background images
  private bgSprite: Sprite | null = null;
  private bgOverlay: Graphics | null = null;
  private bgMask: Graphics | null = null;
  private readonly bgImageUrls = [
    '/images/bg1.jpg',
    '/images/bg2.jpg',
    '/images/bg3.jpg',
    '/images/bg4.jpg',
  ];
  private loadedBgImages: string[] = [];
  private currentBgIndex = 0;

  // Animation state
  private scorePopups: ScorePopup[] = [];
  private shakeTargets: { btn: Container; origX: number; age: number }[] = [];
  private questionFadeIn = 0;
  private timerPulsePhase = 0;

  // Keyboard handler reference for cleanup
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(
    app: import('pixi.js').Application,
    getNextQuestion: () => Question,
    onAnswer: OnAnswerCallback,
    onTimeUp: OnTimeUpCallback,
    onAria: OnAriaCallback,
  ) {
    super(app);
    this.getNextQuestion = getNextQuestion;
    this.onAnswer = onAnswer;
    this.onTimeUp = onTimeUp;
    this.onAria = onAria;
  }

  setup(): void {
    this.score = 0;
    this.questionsCorrect = 0;
    this.questionsAnswered = 0;
    this.timeRemainingMs = GAME_DURATION_MS;
    this.feedbackTimeMs = 0;
    this.inFeedback = false;
    this.gameEnded = false;
    this.scorePopups = [];
    this.shakeTargets = [];
    this.questionFadeIn = 0;
    this.timerPulsePhase = 0;

    this.createTimerBar();
    this.createHUD();
    this.createQuestionArea();
    this.createAnswerButtons();
    this.showNextQuestion();
    this.loadBackgrounds();

    // Keyboard support — press 1/2/3 to answer
    this.keydownHandler = (e: KeyboardEvent) => {
      if (this.inFeedback || this.gameEnded) return;
      const key = e.key;
      if (key === '1') this.handleAnswer(0);
      else if (key === '2') this.handleAnswer(1);
      else if (key === '3') this.handleAnswer(2);
    };
    window.addEventListener('keydown', this.keydownHandler);
  }

  destroy(): void {
    this.isDestroyed = true;
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
    super.destroy();
  }

  /** Override resize to preserve game state while re-laying out */
  resize(): void {
    // Re-layout is complex mid-game; only redraw timer bar width (live dimension)
    // Full re-layout would reset animations, so we only adjust what reads live dimensions
  }

  private async loadBackgrounds(): Promise<void> {
    // Load all images in parallel instead of sequentially
    const results = await Promise.allSettled(this.bgImageUrls.map((url) => Assets.load(url)));

    // Guard against scene being destroyed while loading
    if (this.isDestroyed) return;

    for (let i = 0; i < results.length; i++) {
      if (results[i].status === 'fulfilled') {
        this.loadedBgImages.push(this.bgImageUrls[i]);
      }
    }

    if (this.loadedBgImages.length > 0) {
      this.showBackground(0);
    }
  }

  private showBackground(index: number): void {
    if (this.loadedBgImages.length === 0 || this.isDestroyed) return;

    // Remove previous background elements
    if (this.bgSprite) {
      this.container.removeChild(this.bgSprite);
      this.bgSprite.destroy();
      this.bgSprite = null;
    }
    if (this.bgOverlay) {
      this.container.removeChild(this.bgOverlay);
      this.bgOverlay.destroy();
      this.bgOverlay = null;
    }
    if (this.bgMask) {
      this.container.removeChild(this.bgMask);
      this.bgMask.destroy();
      this.bgMask = null;
    }

    const url = this.loadedBgImages[index % this.loadedBgImages.length];
    const texture = Assets.get(url);
    if (!texture) return;

    const sprite = new Sprite(texture);

    // Cover the entire screen (like CSS background-size: cover)
    const scaleX = this.width / texture.width;
    const scaleY = this.height / texture.height;
    const coverScale = Math.max(scaleX, scaleY);
    sprite.scale.set(coverScale);
    // Center the image
    sprite.x = (this.width - texture.width * coverScale) / 2;
    sprite.y = (this.height - texture.height * coverScale) / 2;

    sprite.alpha = 0.2; // Semi-transparent so text and buttons are readable
    this.container.addChildAt(sprite, 0); // Behind everything
    this.bgSprite = sprite;

    // Dark overlay for text readability across the full screen
    const overlay = new Graphics();
    overlay.rect(0, 0, this.width, this.height);
    overlay.fill({ color: 0x000000, alpha: 0.45 });
    this.container.addChildAt(overlay, 1); // On top of image, behind text
    this.bgOverlay = overlay;
  }

  private createTimerBar(): void {
    const barHeight = this.s(6);

    const barBg = new Graphics();
    barBg.rect(0, 0, this.width, barHeight);
    barBg.fill(0x222244);
    this.container.addChild(barBg);

    this.timerBar = new Graphics();
    this.drawTimerBar(1.0);
    this.container.addChild(this.timerBar);
  }

  private drawTimerBar(fraction: number): void {
    this.timerBar.clear();
    const barWidth = this.width * Math.max(0, fraction);
    const barHeight = this.s(6);
    const color = fraction > 0.2 ? COLOR_TIMER_BAR : COLOR_TIMER_BAR_LOW;
    this.timerBar.rect(0, 0, barWidth, barHeight);
    this.timerBar.fill(color);
  }

  private createHUD(): void {
    const hudY = this.s(6) + this.s(12);
    const hudFontSize = this.s(18);

    this.timerText = new Text({
      text: '3:00',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: hudFontSize,
        fontWeight: 'bold',
        fill: 0xffffff,
      },
    });
    this.timerText.x = this.padding;
    this.timerText.y = hudY;
    this.container.addChild(this.timerText);

    this.scoreText = new Text({
      text: 'Pontos: 0',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(20),
        fontWeight: 'bold',
        fill: 0xffffff,
        dropShadow: {
          color: 0x000000,
          blur: 3,
          distance: 1,
          angle: Math.PI / 2,
        },
      },
    });
    this.scoreText.anchor.set(1, 0);
    this.scoreText.x = this.width - this.padding;
    this.scoreText.y = hudY;
    this.container.addChild(this.scoreText);

    this.questionCountText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(14),
        fill: 0x888899,
      },
    });
    this.questionCountText.anchor.set(0.5, 0);
    this.questionCountText.x = this.centerX;
    this.questionCountText.y = hudY;
    this.container.addChild(this.questionCountText);
  }

  private createQuestionArea(): void {
    this.questionText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(24),
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
        lineHeight: this.s(32),
        wordWrap: true,
        wordWrapWidth: this.width * 0.85,
        dropShadow: {
          color: 0x000000,
          blur: 3,
          distance: 1,
          angle: Math.PI / 2,
        },
      },
    });
    this.questionText.anchor.set(0.5);
    this.questionText.x = this.centerX;
    this.questionText.y = this.height * 0.28;
    this.container.addChild(this.questionText);
  }

  private createAnswerButtons(): void {
    this.answerButtons = [];
    const btnW = this.buttonWidth;
    const btnH = this.buttonHeight;
    const spacing = this.s(12);
    const startY = this.height * 0.5;

    for (let i = 0; i < 3; i++) {
      const btn = this.createAnswerButton(btnW, btnH);
      btn.x = this.centerX;
      btn.y = startY + i * (btnH + spacing);
      this.container.addChild(btn);
      this.answerButtons.push(btn);
    }
  }

  private createAnswerButton(width: number, height: number): Container {
    const btnContainer = new Container();

    const bg = new Graphics();
    bg.roundRect(-width / 2, -height / 2, width, height, this.s(10));
    bg.fill(COLOR_BUTTON_DEFAULT);
    // Highlight strip for 3D bevel effect
    bg.roundRect(-width / 2, -height / 2, width, this.s(3), this.s(10));
    bg.fill({ color: 0xffffff, alpha: 0.15 });
    bg.label = 'bg';
    btnContainer.addChild(bg);

    const text = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(20),
        fill: 0xffffff,
        align: 'center',
        dropShadow: {
          color: 0x000000,
          blur: 2,
          distance: 1,
          angle: Math.PI / 2,
        },
      },
    });
    text.anchor.set(0.5);
    text.label = 'text';
    btnContainer.addChild(text);

    btnContainer.eventMode = 'static';
    btnContainer.cursor = 'pointer';

    btnContainer.on('pointerover', () => {
      if (!this.inFeedback) {
        btnContainer.scale.set(1.03);
        bg.tint = 0xcccccc;
      }
    });
    btnContainer.on('pointerout', () => {
      if (!this.inFeedback) {
        btnContainer.scale.set(1.0);
        bg.tint = 0xffffff;
      }
    });

    return btnContainer;
  }

  private showNextQuestion(): void {
    this.currentQuestion = this.getNextQuestion();
    this.inFeedback = false;
    this.questionFadeIn = 0;

    // Cycle to next background image (only loaded ones)
    if (this.loadedBgImages.length > 0) {
      this.currentBgIndex = (this.currentBgIndex + 1) % this.loadedBgImages.length;
      this.showBackground(this.currentBgIndex);
    }

    this.questionText.text = this.currentQuestion.text;
    this.questionText.alpha = 0;

    // Announce question to screen readers
    const answerList = this.currentQuestion.answers.map((a, i) => `${i + 1}: ${a}`).join(', ');
    this.onAria(`Pergunta: ${this.currentQuestion.text}. Respostas: ${answerList}`);

    const btnW = this.buttonWidth;
    const btnH = this.buttonHeight;

    for (let i = 0; i < 3; i++) {
      const btn = this.answerButtons[i];
      const bg = btn.getChildByLabel('bg') as Graphics;
      const text = btn.getChildByLabel('text') as Text;

      text.text = this.currentQuestion.answers[i];

      bg.clear();
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, this.s(10));
      bg.fill(COLOR_BUTTON_DEFAULT);
      // Re-draw highlight strip
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, this.s(3), this.s(10));
      bg.fill({ color: 0xffffff, alpha: 0.15 });
      bg.tint = 0xffffff;

      btn.scale.set(1.0);
      btn.alpha = 0;
      btn.eventMode = 'static';
      btn.cursor = 'pointer';

      btn.removeAllListeners('pointerdown');
      const idx = i;
      btn.on('pointerdown', () => this.handleAnswer(idx));
    }

    this.updateStatsText();
  }

  /** Spawn a floating "+10" text that drifts up and fades */
  private spawnScorePopup(x: number, y: number): void {
    if (prefersReducedMotion()) return;

    const popup = new Text({
      text: '+10',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(32),
        fontWeight: 'bold',
        fill: COLOR_CORRECT,
      },
    });
    popup.anchor.set(0.5);
    popup.x = x;
    popup.y = y;
    this.container.addChild(popup);
    this.scorePopups.push({ text: popup, age: 0, startY: y });
  }

  /** Start shaking a button (wrong answer) */
  private startShake(btn: Container): void {
    if (prefersReducedMotion()) return;
    this.shakeTargets.push({ btn, origX: btn.x, age: 0 });
  }

  /** Update the center HUD with questions answered, correct, and percentage */
  private updateStatsText(): void {
    if (this.questionsAnswered === 0) {
      this.questionCountText.text = '';
      return;
    }
    const pct = Math.round((this.questionsCorrect / this.questionsAnswered) * 100);
    this.questionCountText.text = `${this.questionsCorrect}/${this.questionsAnswered} certas · ${pct}%`;
  }

  private handleAnswer(selectedIndex: number): void {
    if (this.inFeedback || !this.currentQuestion) return;

    this.inFeedback = true;
    this.feedbackTimeMs = FEEDBACK_DURATION_MS;
    this.questionsAnswered++;

    const wasCorrect = selectedIndex === this.currentQuestion.correctIndex;
    if (wasCorrect) {
      this.questionsCorrect++;
      this.score += 10;

      // Spawn score popup near the score display
      this.spawnScorePopup(this.width - this.padding - this.s(40), this.s(6) + this.s(12));
    }

    // Announce result to screen readers
    const correctAnswer = this.currentQuestion.answers[this.currentQuestion.correctIndex];
    this.onAria(
      wasCorrect
        ? `Correto! +10 pontos. Total: ${this.score}`
        : `Errado. A resposta certa era: ${correctAnswer}. Pontos: ${this.score}`,
    );

    const btnW = this.buttonWidth;
    const btnH = this.buttonHeight;

    for (let i = 0; i < 3; i++) {
      const btn = this.answerButtons[i];
      const bg = btn.getChildByLabel('bg') as Graphics;

      btn.eventMode = 'none';
      btn.cursor = 'default';
      bg.tint = 0xffffff;
      btn.scale.set(1.0);

      bg.clear();
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, this.s(10));

      if (i === this.currentQuestion.correctIndex) {
        bg.fill(COLOR_CORRECT);
        // Pulse the correct button up slightly
        btn.scale.set(1.05);
      } else if (i === selectedIndex && !wasCorrect) {
        bg.fill(COLOR_WRONG);
        // Shake the wrong button
        this.startShake(btn);
      } else {
        bg.fill(COLOR_BUTTON_DEFAULT);
        btn.alpha = 0.5;
      }
    }

    this.scoreText.text = `Pontos: ${this.score}`;
    this.updateStatsText();

    // Brief scale punch on score text
    if (!prefersReducedMotion()) {
      this.scoreText.scale.set(1.3);
    }

    this.onAnswer({
      wasCorrect,
      selectedIndex,
      correctIndex: this.currentQuestion.correctIndex,
    });
  }

  update(deltaMs: number): void {
    if (this.gameEnded) return;

    // ── Question / button fade-in ──────────────────────
    if (this.questionFadeIn < 300) {
      this.questionFadeIn += deltaMs;
      const t = Math.min(this.questionFadeIn / 300, 1);
      const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      this.questionText.alpha = ease;
      for (let i = 0; i < this.answerButtons.length; i++) {
        // Stagger each button slightly
        const btnT = Math.min(Math.max((this.questionFadeIn - i * 50) / 250, 0), 1);
        const btnEase = 1 - Math.pow(1 - btnT, 3);
        this.answerButtons[i].alpha = btnEase;
      }
    }

    // ── Score text scale recovery ──────────────────────
    if (this.scoreText.scale.x > 1.01) {
      const decay = Math.pow(0.92, deltaMs / 16);
      const s = 1 + (this.scoreText.scale.x - 1) * decay;
      this.scoreText.scale.set(s);
    } else {
      this.scoreText.scale.set(1.0);
    }

    // ── Score pop-ups float up and fade ────────────────
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const popup = this.scorePopups[i];
      popup.age += deltaMs;
      const life = popup.age / 800; // 800ms total life
      popup.text.y = popup.startY - this.s(40) * life;
      popup.text.alpha = 1 - life;
      if (life >= 1) {
        this.container.removeChild(popup.text);
        popup.text.destroy();
        // Swap-and-pop removal instead of splice for performance
        this.scorePopups[i] = this.scorePopups[this.scorePopups.length - 1];
        this.scorePopups.pop();
      }
    }

    // ── Button shake animation ─────────────────────────
    for (let i = this.shakeTargets.length - 1; i >= 0; i--) {
      const shake = this.shakeTargets[i];
      shake.age += deltaMs;
      const shakeLife = shake.age / 400; // 400ms shake
      if (shakeLife >= 1) {
        shake.btn.x = shake.origX;
        // Swap-and-pop removal
        this.shakeTargets[i] = this.shakeTargets[this.shakeTargets.length - 1];
        this.shakeTargets.pop();
      } else {
        const intensity = this.s(6) * (1 - shakeLife);
        shake.btn.x = shake.origX + Math.sin(shakeLife * Math.PI * 6) * intensity;
      }
    }

    // ── Timer ──────────────────────────────────────────
    this.timeRemainingMs -= deltaMs;
    if (this.timeRemainingMs <= 0) {
      this.timeRemainingMs = 0;
      this.gameEnded = true;
      this.onTimeUp(this.score, this.questionsCorrect, this.questionsAnswered);
      return;
    }

    const seconds = Math.ceil(this.timeRemainingMs / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timerText.text = `${mins}:${String(secs).padStart(2, '0')}`;

    const fraction = this.timeRemainingMs / GAME_DURATION_MS;
    this.drawTimerBar(fraction);

    // ── Timer pulse when low ───────────────────────────
    if (this.timeRemainingMs < LOW_TIME_MS) {
      if (!prefersReducedMotion()) {
        this.timerPulsePhase += deltaMs * 0.008;
        const pulse = 0.7 + 0.3 * Math.abs(Math.sin(this.timerPulsePhase));
        this.timerText.alpha = pulse;
      }
      this.timerText.style.fill = COLOR_TIMER_BAR_LOW;
    }

    // ── Feedback → next question ───────────────────────
    if (this.inFeedback) {
      this.feedbackTimeMs -= deltaMs;
      if (this.feedbackTimeMs <= 0) {
        // Reset button alphas
        for (const btn of this.answerButtons) {
          btn.alpha = 1;
        }
        this.showNextQuestion();
      }
    }
  }
}
