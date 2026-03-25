/** Competition type */
export type Competition = 'liga' | 'champions' | 'europa' | 'conference' | 'taca';

/** Match result from any competition */
export interface MatchResult {
  jornada: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  homeScorers: string[];
  awayScorers: string[];
  /** Competition this match belongs to. Defaults to 'liga' for Primeira Liga. */
  competition?: Competition;
  /** Round label for European matches (e.g. "Matchday 1", "Oitavos - 1.a mão") */
  round?: string;
}

/** Player preferred foot */
export type PlayerFoot = 'right' | 'left' | 'both';

/** Detailed player position for position questions */
export type DetailedPosition =
  | 'guarda_redes'
  | 'defesa_central'
  | 'lateral_direito'
  | 'lateral_esquerdo'
  | 'trinco'
  | 'medio'
  | 'medio_ofensivo'
  | 'extremo_direito'
  | 'extremo_esquerdo'
  | 'ponta_de_lanca';

/** Player with shirt number and preferred foot */
export interface Player {
  name: string;
  number: number;
  position: PlayerPosition;
  team: string;
  foot: PlayerFoot;
  detailedPosition?: DetailedPosition;
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
  /** Competition this question relates to (for weighting) */
  competition?: Competition;
}

export type QuestionType =
  | 'match_result'
  | 'shirt_number'
  | 'goal_scorer'
  | 'player_foot'
  | 'man_of_the_match'
  | 'player_position';

/** Answer result for feedback */
export interface AnswerResult {
  wasCorrect: boolean;
  selectedIndex: number;
  correctIndex: number;
}
