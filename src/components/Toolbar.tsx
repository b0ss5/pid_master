import { useRef, useState, type ChangeEvent } from 'react';
import { useReactFlow } from '@xyflow/react';
import {
  ChevronDown,
  Copy,
  Download,
  FileJson,
  FilePlus2,
  FileText,
  FolderOpen,
  Image,
  Maximize,
  Moon,
  Save,
  Shapes,
  Sun,
  Trash2,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  exportImage,
  exportPDF,
  openProject,
  saveProject,
} from '../lib/export';

export default function Toolbar() {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const newDocument = useStore((s) => s.newDocument);
  const loadDocument = useStore((s) => s.loadDocument);
  const deleteSelected = useStore((s) => s.deleteSelected);
  const duplicateSelected = useStore((s) => s.duplicateSelected);
  const selectedId = useStore((s) => s.selectedId);
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);

  const { fitView } = useReactFlow();
  const fileRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const exportBackground = theme === 'dark' ? '#0f172a' : '#ffffff';

  const handleOpen = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const doc = await openProject(file);
        loadDocument(doc);
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 60);
      } catch (err) {
        alert(`Could not open file: ${(err as Error).message}`);
      }
    }
    event.target.value = '';
  };

  const run = async (fn: () => void | Promise<void>) => {
    setMenuOpen(false);
    try {
      await fn();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <header className="toolbar">
      <div className="brand">
        <svg viewBox="0 0 64 64" className="brand-mark" aria-hidden>
          <rect width="64" height="64" rx="12" fill="var(--accent)" />
          <g
            fill="none"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="20" cy="22" r="9" />
            <rect x="38" y="13" width="16" height="18" rx="2" />
            <path d="M14 44 h36 M32 31 v13 M20 31 v13 M46 31 v13" />
            <circle cx="32" cy="50" r="6" />
          </g>
        </svg>
        <span className="brand-name">PID&nbsp;Master</span>
      </div>

      <div className="toolbar-group">
        <button
          className="tb-btn"
          onClick={() => {
            if (
              nodes.length === 0 ||
              confirm('Start a new diagram? Unsaved changes will be cleared.')
            ) {
              newDocument();
            }
          }}
        >
          <FilePlus2 size={16} /> New
        </button>
        <button className="tb-btn" onClick={() => fileRef.current?.click()}>
          <FolderOpen size={16} /> Open
        </button>
        <button className="tb-btn" onClick={() => saveProject(nodes, edges)}>
          <Save size={16} /> Save
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pidproj,application/json"
          hidden
          onChange={handleOpen}
        />
      </div>

      <div className="toolbar-group">
        <div className="dropdown">
          <button
            className="tb-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Download size={16} /> Export <ChevronDown size={14} />
          </button>
          {menuOpen && (
            <div className="dropdown-menu" onMouseLeave={() => setMenuOpen(false)}>
              <button onClick={() => run(() => saveProject(nodes, edges))}>
                <FileJson size={15} /> Project (.pidproj)
              </button>
              <button
                onClick={() =>
                  run(() =>
                    exportImage('png', nodes, { background: exportBackground }),
                  )
                }
              >
                <Image size={15} /> PNG image
              </button>
              <button
                onClick={() =>
                  run(() =>
                    exportImage('svg', nodes, { background: exportBackground }),
                  )
                }
              >
                <Shapes size={15} /> SVG vector
              </button>
              <button
                onClick={() =>
                  run(() => exportPDF(nodes, { background: exportBackground }))
                }
              >
                <FileText size={15} /> PDF document
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-group">
        <button
          className="tb-btn icon"
          disabled={!selectedId}
          onClick={duplicateSelected}
          title="Duplicate selected"
        >
          <Copy size={16} />
        </button>
        <button
          className="tb-btn icon"
          disabled={!selectedId}
          onClick={deleteSelected}
          title="Delete selected"
        >
          <Trash2 size={16} />
        </button>
        <button
          className="tb-btn icon"
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          title="Fit view"
        >
          <Maximize size={16} />
        </button>
      </div>

      <div className="toolbar-spacer" />

      <button
        className="tb-btn icon theme-toggle"
        onClick={toggleTheme}
        title="Toggle light / dark"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
