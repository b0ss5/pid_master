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
    PropertiesPanel.tsx    Edit selected node OR pipe (size, rotation, BOM, pipe specs)
    BomPanel.tsx           BOM table (equipment + pipes) + CSV export
    AnalysisPanel.tsx      Counts, category breakdown, validation checks
    nodes/EquipmentNode.tsx  Custom node: SVG symbol, 4 ports, resize handles
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
- **Pipes (edges):** every edge carries `PipeData` (tag, material, ID/OD/
  thickness, manufacturer, part #, notes). `lib/pipe.ts` enforces
  `OD = ID + 2·thickness`; the dimension named by `solveFor` is the derived
  one. Edges are selectable; the Properties panel edits the selected node *or*
  the selected pipe.
- **Connections:** `ConnectionMode.Loose` + four `type="source"` handles per node
  let any port connect to any other (draw.io-style).
- **Mouse/keys:** middle-drag pans; left-drag box-selects (drag right = window/
  blue/enclose, drag left = crossing/green/touch). `Ctrl/Cmd+S` saves the
  `.pidproj`, `Ctrl/Cmd+O` opens. A `dirty` flag (set by real edits, not by
  React Flow's load-time measurement) drives unsaved-change warnings on
  new/open/close.
- **IDs:** node ids come from `nextId()` in the store; tag numbers from
  per-prefix `counters`. There is no quantity field — each instance is one item.

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
