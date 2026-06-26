import { create } from 'zustand';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type XYPosition,
} from '@xyflow/react';
import type { EquipmentData, EquipmentNode, PidDocument, Theme } from '../types';
import { getSymbol } from '../lib/symbols';

const STORAGE_KEY = 'pid_master:document';
const THEME_KEY = 'pid_master:theme';

interface AppState {
  nodes: EquipmentNode[];
  edges: Edge[];
  selectedId: string | null;
  theme: Theme;
  /** Monotonic counter so each new instance of a symbol gets a unique tag. */
  counters: Record<string, number>;

  // React Flow plumbing
  onNodesChange: (changes: NodeChange<EquipmentNode>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Editing actions
  addNode: (symbolId: string, position: XYPosition) => void;
  updateNodeData: (id: string, patch: Partial<EquipmentData>) => void;
  setNodeSize: (id: string, width: number, height: number) => void;
  setSelected: (id: string | null) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;

  // Document actions
  newDocument: () => void;
  loadDocument: (doc: PidDocument) => void;

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

function loadPersisted(): { nodes: EquipmentNode[]; edges: Edge[] } {
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

let idSeq = Date.now();
const nextId = () => `n_${(idSeq++).toString(36)}`;

const persisted = loadPersisted();

export const useStore = create<AppState>((set, get) => ({
  nodes: persisted.nodes,
  edges: persisted.edges,
  selectedId: null,
  theme: loadTheme(),
  counters: {},

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
    persist(get());
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
    persist(get());
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        { ...connection, type: 'smoothstep', animated: false },
        get().edges,
      ),
    });
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
        quantity: 1,
        notes: '',
      },
    };
    set({ nodes: [...get().nodes, node], counters, selectedId: node.id });
    persist(get());
  },

  updateNodeData: (id, patch) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    });
    persist(get());
  },

  setNodeSize: (id, width, height) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, width, height } : n,
      ),
    });
    persist(get());
  },

  setSelected: (id) => set({ selectedId: id }),

  deleteSelected: () => {
    const id = get().selectedId;
    if (!id) return;
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedId: null,
    });
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
    set({ nodes: [...get().nodes, copy], selectedId: copy.id });
    persist(get());
  },

  newDocument: () => {
    set({ nodes: [], edges: [], selectedId: null, counters: {} });
    persist(get());
  },

  loadDocument: (doc) => {
    set({
      nodes: doc.nodes ?? [],
      edges: doc.edges ?? [],
      selectedId: null,
      counters: {},
    });
    persist(get());
  },

  toggleTheme: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, theme);
    set({ theme });
  },
}));
