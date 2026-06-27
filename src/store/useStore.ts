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
import { createPipeData } from '../lib/pipe';

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
  deleteSelected: () => void;
  duplicateSelected: () => void;
  /** Clone a node in place (used by Ctrl-drag duplicate). */
  duplicateNodeInPlace: (id: string) => void;

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

function loadPersisted(): { nodes: EquipmentNode[]; edges: PipeEdge[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { nodes: [], edges: [] };
    const doc = JSON.parse(raw) as PidDocument;
    return { nodes: doc.nodes ?? [], edges: doc.edges ?? [] };
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

const persisted = loadPersisted();

export const useStore = create<AppState>((set, get) => ({
  nodes: persisted.nodes,
  edges: persisted.edges,
  selectedId: null,
  selectedEdgeId: null,
  theme: loadTheme(),
  dirty: false,
  counters: {},

  onNodesChange: (changes) => {
    set((s) => ({
      nodes: applyNodeChanges(changes, s.nodes),
      dirty: s.dirty || hasContentChange(changes),
    }));
    persist(get());
  },

  onEdgesChange: (changes) => {
    set((s) => ({
      edges: applyEdgeChanges(changes, s.edges) as PipeEdge[],
      dirty: s.dirty || hasContentChange(changes),
    }));
    persist(get());
  },

  onConnect: (connection) => {
    set((s) => ({
      edges: addEdge(
        { ...connection, type: 'smoothstep', data: createPipeData() },
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
      position,
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

  deleteSelected: () => {
    const { selectedId, selectedEdgeId } = get();
    if (selectedId) {
      set((s) => ({
        nodes: s.nodes.filter((n) => n.id !== selectedId),
        edges: s.edges.filter(
          (e) => e.source !== selectedId && e.target !== selectedId,
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
    const id = get().selectedId;
    const original = get().nodes.find((n) => n.id === id);
    if (!original) return;
    const copy: EquipmentNode = {
      ...original,
      id: nextId(),
      position: {
        x: original.position.x + 32,
        y: original.position.y + 32,
      },
      selected: false,
      data: { ...original.data, label: `${original.data.label}-copy` },
    };
    set((s) => ({
      nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), { ...copy, selected: true }],
      selectedId: copy.id,
      selectedEdgeId: null,
      dirty: true,
    }));
    persist(get());
  },

  duplicateNodeInPlace: (id) => {
    const original = get().nodes.find((n) => n.id === id);
    if (!original) return;
    const symbol = getSymbol(original.data.symbolId);
    const counters = { ...get().counters };
    let label = `${original.data.label}-copy`;
    if (symbol) {
      const seq = (counters[symbol.tagPrefix] ?? 0) + 1;
      counters[symbol.tagPrefix] = seq;
      label = `${symbol.tagPrefix}-${100 + seq}`;
    }
    // The clone stays at the source position; the original keeps being dragged.
    const copy: EquipmentNode = {
      ...original,
      id: nextId(),
      selected: false,
      dragging: false,
      data: { ...original.data, label },
    };
    set((s) => ({ nodes: [...s.nodes, copy], counters, dirty: true }));
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
      edges: doc.edges ?? [],
      selectedId: null,
      selectedEdgeId: null,
      counters: {},
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
