/** Match result from Primeira Liga */
export interface MatchResult {
  jornada: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  homeScorers: string[];
  awayScorers: string[];
}

/** Player with shirt number */
export interface Player {
  name: string;
  number: number;
  position: PlayerPosition;
  team: string;
}

export type PlayerPosition = 'GR' | 'DEF' | 'MED' | 'AV';

/** Question shown to the player */
export interface Question {
  text: string;
  answers: [string, string, string];
  correctIndex: number;
  type: QuestionType;
}

export type QuestionType = 'match_result' | 'shirt_number' | 'goal_scorer';

/** Game state */
export interface GameState {
  phase: GamePhase;
  score: number;
  questionsAnswered: number;
  questionsCorrect: number;
  timeRemainingMs: number;
  currentQuestion: Question | null;
  selectedAnswer: number | null;
  feedbackTimeMs: number;
}

export type GamePhase = 'menu' | 'playing' | 'feedback' | 'results';

/** Answer result for feedback */
export interface AnswerResult {
  wasCorrect: boolean;
  selectedIndex: number;
  correctIndex: number;
}
