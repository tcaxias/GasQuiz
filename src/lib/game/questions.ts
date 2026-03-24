import type { Question, QuestionType } from '$lib/types/quiz';
import { matches } from '$lib/data/matches';
import { players, getTeams, getPlayersByTeam } from '$lib/data/players';

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

/**
 * Generate a "match result" question.
 * "Qual foi o resultado de [Home] vs [Away] (Jornada X)?"
 * Correct: "2-1", Wrong: two other plausible scores.
 */
function generateMatchResultQuestion(): Question | null {
  if (matches.length === 0) return null;

  const match = pickRandom(matches);
  const correctScore = `${match.homeGoals}-${match.awayGoals}`;

  // Generate plausible wrong scores
  const wrongScores = generateWrongScores(match.homeGoals, match.awayGoals);

  const answers: [string, string, string] = [correctScore, wrongScores[0], wrongScores[1]];
  const shuffledAnswers = shuffle([...answers]);
  const correctIndex = shuffledAnswers.indexOf(correctScore);

  return {
    text: `Qual foi o resultado de ${match.homeTeam} vs ${match.awayTeam}?\n(Jornada ${match.jornada})`,
    answers: shuffledAnswers as [string, string, string],
    correctIndex,
    type: 'match_result',
  };
}

/** Generate two plausible wrong scores that differ from the correct one */
function generateWrongScores(homeGoals: number, awayGoals: number): [string, string] {
  const scores = new Set<string>();
  const correct = `${homeGoals}-${awayGoals}`;

  // Generate wrong scores by tweaking goals +-1 or +-2
  const attempts = [
    `${homeGoals + 1}-${awayGoals}`,
    `${homeGoals}-${awayGoals + 1}`,
    `${homeGoals + 1}-${awayGoals + 1}`,
    `${Math.max(0, homeGoals - 1)}-${awayGoals}`,
    `${homeGoals}-${Math.max(0, awayGoals - 1)}`,
    `${homeGoals + 2}-${awayGoals}`,
    `${homeGoals}-${awayGoals + 2}`,
    `${awayGoals}-${homeGoals}`, // swapped score
    `${Math.max(0, homeGoals - 1)}-${Math.max(0, awayGoals - 1)}`,
  ];

  for (const score of shuffle(attempts)) {
    if (score !== correct && !scores.has(score)) {
      scores.add(score);
    }
    if (scores.size >= 2) break;
  }

  // Fallback if we somehow don't have 2
  while (scores.size < 2) {
    const s = `${Math.floor(Math.random() * 4)}-${Math.floor(Math.random() * 3)}`;
    if (s !== correct && !scores.has(s)) scores.add(s);
  }

  const arr = [...scores];
  return [arr[0], arr[1]];
}

/**
 * Generate a "shirt number" question.
 * "Qual é o número da camisola de [Player] no [Team]?"
 * Correct: "19", Wrong: two other numbers from the same team.
 */
function generateShirtNumberQuestion(): Question | null {
  if (players.length === 0) return null;

  const teams = getTeams();
  if (teams.length === 0) return null;

  // Pick a team that has at least 3 players (so we can generate 2 wrong answers)
  const viableTeams = teams.filter((t) => getPlayersByTeam(t).length >= 3);
  if (viableTeams.length === 0) return null;

  const team = pickRandom(viableTeams);
  const teamPlayers = getPlayersByTeam(team);
  const player = pickRandom(teamPlayers);
  const correctNumber = String(player.number);

  // Get wrong numbers from other players on the same team
  const otherNumbers = teamPlayers
    .filter((p) => p.name !== player.name)
    .map((p) => String(p.number));

  const wrongNumbers = pickRandomExcluding(otherNumbers, [correctNumber], 2);

  // If not enough wrong numbers from same team, add random numbers
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
  };
}

/**
 * Generate a "goal scorer" question.
 * "Quem marcou golo no jogo [Home] [H]-[A] [Away]?"
 * Correct: a scorer, Wrong: two players who didn't score.
 */
function generateGoalScorerQuestion(): Question | null {
  // Only consider matches where at least one goal was scored
  const matchesWithGoals = matches.filter(
    (m) => m.homeScorers.length > 0 || m.awayScorers.length > 0,
  );
  if (matchesWithGoals.length === 0) return null;

  const match = pickRandom(matchesWithGoals);
  const allScorers = [...match.homeScorers, ...match.awayScorers];
  const correctScorer = pickRandom(allScorers);

  // Get wrong answers: players who did NOT score in this match
  const allPlayerNames = players.map((p) => p.name);
  const uniqueScorers = [...new Set(allScorers)];
  const wrongPlayers = pickRandomExcluding(allPlayerNames, uniqueScorers, 2);

  // Fallback if not enough players in dataset
  if (wrongPlayers.length < 2) return null;

  const answers: [string, string, string] = [correctScorer, wrongPlayers[0], wrongPlayers[1]];
  const shuffledAnswers = shuffle([...answers]);
  const correctIndex = shuffledAnswers.indexOf(correctScorer);

  return {
    text: `Quem marcou golo no jogo\n${match.homeTeam} ${match.homeGoals}-${match.awayGoals} ${match.awayTeam}?\n(Jornada ${match.jornada})`,
    answers: shuffledAnswers as [string, string, string],
    correctIndex,
    type: 'goal_scorer',
  };
}

/** All available question generator functions */
const generators: (() => Question | null)[] = [
  generateMatchResultQuestion,
  generateShirtNumberQuestion,
  generateGoalScorerQuestion,
];

/**
 * Generate a random question.
 * Tries different generators until one succeeds.
 */
export function generateQuestion(): Question {
  const shuffledGenerators = shuffle([...generators]);

  for (const gen of shuffledGenerators) {
    const question = gen();
    if (question) return question;
  }

  // Absolute fallback — should never happen if data is populated
  return {
    text: 'Qual é o clube mais antigo de Portugal?',
    answers: ['FC Porto', 'SL Benfica', 'Sporting CP'],
    correctIndex: 0,
    type: 'match_result',
  };
}

/**
 * Generate a question of a specific type.
 */
export function generateQuestionOfType(type: QuestionType): Question | null {
  switch (type) {
    case 'match_result':
      return generateMatchResultQuestion();
    case 'shirt_number':
      return generateShirtNumberQuestion();
    case 'goal_scorer':
      return generateGoalScorerQuestion();
  }
}
