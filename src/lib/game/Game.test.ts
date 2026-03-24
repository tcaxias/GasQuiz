import { describe, it, expect } from 'vitest';
import { Game } from './Game';

describe('Game', () => {
  it('should be instantiable', () => {
    const game = new Game();
    expect(game).toBeDefined();
  });
});
