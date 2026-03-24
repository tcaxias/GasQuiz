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

/** Player preferred foot */
export type PlayerFoot = 'right' | 'left' | 'both';

/** Player with shirt number and preferred foot */
export interface Player {
  name: string;
  number: number;
  position: PlayerPosition;
  team: string;
  foot: PlayerFoot;
}

export type PlayerPosition = 'GR' | 'DEF' | 'MED' | 'AV';

/** Man of the match data (hat-trick / standout performance) */
export interface ManOfTheMatch {
  jornada: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  player: string;
  team: string;
}

/** Team color theme */
export interface TeamColors {
  primary: number;
  secondary: number;
  text: number;
}

/** Question shown to the player */
export interface Question {
  text: string;
  answers: [string, string, string];
  correctIndex: number;
  type: QuestionType;
  /** Team associated with this question (for weighting) */
  team?: string;
}

export type QuestionType =
  | 'match_result'
  | 'shirt_number'
  | 'goal_scorer'
  | 'player_foot'
  | 'man_of_the_match';

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
