import { Text, Graphics, Container } from 'pixi.js';
import { Scene } from './Scene';
import type { Question, AnswerResult } from '$lib/types/quiz';

const GAME_DURATION_MS = 60_000;
const FEEDBACK_DURATION_MS = 800;

const COLOR_CORRECT = 0x2ecc71;
const COLOR_WRONG = 0xe74c3c;
const COLOR_BUTTON_DEFAULT = 0x34495e;
const COLOR_TIMER_BAR = 0x3498db;
const COLOR_TIMER_BAR_LOW = 0xe74c3c;

export type OnAnswerCallback = (result: AnswerResult) => void;
export type OnTimeUpCallback = (score: number, correct: number, total: number) => void;

/**
 * Quiz scene — shows questions with 3 answers, timer bar, and score.
 * Fully responsive: scales to any screen size including mobile.
 */
export class QuizScene extends Scene {
  private onAnswer: OnAnswerCallback;
  private onTimeUp: OnTimeUpCallback;

  private score = 0;
  private questionsCorrect = 0;
  private questionsAnswered = 0;
  private timeRemainingMs = GAME_DURATION_MS;
  private feedbackTimeMs = 0;
  private inFeedback = false;
  private gameEnded = false;
  private currentQuestion: Question | null = null;
  private getNextQuestion: () => Question;

  // Display objects
  private timerBar!: Graphics;
  private timerText!: Text;
  private scoreText!: Text;
  private questionText!: Text;
  private answerButtons: Container[] = [];
  private questionCountText!: Text;

  constructor(
    app: import('pixi.js').Application,
    getNextQuestion: () => Question,
    onAnswer: OnAnswerCallback,
    onTimeUp: OnTimeUpCallback,
  ) {
    super(app);
    this.getNextQuestion = getNextQuestion;
    this.onAnswer = onAnswer;
    this.onTimeUp = onTimeUp;
  }

  setup(): void {
    this.score = 0;
    this.questionsCorrect = 0;
    this.questionsAnswered = 0;
    this.timeRemainingMs = GAME_DURATION_MS;
    this.feedbackTimeMs = 0;
    this.inFeedback = false;
    this.gameEnded = false;

    this.createTimerBar();
    this.createHUD();
    this.createQuestionArea();
    this.createAnswerButtons();
    this.showNextQuestion();
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
      text: '1:00',
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
        fontSize: hudFontSize,
        fontWeight: 'bold',
        fill: 0xffffff,
      },
    });
    this.scoreText.anchor.set(1, 0);
    this.scoreText.x = this.width - this.padding;
    this.scoreText.y = hudY;
    this.container.addChild(this.scoreText);

    this.questionCountText = new Text({
      text: 'Pergunta 1',
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
    bg.label = 'bg';
    btnContainer.addChild(bg);

    const text = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: this.s(20),
        fill: 0xffffff,
        align: 'center',
      },
    });
    text.anchor.set(0.5);
    text.label = 'text';
    btnContainer.addChild(text);

    btnContainer.eventMode = 'static';
    btnContainer.cursor = 'pointer';

    btnContainer.on('pointerover', () => {
      if (!this.inFeedback) bg.tint = 0xcccccc;
    });
    btnContainer.on('pointerout', () => {
      if (!this.inFeedback) bg.tint = 0xffffff;
    });

    return btnContainer;
  }

  private showNextQuestion(): void {
    this.currentQuestion = this.getNextQuestion();
    this.inFeedback = false;

    this.questionText.text = this.currentQuestion.text;

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
      bg.tint = 0xffffff;

      btn.eventMode = 'static';
      btn.cursor = 'pointer';

      btn.removeAllListeners('pointerdown');
      const idx = i;
      btn.on('pointerdown', () => this.handleAnswer(idx));
    }

    this.questionCountText.text = `Pergunta ${this.questionsAnswered + 1}`;
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
    }

    const btnW = this.buttonWidth;
    const btnH = this.buttonHeight;

    for (let i = 0; i < 3; i++) {
      const btn = this.answerButtons[i];
      const bg = btn.getChildByLabel('bg') as Graphics;

      btn.eventMode = 'none';
      btn.cursor = 'default';
      bg.tint = 0xffffff;

      bg.clear();
      bg.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, this.s(10));

      if (i === this.currentQuestion.correctIndex) {
        bg.fill(COLOR_CORRECT);
      } else if (i === selectedIndex && !wasCorrect) {
        bg.fill(COLOR_WRONG);
      } else {
        bg.fill(COLOR_BUTTON_DEFAULT);
      }
    }

    this.scoreText.text = `Pontos: ${this.score}`;

    this.onAnswer({
      wasCorrect,
      selectedIndex,
      correctIndex: this.currentQuestion.correctIndex,
    });
  }

  update(deltaMs: number): void {
    if (this.gameEnded) return;

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

    if (this.inFeedback) {
      this.feedbackTimeMs -= deltaMs;
      if (this.feedbackTimeMs <= 0) {
        this.showNextQuestion();
      }
    }
  }
}
