import { create } from 'zustand';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type XYPosition,
} from '@xyflow/react';
import type {
  EquipmentData,
  EquipmentNode,
  PidDocument,
  PipeData,
  PipeEdge,
  Theme,
} from '../types';
import { getSymbol } from '../lib/symbols';
import { createPipeData, recomputePipe } from '../lib/pipe';

const STORAGE_KEY = 'pid_master:document';
const THEME_KEY = 'pid_master:theme';

interface AppState {
  nodes: EquipmentNode[];
  edges: PipeEdge[];
  selectedId: string | null;
  selectedEdgeId: string | null;
  theme: Theme;
  /** True when there are changes not yet saved to a `.pidproj` file. */
  dirty: boolean;
  /** Monotonic counter so each new instance of a symbol gets a unique tag. */
  counters: Record<string, number>;
  /**
   * In-app clipboard for Ctrl/Cmd+C → Ctrl/Cmd+V. Holds a snapshot of the
   * copied nodes plus the pipes *between* them. Not the OS clipboard, so it
   * doesn't survive a reload or cross into another tab.
   */
  clipboard: { nodes: EquipmentNode[]; edges: PipeEdge[] } | null;
  /** Pastes since the last copy — each one cascades further from the source. */
  pasteCount: number;

  // React Flow plumbing
  onNodesChange: (changes: NodeChange<EquipmentNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<PipeEdge>[]) => void;
  onConnect: (connection: Connection) => void;

  // Editing actions
  addNode: (symbolId: string, position: XYPosition) => void;
  updateNodeData: (id: string, patch: Partial<EquipmentData>) => void;
  setNodeSize: (id: string, width: number, height: number) => void;
  setNodeBounds: (id: string, x: number, y: number, width: number, height: number) => void;
  updateEdgeData: (id: string, data: PipeData) => void;
  /** Replace a pipe's hand-placed bends (empty = back to auto-routing). */
  setPipeWaypoints: (id: string, waypoints: XYPosition[]) => void;

  // Batch editing (multi-selection)
  updateNodesData: (ids: string[], patch: Partial<EquipmentData>) => void;
  setNodesSize: (ids: string[], patch: { width?: number; height?: number }) => void;
  /** Patch several pipes at once, re-solving OD/ID/thickness on each. */
  updatePipesData: (ids: string[], patch: Partial<PipeData>) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  /**
   * Ctrl-drag duplicate: leaves a copy of the whole dragged selection parked at
   * the source, so the nodes under the cursor become the new duplicates.
   */
  duplicateDragSelection: (draggedId: string) => void;
  copySelection: () => void;
  pasteClipboard: () => void;

  // Selection
  setSelection: (nodeId: string | null, edgeId: string | null) => void;
  selectNode: (id: string) => void;
  selectEdge: (id: string) => void;

  // Document actions
  newDocument: () => void;
  loadDocument: (doc: PidDocument) => void;
  markSaved: () => void;

  // Theme
  toggleTheme: () => void;
}

function persist(state: Pick<AppState, 'nodes' | 'edges'>) {
  try {
    const doc: PidDocument = {
      app: 'pid_master',
      version: 1,
      savedAt: new Date().toISOString(),
      nodes: state.nodes,
      edges: state.edges,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch {
    /* storage may be unavailable (private mode, quota); non-fatal */
  }
}

/**
 * Bring an edge from any older document up to the current shape: pipes drawn
 * before routing was editable are typed `smoothstep` and have no `waypoints`,
 * which would render them with React Flow's built-in edge (no bend handles).
 */
export function normalizeEdge(edge: PipeEdge): PipeEdge {
  return {
    ...edge,
    type: 'pipe',
    data: { ...createPipeData(), ...edge.data, waypoints: edge.data?.waypoints ?? [] },
  };
}

function loadPersisted(): { nodes: EquipmentNode[]; edges: PipeEdge[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { nodes: [], edges: [] };
    const doc = JSON.parse(raw) as PidDocument;
    return { nodes: doc.nodes ?? [], edges: (doc.edges ?? []).map(normalizeEdge) };
  } catch {
    return { nodes: [], edges: [] };
  }
}

function loadTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * True if a change is a real user edit. We deliberately ignore `select` and
 * `dimensions` changes: React Flow emits `dimensions` while measuring nodes on
 * load, which must not mark a freshly-opened document as unsaved.
 */
const DIRTYING_CHANGES = new Set(['add', 'remove', 'position', 'replace']);
function hasContentChange(changes: { type: string }[]): boolean {
  return changes.some((c) => DIRTYING_CHANGES.has(c.type));
}

let idSeq = Date.now();
const nextId = () => `n_${(idSeq++).toString(36)}`;
const nextEdgeId = () => `e_${(idSeq++).toString(36)}`;

/**
 * The nodes a duplicate/copy should act on. React Flow marks every node in a
 * multi-selection `selected`, while `selectedId` is only set when exactly one
 * is picked — so `selected` is the source of truth and `selectedId` the
 * fallback for a selection React Flow hasn't flagged yet.
 */
function selectionOf(
  nodes: EquipmentNode[],
  selectedId: string | null,
): EquipmentNode[] {
  const selected = nodes.filter((n) => n.selected);
  if (selected.length) return selected;
  return nodes.filter((n) => n.id === selectedId);
}

/**
 * Next free `PREFIX-N` tag. Skips labels already in use: `counters` starts
 * empty on a document opened from disk, so without this a paste into a loaded
 * drawing would re-issue tags that are already on the canvas.
 */
function allocTag(
  prefix: string,
  nodes: EquipmentNode[],
  counters: Record<string, number>,
): { label: string; seq: number } {
  const used = new Set(nodes.map((n) => n.data.label));
  let seq = counters[prefix] ?? 0;
  let label: string;
  do {
    seq += 1;
    label = `${prefix}-${100 + seq}`;
  } while (used.has(label));
  return { label, seq };
}

/**
 * Copies `sources` with fresh ids and tags, offset by `offset`. Returns the
 * clones, bumped counters, and an old-id → new-id map for rewiring pipes.
 */
function cloneNodes(
  sources: EquipmentNode[],
  existing: EquipmentNode[],
  counters: Record<string, number>,
  offset: XYPosition,
): {
  clones: EquipmentNode[];
  idMap: Map<string, string>;
  counters: Record<string, number>;
} {
  const nextCounters = { ...counters };
  const idMap = new Map<string, string>();
  // Grows as we go, so clones in one batch can't collide with each other.
  const taken = [...existing];

  const clones = sources.map((src) => {
    const symbol = getSymbol(src.data.symbolId);
    let label = `${src.data.label}-copy`;
    if (symbol) {
      const tag = allocTag(symbol.tagPrefix, taken, nextCounters);
      nextCounters[symbol.tagPrefix] = tag.seq;
      label = tag.label;
    }
    const clone: EquipmentNode = {
      ...src,
      id: nextId(),
      position: {
        x: src.position.x + offset.x,
        y: src.position.y + offset.y,
      },
      selected: false,
      dragging: false,
      data: { ...src.data, label },
    };
    idMap.set(src.id, clone.id);
    taken.push(clone);
    return clone;
  });

  return { clones, idMap, counters: nextCounters };
}

/**
 * Copies of every pipe running *between* cloned nodes, rewired onto the clones.
 * Pipes to the world outside the selection are deliberately not copied.
 *
 * `offset` must match the one the nodes moved by: waypoints are absolute, so
 * they have to be deep-copied *and* shifted or the copy's bends would snap back
 * to the source pipe's route.
 */
function cloneInternalEdges(
  edges: PipeEdge[],
  idMap: Map<string, string>,
  offset: XYPosition,
): PipeEdge[] {
  return edges
    .filter((e) => idMap.has(e.source) && idMap.has(e.target))
    .map((e) => ({
      ...e,
      id: nextEdgeId(),
      source: idMap.get(e.source)!,
      target: idMap.get(e.target)!,
      selected: false,
      data: {
        ...createPipeData(),
        ...e.data,
        waypoints: (e.data?.waypoints ?? []).map((p) => ({
          x: p.x + offset.x,
          y: p.y + offset.y,
        })),
      },
    }));
}

/** Canvas snap grid (px). Node *centers* snap to this so aligned elements
 *  connect with straight, bend-free pipes. Mirrors `snapGrid` in Canvas. */
export const GRID = 8;

/** Snap a top-left position so the node's center lands on the grid. */
export function snapCenter(
  x: number,
  y: number,
  width: number,
  height: number,
): XYPosition {
  return {
    x: Math.round((x + width / 2) / GRID) * GRID - width / 2,
    y: Math.round((y + height / 2) / GRID) * GRID - height / 2,
  };
}

const persisted = loadPersisted();

export const useStore = create<AppState>((set, get) => ({
  nodes: persisted.nodes,
  edges: persisted.edges,
  selectedId: null,
  selectedEdgeId: null,
  theme: loadTheme(),
  dirty: false,
  counters: {},
  clipboard: null,
  pasteCount: 0,

  onNodesChange: (changes) => {
    set((s) => {
      const nodes = applyNodeChanges(changes, s.nodes);
      const gone = s.selectedId && !nodes.some((n) => n.id === s.selectedId);
      return {
        nodes,
        selectedId: gone ? null : s.selectedId,
        dirty: s.dirty || hasContentChange(changes),
      };
    });
    persist(get());
  },

  onEdgesChange: (changes) => {
    set((s) => {
      const edges = applyEdgeChanges(changes, s.edges) as PipeEdge[];
      const gone =
        s.selectedEdgeId && !edges.some((e) => e.id === s.selectedEdgeId);
      return {
        edges,
        selectedEdgeId: gone ? null : s.selectedEdgeId,
        dirty: s.dirty || hasContentChange(changes),
      };
    });
    persist(get());
  },

  onConnect: (connection) => {
    set((s) => ({
      edges: addEdge(
        { ...connection, type: 'pipe', data: createPipeData() },
        s.edges,
      ) as PipeEdge[],
      dirty: true,
    }));
    persist(get());
  },

  addNode: (symbolId, position) => {
    const symbol = getSymbol(symbolId);
    if (!symbol) return;
    const counters = { ...get().counters };
    const seq = (counters[symbol.tagPrefix] ?? 0) + 1;
    counters[symbol.tagPrefix] = seq;

    const node: EquipmentNode = {
      id: nextId(),
      type: 'equipment',
      position: snapCenter(
        position.x,
        position.y,
        symbol.defaultWidth,
        symbol.defaultHeight,
      ),
      width: symbol.defaultWidth,
      height: symbol.defaultHeight,
      data: {
        symbolId,
        label: `${symbol.tagPrefix}-${100 + seq}`,
        rotation: 0,
        manufacturer: '',
        partNumber: '',
        notes: '',
      },
    };
    set({
      nodes: [...get().nodes, node],
      counters,
      selectedId: node.id,
      selectedEdgeId: null,
      dirty: true,
    });
    persist(get());
  },

  updateNodeData: (id, patch) => {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
      dirty: true,
    }));
    persist(get());
  },

  setNodeSize: (id, width, height) => {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, width, height } : n,
      ),
      dirty: true,
    }));
    persist(get());
  },

  setNodeBounds: (id, x, y, width, height) => {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id ? { ...n, position: { x, y }, width, height } : n,
      ),
      dirty: true,
    }));
    persist(get());
  },

  updateEdgeData: (id, data) => {
    set((s) => ({
      edges: s.edges.map((e) => (e.id === id ? { ...e, data } : e)),
      dirty: true,
    }));
    persist(get());
  },

  setPipeWaypoints: (id, waypoints) => {
    set((s) => ({
      edges: s.edges.map((e) =>
        e.id === id
          ? { ...e, data: { ...(e.data ?? createPipeData()), waypoints } }
          : e,
      ),
      dirty: true,
    }));
    persist(get());
  },

  updateNodesData: (ids, patch) => {
    const target = new Set(ids);
    set((s) => ({
      nodes: s.nodes.map((n) =>
        target.has(n.id) ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
      dirty: true,
    }));
    persist(get());
  },

  setNodesSize: (ids, patch) => {
    const target = new Set(ids);
    set((s) => ({
      nodes: s.nodes.map((n) =>
        target.has(n.id)
          ? {
              ...n,
              width: patch.width ?? n.width,
              height: patch.height ?? n.height,
            }
          : n,
      ),
      dirty: true,
    }));
    persist(get());
  },

  updatePipesData: (ids, patch) => {
    const target = new Set(ids);
    set((s) => ({
      edges: s.edges.map((e) =>
        target.has(e.id)
          ? {
              ...e,
              data: recomputePipe({ ...createPipeData(), ...e.data, ...patch }),
            }
          : e,
      ),
      dirty: true,
    }));
    persist(get());
  },

  deleteSelected: () => {
    const { nodes, selectedId, selectedEdgeId } = get();
    const doomed = new Set(selectionOf(nodes, selectedId).map((n) => n.id));
    if (doomed.size) {
      set((s) => ({
        nodes: s.nodes.filter((n) => !doomed.has(n.id)),
        edges: s.edges.filter(
          (e) => !doomed.has(e.source) && !doomed.has(e.target),
        ),
        selectedId: null,
        dirty: true,
      }));
    } else if (selectedEdgeId) {
      set((s) => ({
        edges: s.edges.filter((e) => e.id !== selectedEdgeId),
        selectedEdgeId: null,
        dirty: true,
      }));
    }
    persist(get());
  },

  duplicateSelected: () => {
    const { nodes, edges, counters, selectedId } = get();
    const sources = selectionOf(nodes, selectedId);
    if (!sources.length) return;

    const step = GRID * 4;
    const offset = { x: step, y: step };
    const { clones, idMap, counters: nextCounters } = cloneNodes(
      sources,
      nodes,
      counters,
      offset,
    );
    const copiedEdges = cloneInternalEdges(edges, idMap, offset);

    set({
      nodes: [
        ...nodes.map((n) => ({ ...n, selected: false })),
        ...clones.map((c) => ({ ...c, selected: true })),
      ],
      edges: [...edges.map((e) => ({ ...e, selected: false })), ...copiedEdges],
      counters: nextCounters,
      selectedId: clones.length === 1 ? clones[0].id : null,
      selectedEdgeId: null,
      dirty: true,
    });
    persist(get());
  },

  duplicateDragSelection: (draggedId) => {
    const { nodes, edges, counters } = get();
    const dragged = nodes.find((n) => n.id === draggedId);
    if (!dragged) return;

    // React Flow drags the whole selection, so all of it gets duplicated —
    // grabbing an unselected node duplicates just that one.
    const moving = dragged.selected ? nodes.filter((n) => n.selected) : [dragged];
    const movingIds = new Set(moving.map((n) => n.id));

    const { clones, idMap, counters: nextCounters } = cloneNodes(
      moving,
      nodes,
      counters,
      { x: 0, y: 0 },
    );

    // React Flow goes on dragging the *source* ids, so those are the nodes that
    // must become the duplicates: the node under the cursor takes the fresh tag
    // and the clone parked at the source inherits the original's tag.
    const freshLabels = new Map<string, string>();
    const parked = clones.map((clone, i) => {
      const src = moving[i];
      freshLabels.set(src.id, clone.data.label);
      return { ...clone, data: { ...clone.data, label: src.data.label } };
    });

    const nextNodes = nodes.map((n) =>
      freshLabels.has(n.id)
        ? { ...n, data: { ...n.data, label: freshLabels.get(n.id)! } }
        : n,
    );

    // Pipes inside the selection stay wired to the moving ids (so the copies
    // keep their connections) and get cloned onto the parked nodes. A pipe to
    // an outside node belongs to whatever stays put, so it's rewired there.
    const parkedEdges = cloneInternalEdges(edges, idMap, { x: 0, y: 0 });
    const nextEdges = edges.map((e) => {
      const sourceMoving = movingIds.has(e.source);
      const targetMoving = movingIds.has(e.target);
      if (sourceMoving && targetMoving) return e;
      if (sourceMoving) return { ...e, source: idMap.get(e.source)! };
      if (targetMoving) return { ...e, target: idMap.get(e.target)! };
      return e;
    });

    set({
      nodes: [...nextNodes, ...parked],
      edges: [...nextEdges, ...parkedEdges],
      counters: nextCounters,
      dirty: true,
    });
    persist(get());
  },

  copySelection: () => {
    const { nodes, edges, selectedId } = get();
    const sources = selectionOf(nodes, selectedId);
    if (!sources.length) return;
    const ids = new Set(sources.map((n) => n.id));
    set({
      clipboard: {
        nodes: sources.map((n) => ({ ...n, selected: false, dragging: false })),
        edges: edges.filter((e) => ids.has(e.source) && ids.has(e.target)),
      },
      pasteCount: 0,
    });
  },

  pasteClipboard: () => {
    const { clipboard, nodes, edges, counters, pasteCount } = get();
    if (!clipboard?.nodes.length) return;

    // Cascade repeated pastes instead of stacking them on one spot.
    const n = pasteCount + 1;
    const step = GRID * 4 * n;
    const offset = { x: step, y: step };
    const { clones, idMap, counters: nextCounters } = cloneNodes(
      clipboard.nodes,
      nodes,
      counters,
      offset,
    );
    const pastedEdges = cloneInternalEdges(clipboard.edges, idMap, offset);

    set({
      nodes: [
        ...nodes.map((node) => ({ ...node, selected: false })),
        ...clones.map((c) => ({ ...c, selected: true })),
      ],
      edges: [...edges.map((e) => ({ ...e, selected: false })), ...pastedEdges],
      counters: nextCounters,
      pasteCount: n,
      selectedId: clones.length === 1 ? clones[0].id : null,
      selectedEdgeId: null,
      dirty: true,
    });
    persist(get());
  },

  setSelection: (nodeId, edgeId) =>
    set({ selectedId: nodeId, selectedEdgeId: edgeId }),

  selectNode: (id) =>
    set((s) => ({
      nodes: s.nodes.map((n) => ({ ...n, selected: n.id === id })),
      edges: s.edges.map((e) => ({ ...e, selected: false })),
      selectedId: id,
      selectedEdgeId: null,
    })),

  selectEdge: (id) =>
    set((s) => ({
      nodes: s.nodes.map((n) => ({ ...n, selected: false })),
      edges: s.edges.map((e) => ({ ...e, selected: e.id === id })),
      selectedId: null,
      selectedEdgeId: id,
    })),

  newDocument: () => {
    set({
      nodes: [],
      edges: [],
      selectedId: null,
      selectedEdgeId: null,
      counters: {},
      dirty: false,
    });
    persist(get());
  },

  loadDocument: (doc) => {
    set({
      nodes: doc.nodes ?? [],
      edges: (doc.edges ?? []).map(normalizeEdge),
      selectedId: null,
      selectedEdgeId: null,
      counters: {},
      clipboard: null,
      pasteCount: 0,
      dirty: false,
    });
    persist(get());
  },

  markSaved: () => set({ dirty: false }),

  toggleTheme: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, theme);
    set({ theme });
  },
}));
