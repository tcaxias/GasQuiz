import type {
  Question,
  QuestionType,
  PlayerFoot,
  Competition,
  MatchResult,
  Player,
  ManOfTheMatch,
  DetailedPosition,
} from '$lib/types/quiz';
import { matches } from '$lib/data/matches';
import { players, getPlayersByTeam } from '$lib/data/players';
import { manOfTheMatch } from '$lib/data/awards';

/** The big three clubs — same weight as European competitions */
const BIG_THREE = ['FC Porto', 'SL Benfica', 'Sporting CP'];

/** Portuguese clubs that play in European competitions */
const EUROPEAN_CLUBS = ['FC Porto', 'SL Benfica', 'Sporting CP', 'SC Braga', 'Vitória SC'];

/** Teams that play in the Champions League */
const CL_TEAMS = ['SL Benfica', 'Sporting CP'];

/** Teams that play in the Europa League */
const EL_TEAMS = ['FC Porto', 'SC Braga'];

/** Question category for probability-based selection */
export type QuestionCategory = 'liga' | 'big' | 'europa' | 'champions' | 'taca' | 'favorite';

/** Pick a random element from a non-empty array */
function pickRandom<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('pickRandom: empty array');
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Shuffle an array in place (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick N unique random elements from an array, excluding certain values */
function pickRandomExcluding<T>(arr: T[], exclude: T[], count: number): T[] {
  const filtered = arr.filter((item) => !exclude.includes(item));
  const shuffled = shuffle([...filtered]);
  return shuffled.slice(0, count);
}

/** Portuguese label for a foot value */
function footLabel(foot: PlayerFoot): string {
  switch (foot) {
    case 'right':
      return 'Direito';
    case 'left':
      return 'Esquerdo';
    case 'both':
      return 'Ambos';
  }
}

/** Human-readable competition name in Portuguese */
function competitionLabel(comp?: Competition): string {
  switch (comp) {
    case 'champions':
      return 'Liga dos Campeões';
    case 'europa':
      return 'Liga Europa';
    case 'conference':
      return 'Liga Conferência';
    case 'taca':
      return 'Taça de Portugal';
    default:
      return 'Primeira Liga';
  }
}

/** Build the round display text for a match */
function matchRoundLabel(match: {
  jornada: number;
  competition?: Competition;
  round?: string;
}): string {
  if (match.round) return match.round;
  return `Jornada ${match.jornada}`;
}

// ── Category filter predicates ──────────────────────────────────────────────

/** Filter matches by question category */
function filterMatchesByCategory(category: QuestionCategory): MatchResult[] {
  switch (category) {
    case 'champions':
      return matches.filter((m) => m.competition === 'champions');
    case 'europa':
      return matches.filter((m) => m.competition === 'europa');
    case 'taca':
      return matches.filter((m) => m.competition === 'taca');
    case 'big':
      return matches.filter(
        (m) => BIG_THREE.includes(m.homeTeam) || BIG_THREE.includes(m.awayTeam),
      );
    case 'liga':
    case 'favorite':
      return matches.filter(
        (m) =>
          (!m.competition || m.competition === 'liga') &&
          (EUROPEAN_CLUBS.includes(m.homeTeam) || EUROPEAN_CLUBS.includes(m.awayTeam)) &&
          !(BIG_THREE.includes(m.homeTeam) && BIG_THREE.includes(m.awayTeam)),
      );
  }
}

/** Filter players by question category */
function filterPlayersByCategory(category: QuestionCategory): Player[] {
  switch (category) {
    case 'champions':
      return players.filter((p) => CL_TEAMS.includes(p.team));
    case 'europa':
      return players.filter((p) => EL_TEAMS.includes(p.team));
    case 'taca':
      // Taça de Portugal involves all teams — use the full set
      return players;
    case 'big':
      return players.filter((p) => BIG_THREE.includes(p.team));
    case 'liga':
    case 'favorite':
      return players.filter((p) => !BIG_THREE.includes(p.team));
  }
}

/** Filter MOTM entries by question category. MOTM data is all liga, so only liga and big work. */
function filterMotmByCategory(category: QuestionCategory): ManOfTheMatch[] {
  switch (category) {
    case 'big':
      return manOfTheMatch.filter(
        (m) => BIG_THREE.includes(m.homeTeam) || BIG_THREE.includes(m.awayTeam),
      );
    case 'liga':
    case 'favorite':
      return manOfTheMatch.filter(
        (m) => !BIG_THREE.includes(m.homeTeam) && !BIG_THREE.includes(m.awayTeam),
      );
    // No MOTM data for European competitions or Taça de Portugal
    case 'champions':
    case 'europa':
    case 'taca':
      return [];
  }
}

// ── Category-aware question generators ──────────────────────────────────────

/**
 * Generate a "match result" question from a filtered set of matches.
 */
function generateMatchResultFromMatches(filteredMatches: MatchResult[]): Question | null {
  if (filteredMatches.length === 0) return null;

  const match = pickRandom(filteredMatches);
  const correctScore = `${match.homeGoals}-${match.awayGoals}`;
  const wrongScores = generateWrongScores(match.homeGoals, match.awayGoals);

  const answers: [string, string, string] = [correctScore, wrongScores[0], wrongScores[1]];
  const shuffledAnswers = shuffle([...answers]);
  const correctIndex = shuffledAnswers.indexOf(correctScore);
  if (correctIndex === -1) return null;

  const comp = match.competition ?? 'liga';
  const roundText = matchRoundLabel(match);
  const compText = comp !== 'liga' ? `${competitionLabel(comp)} — ` : '';

  return {
    text: `Qual foi o resultado de ${match.homeTeam} vs ${match.awayTeam}?\n(${compText}${roundText})`,
    answers: shuffledAnswers as [string, string, string],
    correctIndex,
    type: 'match_result',
    team: match.homeTeam,
    competition: comp,
  };
}

/** Generate two plausible wrong scores that differ from the correct one */
function generateWrongScores(homeGoals: number, awayGoals: number): [string, string] {
  const scores = new Set<string>();
  const correct = `${homeGoals}-${awayGoals}`;

  // For 0-0 draws, many ±1 variants collapse to "0-0" — inject guaranteed alternatives
  const attempts =
    homeGoals === 0 && awayGoals === 0
      ? ['1-0', '0-1', '1-1', '2-0', '0-2', '2-1']
      : [
          `${homeGoals + 1}-${awayGoals}`,
          `${homeGoals}-${awayGoals + 1}`,
          `${homeGoals + 1}-${awayGoals + 1}`,
          `${Math.max(0, homeGoals - 1)}-${awayGoals}`,
          `${homeGoals}-${Math.max(0, awayGoals - 1)}`,
          `${homeGoals + 2}-${awayGoals}`,
          `${homeGoals}-${awayGoals + 2}`,
          `${awayGoals}-${homeGoals}`,
          `${Math.max(0, homeGoals - 1)}-${Math.max(0, awayGoals - 1)}`,
        ];

  for (const score of shuffle(attempts)) {
    if (score !== correct && !scores.has(score)) {
      scores.add(score);
    }
    if (scores.size >= 2) break;
  }

  while (scores.size < 2) {
    const s = `${Math.floor(Math.random() * 4)}-${Math.floor(Math.random() * 3)}`;
    if (s !== correct && !scores.has(s)) scores.add(s);
  }

  const arr = [...scores];
  return [arr[0], arr[1]];
}

/**
 * Generate a "shirt number" question from a filtered set of players.
 */
function generateShirtNumberFromPlayers(filteredPlayers: Player[]): Question | null {
  if (filteredPlayers.length === 0) return null;

  // Group by team and find teams with at least 3 players
  const teamMap = new Map<string, Player[]>();
  for (const p of filteredPlayers) {
    const list = teamMap.get(p.team) ?? [];
    list.push(p);
    teamMap.set(p.team, list);
  }

  const viableTeams = [...teamMap.entries()].filter(([, list]) => list.length >= 3);
  if (viableTeams.length === 0) return null;

  const [team, teamPlayers] = pickRandom(viableTeams);
  const player = pickRandom(teamPlayers);
  const correctNumber = String(player.number);

  const otherNumbers = teamPlayers
    .filter((p) => p.name !== player.name)
    .map((p) => String(p.number));

  const wrongNumbers = pickRandomExcluding(otherNumbers, [correctNumber], 2);

  while (wrongNumbers.length < 2) {
    const rnd = String(Math.floor(Math.random() * 40) + 1);
    if (rnd !== correctNumber && !wrongNumbers.includes(rnd)) {
      wrongNumbers.push(rnd);
    }
  }

  const answers: [string, string, string] = [correctNumber, wrongNumbers[0], wrongNumbers[1]];
  const shuffledAnswers = shuffle([...answers]);
  const correctIndex = shuffledAnswers.indexOf(correctNumber);
  if (correctIndex === -1) return null;

  return {
    text: `Qual é o número da camisola de ${player.name}\nno ${team}?`,
    answers: shuffledAnswers as [string, string, string],
    correctIndex,
    type: 'shirt_number',
    team,
  };
}

/**
 * Generate a "goal scorer" question from a filtered set of matches.
 *
 * Only uses scorers that exist in the player database so that
 * wrong-answer exclusion works reliably (same name source for both).
 */
function generateGoalScorerFromMatches(filteredMatches: MatchResult[]): Question | null {
  const matchesWithGoals = filteredMatches.filter(
    (m) => m.homeScorers.length > 0 || m.awayScorers.length > 0,
  );
  if (matchesWithGoals.length === 0) return null;

  const match = pickRandom(matchesWithGoals);

  // Resolve scorers to player-database entries so names are canonical
  const homeTeamPlayers = players.filter((p) => p.team === match.homeTeam);
  const awayTeamPlayers = players.filter((p) => p.team === match.awayTeam);

  const homeScorerNames = [...new Set(match.homeScorers)];
  const awayScorerNames = [...new Set(match.awayScorers)];

  const homeScorerPlayers = homeTeamPlayers.filter((p) => homeScorerNames.includes(p.name));
  const awayScorerPlayers = awayTeamPlayers.filter((p) => awayScorerNames.includes(p.name));
  const allScorerPlayers = [...homeScorerPlayers, ...awayScorerPlayers];

  if (allScorerPlayers.length === 0) return null;

  const correctPlayer = pickRandom(allScorerPlayers);
  const correctName = correctPlayer.name;
  const scorerTeam = correctPlayer.team;

  // Exclude every scorer found in the DB — guarantees wrong answers never scored
  const scorerNames = allScorerPlayers.map((p) => p.name);
  const bothTeamNames = [...homeTeamPlayers, ...awayTeamPlayers].map((p) => p.name);
  const wrongPlayers = pickRandomExcluding(bothTeamNames, scorerNames, 2);

  if (wrongPlayers.length < 2) return null;

  const answers: [string, string, string] = [correctName, wrongPlayers[0], wrongPlayers[1]];
  const shuffledAnswers = shuffle([...answers]);
  const correctIndex = shuffledAnswers.indexOf(correctName);
  if (correctIndex === -1) return null;

  const comp = match.competition ?? 'liga';
  const roundText = matchRoundLabel(match);
  const compText = comp !== 'liga' ? `${competitionLabel(comp)} — ` : '';

  return {
    text: `Quem marcou golo no jogo\n${match.homeTeam} ${match.homeGoals}-${match.awayGoals} ${match.awayTeam}?\n(${compText}${roundText})`,
    answers: shuffledAnswers as [string, string, string],
    correctIndex,
    type: 'goal_scorer',
    team: scorerTeam,
    competition: comp,
  };
}

/**
 * Generate a "player foot" question from a filtered set of players.
 */
function generatePlayerFootFromPlayers(filteredPlayers: Player[]): Question | null {
  if (filteredPlayers.length === 0) return null;

  const player = pickRandom(filteredPlayers);
  const correctFoot = footLabel(player.foot);

  const allFeet: PlayerFoot[] = ['right', 'left', 'both'];
  const wrongFeet = allFeet.filter((f) => f !== player.foot).map(footLabel);

  const answers: [string, string, string] = [correctFoot, wrongFeet[0], wrongFeet[1]];
  const shuffledAnswers = shuffle([...answers]);
  const correctIndex = shuffledAnswers.indexOf(correctFoot);
  if (correctIndex === -1) return null;

  return {
    text: `Qual é o pé preferido de ${player.name}\n(${player.team})?`,
    answers: shuffledAnswers as [string, string, string],
    correctIndex,
    type: 'player_foot',
    team: player.team,
  };
}

/**
 * Generate a "man of the match" question from a filtered set of MOTM entries.
 */
function generateMotmFromEntries(filteredMotm: ManOfTheMatch[]): Question | null {
  if (filteredMotm.length === 0) return null;

  const motm = pickRandom(filteredMotm);
  const correctPlayer = motm.player;

  const homePlayers = getPlayersByTeam(motm.homeTeam).map((p) => p.name);
  const awayPlayers = getPlayersByTeam(motm.awayTeam).map((p) => p.name);
  const matchPlayers = [...homePlayers, ...awayPlayers];

  const wrongPlayers = pickRandomExcluding(matchPlayers, [correctPlayer], 2);

  if (wrongPlayers.length < 2) {
    const allNames = players.map((p) => p.name);
    const extra = pickRandomExcluding(
      allNames,
      [correctPlayer, ...wrongPlayers],
      2 - wrongPlayers.length,
    );
    wrongPlayers.push(...extra);
  }

  if (wrongPlayers.length < 2) return null;

  const answers: [string, string, string] = [correctPlayer, wrongPlayers[0], wrongPlayers[1]];
  const shuffledAnswers = shuffle([...answers]);
  const correctIndex = shuffledAnswers.indexOf(correctPlayer);
  if (correctIndex === -1) return null;

  return {
    text: `Quem foi o melhor jogador do jogo\n${motm.homeTeam} ${motm.homeGoals}-${motm.awayGoals} ${motm.awayTeam}?\n(Jornada ${motm.jornada})`,
    answers: shuffledAnswers as [string, string, string],
    correctIndex,
    type: 'man_of_the_match',
    team: motm.team,
  };
}

// ── Player position question ────────────────────────────────────────────────

/** Portuguese label for a detailed position */
function detailedPositionLabel(pos: DetailedPosition): string {
  const labels: Record<DetailedPosition, string> = {
    guarda_redes: 'Guarda-redes',
    defesa_central: 'Defesa central',
    lateral_direito: 'Lateral direito',
    lateral_esquerdo: 'Lateral esquerdo',
    trinco: 'Trinco',
    medio: 'Médio centro',
    medio_ofensivo: 'Médio ofensivo',
    extremo_direito: 'Extremo direito',
    extremo_esquerdo: 'Extremo esquerdo',
    ponta_de_lanca: 'Ponta de lança',
  };
  return labels[pos];
}

/** Groups of positions for generating plausible wrong answers */
const POSITION_GROUPS: DetailedPosition[][] = [
  ['guarda_redes'],
  ['defesa_central', 'lateral_direito', 'lateral_esquerdo'],
  ['trinco', 'medio', 'medio_ofensivo'],
  ['extremo_direito', 'extremo_esquerdo', 'ponta_de_lanca'],
];

/**
 * Generate a "player position" question from a filtered set of players.
 * Only players with detailedPosition are eligible.
 */
function generatePlayerPositionFromPlayers(filteredPlayers: Player[]): Question | null {
  const eligible = filteredPlayers.filter((p) => p.detailedPosition);
  if (eligible.length === 0) return null;

  const player = pickRandom(eligible);
  const correctPos = player.detailedPosition!;
  const correctLabel = detailedPositionLabel(correctPos);

  // Find the group this position belongs to, plus adjacent groups
  const groupIdx = POSITION_GROUPS.findIndex((g) => g.includes(correctPos));
  const nearbyPositions: DetailedPosition[] = [];
  for (
    let i = Math.max(0, groupIdx - 1);
    i <= Math.min(POSITION_GROUPS.length - 1, groupIdx + 1);
    i++
  ) {
    nearbyPositions.push(...POSITION_GROUPS[i]);
  }
  const wrongCandidates = nearbyPositions.filter((p) => p !== correctPos);

  // Shuffle and take 2
  const wrongPositions = shuffle([...wrongCandidates]).slice(0, 2);
  while (wrongPositions.length < 2) {
    const allPositions: DetailedPosition[] = POSITION_GROUPS.flat();
    const fallback = allPositions.filter((p) => p !== correctPos && !wrongPositions.includes(p));
    wrongPositions.push(pickRandom(fallback));
  }

  const answers: [string, string, string] = [
    correctLabel,
    detailedPositionLabel(wrongPositions[0]),
    detailedPositionLabel(wrongPositions[1]),
  ];
  const shuffledAnswers = shuffle([...answers]);
  const correctIndex = shuffledAnswers.indexOf(correctLabel);
  if (correctIndex === -1) return null;

  // Find a real match this player's team played in for context
  const teamMatches = matches.filter(
    (m) => m.homeTeam === player.team || m.awayTeam === player.team,
  );
  let matchContext = '';
  if (teamMatches.length > 0) {
    const m = pickRandom(teamMatches);
    const comp = m.competition ?? 'liga';
    const compText = comp !== 'liga' ? `${competitionLabel(comp)} — ` : '';
    matchContext = `\n(${compText}${m.homeTeam} ${m.homeGoals}-${m.awayGoals} ${m.awayTeam})`;
  }

  return {
    text: `Em que posição joga ${player.name}?${matchContext}`,
    answers: shuffledAnswers as [string, string, string],
    correctIndex,
    type: 'player_position',
    team: player.team,
  };
}

/** Map of question type to unfiltered generator function */
const generatorMap: Record<QuestionType, () => Question | null> = {
  match_result: () => generateMatchResultFromMatches(matches),
  shirt_number: () => generateShirtNumberFromPlayers(players),
  goal_scorer: () => generateGoalScorerFromMatches(matches),
  player_foot: () => generatePlayerFootFromPlayers(players),
  man_of_the_match: () => generateMotmFromEntries(manOfTheMatch),
  player_position: () => generatePlayerPositionFromPlayers(players),
};

/** All available question types */
const allTypes: QuestionType[] = [
  'match_result',
  'shirt_number',
  'goal_scorer',
  'player_foot',
  'man_of_the_match',
  'player_position',
];

// ── QuestionGenerator class ─────────────────────────────────────────────────

/**
 * Stateful question generator with probability-based category selection
 * and no consecutive same-type questions.
 *
 * Distribution (with favorite team): 30% favorite, 33% CL, 27% EL, 5% liga, 5% taça
 * Distribution (without favorite):   47% CL, 40% EL, 6% liga, 7% taça
 */
export class QuestionGenerator {
  private lastType: QuestionType | null = null;
  private favoriteTeam?: string;

  constructor(favoriteTeam?: string) {
    this.favoriteTeam = favoriteTeam;
  }

  /** Pick a category based on probability distribution. */
  private pickCategory(): QuestionCategory {
    const roll = Math.random();

    if (this.favoriteTeam) {
      // 30% favorite, 33% CL, 27% EL, 5% liga, 5% taça
      if (roll < 0.3) return 'favorite';
      if (roll < 0.63) return 'champions';
      if (roll < 0.9) return 'europa';
      if (roll < 0.95) return 'liga';
      return 'taca';
    } else {
      // No favorite: 47% CL, 40% EL, 6% liga, 7% taça
      if (roll < 0.47) return 'champions';
      if (roll < 0.87) return 'europa';
      if (roll < 0.93) return 'liga';
      return 'taca';
    }
  }

  /** Generate the next question using probability-based category selection. */
  next(): Question {
    const category = this.pickCategory();

    let question: Question | null = null;

    if (category === 'favorite') {
      question = this.generateForFavorite();
    }

    if (!question) {
      // For non-favorite or if favorite generation failed
      const effectiveCategory = category === 'favorite' ? 'liga' : category;
      question = this.generateForCategory(effectiveCategory);
    }

    if (question) {
      this.lastType = question.type;
      return question;
    }

    // Fallback chain: try other categories
    for (const fallback of ['champions', 'europa', 'taca', 'big', 'liga'] as QuestionCategory[]) {
      const q = this.generateForCategory(fallback);
      if (q) {
        this.lastType = q.type;
        return q;
      }
    }

    return this.generateUnfiltered();
  }

  /**
   * Try to generate a question for a specific category.
   * Picks a random type that differs from the last type.
   */
  private generateForCategory(category: QuestionCategory): Question | null {
    // Determine which types are available for this category
    const availableTypes = this.getAvailableTypes(category);

    // Filter out the last type to prevent consecutive repeats
    const candidateTypes = availableTypes.filter((t) => t !== this.lastType);

    // Try candidate types (non-repeating) first, in random order
    for (const type of shuffle([...candidateTypes])) {
      const question = this.generateTypedForCategory(type, category);
      if (question) return question;
    }

    // If no non-repeating type works, try all available types (allows repeat as last resort)
    for (const type of shuffle([...availableTypes])) {
      const question = this.generateTypedForCategory(type, category);
      if (question) return question;
    }

    return null;
  }

  /**
   * Get question types that can potentially produce results for a category.
   * MOTM only works for liga/big since all MOTM data is from league matches.
   */
  private getAvailableTypes(category: QuestionCategory): QuestionType[] {
    const types: QuestionType[] = ['match_result', 'goal_scorer', 'shirt_number', 'player_foot'];
    if (category === 'liga' || category === 'big') {
      types.push('man_of_the_match');
    }
    // player_position for categories with big three players (who have detailedPosition)
    // Taça also includes big clubs, so player_position is available
    if (
      category === 'big' ||
      category === 'champions' ||
      category === 'europa' ||
      category === 'taca'
    ) {
      types.push('player_position');
    }
    return types;
  }

  /** Generate a question of a specific type filtered by category. */
  private generateTypedForCategory(
    type: QuestionType,
    category: QuestionCategory,
  ): Question | null {
    switch (type) {
      case 'match_result':
        return generateMatchResultFromMatches(filterMatchesByCategory(category));
      case 'goal_scorer':
        return generateGoalScorerFromMatches(filterMatchesByCategory(category));
      case 'shirt_number':
        return generateShirtNumberFromPlayers(filterPlayersByCategory(category));
      case 'player_foot':
        return generatePlayerFootFromPlayers(filterPlayersByCategory(category));
      case 'man_of_the_match':
        return generateMotmFromEntries(filterMotmByCategory(category));
      case 'player_position':
        return generatePlayerPositionFromPlayers(filterPlayersByCategory(category));
    }
  }

  /**
   * Try to generate a question specifically about the favorite team.
   * Filters matches, players, and MOTM entries to only those involving the favorite club.
   */
  private generateForFavorite(): Question | null {
    if (!this.favoriteTeam) return null;

    // Determine which types are available based on the favorite team's context
    const category: QuestionCategory = CL_TEAMS.includes(this.favoriteTeam)
      ? 'champions'
      : EL_TEAMS.includes(this.favoriteTeam)
        ? 'europa'
        : BIG_THREE.includes(this.favoriteTeam)
          ? 'big'
          : 'liga';
    const availableTypes = this.getAvailableTypes(category);

    // Filter out the last type to prevent consecutive repeats
    const candidateTypes = availableTypes.filter((t) => t !== this.lastType);

    // Try candidate types (non-repeating) first, in random order
    for (const type of shuffle([...candidateTypes])) {
      const question = this.generateTypedForFavorite(type);
      if (question) return question;
    }

    // If no non-repeating type works, try all available types
    for (const type of shuffle([...availableTypes])) {
      const question = this.generateTypedForFavorite(type);
      if (question) return question;
    }

    return null;
  }

  /** Generate a question of a specific type filtered to the favorite team only. */
  private generateTypedForFavorite(type: QuestionType): Question | null {
    if (!this.favoriteTeam) return null;

    const teamMatches = matches.filter(
      (m) => m.homeTeam === this.favoriteTeam || m.awayTeam === this.favoriteTeam,
    );
    const teamPlayers = players.filter((p) => p.team === this.favoriteTeam);
    const teamMotm = manOfTheMatch.filter(
      (m) => m.homeTeam === this.favoriteTeam || m.awayTeam === this.favoriteTeam,
    );

    switch (type) {
      case 'match_result':
        return generateMatchResultFromMatches(teamMatches);
      case 'goal_scorer':
        return generateGoalScorerFromMatches(teamMatches);
      case 'shirt_number':
        return generateShirtNumberFromPlayers(teamPlayers);
      case 'player_foot':
        return generatePlayerFootFromPlayers(teamPlayers);
      case 'player_position':
        return generatePlayerPositionFromPlayers(teamPlayers);
      case 'man_of_the_match':
        return generateMotmFromEntries(teamMotm);
    }
  }

  /** Unfiltered fallback — picks any question that differs from the last type. */
  private generateUnfiltered(): Question {
    const candidateTypes = allTypes.filter((t) => t !== this.lastType);
    for (const type of shuffle([...candidateTypes])) {
      const question = generatorMap[type]();
      if (question) {
        this.lastType = question.type;
        return question;
      }
    }

    // Absolute last resort — any type
    for (const type of shuffle([...allTypes])) {
      const question = generatorMap[type]();
      if (question) {
        this.lastType = question.type;
        return question;
      }
    }

    // Absolute last resort — should never happen with valid data
    return {
      text: 'Qual destes clubes joga na Primeira Liga?',
      answers: ['SL Benfica', 'Real Madrid', 'AC Milan'],
      correctIndex: 0,
      type: 'match_result',
    };
  }
}

// ── Exported utility functions ──────────────────────────────────────────────

/**
 * Generate a random question using the stateful generator.
 * Creates a temporary instance — prefer using QuestionGenerator directly.
 */
export function generateQuestion(favoriteTeam?: string): Question {
  const generator = new QuestionGenerator(favoriteTeam);
  return generator.next();
}

/**
 * Generate a question of a specific type (unfiltered).
 */
export function generateQuestionOfType(type: QuestionType): Question | null {
  return generatorMap[type]();
}
