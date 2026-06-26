import type { Node, Edge } from '@xyflow/react';

/**
 * A symbol definition is a reusable, data-driven entry in the component
 * library (the left palette). Swapping the library out for a different domain
 * (e.g. electronics/PCB symbols) only requires editing `src/lib/symbols.ts`.
 */
export interface SymbolDef {
  /** Stable unique id for the symbol type, e.g. 'pump-centrifugal'. */
  id: string;
  /** Human-readable name shown in the palette. */
  label: string;
  /** Group used to organise the palette, e.g. 'Pumps', 'Valves'. */
  category: string;
  /** Default tag prefix used when auto-naming, e.g. 'P', 'V', 'TK'. */
  tagPrefix: string;
  /** Inline SVG markup drawn inside a 0..100 viewBox. Use currentColor. */
  svg: string;
  /** Default placement size in canvas units. */
  defaultWidth: number;
  defaultHeight: number;
}

/** Per-instance data carried by every node on the canvas. */
export interface EquipmentData {
  symbolId: string;
  /** Editable display name / equipment tag, e.g. 'P-101'. */
  label: string;
  rotation: number;
  /** BOM metadata. */
  manufacturer: string;
  partNumber: string;
  quantity: number;
  notes: string;
  [key: string]: unknown;
}

export type EquipmentNode = Node<EquipmentData, 'equipment'>;

export type Theme = 'light' | 'dark';

/** Native project file format (`.pidproj`). */
export interface PidDocument {
  app: 'pid_master';
  version: number;
  savedAt: string;
  nodes: EquipmentNode[];
  edges: Edge[];
}
