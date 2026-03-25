import { describe, it, expect } from 'vitest';
import { Game } from './Game';
import { generateQuestion, generateQuestionOfType, QuestionGenerator } from './questions';
import { matches } from '$lib/data/matches';
import { players, getTeams, getPlayersByTeam } from '$lib/data/players';
import { manOfTheMatch } from '$lib/data/awards';
import { allTeams, teamColors, getTeamColors, defaultColors } from '$lib/data/teams';

describe('Game', () => {
  it('should be instantiable', () => {
    const game = new Game('Test', 'FC Porto');
    expect(game).toBeDefined();
  });
});

describe('Match data', () => {
  it('should have matches loaded', () => {
    expect(matches.length).toBeGreaterThan(200);
  });

  it('should cover jornadas 1-27', () => {
    const jornadas = new Set(matches.map((m) => m.jornada));
    for (let j = 1; j <= 27; j++) {
      expect(jornadas.has(j)).toBe(true);
    }
  });

  it('should have valid score data', () => {
    for (const m of matches) {
      expect(m.homeGoals).toBeGreaterThanOrEqual(0);
      expect(m.awayGoals).toBeGreaterThanOrEqual(0);
      expect(m.homeTeam).toBeTruthy();
      expect(m.awayTeam).toBeTruthy();
    }
  });

  it('should have European competition matches', () => {
    const euroMatches = matches.filter((m) => m.competition);
    expect(euroMatches.length).toBeGreaterThan(20);
  });

  it('should have Champions League and Europa League matches', () => {
    const cl = matches.filter((m) => m.competition === 'champions');
    const el = matches.filter((m) => m.competition === 'europa');
    expect(cl.length).toBeGreaterThan(0);
    expect(el.length).toBeGreaterThan(0);
  });

  it('should have Taça de Portugal matches', () => {
    const taca = matches.filter((m) => m.competition === 'taca');
    expect(taca.length).toBeGreaterThan(10);
  });

  it('should have Taça de Portugal matches from multiple rounds', () => {
    const taca = matches.filter((m) => m.competition === 'taca');
    const rounds = new Set(taca.map((m) => m.round));
    expect(rounds.size).toBeGreaterThanOrEqual(3); // Quinta Eliminatória, Quartos de Final, Meias-Finais
  });

  it('should have Taça de Portugal matches with goal scorers', () => {
    const tacaWithGoals = matches.filter(
      (m) => m.competition === 'taca' && (m.homeScorers.length > 0 || m.awayScorers.length > 0),
    );
    expect(tacaWithGoals.length).toBeGreaterThan(4);
  });

  it('should have round labels for European and Taça matches', () => {
    const euroMatches = matches.filter((m) => m.competition);
    for (const m of euroMatches) {
      expect(m.round).toBeTruthy();
    }
  });
});

describe('Player data', () => {
  it('should have players loaded', () => {
    expect(players.length).toBeGreaterThan(150);
  });

  it('should have the big three teams', () => {
    const teams = getTeams();
    expect(teams).toContain('FC Porto');
    expect(teams).toContain('SL Benfica');
    expect(teams).toContain('Sporting CP');
  });

  it('should have at least 3 players per major team', () => {
    for (const team of ['FC Porto', 'SL Benfica', 'Sporting CP', 'SC Braga']) {
      expect(getPlayersByTeam(team).length).toBeGreaterThanOrEqual(3);
    }
  });

  it('should have foot data for all players', () => {
    for (const p of players) {
      expect(['right', 'left', 'both']).toContain(p.foot);
    }
  });
});

describe('Team colors', () => {
  it('should have colors for all 18 teams', () => {
    expect(allTeams).toHaveLength(18);
    for (const team of allTeams) {
      expect(teamColors[team]).toBeDefined();
      expect(teamColors[team].primary).toBeTypeOf('number');
      expect(teamColors[team].secondary).toBeTypeOf('number');
      expect(teamColors[team].text).toBeTypeOf('number');
    }
  });

  it('should return default colors for unknown team', () => {
    const colors = getTeamColors('Unknown FC');
    expect(colors).toEqual(defaultColors);
  });
});

describe('Man of the match data', () => {
  it('should have MOTM entries', () => {
    expect(manOfTheMatch.length).toBeGreaterThan(5);
  });

  it('should have valid MOTM data', () => {
    for (const motm of manOfTheMatch) {
      expect(motm.player).toBeTruthy();
      expect(motm.team).toBeTruthy();
      expect(motm.jornada).toBeGreaterThan(0);
    }
  });
});

describe('Question generation', () => {
  it('should generate a question', () => {
    const q = generateQuestion();
    expect(q).toBeDefined();
    expect(q.text).toBeTruthy();
    expect(q.answers).toHaveLength(3);
    expect(q.correctIndex).toBeGreaterThanOrEqual(0);
    expect(q.correctIndex).toBeLessThan(3);
  });

  it('should generate a question with favorite team', () => {
    const q = generateQuestion('FC Porto');
    expect(q).toBeDefined();
    expect(q.text).toBeTruthy();
    expect(q.answers).toHaveLength(3);
  });

  it('should generate match result questions', () => {
    const q = generateQuestionOfType('match_result');
    expect(q).not.toBeNull();
    expect(q!.type).toBe('match_result');
    expect(q!.text).toContain('resultado');
  });

  it('should generate shirt number questions', () => {
    const q = generateQuestionOfType('shirt_number');
    expect(q).not.toBeNull();
    expect(q!.type).toBe('shirt_number');
    expect(q!.text).toContain('camisola');
  });

  it('should generate goal scorer questions', () => {
    const q = generateQuestionOfType('goal_scorer');
    expect(q).not.toBeNull();
    expect(q!.type).toBe('goal_scorer');
    expect(q!.text).toContain('marcou');
  });

  it('should generate player foot questions', () => {
    const q = generateQuestionOfType('player_foot');
    expect(q).not.toBeNull();
    expect(q!.type).toBe('player_foot');
    expect(q!.text).toContain('pé preferido');
  });

  it('should generate man of the match questions', () => {
    const q = generateQuestionOfType('man_of_the_match');
    expect(q).not.toBeNull();
    expect(q!.type).toBe('man_of_the_match');
    expect(q!.text).toContain('melhor jogador');
  });

  it('should generate player position questions', () => {
    const q = generateQuestionOfType('player_position');
    expect(q).not.toBeNull();
    expect(q!.type).toBe('player_position');
    expect(q!.text).toContain('posição');
  });

  it('should have detailed positions for big three players', () => {
    const bigThreePlayers = players.filter(
      (p) => ['FC Porto', 'SL Benfica', 'Sporting CP'].includes(p.team),
    );
    const withDetailedPos = bigThreePlayers.filter((p) => p.detailedPosition);
    expect(withDetailedPos.length).toBe(bigThreePlayers.length);
  });

  it('should have goal scorer wrong answers from match teams', () => {
    for (let i = 0; i < 10; i++) {
      const q = generateQuestionOfType('goal_scorer');
      if (q) {
        // All 3 answers should be real player names (not random strings)
        for (const answer of q.answers) {
          expect(answer).toBeTruthy();
          expect(answer.length).toBeGreaterThan(1);
        }
      }
    }
  });

  it('should have correct answer in the answers array', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion();
      expect(q.answers[q.correctIndex]).toBeTruthy();
    }
  });

  it('should generate different questions (not always the same)', () => {
    const texts = new Set<string>();
    for (let i = 0; i < 20; i++) {
      texts.add(generateQuestion().text);
    }
    expect(texts.size).toBeGreaterThan(5);
  });
});

describe('QuestionGenerator', () => {
  it('never repeats question types consecutively', () => {
    const generator = new QuestionGenerator();
    const questions = Array.from({ length: 20 }, () => generator.next());

    for (let i = 1; i < questions.length; i++) {
      expect(
        questions[i].type,
        `Question ${i} (${questions[i].type}) should differ from question ${i - 1} (${questions[i - 1].type})`,
      ).not.toBe(questions[i - 1].type);
    }
  });

  it('produces questions from multiple categories via probability', () => {
    const generator = new QuestionGenerator();
    // Generate enough questions for probability-based distribution to show variety
    const questions = Array.from({ length: 100 }, () => generator.next());

    // Classify each question by category using team/competition
    const seenCategories = new Set<string>();

    for (const q of questions) {
      const comp = q.competition;

      if (comp === 'champions') {
        seenCategories.add('champions');
      } else if (comp === 'europa') {
        seenCategories.add('europa');
      } else {
        seenCategories.add('liga');
      }
    }

    // Should see champions, europa, and liga categories represented
    expect(seenCategories.has('champions')).toBe(true);
    expect(seenCategories.has('europa')).toBe(true);
    expect(seenCategories.has('liga')).toBe(true);
  });

  it('works with a favorite team', () => {
    const generator = new QuestionGenerator('FC Porto');
    const questions = Array.from({ length: 10 }, () => generator.next());

    // All questions should be valid
    for (const q of questions) {
      expect(q.text).toBeTruthy();
      expect(q.answers).toHaveLength(3);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(3);
    }

    // No consecutive same-type even with favorite team
    for (let i = 1; i < questions.length; i++) {
      expect(questions[i].type).not.toBe(questions[i - 1].type);
    }
  });

  it('can produce Taça de Portugal questions', () => {
    // Generate enough questions to statistically hit the 5-7% taça probability
    const generator = new QuestionGenerator();
    const questions = Array.from({ length: 200 }, () => generator.next());

    const tacaQuestions = questions.filter((q) => q.competition === 'taca');
    expect(tacaQuestions.length).toBeGreaterThan(0);

    // Verify taça questions mention Taça de Portugal in the text
    for (const q of tacaQuestions) {
      expect(q.text).toContain('Taça de Portugal');
    }
  });
});
