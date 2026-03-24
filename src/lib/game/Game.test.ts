import { describe, it, expect } from 'vitest';
import { Game } from './Game';
import { generateQuestion, generateQuestionOfType } from './questions';
import { matches } from '$lib/data/matches';
import { players, getTeams, getPlayersByTeam } from '$lib/data/players';

describe('Game', () => {
  it('should be instantiable', () => {
    const game = new Game('Test');
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
