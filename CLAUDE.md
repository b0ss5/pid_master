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
  types.ts                 SymbolDef, EquipmentData, EquipmentNode, PidDocument
  store/useStore.ts        Zustand store — ALL state & mutations live here
  lib/
    symbols.ts             The component library (data-driven). Add symbols here.
    export.ts              saveProject/openProject, exportImage, exportPDF, BOM CSV
  components/
    Toolbar.tsx            New/Open/Save, Export menu, dup/delete/fit, theme toggle
    Palette.tsx            Left library; drag-drop + click-to-add, search
    Canvas.tsx             React Flow wrapper, drop handling, selection
    RightPanel.tsx         Tabs: Properties | BOM | Analysis
    PropertiesPanel.tsx    Edit selected node (tag, size, rotation, BOM fields)
    BomPanel.tsx           Per-instance BOM table + CSV export
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
- **Symbols:** each `SymbolDef` is inline SVG drawn in a `0 0 100 100` viewBox,
  strokes only (`fill="none"` is applied by the renderer; set
  `fill="currentColor" stroke="none"` on a shape if you need a filled element).
  `tagPrefix` drives auto-naming (e.g. `P-101`).
- **Connections:** `ConnectionMode.Loose` + four `type="source"` handles per node
  let any port connect to any other (draw.io-style).
- **IDs:** node ids come from `nextId()` in the store; tag numbers from
  per-prefix `counters`.

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
  defaultWidth: 76,
  defaultHeight: 60,
  svg: '<path d="M18 32 L50 50 L18 68 Z M82 32 L50 50 L82 68 Z"/><path d="M50 38 V20"/>',
}
```

That's it — the palette, BOM, and analysis pick it up with no other changes.

## Status & roadmap

First iteration is complete: editor, library, connections, scaling, naming,
light/dark, export (native `.pidproj` + PNG/SVG/PDF), BOM, analysis. See
`docs/ROADMAP.md` for what's next (line/stream types, ISA tag bubbles, rule-based
validation, multi-sheet, auth/cloud sync for the subdomain deployment).
Architecture deep-dive in `docs/ARCHITECTURE.md`.
