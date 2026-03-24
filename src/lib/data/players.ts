import type { Player, PlayerPosition, PlayerFoot } from '$lib/types/quiz';

type P = [string, number, PlayerPosition, PlayerFoot];

function team(name: string, list: P[]): Player[] {
  return list.map(([n, num, pos, foot]) => ({ name: n, number: num, position: pos, team: name, foot }));
}

/**
 * Primeira Liga 2025-26 player shirt numbers.
 * Source: Transfermarkt.pt (March 2026)
 */
export const players: Player[] = [
  // ── FC Porto ──────────────────────────────────────────
  ...team('FC Porto', [
    ['Diogo Costa', 99, 'GR', 'right'],
    ['Cláudio Ramos', 14, 'GR', 'right'],
    ['Jakub Kiwior', 4, 'DEF', 'left'],
    ['Nehuén Pérez', 18, 'DEF', 'right'],
    ['Jan Bednarek', 5, 'DEF', 'right'],
    ['Dominik Prpić', 21, 'DEF', 'left'],
    ['Thiago Silva', 3, 'DEF', 'right'],
    ['Francisco Moura', 74, 'DEF', 'left'],
    ['Zaidu Sanusi', 12, 'DEF', 'left'],
    ['Alberto Costa', 20, 'DEF', 'right'],
    ['Martim Fernandes', 52, 'DEF', 'right'],
    ['Alan Varela', 22, 'MED', 'right'],
    ['Pablo Rosario', 13, 'MED', 'right'],
    ['Victor Froholdt', 8, 'MED', 'right'],
    ['Seko Fofana', 42, 'MED', 'right'],
    ['Rodrigo Mora', 86, 'MED', 'right'],
    ['Gabri Veiga', 10, 'MED', 'right'],
    ['Borja Sainz', 17, 'AV', 'right'],
    ['Yann Karamoh', 75, 'AV', 'right'],
    ['William Gomes', 7, 'AV', 'left'],
    ['Pepê', 11, 'AV', 'right'],
    ['Samu Aghehowa', 9, 'AV', 'right'],
    ['Terem Moffi', 29, 'AV', 'left'],
    ['Deniz Gül', 27, 'AV', 'right'],
    ['Luuk de Jong', 26, 'AV', 'right'],
  ]),

  // ── SL Benfica ────────────────────────────────────────
  ...team('SL Benfica', [
    ['Anatoliy Trubin', 1, 'GR', 'right'],
    ['Samuel Soares', 24, 'GR', 'right'],
    ['António Silva', 4, 'DEF', 'right'],
    ['Tomás Araújo', 44, 'DEF', 'right'],
    ['Nicolás Otamendi', 30, 'DEF', 'right'],
    ['Samuel Dahl', 26, 'DEF', 'left'],
    ['Amar Dedić', 17, 'DEF', 'right'],
    ['Alexander Bah', 6, 'DEF', 'right'],
    ['Richard Ríos', 20, 'MED', 'right'],
    ['Enzo Barrenechea', 5, 'MED', 'right'],
    ['Fredrik Aursnes', 8, 'MED', 'right'],
    ['Leandro Barreiro', 18, 'MED', 'right'],
    ['Georgiy Sudakov', 10, 'MED', 'both'],
    ['Andreas Schjelderup', 21, 'AV', 'right'],
    ['Bruma', 7, 'AV', 'right'],
    ['Dodi Lukébakio', 11, 'AV', 'left'],
    ['Gianluca Prestianni', 25, 'AV', 'right'],
    ['Rafa Silva', 27, 'AV', 'right'],
    ['Vangelis Pavlidis', 14, 'AV', 'both'],
    ['Franjo Ivanović', 9, 'AV', 'right'],
  ]),

  // ── Sporting CP ───────────────────────────────────────
  ...team('Sporting CP', [
    ['Rui Silva', 1, 'GR', 'left'],
    ['João Virgínia', 12, 'GR', 'left'],
    ['Ousmane Diomande', 26, 'DEF', 'right'],
    ['Gonçalo Inácio', 25, 'DEF', 'left'],
    ['Zeno Debast', 6, 'DEF', 'right'],
    ['Eduardo Quaresma', 72, 'DEF', 'right'],
    ['Maxi Araújo', 20, 'DEF', 'left'],
    ['Nuno Santos', 11, 'DEF', 'left'],
    ['Iván Fresneda', 22, 'DEF', 'right'],
    ['Morten Hjulmand', 42, 'MED', 'right'],
    ['Daniel Bragança', 23, 'MED', 'left'],
    ['Hidemasa Morita', 5, 'MED', 'right'],
    ['Giorgi Kochorashvili', 14, 'MED', 'right'],
    ['Francisco Trincão', 17, 'MED', 'left'],
    ['Pedro Gonçalves', 8, 'AV', 'right'],
    ['Geovany Quenda', 7, 'AV', 'left'],
    ['Geny Catamo', 10, 'AV', 'left'],
    ['Luis Suárez', 97, 'AV', 'right'],
    ['Fotis Ioannidis', 89, 'AV', 'both'],
  ]),

  // ── SC Braga ──────────────────────────────────────────
  ...team('SC Braga', [
    ['Lukas Hornicek', 1, 'GR', 'right'],
    ['Tiago Sá', 12, 'GR', 'right'],
    ['Sikou Niakaté', 4, 'DEF', 'left'],
    ['Bright Arrey-Mbi', 26, 'DEF', 'left'],
    ['Gustaf Lagerbielke', 14, 'DEF', 'right'],
    ['Leonardo Lelo', 5, 'DEF', 'left'],
    ['Víctor Gómez', 2, 'DEF', 'right'],
    ['Gabriel Moscardo', 17, 'MED', 'right'],
    ['Vítor Carvalho', 6, 'MED', 'right'],
    ['Florian Grillitsch', 27, 'MED', 'right'],
    ['Rodrigo Zalazar', 10, 'MED', 'right'],
    ['Diego Rodrigues', 50, 'MED', 'right'],
    ['João Moutinho', 8, 'MED', 'right'],
    ['Mario Dorgeles', 20, 'MED', 'left'],
    ['Ricardo Horta', 21, 'AV', 'right'],
    ['Gabri Martínez', 77, 'AV', 'right'],
    ['Pau Víctor', 18, 'AV', 'right'],
    ['Fran Navarro', 39, 'AV', 'right'],
    ['Amine El Ouazzani', 9, 'AV', 'left'],
  ]),

  // ── Vitória SC ────────────────────────────────────────
  ...team('Vitória SC', [
    ['Juan Castillo', 25, 'GR', 'right'],
    ['Óscar Rivas', 4, 'DEF', 'both'],
    ['Rodrigo Abascal', 26, 'DEF', 'left'],
    ['Miguel Nóbrega', 3, 'DEF', 'right'],
    ['João Mendes', 13, 'DEF', 'left'],
    ['Maga', 2, 'DEF', 'right'],
    ['Diogo Sousa', 23, 'MED', 'left'],
    ['Samu', 20, 'MED', 'left'],
    ['Gustavo Silva', 11, 'AV', 'right'],
    ['Telmo Arcanjo', 18, 'AV', 'left'],
    ['Nélson Oliveira', 7, 'AV', 'right'],
    ['Tiago Silva', 69, 'MED', 'right'],
  ]),

  // ── Gil Vicente ───────────────────────────────────────
  ...team('Gil Vicente', [
    ['Lucão', 30, 'GR', 'right'],
    ['Marvin Elimbi', 4, 'DEF', 'right'],
    ['Buatu', 39, 'DEF', 'right'],
    ['Ghislain Konan', 3, 'DEF', 'left'],
    ['Zé Carlos', 2, 'DEF', 'right'],
    ['Mohamed Bamba', 8, 'MED', 'left'],
    ['Facundo Cáseres', 5, 'MED', 'right'],
    ['Luís Esteves', 10, 'MED', 'right'],
    ['Joelson Fernandes', 11, 'AV', 'right'],
    ['Tidjany Touré', 7, 'AV', 'right'],
    ['Sergio Bermejo', 22, 'AV', 'left'],
    ['Gustavo Varela', 89, 'AV', 'right'],
    ['Pablo', 29, 'AV', 'right'],
    ['Héctor Hernández', 23, 'AV', 'right'],
  ]),

  // ── Moreirense ────────────────────────────────────────
  ...team('Moreirense', [
    ['André Ferreira', 13, 'GR', 'right'],
    ['Gilberto Batista', 66, 'DEF', 'right'],
    ['Michel', 3, 'DEF', 'right'],
    ['Maracás', 26, 'DEF', 'right'],
    ['Kiko', 27, 'DEF', 'left'],
    ['Diogo Travassos', 2, 'DEF', 'right'],
    ['Vasco Sousa', 15, 'MED', 'right'],
    ['Nile John', 23, 'MED', 'right'],
    ['Alan', 11, 'MED', 'right'],
    ['Kiko Bondoso', 10, 'AV', 'right'],
    ['Guilherme Schettine', 9, 'AV', 'right'],
    ['Yan Maranhão', 99, 'AV', 'right'],
    ['Marcelo', 7, 'MED', 'right'],
  ]),

  // ── Casa Pia ──────────────────────────────────────────
  ...team('Casa Pia', [
    ['Patrick Sequeira', 1, 'GR', 'right'],
    ['Kaique Rocha', 27, 'DEF', 'right'],
    ['José Fonte', 6, 'DEF', 'right'],
    ['Abdu Conté', 5, 'DEF', 'left'],
    ['Gaizka Larrazabal', 72, 'DEF', 'right'],
    ['Seba Pérez', 42, 'MED', 'right'],
    ['Rafael Brito', 8, 'MED', 'right'],
    ['Kevin Prieto', 19, 'MED', 'right'],
    ['Kelian Nsona', 7, 'AV', 'right'],
    ['Korede Osundina', 13, 'AV', 'both'],
    ['Dailon Livramento', 10, 'AV', 'right'],
    ['Cassiano', 90, 'AV', 'right'],
  ]),

  // ── FC Famalicão ──────────────────────────────────────
  ...team('FC Famalicão', [
    ['Lazar Carević', 25, 'GR', 'right'],
    ['Justin de Haas', 16, 'DEF', 'left'],
    ['Léo Realpe', 3, 'DEF', 'right'],
    ['Pedro Bondo', 28, 'DEF', 'left'],
    ['Rodrigo Pinheiro', 17, 'DEF', 'right'],
    ['Garcia', 2, 'DEF', 'right'],
    ['Tom van de Looi', 6, 'MED', 'right'],
    ['Marcos Peña', 8, 'MED', 'right'],
    ['Gustavo Sá', 20, 'MED', 'right'],
    ['Rochinha', 10, 'AV', 'right'],
    ['Sorriso', 7, 'AV', 'right'],
    ['Gil Dias', 23, 'AV', 'left'],
    ['Simon Elisor', 12, 'AV', 'left'],
    ['Umar Abubakar', 9, 'AV', 'right'],
  ]),

  // ── Santa Clara ───────────────────────────────────────
  ...team('Santa Clara', [
    ['Gabriel Batista', 1, 'GR', 'right'],
    ['MT', 32, 'DEF', 'left'],
    ['Sidney Lima', 23, 'DEF', 'right'],
    ['Frederico Venâncio', 21, 'DEF', 'right'],
    ['Paulo Victor', 64, 'DEF', 'left'],
    ['Diogo Calila', 2, 'DEF', 'right'],
    ['Pedro Ferreira', 8, 'MED', 'right'],
    ['Serginho', 35, 'MED', 'right'],
    ['Gabriel Silva', 10, 'AV', 'right'],
    ['Vinícius Lopes', 70, 'AV', 'right'],
    ['Elias Manoel', 7, 'AV', 'right'],
    ['Gonçalo Paciência', 39, 'AV', 'right'],
  ]),

  // ── Estoril Praia ─────────────────────────────────────
  ...team('Estoril Praia', [
    ['Joel Robles', 1, 'GR', 'right'],
    ['Kévin Boma', 44, 'DEF', 'right'],
    ['Ferro', 4, 'DEF', 'right'],
    ['Pedro Amaral', 24, 'DEF', 'left'],
    ['Ricard Sánchez', 2, 'DEF', 'right'],
    ['Jordan Holsgrove', 10, 'MED', 'left'],
    ['Jandro Orellana', 6, 'MED', 'right'],
    ['Xeka', 8, 'MED', 'both'],
    ['Nodar Lominadze', 7, 'MED', 'right'],
    ['João Carvalho', 12, 'MED', 'right'],
    ['Pizzi', 21, 'MED', 'right'],
    ['Rafik Guitane', 99, 'AV', 'left'],
    ['Yanis Begraoui', 14, 'AV', 'both'],
    ['Alejandro Marqués', 9, 'AV', 'right'],
    ['Tiago Parente', 36, 'MED', 'right'],
  ]),

  // ── FC Arouca ─────────────────────────────────────────
  ...team('FC Arouca', [
    ['Ignacio de Arruabarrena', 12, 'GR', 'right'],
    ['José Fontán', 3, 'DEF', 'left'],
    ['Boris Popović', 5, 'DEF', 'right'],
    ['Tiago Esgaio', 28, 'DEF', 'right'],
    ['Amadou Dante', 44, 'DEF', 'left'],
    ['Taichi Fukui', 21, 'MED', 'right'],
    ['Pablo Gozálbez', 10, 'MED', 'right'],
    ['Naïs Djouahra', 7, 'AV', 'right'],
    ['Alfonso Trezza', 19, 'AV', 'right'],
    ['Dylan Nandín', 23, 'AV', 'right'],
    ['Iván Barbero', 17, 'AV', 'right'],
  ]),

  // ── Rio Ave ───────────────────────────────────────────
  ...team('Rio Ave', [
    ['Cezary Miszta', 1, 'GR', 'right'],
    ['Andreas Ntoi', 5, 'DEF', 'right'],
    ['Nelson Abbey', 6, 'DEF', 'left'],
    ['Omar Richards', 77, 'DEF', 'left'],
    ['Leonardo Buta', 24, 'DEF', 'left'],
    ['João Tomé', 20, 'DEF', 'right'],
    ['Brandon Aguilera', 10, 'MED', 'left'],
    ['Ryan Guilherme', 8, 'MED', 'right'],
    ['Ole Pohlmann', 80, 'MED', 'right'],
    ['Dario Špikić', 18, 'AV', 'right'],
    ['Clayton', 9, 'AV', 'right'],
    ['André Luiz', 11, 'AV', 'right'],
    ['Tobías Medina', 27, 'AV', 'left'],
  ]),

  // ── CD Nacional ───────────────────────────────────────
  ...team('CD Nacional', [
    ['Kaique Pereira', 1, 'GR', 'right'],
    ['Ulisses', 4, 'DEF', 'right'],
    ['Léo Santos', 34, 'DEF', 'right'],
    ['Ivanildo Fernandes', 14, 'DEF', 'left'],
    ['José Gomes', 5, 'DEF', 'left'],
    ['João Aurélio', 2, 'DEF', 'right'],
    ['Matheus Dias', 6, 'MED', 'right'],
    ['Liziero', 28, 'MED', 'left'],
    ['Filipe Soares', 22, 'MED', 'right'],
    ['Daniel Jr', 10, 'MED', 'left'],
    ['Paulinho Bóia', 11, 'AV', 'right'],
    ['Gabriel Veron', 27, 'AV', 'right'],
    ['Pablo Ruan', 99, 'AV', 'right'],
    ['Jesús Ramírez', 9, 'AV', 'left'],
    ['Lucas João', 19, 'AV', 'right'],
  ]),

  // ── Estrela da Amadora ────────────────────────────────
  ...team('Estrela da Amadora', [
    ['Diogo Pinto', 1, 'GR', 'right'],
    ['Stefan Lekovic', 25, 'DEF', 'right'],
    ['Luan Patrick', 30, 'DEF', 'right'],
    ['Ni', 3, 'DEF', 'left'],
    ['Bruno Langa', 24, 'DEF', 'left'],
    ['Jefferson Encada', 17, 'DEF', 'right'],
    ['Kevin Höög Jansson', 6, 'MED', 'left'],
    ['Paulo Moreira', 19, 'MED', 'right'],
    ['Robinho', 8, 'MED', 'right'],
    ['Ianis Stoica', 10, 'AV', 'right'],
    ['Jovane Cabral', 11, 'AV', 'right'],
    ['Billal Brahimi', 26, 'AV', 'left'],
    ['Sydney van Hooijdonk', 20, 'AV', 'right'],
    ['Rodrigo Pinho', 9, 'AV', 'left'],
  ]),

  // ── AVS ───────────────────────────────────────────────
  ...team('AVS', [
    ['Adriel', 1, 'GR', 'right'],
    ['Cristian Devenish', 42, 'DEF', 'right'],
    ['Paulo Vitor', 3, 'DEF', 'left'],
    ['Rúben Semedo', 35, 'DEF', 'right'],
    ['Ponck', 26, 'DEF', 'right'],
    ['Daniel Rivas', 12, 'DEF', 'left'],
    ['Guillem Molina', 5, 'DEF', 'right'],
    ['Roni', 70, 'MED', 'right'],
    ['Pedro Lima', 8, 'MED', 'left'],
    ['Óscar Perea', 14, 'AV', 'right'],
    ['Tunde Akinsola', 11, 'AV', 'both'],
    ['Antoine Baroan', 17, 'AV', 'left'],
    ['Diego Duarte', 20, 'AV', 'left'],
    ['Tomané', 7, 'AV', 'right'],
    ['Nenê', 18, 'AV', 'right'],
    ['Diogo Spencer', 78, 'AV', 'right'],
  ]),

  // ── FC Alverca ────────────────────────────────────────
  ...team('FC Alverca', [
    ['Marko Milovanović', 9, 'AV', 'right'],
    ['Nor Maviram', 7, 'AV', 'left'],
  ]),

  // ── CD Tondela ────────────────────────────────────────
  ...team('CD Tondela', [
    ['Tiago Manso', 10, 'MED', 'right'],
    ['Ivan Cavaleiro', 9, 'AV', 'right'],
  ]),
];

/** Get all unique team names from the players dataset */
export function getTeams(): string[] {
  return [...new Set(players.map((p) => p.team))];
}

/** Get players for a specific team */
export function getPlayersByTeam(team: string): Player[] {
  return players.filter((p) => p.team === team);
}
