import type { TeamColors } from '$lib/types/quiz';

/**
 * Team colors for all 18 Primeira Liga 2025-26 clubs.
 * Primary = main jersey color, used as game background.
 * Secondary = accent, used for highlights.
 * Text = readable text color on primary background.
 */
export const teamColors: Record<string, TeamColors> = {
  'FC Porto': { primary: 0x003f87, secondary: 0xffffff, text: 0xffffff },
  'SL Benfica': { primary: 0xcc0000, secondary: 0xffffff, text: 0xffffff },
  'Sporting CP': { primary: 0x006b3f, secondary: 0xffffff, text: 0xffffff },
  'SC Braga': { primary: 0xd40000, secondary: 0xffffff, text: 0xffffff },
  'Vitória SC': { primary: 0x1a1a1a, secondary: 0xffffff, text: 0xffffff },
  'Gil Vicente': { primary: 0xcc0000, secondary: 0x003399, text: 0xffffff },
  Moreirense: { primary: 0x006633, secondary: 0xffffff, text: 0xffffff },
  'Casa Pia': { primary: 0x003366, secondary: 0xffcc00, text: 0xffffff },
  'FC Famalicão': { primary: 0x003366, secondary: 0xffffff, text: 0xffffff },
  'Santa Clara': { primary: 0xcc0000, secondary: 0xffffff, text: 0xffffff },
  'Estoril Praia': { primary: 0xffd700, secondary: 0x003399, text: 0x1a1a1a },
  'FC Arouca': { primary: 0xffd700, secondary: 0x1a1a1a, text: 0x1a1a1a },
  'Rio Ave': { primary: 0x006633, secondary: 0xffffff, text: 0xffffff },
  'CD Nacional': { primary: 0x1a1a1a, secondary: 0xffffff, text: 0xffffff },
  'Estrela da Amadora': { primary: 0xcc0000, secondary: 0x1a1a1a, text: 0xffffff },
  AVS: { primary: 0x003366, secondary: 0xcc0000, text: 0xffffff },
  'FC Alverca': { primary: 0xcc0000, secondary: 0xffffff, text: 0xffffff },
  'CD Tondela': { primary: 0x006633, secondary: 0xffd700, text: 0xffffff },
};

/** Default colors when no team is selected */
export const defaultColors: TeamColors = {
  primary: 0x1a1a2e,
  secondary: 0x3498db,
  text: 0xffffff,
};

/** All team names in display order (big three first) */
export const allTeams: string[] = [
  'FC Porto',
  'SL Benfica',
  'Sporting CP',
  'SC Braga',
  'Vitória SC',
  'Gil Vicente',
  'Moreirense',
  'Casa Pia',
  'FC Famalicão',
  'Santa Clara',
  'Estoril Praia',
  'FC Arouca',
  'Rio Ave',
  'CD Nacional',
  'Estrela da Amadora',
  'AVS',
  'FC Alverca',
  'CD Tondela',
];

/**
 * Get colors for a team, falling back to defaults.
 */
export function getTeamColors(team: string): TeamColors {
  return teamColors[team] ?? defaultColors;
}
