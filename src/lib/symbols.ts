import type { SymbolDef } from '../types';

/**
 * The component library. Each entry is pure data: a name, a category, a tag
 * prefix and inline SVG using `currentColor`. Artwork is authored to fill its
 * `viewBox` edge-to-edge, and `defaultWidth/Height` match the viewBox aspect
 * ratio, so the node bounding box (and its four connection ports) sit tight
 * against the symbol. Add a domain by appending entries here.
 *
 * Instrument bubbles may include `<text>` (ISA-style tags); give text elements
 * `fill="currentColor" stroke="none"`.
 */
export const SYMBOLS: SymbolDef[] = [
  // ---- Vessels ---------------------------------------------------------
  {
    id: 'tank-vertical',
    label: 'Storage Tank',
    category: 'Vessels',
    tagPrefix: 'TK',
    viewBox: '0 0 72 92',
    defaultWidth: 72,
    defaultHeight: 92,
    svg: '<ellipse cx="36" cy="16" rx="30" ry="10"/><path d="M6 16 V76 A30 10 0 0 0 66 76 V16"/>',
  },
  {
    id: 'vessel-horizontal',
    label: 'Horizontal Vessel',
    category: 'Vessels',
    tagPrefix: 'V',
    viewBox: '0 0 132 72',
    defaultWidth: 132,
    defaultHeight: 72,
    svg: '<path d="M30 6 H102 A18 30 0 0 1 102 66 H30 A18 30 0 0 1 30 6 Z"/><path d="M30 6 A18 30 0 0 0 30 66"/>',
  },
  {
    id: 'column-tower',
    label: 'Column / Tower',
    category: 'Vessels',
    tagPrefix: 'C',
    viewBox: '0 0 60 144',
    defaultWidth: 60,
    defaultHeight: 144,
    svg: '<rect x="8" y="6" width="44" height="132" rx="22"/><path d="M8 44 H52 M8 72 H52 M8 100 H52"/>',
  },

  // ---- Pumps & Compressors --------------------------------------------
  {
    id: 'pump-centrifugal',
    label: 'Centrifugal Pump',
    category: 'Pumps & Compressors',
    tagPrefix: 'P',
    viewBox: '0 0 86 90',
    defaultWidth: 86,
    defaultHeight: 90,
    svg: '<circle cx="42" cy="54" r="32"/><path d="M42 22 V6 H82 V30"/><path d="M10 54 H2"/>',
  },
  {
    id: 'pump-pd',
    label: 'PD Pump',
    category: 'Pumps & Compressors',
    tagPrefix: 'P',
    viewBox: '0 0 76 90',
    defaultWidth: 76,
    defaultHeight: 90,
    svg: '<circle cx="38" cy="56" r="32"/><path d="M28 42 L58 56 L28 70 Z" fill="currentColor" stroke="none"/><path d="M38 24 V6"/>',
  },
  {
    id: 'compressor',
    label: 'Compressor',
    category: 'Pumps & Compressors',
    tagPrefix: 'K',
    viewBox: '0 0 92 72',
    defaultWidth: 92,
    defaultHeight: 72,
    svg: '<path d="M8 14 L84 28 V44 L8 58 Z"/>',
  },
  {
    id: 'fan-blower',
    label: 'Fan / Blower',
    category: 'Pumps & Compressors',
    tagPrefix: 'B',
    viewBox: '0 0 80 80',
    defaultWidth: 80,
    defaultHeight: 80,
    svg: '<circle cx="40" cy="40" r="36"/><path d="M40 40 L40 8 M40 40 L68 56 M40 40 L12 56"/>',
  },

  // ---- Heat Transfer ---------------------------------------------------
  {
    id: 'heat-exchanger',
    label: 'Heat Exchanger',
    category: 'Heat Transfer',
    tagPrefix: 'E',
    viewBox: '0 0 132 72',
    defaultWidth: 132,
    defaultHeight: 72,
    svg: '<rect x="8" y="18" width="116" height="36" rx="18"/><path d="M18 36 H38 L48 24 L66 48 L84 24 L102 36 H120"/>',
  },
  {
    id: 'cooler',
    label: 'Cooler / Heater',
    category: 'Heat Transfer',
    tagPrefix: 'E',
    viewBox: '0 0 80 80',
    defaultWidth: 80,
    defaultHeight: 80,
    svg: '<circle cx="40" cy="40" r="36"/><path d="M16 16 L64 64 M64 16 L16 64"/>',
  },

  // ---- Valves ----------------------------------------------------------
  {
    id: 'valve-gate',
    label: 'Gate Valve',
    category: 'Valves',
    tagPrefix: 'HV',
    viewBox: '0 0 84 52',
    defaultWidth: 84,
    defaultHeight: 52,
    svg: '<path d="M4 6 L42 26 L4 46 Z M80 6 L42 26 L80 46 Z"/>',
  },
  {
    id: 'valve-globe',
    label: 'Globe Valve',
    category: 'Valves',
    tagPrefix: 'HV',
    viewBox: '0 0 84 52',
    defaultWidth: 84,
    defaultHeight: 52,
    svg: '<path d="M4 6 L42 26 L4 46 Z M80 6 L42 26 L80 46 Z"/><circle cx="42" cy="26" r="8" fill="currentColor" stroke="none"/>',
  },
  {
    id: 'valve-ball',
    label: 'Ball Valve',
    category: 'Valves',
    tagPrefix: 'HV',
    viewBox: '0 0 84 52',
    defaultWidth: 84,
    defaultHeight: 52,
    svg: '<path d="M4 6 L42 26 L4 46 Z M80 6 L42 26 L80 46 Z"/><circle cx="42" cy="26" r="8"/>',
  },
  {
    id: 'valve-check',
    label: 'Check Valve',
    category: 'Valves',
    tagPrefix: 'CV',
    viewBox: '0 0 72 72',
    defaultWidth: 72,
    defaultHeight: 72,
    svg: '<path d="M8 8 L62 36 L8 64 Z"/><path d="M62 8 V64"/>',
  },
  {
    id: 'valve-control',
    label: 'Control Valve',
    category: 'Valves',
    tagPrefix: 'FV',
    viewBox: '0 0 84 84',
    defaultWidth: 84,
    defaultHeight: 84,
    svg: '<path d="M4 44 L42 62 L4 80 Z M80 44 L42 62 L80 80 Z"/><path d="M42 62 V28"/><path d="M24 28 A18 16 0 0 1 60 28 Z"/>',
  },
  {
    id: 'valve-solenoid',
    label: 'Solenoid Valve',
    category: 'Valves',
    tagPrefix: 'SV',
    viewBox: '0 0 84 82',
    defaultWidth: 84,
    defaultHeight: 82,
    svg: '<path d="M4 42 L42 60 L4 78 Z M80 42 L42 60 L80 78 Z"/><path d="M42 60 V28"/><path d="M24 10 H60 V28 H24 Z"/><path d="M24 28 L60 10"/>',
  },

  // ---- Instruments -----------------------------------------------------
  {
    id: 'instrument-field',
    label: 'Field Instrument',
    category: 'Instruments',
    tagPrefix: 'I',
    viewBox: '0 0 72 72',
    defaultWidth: 64,
    defaultHeight: 64,
    svg: '<circle cx="36" cy="36" r="32"/>',
  },
  {
    id: 'instrument-panel',
    label: 'Panel Instrument',
    category: 'Instruments',
    tagPrefix: 'I',
    viewBox: '0 0 72 72',
    defaultWidth: 64,
    defaultHeight: 64,
    svg: '<circle cx="36" cy="36" r="32"/><path d="M4 36 H68"/>',
  },
  {
    id: 'instrument-dcs',
    label: 'DCS / Shared',
    category: 'Instruments',
    tagPrefix: 'I',
    viewBox: '0 0 72 72',
    defaultWidth: 64,
    defaultHeight: 64,
    svg: '<rect x="4" y="4" width="64" height="64"/><circle cx="36" cy="36" r="28"/>',
  },
  {
    id: 'instrument-pt',
    label: 'Pressure Transducer',
    category: 'Instruments',
    tagPrefix: 'PT',
    viewBox: '0 0 72 72',
    defaultWidth: 64,
    defaultHeight: 64,
    svg: '<circle cx="36" cy="36" r="32"/><text x="36" y="37" font-size="24" font-weight="700" font-family="sans-serif" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none">PT</text>',
  },
  {
    id: 'instrument-rtd',
    label: 'RTD',
    category: 'Instruments',
    tagPrefix: 'TE',
    viewBox: '0 0 72 72',
    defaultWidth: 64,
    defaultHeight: 64,
    svg: '<circle cx="36" cy="36" r="32"/><text x="36" y="37" font-size="19" font-weight="700" font-family="sans-serif" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none">RTD</text>',
  },
  {
    id: 'instrument-tc',
    label: 'Thermocouple',
    category: 'Instruments',
    tagPrefix: 'TE',
    viewBox: '0 0 72 72',
    defaultWidth: 64,
    defaultHeight: 64,
    svg: '<circle cx="36" cy="36" r="32"/><text x="36" y="37" font-size="24" font-weight="700" font-family="sans-serif" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none">TC</text>',
  },
  {
    id: 'instrument-ft',
    label: 'Flow Meter',
    category: 'Instruments',
    tagPrefix: 'FT',
    viewBox: '0 0 72 72',
    defaultWidth: 64,
    defaultHeight: 64,
    svg: '<circle cx="36" cy="36" r="32"/><text x="36" y="37" font-size="24" font-weight="700" font-family="sans-serif" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none">FT</text>',
  },
  {
    id: 'instrument-pg',
    label: 'Pressure Gauge',
    category: 'Instruments',
    tagPrefix: 'PG',
    viewBox: '0 0 72 84',
    defaultWidth: 62,
    defaultHeight: 72,
    svg: '<circle cx="36" cy="32" r="28"/><circle cx="36" cy="32" r="3" fill="currentColor" stroke="none"/><path d="M36 32 L53 17"/><path d="M36 60 V78"/><path d="M26 78 H46"/>',
  },

  // ---- Piping ----------------------------------------------------------
  {
    id: 'pipe-tee',
    label: 'Tee Junction',
    category: 'Piping',
    tagPrefix: 'T',
    viewBox: '0 0 80 56',
    defaultWidth: 80,
    defaultHeight: 56,
    svg: '<path d="M4 16 H76 M40 16 V52"/>',
  },
  {
    id: 'reducer',
    label: 'Reducer',
    category: 'Piping',
    tagPrefix: 'RED',
    viewBox: '0 0 80 56',
    defaultWidth: 80,
    defaultHeight: 56,
    svg: '<path d="M4 6 L76 20 V36 L4 50 Z"/>',
  },
  {
    id: 'strainer',
    label: 'Strainer / Filter',
    category: 'Piping',
    tagPrefix: 'ST',
    viewBox: '0 0 76 60',
    defaultWidth: 76,
    defaultHeight: 60,
    svg: '<rect x="6" y="10" width="64" height="40"/><path d="M6 10 L70 50 M40 10 L70 35 M6 32 L52 50"/>',
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
