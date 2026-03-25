/**
 * Feature flags for GasQuiz.
 * All new user-visible behavior should be gated behind a flag here.
 * Toggle flags to enable/disable features without code changes.
 */
export const flags = {
  /** Background images behind quiz questions */
  backgroundImages: true,
  /** Sound effects and background music */
  audio: true,
  /** Floating particles on menu screen */
  menuParticles: true,
  /** Confetti animation on results screen */
  resultsConfetti: true,
  /** Keyboard shortcuts (1/2/3) for answering */
  keyboardAnswers: true,
  /** Breathing title animation on menu */
  menuTitleAnimation: true,
  /** Score pop-up animation (+10) */
  scorePopups: true,
  /** Button shake on wrong answer */
  wrongAnswerShake: true,
  /** Timer pulse effect when time is low */
  timerPulse: true,
} as const;

/** Current season label — update each year */
export const SEASON = '2025-26';

/** Points awarded per correct answer */
export const SCORE_PER_CORRECT = 10;
