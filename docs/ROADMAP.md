# Roadmap

Iteration 1 (done) established the editor foundation. Below is a suggested
sequence for subsequent iterations. Nothing here is committed scope — it's a
menu to prioritise from.

## ✅ Iteration 1 — Boilerplate editor (complete)

- React Flow canvas: place, move, connect, pan, zoom, minimap.
- Data-driven symbol library (vessels, pumps, heat transfer, valves,
  instruments, piping) with search.
- Per-element scale (resize handles), name/tag, rotation.
- Properties / BOM / Analysis side panels.
- Light & dark mode.
- Export: native `.pidproj`, PNG, SVG, PDF; BOM CSV.
- Auto-save to localStorage.

## Iteration 2 — Diagram fidelity

- **Line/stream types** — process, signal, electrical, pneumatic; styled edges
  (dashed, double, with arrowheads) chosen per connection.
- **ISA-style tag bubbles** for instruments (measured variable + loop number).
- **Edge labels** (line numbers, sizes, specs) and routing options
  (orthogonal/step vs. smooth).
- **Snap & align** guides, distribution helpers, grouping.
- **Per-port semantics** — typed inlet/outlet ports instead of generic ports.

## Iteration 3 — Analysis & BOM depth

- **Rule-based validation** — e.g. pumps need suction + discharge, control
  valves need a controller, no dangling connections; severity levels.
- **Rolled-up BOM** — group identical part numbers, quantities, cost columns,
  supplier metadata; export to XLSX.
- **Line list / equipment list** reports.
- **Connectivity/flow tracing** — follow a stream through the diagram.

## Iteration 4 — Projects & scale

- **Multi-sheet** documents with cross-sheet connectors and a sheet index.
- **Title block** + drawing metadata (rev, author, date) baked into exports.
- **Templates** and a savable custom symbol/library manager.
- **Undo/redo** history.

## Iteration 5 — Deployment as a subdomain

- Static hosting of `dist/` on the target subdomain (CI build).
- Optional **accounts + cloud sync** (replace localStorage with a backend);
  share links; autosave to the cloud.
- **PWA**: installable, offline cache.
- Access control if projects are private.

## Known limitations to revisit

- Rotation is a CSS transform on the symbol only; ports/handles do not rotate
  with it. Typed/positioned ports (Iter. 2) would address this.
- Export rasterizes the live viewport via `html-to-image`; very large diagrams
  may need tiling or a dedicated vector export path.
- Bundle includes jsPDF + html2canvas (large). Consider lazy-loading the export
  module so the editor loads faster.
