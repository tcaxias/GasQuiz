import type { Question, QuestionType, PlayerFoot, Competition, MatchResult, Player, ManOfTheMatch, DetailedPosition } from '$lib/types/quiz';
import { matches } from '$lib/data/matches';
import { players, getTeams, getPlayersByTeam } from '$lib/data/players';
import { manOfTheMatch } from '$lib/data/awards';

/** The big three clubs — same weight as European competitions */
const BIG_THREE = ['FC Porto', 'SL Benfica', 'Sporting CP'];

/** Portuguese clubs that play in European competitions */
const EUROPEAN_CLUBS = ['FC Porto', 'SL Benfica', 'Sporting CP', 'SC Braga', 'Vitória SC'];

/** Teams that play in the Champions League */
const CL_TEAMS = ['SL Benfica', 'Sporting CP'];

/** Teams that play in the Europa League */
const EL_TEAMS = ['FC Porto', 'SC Braga'];

/** Question category for the rotation cycle */
export type QuestionCategory = 'liga' | 'big' | 'europa' | 'champions';

/**
 * 7-question repeating cycle:
 * 1 liga (small clubs) : 2 big three : 2 Europa League : 2 Champions League
 */
const CATEGORY_ROTATION: QuestionCategory[] = [
  'liga', 'big', 'big', 'europa', 'europa', 'champions', 'champions',
];

/** Pick a random element from an array */
function pickRandom<T>(arr: T[]): T {
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
    default:
      return 'Primeira Liga';
  }
}

/** Build the round display text for a match */
function matchRoundLabel(match: { jornada: number; competition?: Competition; round?: string }): string {
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
    case 'big':
      return matches.filter(
        (m) => BIG_THREE.includes(m.homeTeam) || BIG_THREE.includes(m.awayTeam),
      );
    case 'liga':
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
    case 'big':
      return players.filter((p) => BIG_THREE.includes(p.team));
    case 'liga':
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
      return manOfTheMatch.filter(
        (m) => !BIG_THREE.includes(m.homeTeam) && !BIG_THREE.includes(m.awayTeam),
      );
    // No MOTM data for European competitions
    case 'champions':
    case 'europa':
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

  const attempts = [
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
 */
function generateGoalScorerFromMatches(filteredMatches: MatchResult[]): Question | null {
  const matchesWithGoals = filteredMatches.filter(
    (m) => m.homeScorers.length > 0 || m.awayScorers.length > 0,
  );
  if (matchesWithGoals.length === 0) return null;

  const match = pickRandom(matchesWithGoals);
  const allScorers = [...match.homeScorers, ...match.awayScorers];
  const correctScorer = pickRandom(allScorers);

  // Determine which team the scorer belongs to
  const scorerTeam = match.homeScorers.includes(correctScorer)
    ? match.homeTeam
    : match.awayTeam;

  // Get teammates from the same team, excluding all actual scorers
  const uniqueScorers = [...new Set(allScorers)];
  const teammates = players
    .filter((p) => p.team === scorerTeam)
    .map((p) => p.name);

  const wrongPlayers = pickRandomExcluding(teammates, uniqueScorers, 2);

  // Fallback: if not enough teammates, use players from the other team in the match
  if (wrongPlayers.length < 2) {
    const otherTeam = scorerTeam === match.homeTeam ? match.awayTeam : match.homeTeam;
    const otherPlayers = players
      .filter((p) => p.team === otherTeam)
      .map((p) => p.name);
    const extra = pickRandomExcluding(otherPlayers, [...uniqueScorers, ...wrongPlayers], 2 - wrongPlayers.length);
    wrongPlayers.push(...extra);
  }

  if (wrongPlayers.length < 2) return null;

  const answers: [string, string, string] = [correctScorer, wrongPlayers[0], wrongPlayers[1]];
  const shuffledAnswers = shuffle([...answers]);
  const correctIndex = shuffledAnswers.indexOf(correctScorer);

  const comp = match.competition ?? 'liga';
  const roundText = matchRoundLabel(match);
  const compText = comp !== 'liga' ? `${competitionLabel(comp)} — ` : '';

  return {
    text: `Quem marcou golo no jogo\n${match.homeTeam} ${match.homeGoals}-${match.awayGoals} ${match.awayTeam}?\n(${compText}${roundText})`,
    answers: shuffledAnswers as [string, string, string],
    correctIndex,
    type: 'goal_scorer',
    team: match.homeTeam,
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
    const extra = pickRandomExcluding(allNames, [correctPlayer, ...wrongPlayers], 2 - wrongPlayers.length);
    wrongPlayers.push(...extra);
  }

  if (wrongPlayers.length < 2) return null;

  const answers: [string, string, string] = [correctPlayer, wrongPlayers[0], wrongPlayers[1]];
  const shuffledAnswers = shuffle([...answers]);
  const correctIndex = shuffledAnswers.indexOf(correctPlayer);

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
  for (let i = Math.max(0, groupIdx - 1); i <= Math.min(POSITION_GROUPS.length - 1, groupIdx + 1); i++) {
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

// ── Legacy unfiltered generators (for backward compat) ──────────────────────

function generateMatchResultQuestion(): Question | null {
  return generateMatchResultFromMatches(matches);
}

function generateShirtNumberQuestion(): Question | null {
  if (players.length === 0) return null;
  const teams = getTeams();
  if (teams.length === 0) return null;
  const viableTeams = teams.filter((t) => getPlayersByTeam(t).length >= 3);
  if (viableTeams.length === 0) return null;

  const team = pickRandom(viableTeams);
  const teamPlayers = getPlayersByTeam(team);
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

  return {
    text: `Qual é o número da camisola de ${player.name}\nno ${team}?`,
    answers: shuffledAnswers as [string, string, string],
    correctIndex,
    type: 'shirt_number',
    team,
  };
}

function generateGoalScorerQuestion(): Question | null {
  return generateGoalScorerFromMatches(matches);
}

function generatePlayerFootQuestion(): Question | null {
  return generatePlayerFootFromPlayers(players);
}

function generateManOfTheMatchQuestion(): Question | null {
  return generateMotmFromEntries(manOfTheMatch);
}

function generatePlayerPositionQuestion(): Question | null {
  return generatePlayerPositionFromPlayers(players);
}

/** Map of question type to generator function (unfiltered, for backward compat) */
const generatorMap: Record<QuestionType, () => Question | null> = {
  match_result: generateMatchResultQuestion,
  shirt_number: generateShirtNumberQuestion,
  goal_scorer: generateGoalScorerQuestion,
  player_foot: generatePlayerFootQuestion,
  man_of_the_match: generateManOfTheMatchQuestion,
  player_position: generatePlayerPositionQuestion,
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
 * Stateful question generator with structured category rotation
 * and no consecutive same-type questions.
 *
 * Uses a 7-question repeating cycle:
 *   liga → big → big → europa → europa → champions → champions
 */
export class QuestionGenerator {
  private categoryIndex: number;
  private lastType: QuestionType | null = null;
  private favoriteTeam?: string;

  constructor(favoriteTeam?: string) {
    this.favoriteTeam = favoriteTeam;
    // Random starting position so games don't always start the same
    this.categoryIndex = Math.floor(Math.random() * CATEGORY_ROTATION.length);
  }

  /** Generate the next question, respecting category rotation and type diversity. */
  next(): Question {
    const category = CATEGORY_ROTATION[this.categoryIndex % CATEGORY_ROTATION.length];

    // 5x boost for favorite team: ~71% chance (5/7) to force favorite team category
    const effectiveCategory = this.maybeFavoriteOverride(category);
    const isFavoriteOverride = effectiveCategory !== category && this.favoriteTeam != null;

    // When favorite override is active, try favorite-team-specific generation first
    if (isFavoriteOverride) {
      const favoriteQuestion = this.generateForFavorite();
      if (favoriteQuestion) {
        this.lastType = favoriteQuestion.type;
        this.categoryIndex = (this.categoryIndex + 1) % CATEGORY_ROTATION.length;
        return favoriteQuestion;
      }
    }

    // Try to generate a question matching the effective category with a different type
    const question = this.generateForCategory(effectiveCategory);
    if (question) {
      this.lastType = question.type;
      this.categoryIndex = (this.categoryIndex + 1) % CATEGORY_ROTATION.length;
      return question;
    }

    // Fallback: try all other categories if this one has no viable data
    for (let offset = 1; offset < CATEGORY_ROTATION.length; offset++) {
      const fallbackIdx = (this.categoryIndex + offset) % CATEGORY_ROTATION.length;
      const fallbackCategory = CATEGORY_ROTATION[fallbackIdx];
      const fallbackQuestion = this.generateForCategory(fallbackCategory);
      if (fallbackQuestion) {
        this.lastType = fallbackQuestion.type;
        this.categoryIndex = (this.categoryIndex + 1) % CATEGORY_ROTATION.length;
        return fallbackQuestion;
      }
    }

    // Ultimate fallback — use unfiltered generation
    this.categoryIndex = (this.categoryIndex + 1) % CATEGORY_ROTATION.length;
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
    // player_position only for categories with big three players (who have detailedPosition)
    if (category === 'big' || category === 'champions' || category === 'europa') {
      types.push('player_position');
    }
    return types;
  }

  /** Generate a question of a specific type filtered by category. */
  private generateTypedForCategory(type: QuestionType, category: QuestionCategory): Question | null {
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
   * Override category to favor the player's favorite team.
   * 5 out of 7 questions should target the favorite team's category (~71%).
   */
  private maybeFavoriteOverride(originalCategory: QuestionCategory): QuestionCategory {
    if (!this.favoriteTeam) return originalCategory;

    // 5 out of 7 questions should be about the favorite team's context
    if (Math.random() < 5 / 7) {
      return this.getFavoriteCategory();
    }
    return originalCategory;
  }

  /** Determine which category the favorite team belongs to. */
  private getFavoriteCategory(): QuestionCategory {
    if (!this.favoriteTeam) return 'liga';
    if (CL_TEAMS.includes(this.favoriteTeam)) return 'champions';
    if (EL_TEAMS.includes(this.favoriteTeam)) return 'europa';
    if (BIG_THREE.includes(this.favoriteTeam)) return 'big';
    return 'liga';
  }

  /**
   * Try to generate a question specifically about the favorite team.
   * Filters matches, players, and MOTM entries to only those involving the favorite club.
   */
  private generateForFavorite(): Question | null {
    if (!this.favoriteTeam) return null;

    // Determine which types are available for the favorite team's category
    const category = this.getFavoriteCategory();
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

    return {
      text: 'Qual é o clube mais antigo de Portugal?',
      answers: ['FC Porto', 'SL Benfica', 'Sporting CP'],
      correctIndex: 0,
      type: 'match_result',
    };
  }
}

// ── Backward-compatible exported functions ──────────────────────────────────

/**
 * Generate a random question using the stateful generator.
 * Creates a temporary instance for backward compatibility.
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
