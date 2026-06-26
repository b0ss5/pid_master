import type { SymbolDef } from '../types';

/**
 * The component library. Each entry is pure data: a name, a category, a tag
 * prefix and inline SVG drawn in a 0..100 viewBox using `currentColor` so it
 * adapts to light/dark themes. Add a domain (e.g. electronics) by appending
 * entries here — nothing else in the app is hard-coded to these symbols.
 */
export const SYMBOLS: SymbolDef[] = [
  // ---- Vessels ---------------------------------------------------------
  {
    id: 'tank-vertical',
    label: 'Storage Tank',
    category: 'Vessels',
    tagPrefix: 'TK',
    defaultWidth: 86,
    defaultHeight: 112,
    svg: '<ellipse cx="50" cy="25" rx="28" ry="8"/><path d="M22 25 V75 A28 8 0 0 0 78 75 V25"/>',
  },
  {
    id: 'vessel-horizontal',
    label: 'Horizontal Vessel',
    category: 'Vessels',
    tagPrefix: 'V',
    defaultWidth: 130,
    defaultHeight: 72,
    svg: '<path d="M25 28 H75 A12 22 0 0 1 75 72 H25 A12 22 0 0 1 25 28 Z"/><path d="M25 28 A12 22 0 0 0 25 72"/>',
  },
  {
    id: 'column-tower',
    label: 'Column / Tower',
    category: 'Vessels',
    tagPrefix: 'C',
    defaultWidth: 72,
    defaultHeight: 150,
    svg: '<rect x="32" y="10" width="36" height="80" rx="18"/><path d="M32 35 H68 M32 50 H68 M32 65 H68"/>',
  },

  // ---- Pumps & Compressors --------------------------------------------
  {
    id: 'pump-centrifugal',
    label: 'Centrifugal Pump',
    category: 'Pumps & Compressors',
    tagPrefix: 'P',
    defaultWidth: 88,
    defaultHeight: 88,
    svg: '<circle cx="48" cy="58" r="26"/><path d="M48 32 V14 H84 V36"/><path d="M22 58 H8"/>',
  },
  {
    id: 'pump-pd',
    label: 'PD Pump',
    category: 'Pumps & Compressors',
    tagPrefix: 'P',
    defaultWidth: 84,
    defaultHeight: 84,
    svg: '<circle cx="50" cy="55" r="28"/><path d="M40 42 L66 55 L40 68 Z" fill="currentColor" stroke="none"/><path d="M50 27 V12"/>',
  },
  {
    id: 'compressor',
    label: 'Compressor',
    category: 'Pumps & Compressors',
    tagPrefix: 'K',
    defaultWidth: 96,
    defaultHeight: 80,
    svg: '<path d="M20 28 L80 40 V60 L20 72 Z"/>',
  },
  {
    id: 'fan-blower',
    label: 'Fan / Blower',
    category: 'Pumps & Compressors',
    tagPrefix: 'B',
    defaultWidth: 84,
    defaultHeight: 84,
    svg: '<circle cx="50" cy="50" r="30"/><path d="M50 50 L50 22 M50 50 L74 64 M50 50 L26 64"/>',
  },

  // ---- Heat Transfer ---------------------------------------------------
  {
    id: 'heat-exchanger',
    label: 'Heat Exchanger',
    category: 'Heat Transfer',
    tagPrefix: 'E',
    defaultWidth: 130,
    defaultHeight: 72,
    svg: '<rect x="14" y="32" width="72" height="36" rx="18"/><path d="M22 50 H34 L40 38 L52 62 L64 38 L70 50 H80"/>',
  },
  {
    id: 'cooler',
    label: 'Cooler / Heater',
    category: 'Heat Transfer',
    tagPrefix: 'E',
    defaultWidth: 84,
    defaultHeight: 84,
    svg: '<circle cx="50" cy="50" r="30"/><path d="M30 30 L70 70 M70 30 L30 70"/>',
  },

  // ---- Valves ----------------------------------------------------------
  {
    id: 'valve-gate',
    label: 'Gate Valve',
    category: 'Valves',
    tagPrefix: 'HV',
    defaultWidth: 76,
    defaultHeight: 60,
    svg: '<path d="M18 32 L50 50 L18 68 Z M82 32 L50 50 L82 68 Z"/>',
  },
  {
    id: 'valve-globe',
    label: 'Globe Valve',
    category: 'Valves',
    tagPrefix: 'HV',
    defaultWidth: 76,
    defaultHeight: 60,
    svg: '<path d="M18 32 L50 50 L18 68 Z M82 32 L50 50 L82 68 Z"/><circle cx="50" cy="50" r="9" fill="currentColor" stroke="none"/>',
  },
  {
    id: 'valve-ball',
    label: 'Ball Valve',
    category: 'Valves',
    tagPrefix: 'HV',
    defaultWidth: 76,
    defaultHeight: 60,
    svg: '<path d="M18 32 L50 50 L18 68 Z M82 32 L50 50 L82 68 Z"/><circle cx="50" cy="50" r="9"/>',
  },
  {
    id: 'valve-check',
    label: 'Check Valve',
    category: 'Valves',
    tagPrefix: 'CV',
    defaultWidth: 76,
    defaultHeight: 60,
    svg: '<path d="M30 30 L70 50 L30 70 Z"/><path d="M70 30 V70"/>',
  },
  {
    id: 'valve-control',
    label: 'Control Valve',
    category: 'Valves',
    tagPrefix: 'FV',
    defaultWidth: 80,
    defaultHeight: 88,
    svg: '<path d="M18 44 L50 62 L18 80 Z M82 44 L50 62 L82 80 Z"/><path d="M50 62 V30"/><path d="M34 30 A16 14 0 0 1 66 30 Z"/>',
  },

  // ---- Instruments -----------------------------------------------------
  {
    id: 'instrument-field',
    label: 'Field Instrument',
    category: 'Instruments',
    tagPrefix: 'I',
    defaultWidth: 64,
    defaultHeight: 64,
    svg: '<circle cx="50" cy="50" r="26"/>',
  },
  {
    id: 'instrument-panel',
    label: 'Panel Instrument',
    category: 'Instruments',
    tagPrefix: 'I',
    defaultWidth: 64,
    defaultHeight: 64,
    svg: '<circle cx="50" cy="50" r="26"/><path d="M24 50 H76"/>',
  },
  {
    id: 'instrument-dcs',
    label: 'DCS / Shared',
    category: 'Instruments',
    tagPrefix: 'I',
    defaultWidth: 64,
    defaultHeight: 64,
    svg: '<rect x="22" y="22" width="56" height="56"/><circle cx="50" cy="50" r="22"/>',
  },

  // ---- Piping ----------------------------------------------------------
  {
    id: 'pipe-tee',
    label: 'Tee Junction',
    category: 'Piping',
    tagPrefix: 'T',
    defaultWidth: 72,
    defaultHeight: 72,
    svg: '<path d="M14 50 H86 M50 50 V86"/>',
  },
  {
    id: 'reducer',
    label: 'Reducer',
    category: 'Piping',
    tagPrefix: 'RED',
    defaultWidth: 72,
    defaultHeight: 64,
    svg: '<path d="M25 32 L75 44 L75 56 L25 68 Z"/>',
  },
  {
    id: 'strainer',
    label: 'Strainer / Filter',
    category: 'Piping',
    tagPrefix: 'ST',
    defaultWidth: 72,
    defaultHeight: 64,
    svg: '<rect x="26" y="30" width="48" height="40"/><path d="M26 30 L74 70 M44 30 L74 60 M26 46 L58 70"/>',
  },
];

/** Lookup table for O(1) symbol resolution by id. */
const SYMBOL_INDEX: Record<string, SymbolDef> = Object.fromEntries(
  SYMBOLS.map((s) => [s.id, s]),
);

export function getSymbol(id: string): SymbolDef | undefined {
  return SYMBOL_INDEX[id];
}

/** Stable, insertion-ordered list of category names for grouping the palette. */
export const CATEGORIES: string[] = SYMBOLS.reduce<string[]>((acc, s) => {
  if (!acc.includes(s.category)) acc.push(s.category);
  return acc;
}, []);
