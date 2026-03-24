import type { Question, QuestionType, PlayerFoot, Competition } from '$lib/types/quiz';
import { matches } from '$lib/data/matches';
import { players, getTeams, getPlayersByTeam } from '$lib/data/players';
import { manOfTheMatch } from '$lib/data/awards';

/** The big three clubs — same weight as European competitions */
const BIG_THREE = ['FC Porto', 'SL Benfica', 'Sporting CP'];

/** Portuguese clubs that play in European competitions */
const EUROPEAN_CLUBS = ['FC Porto', 'SL Benfica', 'Sporting CP', 'SC Braga', 'Vitória SC'];

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

/**
 * Generate a "match result" question.
 * Shows competition context for European matches.
 */
function generateMatchResultQuestion(): Question | null {
  if (matches.length === 0) return null;

  const match = pickRandom(matches);
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
 * Generate a "shirt number" question.
 */
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

/**
 * Generate a "goal scorer" question.
 * Shows competition context for European matches.
 */
function generateGoalScorerQuestion(): Question | null {
  const matchesWithGoals = matches.filter(
    (m) => m.homeScorers.length > 0 || m.awayScorers.length > 0,
  );
  if (matchesWithGoals.length === 0) return null;

  const match = pickRandom(matchesWithGoals);
  const allScorers = [...match.homeScorers, ...match.awayScorers];
  const correctScorer = pickRandom(allScorers);

  const allPlayerNames = players.map((p) => p.name);
  const uniqueScorers = [...new Set(allScorers)];
  const wrongPlayers = pickRandomExcluding(allPlayerNames, uniqueScorers, 2);

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
 * Generate a "player foot" question.
 */
function generatePlayerFootQuestion(): Question | null {
  if (players.length === 0) return null;

  const player = pickRandom(players);
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
 * Generate a "man of the match" question.
 */
function generateManOfTheMatchQuestion(): Question | null {
  if (manOfTheMatch.length === 0) return null;

  const motm = pickRandom(manOfTheMatch);
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

/** Map of question type to generator function */
const generatorMap: Record<QuestionType, () => Question | null> = {
  match_result: generateMatchResultQuestion,
  shirt_number: generateShirtNumberQuestion,
  goal_scorer: generateGoalScorerQuestion,
  player_foot: generatePlayerFootQuestion,
  man_of_the_match: generateManOfTheMatchQuestion,
};

/** All available question types */
const allTypes: QuestionType[] = [
  'match_result',
  'shirt_number',
  'goal_scorer',
  'player_foot',
  'man_of_the_match',
];

/**
 * Generate a random question, weighted by competition and team.
 *
 * Weighting:
 * - Favorite team: 3x (always accepted)
 * - European competitions (CL/EL/ECL): 2x
 * - Big three PT clubs: 2x
 * - Smaller PT clubs: 1x (half of big clubs)
 */
export function generateQuestion(favoriteTeam?: string): Question {
  for (let attempt = 0; attempt < 30; attempt++) {
    const type = pickRandom(allTypes);
    const gen = generatorMap[type];
    const question = gen();
    if (!question) continue;

    const weight = getQuestionWeight(question, favoriteTeam);
    if (Math.random() < weight) {
      return question;
    }
  }

  // Fallback
  const shuffledTypes = shuffle([...allTypes]);
  for (const type of shuffledTypes) {
    const question = generatorMap[type]();
    if (question) return question;
  }

  return {
    text: 'Qual é o clube mais antigo de Portugal?',
    answers: ['FC Porto', 'SL Benfica', 'Sporting CP'],
    correctIndex: 0,
    type: 'match_result',
  };
}

/**
 * Get acceptance probability for a question.
 *
 * Proportions:
 *   favorite club  → 1.0  (always accept = 3x effective)
 *   european match  → 0.66 (≈ 2x)
 *   big three club  → 0.66 (≈ 2x)
 *   smaller club    → 0.33 (≈ 1x, half of big clubs)
 */
function getQuestionWeight(question: Question, favoriteTeam?: string): number {
  const team = question.team;
  const comp = question.competition;

  // Favorite team always accepted
  if (favoriteTeam && team === favoriteTeam) return 1.0;

  // European competition questions get 2x
  if (comp && comp !== 'liga') return 0.66;

  // Big three PT clubs get 2x
  if (team && BIG_THREE.includes(team)) return 0.66;

  // European clubs (Braga, Vitória) in liga questions still get slightly boosted
  if (team && EUROPEAN_CLUBS.includes(team)) return 0.5;

  // Smaller clubs get 1x (baseline)
  return 0.33;
}

/**
 * Generate a question of a specific type.
 */
export function generateQuestionOfType(type: QuestionType): Question | null {
  return generatorMap[type]();
}
