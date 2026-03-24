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
 * Quiz scene — shows questions, answers, timer, score.
 * 60 seconds to answer as many questions as possible.
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

    this.createTimerBar();
    this.createHUD();
    this.createQuestionArea();
    this.createAnswerButtons();

    // Show first question
    this.showNextQuestion();
  }

  private createTimerBar(): void {
    // Timer bar background
    const barBg = new Graphics();
    barBg.rect(0, 0, this.width, 8);
    barBg.fill(0x1a1a2e);
    this.container.addChild(barBg);

    // Timer bar fill
    this.timerBar = new Graphics();
    this.drawTimerBar(1.0);
    this.container.addChild(this.timerBar);
  }

  private drawTimerBar(fraction: number): void {
    this.timerBar.clear();
    const barWidth = this.width * Math.max(0, fraction);
    const color = fraction > 0.2 ? COLOR_TIMER_BAR : COLOR_TIMER_BAR_LOW;
    this.timerBar.rect(0, 0, barWidth, 8);
    this.timerBar.fill(color);
  }

  private createHUD(): void {
    // Timer text (top-left)
    this.timerText = new Text({
      text: '1:00',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 22,
        fontWeight: 'bold',
        fill: 0xffffff,
      },
    });
    this.timerText.x = 20;
    this.timerText.y = 20;
    this.container.addChild(this.timerText);

    // Score text (top-right)
    this.scoreText = new Text({
      text: 'Pontos: 0',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 22,
        fontWeight: 'bold',
        fill: 0xffffff,
      },
    });
    this.scoreText.anchor.set(1, 0);
    this.scoreText.x = this.width - 20;
    this.scoreText.y = 20;
    this.container.addChild(this.scoreText);

    // Questions count (top-center)
    this.questionCountText = new Text({
      text: 'Pergunta 1',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 18,
        fill: 0x888899,
      },
    });
    this.questionCountText.anchor.set(0.5, 0);
    this.questionCountText.x = this.centerX;
    this.questionCountText.y = 20;
    this.container.addChild(this.questionCountText);
  }

  private createQuestionArea(): void {
    this.questionText = new Text({
      text: '',
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 28,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
        lineHeight: 36,
        wordWrap: true,
        wordWrapWidth: this.width * 0.8,
      },
    });
    this.questionText.anchor.set(0.5);
    this.questionText.x = this.centerX;
    this.questionText.y = this.height * 0.3;
    this.container.addChild(this.questionText);
  }

  private createAnswerButtons(): void {
    this.answerButtons = [];
    const btnWidth = Math.min(400, this.width * 0.8);
    const btnHeight = 56;
    const btnSpacing = 16;
    const startY = this.height * 0.52;

    for (let i = 0; i < 3; i++) {
      const btn = this.createAnswerButton('', btnWidth, btnHeight);
      btn.x = this.centerX;
      btn.y = startY + i * (btnHeight + btnSpacing);
      this.container.addChild(btn);
      this.answerButtons.push(btn);
    }
  }

  private createAnswerButton(label: string, width: number, height: number): Container {
    const btnContainer = new Container();

    const bg = new Graphics();
    bg.roundRect(-width / 2, -height / 2, width, height, 10);
    bg.fill(COLOR_BUTTON_DEFAULT);
    bg.label = 'bg';
    btnContainer.addChild(bg);

    const text = new Text({
      text: label,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 22,
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
      if (!this.inFeedback) {
        bg.tint = 0xcccccc;
      }
    });
    btnContainer.on('pointerout', () => {
      if (!this.inFeedback) {
        bg.tint = 0xffffff;
      }
    });

    return btnContainer;
  }

  private showNextQuestion(): void {
    this.currentQuestion = this.getNextQuestion();
    this.inFeedback = false;

    // Update question text
    this.questionText.text = this.currentQuestion.text;

    // Update answer buttons
    const btnWidth = Math.min(400, this.width * 0.8);
    const btnHeight = 56;

    for (let i = 0; i < 3; i++) {
      const btn = this.answerButtons[i];
      const bg = btn.getChildByLabel('bg') as Graphics;
      const text = btn.getChildByLabel('text') as Text;

      text.text = this.currentQuestion.answers[i];

      // Reset button appearance
      bg.clear();
      bg.roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);
      bg.fill(COLOR_BUTTON_DEFAULT);
      bg.tint = 0xffffff;

      btn.eventMode = 'static';
      btn.cursor = 'pointer';

      // Remove old listeners and add new ones
      btn.removeAllListeners('pointerdown');
      const answerIndex = i;
      btn.on('pointerdown', () => this.handleAnswer(answerIndex));
    }

    // Update question count
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

    // Show feedback on buttons
    const btnWidth = Math.min(400, this.width * 0.8);
    const btnHeight = 56;

    for (let i = 0; i < 3; i++) {
      const btn = this.answerButtons[i];
      const bg = btn.getChildByLabel('bg') as Graphics;

      btn.eventMode = 'none';
      btn.cursor = 'default';
      bg.tint = 0xffffff;

      bg.clear();
      bg.roundRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 10);

      if (i === this.currentQuestion.correctIndex) {
        bg.fill(COLOR_CORRECT);
      } else if (i === selectedIndex && !wasCorrect) {
        bg.fill(COLOR_WRONG);
      } else {
        bg.fill(COLOR_BUTTON_DEFAULT);
      }
    }

    // Update score display
    this.scoreText.text = `Pontos: ${this.score}`;

    // Notify
    this.onAnswer({
      wasCorrect,
      selectedIndex,
      correctIndex: this.currentQuestion.correctIndex,
    });
  }

  update(deltaMs: number): void {
    // Update timer
    this.timeRemainingMs -= deltaMs;
    if (this.timeRemainingMs <= 0) {
      this.timeRemainingMs = 0;
      this.onTimeUp(this.score, this.questionsCorrect, this.questionsAnswered);
      return;
    }

    // Update timer display
    const seconds = Math.ceil(this.timeRemainingMs / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    this.timerText.text = `${mins}:${String(secs).padStart(2, '0')}`;

    // Update timer bar
    const fraction = this.timeRemainingMs / GAME_DURATION_MS;
    this.drawTimerBar(fraction);

    // Handle feedback timeout
    if (this.inFeedback) {
      this.feedbackTimeMs -= deltaMs;
      if (this.feedbackTimeMs <= 0) {
        this.showNextQuestion();
      }
    }
  }
}
