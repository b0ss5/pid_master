import { useState, type CSSProperties, type DragEvent } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Search } from 'lucide-react';
import { CATEGORIES, SYMBOLS } from '../lib/symbols';
import { useStore } from '../store/useStore';

const SYMBOL_STYLE: CSSProperties = {
  stroke: 'currentColor',
  fill: 'none',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  overflow: 'visible',
};

export default function Palette() {
  const addNode = useStore((s) => s.addNode);
  const { screenToFlowPosition } = useReactFlow();
  const [query, setQuery] = useState('');

  const onDragStart = (event: DragEvent, symbolId: string) => {
    event.dataTransfer.setData('application/pid-symbol', symbolId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onClickAdd = (symbolId: string) => {
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addNode(symbolId, center);
  };

  const q = query.trim().toLowerCase();
  const matches = (id: string) => {
    if (!q) return true;
    const s = SYMBOLS.find((x) => x.id === id)!;
    return (
      s.label.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  };

  return (
    <aside className="palette">
      <div className="panel-title">Library</div>
      <div className="palette-search">
        <Search size={14} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search symbols…"
          aria-label="Search symbols"
        />
      </div>
      <div className="palette-scroll">
        {CATEGORIES.map((category) => {
          const items = SYMBOLS.filter(
            (s) => s.category === category && matches(s.id),
          );
          if (items.length === 0) return null;
          return (
            <section key={category} className="palette-group">
              <div className="palette-group-title">{category}</div>
              <div className="palette-grid">
                {items.map((s) => (
                  <button
                    key={s.id}
                    className="palette-item"
                    draggable
                    onDragStart={(e) => onDragStart(e, s.id)}
                    onClick={() => onClickAdd(s.id)}
                    title={`${s.label} — drag onto canvas or click to add`}
                  >
                    <svg
                      viewBox={s.viewBox}
                      className="palette-svg"
                      style={SYMBOL_STYLE}
                      dangerouslySetInnerHTML={{ __html: s.svg }}
                    />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <div className="palette-hint">Drag a symbol onto the canvas, or click to drop it in the center.</div>
    </aside>
  );
}
