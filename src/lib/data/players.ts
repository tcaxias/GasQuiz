import type { Player, PlayerPosition } from '$lib/types/quiz';

type P = [string, number, PlayerPosition];

function team(name: string, list: P[]): Player[] {
  return list.map(([n, num, pos]) => ({ name: n, number: num, position: pos, team: name }));
}

/**
 * Primeira Liga 2025-26 player shirt numbers.
 * Source: Transfermarkt.pt (March 2026)
 */
export const players: Player[] = [
  // ── FC Porto ──────────────────────────────────────────
  ...team('FC Porto', [
    ['Diogo Costa', 99, 'GR'],
    ['Cláudio Ramos', 14, 'GR'],
    ['Jakub Kiwior', 4, 'DEF'],
    ['Nehuén Pérez', 18, 'DEF'],
    ['Jan Bednarek', 5, 'DEF'],
    ['Dominik Prpić', 21, 'DEF'],
    ['Thiago Silva', 3, 'DEF'],
    ['Francisco Moura', 74, 'DEF'],
    ['Zaidu Sanusi', 12, 'DEF'],
    ['Alberto Costa', 20, 'DEF'],
    ['Martim Fernandes', 52, 'DEF'],
    ['Alan Varela', 22, 'MED'],
    ['Pablo Rosario', 13, 'MED'],
    ['Victor Froholdt', 8, 'MED'],
    ['Seko Fofana', 42, 'MED'],
    ['Rodrigo Mora', 86, 'MED'],
    ['Gabri Veiga', 10, 'MED'],
    ['Borja Sainz', 17, 'AV'],
    ['Yann Karamoh', 75, 'AV'],
    ['William Gomes', 7, 'AV'],
    ['Pepê', 11, 'AV'],
    ['Samu Aghehowa', 9, 'AV'],
    ['Terem Moffi', 29, 'AV'],
    ['Deniz Gül', 27, 'AV'],
    ['Luuk de Jong', 26, 'AV'],
  ]),

  // ── SL Benfica ────────────────────────────────────────
  ...team('SL Benfica', [
    ['Anatoliy Trubin', 1, 'GR'],
    ['Samuel Soares', 24, 'GR'],
    ['António Silva', 4, 'DEF'],
    ['Tomás Araújo', 44, 'DEF'],
    ['Nicolás Otamendi', 30, 'DEF'],
    ['Samuel Dahl', 26, 'DEF'],
    ['Amar Dedić', 17, 'DEF'],
    ['Alexander Bah', 6, 'DEF'],
    ['Richard Ríos', 20, 'MED'],
    ['Enzo Barrenechea', 5, 'MED'],
    ['Fredrik Aursnes', 8, 'MED'],
    ['Leandro Barreiro', 18, 'MED'],
    ['Georgiy Sudakov', 10, 'MED'],
    ['Andreas Schjelderup', 21, 'AV'],
    ['Bruma', 7, 'AV'],
    ['Dodi Lukébakio', 11, 'AV'],
    ['Gianluca Prestianni', 25, 'AV'],
    ['Rafa Silva', 27, 'AV'],
    ['Vangelis Pavlidis', 14, 'AV'],
    ['Franjo Ivanović', 9, 'AV'],
  ]),

  // ── Sporting CP ───────────────────────────────────────
  ...team('Sporting CP', [
    ['Rui Silva', 1, 'GR'],
    ['João Virgínia', 12, 'GR'],
    ['Ousmane Diomande', 26, 'DEF'],
    ['Gonçalo Inácio', 25, 'DEF'],
    ['Zeno Debast', 6, 'DEF'],
    ['Eduardo Quaresma', 72, 'DEF'],
    ['Maxi Araújo', 20, 'DEF'],
    ['Nuno Santos', 11, 'DEF'],
    ['Iván Fresneda', 22, 'DEF'],
    ['Morten Hjulmand', 42, 'MED'],
    ['Daniel Bragança', 23, 'MED'],
    ['Hidemasa Morita', 5, 'MED'],
    ['Giorgi Kochorashvili', 14, 'MED'],
    ['Francisco Trincão', 17, 'MED'],
    ['Pedro Gonçalves', 8, 'AV'],
    ['Geovany Quenda', 7, 'AV'],
    ['Geny Catamo', 10, 'AV'],
    ['Luis Suárez', 97, 'AV'],
    ['Fotis Ioannidis', 89, 'AV'],
  ]),

  // ── SC Braga ──────────────────────────────────────────
  ...team('SC Braga', [
    ['Lukas Hornicek', 1, 'GR'],
    ['Tiago Sá', 12, 'GR'],
    ['Sikou Niakaté', 4, 'DEF'],
    ['Bright Arrey-Mbi', 26, 'DEF'],
    ['Gustaf Lagerbielke', 14, 'DEF'],
    ['Leonardo Lelo', 5, 'DEF'],
    ['Víctor Gómez', 2, 'DEF'],
    ['Gabriel Moscardo', 17, 'MED'],
    ['Vítor Carvalho', 6, 'MED'],
    ['Florian Grillitsch', 27, 'MED'],
    ['Rodrigo Zalazar', 10, 'MED'],
    ['Diego Rodrigues', 50, 'MED'],
    ['João Moutinho', 8, 'MED'],
    ['Mario Dorgeles', 20, 'MED'],
    ['Ricardo Horta', 21, 'AV'],
    ['Gabri Martínez', 77, 'AV'],
    ['Pau Víctor', 18, 'AV'],
    ['Fran Navarro', 39, 'AV'],
    ['Amine El Ouazzani', 9, 'AV'],
  ]),

  // ── Vitória SC ────────────────────────────────────────
  ...team('Vitória SC', [
    ['Juan Castillo', 25, 'GR'],
    ['Óscar Rivas', 4, 'DEF'],
    ['Rodrigo Abascal', 26, 'DEF'],
    ['Miguel Nóbrega', 3, 'DEF'],
    ['João Mendes', 13, 'DEF'],
    ['Maga', 2, 'DEF'],
    ['Diogo Sousa', 23, 'MED'],
    ['Samu', 20, 'MED'],
    ['Gustavo Silva', 11, 'AV'],
    ['Telmo Arcanjo', 18, 'AV'],
    ['Nélson Oliveira', 7, 'AV'],
    ['Tiago Silva', 69, 'MED'],
  ]),

  // ── Gil Vicente ───────────────────────────────────────
  ...team('Gil Vicente', [
    ['Lucão', 30, 'GR'],
    ['Marvin Elimbi', 4, 'DEF'],
    ['Buatu', 39, 'DEF'],
    ['Ghislain Konan', 3, 'DEF'],
    ['Zé Carlos', 2, 'DEF'],
    ['Mohamed Bamba', 8, 'MED'],
    ['Facundo Cáseres', 5, 'MED'],
    ['Luís Esteves', 10, 'MED'],
    ['Joelson Fernandes', 11, 'AV'],
    ['Tidjany Touré', 7, 'AV'],
    ['Sergio Bermejo', 22, 'AV'],
    ['Gustavo Varela', 89, 'AV'],
    ['Pablo', 29, 'AV'],
    ['Héctor Hernández', 23, 'AV'],
  ]),

  // ── Moreirense ────────────────────────────────────────
  ...team('Moreirense', [
    ['André Ferreira', 13, 'GR'],
    ['Gilberto Batista', 66, 'DEF'],
    ['Michel', 3, 'DEF'],
    ['Maracás', 26, 'DEF'],
    ['Kiko', 27, 'DEF'],
    ['Diogo Travassos', 2, 'DEF'],
    ['Vasco Sousa', 15, 'MED'],
    ['Nile John', 23, 'MED'],
    ['Alan', 11, 'MED'],
    ['Kiko Bondoso', 10, 'AV'],
    ['Guilherme Schettine', 9, 'AV'],
    ['Yan Maranhão', 99, 'AV'],
    ['Marcelo', 7, 'MED'],
  ]),

  // ── Casa Pia ──────────────────────────────────────────
  ...team('Casa Pia', [
    ['Patrick Sequeira', 1, 'GR'],
    ['Kaique Rocha', 27, 'DEF'],
    ['José Fonte', 6, 'DEF'],
    ['Abdu Conté', 5, 'DEF'],
    ['Gaizka Larrazabal', 72, 'DEF'],
    ['Seba Pérez', 42, 'MED'],
    ['Rafael Brito', 8, 'MED'],
    ['Kevin Prieto', 19, 'MED'],
    ['Kelian Nsona', 7, 'AV'],
    ['Korede Osundina', 13, 'AV'],
    ['Dailon Livramento', 10, 'AV'],
    ['Cassiano', 90, 'AV'],
  ]),

  // ── FC Famalicão ──────────────────────────────────────
  ...team('FC Famalicão', [
    ['Lazar Carević', 25, 'GR'],
    ['Justin de Haas', 16, 'DEF'],
    ['Léo Realpe', 3, 'DEF'],
    ['Pedro Bondo', 28, 'DEF'],
    ['Rodrigo Pinheiro', 17, 'DEF'],
    ['Garcia', 2, 'DEF'],
    ['Tom van de Looi', 6, 'MED'],
    ['Marcos Peña', 8, 'MED'],
    ['Gustavo Sá', 20, 'MED'],
    ['Rochinha', 10, 'AV'],
    ['Sorriso', 7, 'AV'],
    ['Gil Dias', 23, 'AV'],
    ['Simon Elisor', 12, 'AV'],
    ['Umar Abubakar', 9, 'AV'],
  ]),

  // ── Santa Clara ───────────────────────────────────────
  ...team('Santa Clara', [
    ['Gabriel Batista', 1, 'GR'],
    ['MT', 32, 'DEF'],
    ['Sidney Lima', 23, 'DEF'],
    ['Frederico Venâncio', 21, 'DEF'],
    ['Paulo Victor', 64, 'DEF'],
    ['Diogo Calila', 2, 'DEF'],
    ['Pedro Ferreira', 8, 'MED'],
    ['Serginho', 35, 'MED'],
    ['Gabriel Silva', 10, 'AV'],
    ['Vinícius Lopes', 70, 'AV'],
    ['Elias Manoel', 7, 'AV'],
    ['Gonçalo Paciência', 39, 'AV'],
  ]),

  // ── Estoril Praia ─────────────────────────────────────
  ...team('Estoril Praia', [
    ['Joel Robles', 1, 'GR'],
    ['Kévin Boma', 44, 'DEF'],
    ['Ferro', 4, 'DEF'],
    ['Pedro Amaral', 24, 'DEF'],
    ['Ricard Sánchez', 2, 'DEF'],
    ['Jordan Holsgrove', 10, 'MED'],
    ['Jandro Orellana', 6, 'MED'],
    ['Xeka', 8, 'MED'],
    ['Nodar Lominadze', 7, 'MED'],
    ['João Carvalho', 12, 'MED'],
    ['Pizzi', 21, 'MED'],
    ['Rafik Guitane', 99, 'AV'],
    ['Yanis Begraoui', 14, 'AV'],
    ['Alejandro Marqués', 9, 'AV'],
    ['Tiago Parente', 36, 'MED'],
  ]),

  // ── FC Arouca ─────────────────────────────────────────
  ...team('FC Arouca', [
    ['Ignacio de Arruabarrena', 12, 'GR'],
    ['José Fontán', 3, 'DEF'],
    ['Boris Popović', 5, 'DEF'],
    ['Tiago Esgaio', 28, 'DEF'],
    ['Amadou Dante', 44, 'DEF'],
    ['Taichi Fukui', 21, 'MED'],
    ['Pablo Gozálbez', 10, 'MED'],
    ['Naïs Djouahra', 7, 'AV'],
    ['Alfonso Trezza', 19, 'AV'],
    ['Dylan Nandín', 23, 'AV'],
    ['Iván Barbero', 17, 'AV'],
  ]),

  // ── Rio Ave ───────────────────────────────────────────
  ...team('Rio Ave', [
    ['Cezary Miszta', 1, 'GR'],
    ['Andreas Ntoi', 5, 'DEF'],
    ['Nelson Abbey', 6, 'DEF'],
    ['Omar Richards', 77, 'DEF'],
    ['Leonardo Buta', 24, 'DEF'],
    ['João Tomé', 20, 'DEF'],
    ['Brandon Aguilera', 10, 'MED'],
    ['Ryan Guilherme', 8, 'MED'],
    ['Ole Pohlmann', 80, 'MED'],
    ['Dario Špikić', 18, 'AV'],
    ['Clayton', 9, 'AV'],
    ['André Luiz', 11, 'AV'],
    ['Tobías Medina', 27, 'AV'],
  ]),

  // ── CD Nacional ───────────────────────────────────────
  ...team('CD Nacional', [
    ['Kaique Pereira', 1, 'GR'],
    ['Ulisses', 4, 'DEF'],
    ['Léo Santos', 34, 'DEF'],
    ['Ivanildo Fernandes', 14, 'DEF'],
    ['José Gomes', 5, 'DEF'],
    ['João Aurélio', 2, 'DEF'],
    ['Matheus Dias', 6, 'MED'],
    ['Liziero', 28, 'MED'],
    ['Filipe Soares', 22, 'MED'],
    ['Daniel Jr', 10, 'MED'],
    ['Paulinho Bóia', 11, 'AV'],
    ['Gabriel Veron', 27, 'AV'],
    ['Pablo Ruan', 99, 'AV'],
    ['Jesús Ramírez', 9, 'AV'],
    ['Lucas João', 19, 'AV'],
  ]),

  // ── Estrela da Amadora ────────────────────────────────
  ...team('Estrela da Amadora', [
    ['Diogo Pinto', 1, 'GR'],
    ['Stefan Lekovic', 25, 'DEF'],
    ['Luan Patrick', 30, 'DEF'],
    ['Ni', 3, 'DEF'],
    ['Bruno Langa', 24, 'DEF'],
    ['Jefferson Encada', 17, 'DEF'],
    ['Kevin Höög Jansson', 6, 'MED'],
    ['Paulo Moreira', 19, 'MED'],
    ['Robinho', 8, 'MED'],
    ['Ianis Stoica', 10, 'AV'],
    ['Jovane Cabral', 11, 'AV'],
    ['Billal Brahimi', 26, 'AV'],
    ['Sydney van Hooijdonk', 20, 'AV'],
    ['Rodrigo Pinho', 9, 'AV'],
  ]),

  // ── AVS ───────────────────────────────────────────────
  ...team('AVS', [
    ['Adriel', 1, 'GR'],
    ['Cristian Devenish', 42, 'DEF'],
    ['Paulo Vitor', 3, 'DEF'],
    ['Rúben Semedo', 35, 'DEF'],
    ['Ponck', 26, 'DEF'],
    ['Daniel Rivas', 12, 'DEF'],
    ['Guillem Molina', 5, 'DEF'],
    ['Roni', 70, 'MED'],
    ['Pedro Lima', 8, 'MED'],
    ['Óscar Perea', 14, 'AV'],
    ['Tunde Akinsola', 11, 'AV'],
    ['Antoine Baroan', 17, 'AV'],
    ['Diego Duarte', 20, 'AV'],
    ['Tomané', 7, 'AV'],
    ['Nenê', 18, 'AV'],
    ['Diogo Spencer', 78, 'AV'],
  ]),

  // ── FC Alverca ────────────────────────────────────────
  ...team('FC Alverca', [
    ['Marko Milovanović', 9, 'AV'],
    ['Nor Maviram', 7, 'AV'],
  ]),

  // ── CD Tondela ────────────────────────────────────────
  ...team('CD Tondela', [
    ['Tiago Manso', 10, 'MED'],
    ['Ivan Cavaleiro', 9, 'AV'],
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
