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

  // ---- Gas Storage -----------------------------------------------------
  {
    id: 'gas-cylinder',
    label: 'Gas Bottle',
    category: 'Gas Storage',
    tagPrefix: 'CYL',
    viewBox: '0 0 52 120',
    defaultWidth: 52,
    defaultHeight: 120,
    // Two shapes only: the domed-shoulder body, and a trapezoidal valve cap.
    // The cap's base is left open and its ends (18,32.5)/(34,32.5) sit on the
    // dome curve, so nothing cuts across the shoulder.
    svg: '<path d="M12 44 V108 A6 6 0 0 0 18 114 H34 A6 6 0 0 0 40 108 V44 A14 14 0 0 0 12 44 Z"/><path d="M18 32.5 L22 20 H30 L34 32.5"/>',
  },
  {
    id: 'gas-cylinder-bank',
    label: 'Cylinder Bank',
    category: 'Gas Storage',
    tagPrefix: 'GBK',
    viewBox: '0 0 116 116',
    defaultWidth: 116,
    defaultHeight: 116,
    // Three bottles on a shared manifold header with an outlet takeoff.
    svg: '<path d="M8 22 H108 M58 22 V12"/><g><path d="M10 44 V104 A4 4 0 0 0 14 108 H26 A4 4 0 0 0 30 104 V44 A10 10 0 0 0 10 44 Z"/><rect x="17" y="30" width="6" height="14"/></g><g><path d="M48 44 V104 A4 4 0 0 0 52 108 H64 A4 4 0 0 0 68 104 V44 A10 10 0 0 0 48 44 Z"/><rect x="55" y="30" width="6" height="14"/></g><g><path d="M86 44 V104 A4 4 0 0 0 90 108 H102 A4 4 0 0 0 106 104 V44 A10 10 0 0 0 86 44 Z"/><rect x="93" y="30" width="6" height="14"/></g>',
  },
  {
    id: 'copv',
    label: 'COPV',
    category: 'Gas Storage',
    tagPrefix: 'PV',
    viewBox: '0 0 60 128',
    defaultWidth: 60,
    defaultHeight: 128,
    // Composite overwrapped pressure vessel: domed-end capsule with a top
    // boss and dome seam lines suggesting the wrap-to-liner transition.
    svg: '<path d="M10 44 V84 A20 20 0 0 0 50 84 V44 A20 20 0 0 0 10 44 Z"/><path d="M10 44 H50 M10 84 H50"/><rect x="24" y="10" width="12" height="16" rx="2"/>',
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
    id: 'valve-relief',
    label: 'Pressure Relief Valve',
    category: 'Valves',
    tagPrefix: 'PSV',
    viewBox: '0 0 84 100',
    defaultWidth: 84,
    defaultHeight: 100,
    // Angle body (inlet below, outlet right) under a spring bonnet — the
    // spring is what distinguishes a relief valve from a plain angle valve.
    svg: '<path d="M30 72 L12 96 L48 96 Z"/><path d="M30 72 L80 54 L80 90 Z"/><path d="M30 72 V50"/><path d="M18 50 H42"/><path d="M22 50 L38 42 L22 34 L38 26 L22 18 L38 10"/><path d="M18 10 H42"/>',
  },
  {
    id: 'valve-regulator',
    label: 'Pressure Regulator',
    category: 'Valves',
    tagPrefix: 'PCV',
    viewBox: '0 0 84 88',
    defaultWidth: 84,
    defaultHeight: 88,
    // Globe body + domed diaphragm and adjusting screw: the self-contained
    // spring-loaded regulator. The screw separates it from a control valve.
    svg: '<path d="M4 48 L42 66 L4 84 Z M80 48 L42 66 L80 84 Z"/><path d="M42 66 V44"/><path d="M18 44 A24 24 0 0 1 66 44 Z"/><path d="M42 20 V8"/><path d="M30 8 H54"/>',
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
  {
    id: 'quick-disconnect',
    label: 'Quick Disconnect',
    category: 'Piping',
    tagPrefix: 'QD',
    viewBox: '0 0 84 52',
    defaultWidth: 84,
    defaultHeight: 52,
    // Two flanged halves meeting at centre: the plug (left) seated in the
    // socket (right).
    svg: '<path d="M4 26 H30 M80 26 H54"/><path d="M30 8 V44 M54 8 V44"/><path d="M30 18 H44 V34 H30"/><path d="M54 14 H44 V38 H54"/>',
  },
  {
    id: 'nozzle',
    label: 'Nozzle',
    category: 'Piping',
    tagPrefix: 'N',
    viewBox: '0 0 56 52',
    defaultWidth: 56,
    defaultHeight: 52,
    // Flanged stub — open at the left where it lands on its vessel.
    svg: '<path d="M4 18 H40 M4 34 H40"/><rect x="40" y="8" width="10" height="36"/>',
  },
  {
    id: 'manifold',
    label: 'Manifold',
    category: 'Piping',
    tagPrefix: 'MF',
    viewBox: '0 0 124 60',
    defaultWidth: 124,
    defaultHeight: 60,
    // Header block with a supply on top and three branch takeoffs below.
    svg: '<rect x="8" y="10" width="108" height="20" rx="4"/><path d="M62 10 V4"/><path d="M30 30 V56 M62 30 V56 M94 30 V56"/>',
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
