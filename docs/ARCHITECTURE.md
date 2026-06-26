# Architecture

A deeper look at how PID Master is put together. For the quick orientation see
[`../CLAUDE.md`](../CLAUDE.md).

## Data flow

```
                    ┌─────────────────────────────┐
                    │      Zustand store          │
   user action ───▶ │  (src/store/useStore.ts)    │ ───▶ localStorage
                    │  nodes, edges, selectedId,  │      (auto-persist)
                    │  theme, counters            │
                    └──────────────┬──────────────┘
                                   │ subscribe (selectors)
        ┌──────────────┬───────────┼────────────┬───────────────┐
        ▼              ▼           ▼            ▼               ▼
     Toolbar        Palette     Canvas      RightPanel      (export.ts)
                               (ReactFlow)   ├ Properties
                                             ├ BOM
                                             └ Analysis
```

The **store is the single source of truth.** React Flow runs *controlled*: its
`onNodesChange` / `onEdgesChange` callbacks are wired to store actions that run
the canonical `applyNodeChanges` / `applyEdgeChanges` reducers, then persist.
This keeps the BOM and Analysis panels trivially correct — they just read
`nodes`/`edges` from the store and derive their views with `useMemo`.

## The node model

A node is `Node<EquipmentData, 'equipment'>`:

- React Flow owns geometry: `position`, `width`, `height`, `selected`.
- `data` owns domain fields: `symbolId`, `label` (tag), `rotation`, and BOM
  fields (`manufacturer`, `partNumber`, `quantity`, `notes`).

`EquipmentNode.tsx` renders the symbol SVG, four `Handle`s (ports), and a
`NodeResizer` (visible when selected). Resizing emits dimension changes that flow
back through `onNodesChange` — so width/height in the Properties panel stay live.

## The symbol library

`src/lib/symbols.ts` is pure data — an array of `SymbolDef`. Each symbol is
inline SVG in a `0 0 100 100` viewBox using `currentColor`, so it adapts to the
theme and to the accent color when selected. `CATEGORIES` is derived from the
array (insertion-ordered), so the palette grouping needs no manual maintenance.
`getSymbol(id)` is an O(1) lookup used across rendering, BOM, and analysis.

This indirection is the main extension point: the whole app is generic over
"symbols with a category, a tag prefix, and an SVG", so a different domain is a
data change, not a code change.

## Export pipeline

`src/lib/export.ts`:

- **`.pidproj`** — `JSON.stringify` of `{ app, version, savedAt, nodes, edges }`.
  `openProject` validates the `app` field before loading.
- **PNG / SVG** — `getNodesBounds` computes the content rect; `getViewportFor
  Bounds` produces a transform that frames it with padding; `html-to-image`
  rasterizes/serializes the `.react-flow__viewport` element at that transform.
- **PDF** — renders a PNG (higher scale), then places it 1:1 into a `jsPDF` page
  sized to the image (orientation chosen from aspect ratio).

Export background color is passed from the current theme so exports look right in
both modes.

## Theming

CSS custom properties define the entire palette twice: `:root` (light) and
`html[data-theme="dark"]`. `App.tsx` mirrors the store's `theme` onto
`documentElement.dataset.theme`; React Flow receives `colorMode={theme}`.
Because symbols use `currentColor` and components reference only the CSS
variables, adding a third theme would be a matter of one more selector block.

## Why these libraries

- **React Flow** gives node/edge interaction, panning, zoom, minimap, resizing,
  and serialization out of the box — the bulk of a draw.io-class canvas.
- **Zustand** is a tiny, unopinionated store that pairs cleanly with React
  Flow's controlled mode and avoids prop-drilling to the side panels.
- **html-to-image + jsPDF** are client-only, so export needs no server — keeping
  the app deployable as a pure static bundle.
