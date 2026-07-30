# CLAUDE.md — PID Master

Project guide for AI assistants. Read this first; it captures the decisions and
structure so you don't have to re-derive them. Keep it up to date when the
architecture changes.

## What this is

**PID Master** is a browser-based **P&ID (Piping & Instrumentation Diagram)**
editor with built-in **analysis** and **BOM (Bill of Materials)** tooling.
Think draw.io / Visual Paradigm's pick-and-place + connect-with-lines UX, with
an Altium-inspired multi-panel professional layout, specialised for process
diagrams.

- **Run locally:** `npm run dev` (Vite, opens http://localhost:5173). On
  Windows you can double-click `start-pid-master.bat`.
- **End goal:** deploy the static build as a subdomain of the owner's website
  (`base: './'` in `vite.config.ts` keeps it subpath-friendly).
- **Owner / GitHub:** repo `pid_master` under the `B0ss5` account.

> **Domain assumption.** "PID" is interpreted as **P&ID (process)**. The symbol
> library is 100% data-driven (`src/lib/symbols.ts`), so retargeting to another
> domain (e.g. electronics/PCB) means editing that one file — nothing else is
> hard-coded to specific symbols.

## Stack

- **React 18 + TypeScript + Vite**
- **[@xyflow/react](https://reactflow.dev) (React Flow v12)** — the canvas:
  nodes, edges, panning, zoom, minimap, resizing, drag-drop.
- **Zustand** — single source of truth (`src/store/useStore.ts`). React Flow is
  used in *controlled* mode: changes flow through `onNodesChange` /
  `onEdgesChange` → `applyNodeChanges` / `applyEdgeChanges`.
- **html-to-image** + **jsPDF** — PNG/SVG/PDF export.
- **lucide-react** — icons.

No backend. State persists to `localStorage` (`pid_master:document`,
`pid_master:theme`) and to the native `.pidproj` JSON file format.

## Project structure

```
src/
  main.tsx                 App bootstrap
  App.tsx                  Layout: Toolbar + (Palette | Canvas | RightPanel)
  types.ts                 SymbolDef, EquipmentData, PipeData, *Node/*Edge, PidDocument
  store/useStore.ts        Zustand store — ALL state & mutations live here
  lib/
    symbols.ts             The component library (data-driven). Add symbols here.
    pipe.ts                Pipe defaults + OD=ID+2·thickness constraint solver
    export.ts              saveProject/openProject, exportImage, exportPDF, BOM CSV
  components/
    Toolbar.tsx            New/Open/Save (Ctrl+S/O), Export menu, dup/delete/fit, theme
    Palette.tsx            Left library; drag-drop + click-to-add, search
    Canvas.tsx             React Flow wrapper, drop, selection, mouse/box-select
    RightPanel.tsx         Tabs: Properties | BOM | Analysis
    PropertiesPanel.tsx    Edit selected node OR pipe, or batch-edit a multi-selection
    BomPanel.tsx           BOM table (equipment + pipes) + CSV export
    AnalysisPanel.tsx      Counts, category breakdown, validation checks
    nodes/EquipmentNode.tsx  Custom node: SVG symbol, 4 ports, resize + rotate handles
    edges/PipeEdge.tsx       Custom edge: routed pipe with draggable bend handles
  styles/index.css         All styling + light/dark theme variables
```

## Key conventions

- **State:** never mutate React Flow nodes/edges directly in components. Call
  store actions (`addNode`, `updateNodeData`, `setNodeSize`, etc.). Every
  mutation calls `persist()` to keep `localStorage` in sync.
- **Theming:** CSS custom properties on `:root` and `html[data-theme="dark"]`.
  `App.tsx` syncs `document.documentElement.dataset.theme` from the store. React
  Flow gets `colorMode={theme}`. Symbols use `currentColor` so they invert
  automatically — **don't hard-code symbol colors.**
- **Symbols:** each `SymbolDef` carries its own `viewBox` and SVG artwork
  authored to **fill that viewBox** (with `defaultWidth/Height` matching its
  aspect ratio) so the node bounding box — and therefore its ports — hug the
  symbol tightly. Strokes use `currentColor`; set `fill="currentColor"
  stroke="none"` on a shape for a filled element. Instrument bubbles may include
  `<text>` (ISA tags). `tagPrefix` drives auto-naming (e.g. `P-101`).
- **Pipes (edges):** every edge is type `pipe` (`components/edges/PipeEdge.tsx`)
  and carries `PipeData` (tag, material, ID/OD/thickness, manufacturer, part #,
  notes, `waypoints`). `lib/pipe.ts` enforces `OD = ID + 2·thickness`; the
  dimension named by `solveFor` is the derived one. **Routing is editable:**
  drag the hollow mid-segment grip to add a bend, drag a solid grip to move one,
  double-click it to remove. `waypoints: []` means auto-route (smoothstep), which
  is the pre-editable behaviour. Waypoints are **absolute flow coords**, so they
  stay put when an endpoint node moves — and must be shifted by hand when a pipe
  is copied (see `cloneInternalEdges`). Older documents typed `smoothstep` are
  migrated by `normalizeEdge` on load.
- **Connections:** `ConnectionMode.Loose` + four `type="source"` handles per node
  let any port connect to any other (draw.io-style).
- **Mouse/keys:** middle-drag pans; left-drag box-selects (drag right = window/
  blue/enclose, drag left = crossing/green/touch); **Ctrl-drag** duplicates the
  selection — a copy stays parked at the source and the *duplicates* follow the
  cursor (`onNodeDragStart`→`duplicateDragSelection`); **Ctrl/Cmd+C / +V** copy
  and paste the selection (in-app clipboard in the store, not the OS one;
  repeated pastes cascade); **Alt** while
  dragging = smooth/un-snapped (`snapToGrid={!altPressed}`); **Alt** while
  resizing = symmetric/center scaling (handled in `EquipmentNode`'s
  `shouldResize`, which returns `false` to override React Flow's one-sided
  resize and calls `setNodeBounds`); a selected node grows a **rotate grip**
  above it (15° steps, Alt = free); **double-click** a node renames its ID tag
  inline; **`f`** fits the view; `Ctrl/Cmd+S` saves the `.pidproj`,
  `Ctrl/Cmd+O` opens. `Shift` is the multi-select modifier (Ctrl is reserved for
  drag-duplicate). A `dirty` flag (set by real edits, not by React Flow's
  load-time measurement) drives unsaved-change warnings on new/open/close.
- **IDs:** node ids come from `nextId()` in the store; tag numbers from
  per-prefix `counters`. There is no quantity field — each instance is one item.
- **Batch editing:** selecting more than one thing swaps the Properties panel
  for `MultiProperties`, which is driven by a `BatchField[]` table. Each field
  declares `appliesTo: ('node'|'edge')[]` and a field only renders when *every*
  selected kind carries it — so equipment + equipment keeps the full set, while
  equipment + pipe narrows to the BOM fields they share. Differing values show a
  `Mixed` placeholder. Add a property here *and* to the single-selection panel.
- **Duplicating:** `duplicateSelected`, `duplicateDragSelection` and
  `pasteClipboard` all go through `cloneNodes` + `cloneInternalEdges`, so they
  copy every selected node *and* the pipes between them (pipes to nodes outside
  the selection are not copied). Selections are read with `selectionOf`, since
  React Flow only sets `selectedId` when exactly one node is picked — use it
  rather than `selectedId` for anything acting on "the selection".

## Commands

| Command | What |
|---|---|
| `npm run dev` | Dev server (HMR) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built bundle |
| `npm run typecheck` | `tsc --noEmit` |

## Adding a symbol (the most common task)

Append one object to `SYMBOLS` in `src/lib/symbols.ts`:

```ts
{
  id: 'valve-needle',
  label: 'Needle Valve',
  category: 'Valves',          // new categories appear automatically
  tagPrefix: 'HV',
  viewBox: '0 0 84 52',        // artwork fills this; size matches its aspect
  defaultWidth: 84,
  defaultHeight: 52,
  svg: '<path d="M4 6 L42 26 L4 46 Z M80 6 L42 26 L80 46 Z"/><path d="M42 26 V8"/>',
}
```

That's it — the palette, BOM, and analysis pick it up with no other changes.

## Status & roadmap

First iteration is complete: editor, library, connections, scaling, naming,
light/dark, export (native `.pidproj` + PNG/SVG/PDF), BOM, analysis. See
`docs/ROADMAP.md` for what's next (line/stream types, ISA tag bubbles, rule-based
validation, multi-sheet, auth/cloud sync for the subdomain deployment).
Architecture deep-dive in `docs/ARCHITECTURE.md`.
