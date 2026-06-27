import type { Edge, Node } from '@xyflow/react';

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
  /**
   * Inline SVG markup that fills `viewBox`, drawn with `currentColor`. The
   * artwork is authored to fill the viewBox edge-to-edge so the node's bounding
   * box (and therefore its connection ports) hug the symbol tightly.
   */
  svg: string;
  /** SVG viewBox, e.g. '0 0 84 52'. Its aspect ratio matches the default size. */
  viewBox: string;
  /** Default placement size in canvas units (matches the viewBox aspect). */
  defaultWidth: number;
  defaultHeight: number;
}

/** Per-instance data carried by every node on the canvas. */
export interface EquipmentData {
  symbolId: string;
  /** The element's ID tag, e.g. 'P-101'. */
  label: string;
  rotation: number;
  /** BOM metadata. */
  manufacturer: string;
  partNumber: string;
  notes: string;
  [key: string]: unknown;
}

export type EquipmentNode = Node<EquipmentData, 'equipment'>;

/** Which dimension is derived from the other two (OD = ID + 2·thickness). */
export type PipeSolveFor = 'id' | 'od' | 'thickness';

/** Per-instance data carried by every pipe (edge) on the canvas. */
export interface PipeData {
  /** Optional ID tag for the line, e.g. 'P-1001-CS'. */
  tag: string;
  material: string;
  innerDiameter: number | null;
  outerDiameter: number | null;
  thickness: number | null;
  /** The derived dimension; the other two are user-entered. */
  solveFor: PipeSolveFor;
  manufacturer: string;
  partNumber: string;
  notes: string;
  [key: string]: unknown;
}

export type PipeEdge = Edge<PipeData>;

export type Theme = 'light' | 'dark';

/** Native project file format (`.pidproj`). */
export interface PidDocument {
  app: 'pid_master';
  version: number;
  savedAt: string;
  nodes: EquipmentNode[];
  edges: PipeEdge[];
}
