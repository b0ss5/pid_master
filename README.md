# PID Master

A browser-based **P&ID (Piping & Instrumentation Diagram) designer** with a
pick-and-place component library, connect-with-lines canvas, built-in **diagram
analysis**, and **Bill of Materials** tooling. Inspired by the UX of draw.io /
Visual Paradigm and the panelled, professional feel of Altium Designer.

![status](https://img.shields.io/badge/status-iteration%201-blue)

## Features

- 🧩 **Component library** — drag-and-drop (or click-to-add) process symbols:
  vessels, pumps & compressors, heat transfer, valves, instruments, piping.
- 🔗 **Connect anything** — every element exposes four ports; draw lines between
  any of them (loose connection mode, draw.io style).
- 🧪 **Pipe specs** — pipes are first-class items: material, ID/OD/wall thickness
  (any 2 constrain the 3rd via `OD = ID + 2·t`), tag, manufacturer, part #, notes.
- 📐 **Scale, tag, rotate** — resize handles on every element, editable ID tag,
  rotation, plus per-item BOM metadata.
- 🖱️ **CAD-style controls** — middle-drag pan; left-drag box-select (drag right =
  enclose/blue, drag left = touch/green); **Ctrl-drag** to duplicate; **Alt-drag**
  for smooth/un-snapped moves; **Alt-resize** for symmetric scaling;
  **double-click** to rename; **`f`** fits the view; `Ctrl+S` save, `Ctrl+O` open.
- 🌗 **Light & dark mode** — one-click toggle, remembered between sessions.
- 💾 **Native + portable export** — save/open the editable `.pidproj` format, or
  export a **PNG**, **SVG**, or printable **PDF**.
- 📊 **Analysis** — live component/connection counts, category breakdown, and
  validation checks (unconnected items, missing part numbers).
- 📋 **BOM** — auto-generated bill of materials with one-click **CSV** export.
- 🔌 **Offline-first** — no backend; work is auto-saved to your browser.

## Quick start

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

**Windows shortcut:** double-click **`start-pid-master.bat`** — it installs
dependencies (first run only) and launches the app in your browser.

## Build for deployment

```bash
npm run build      # outputs static files to dist/
npm run preview    # preview the production build locally
```

The build uses relative asset paths (`base: './'`), so `dist/` can be served
from a subdomain or subpath without further configuration — the intended
deployment target is a subdomain of the owner's website.

## Usage

1. **Add** elements — drag a symbol from the left library onto the canvas, or
   click it to drop it in the center.
2. **Connect** — hover an element to reveal its ports, then drag from one port
   to another.
3. **Edit** — select an element and use the **Properties** tab to set its tag,
   size, rotation, manufacturer, part number, quantity, and notes.
4. **Review** — the **BOM** tab lists every item (export to CSV); the
   **Analysis** tab flags unconnected items and missing part numbers.
5. **Export** — use the **Export** menu for `.pidproj`, PNG, SVG, or PDF.
   **Save** downloads the editable project; **Open** loads it back.

## Tech

React 18 · TypeScript · Vite · React Flow (@xyflow/react) · Zustand ·
html-to-image · jsPDF · lucide-react.

See [`CLAUDE.md`](CLAUDE.md) and [`docs/`](docs/) for architecture and roadmap.
