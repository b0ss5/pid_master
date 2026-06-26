import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Unplug } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getSymbol } from '../lib/symbols';

export default function AnalysisPanel() {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const setSelected = useStore((s) => s.setSelected);

  const stats = useMemo(() => {
    const connected = new Set<string>();
    edges.forEach((e) => {
      connected.add(e.source);
      connected.add(e.target);
    });

    const byCategory: Record<string, number> = {};
    const unconnected: { id: string; tag: string }[] = [];
    const missingPart: { id: string; tag: string }[] = [];

    nodes.forEach((n) => {
      const category = getSymbol(n.data.symbolId)?.category ?? 'Other';
      byCategory[category] = (byCategory[category] ?? 0) + 1;
      if (!connected.has(n.id)) unconnected.push({ id: n.id, tag: n.data.label });
      if (!n.data.partNumber.trim())
        missingPart.push({ id: n.id, tag: n.data.label });
    });

    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      byCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1]),
      unconnected,
      missingPart,
    };
  }, [nodes, edges]);

  if (nodes.length === 0) {
    return (
      <div className="panel-empty">
        <p>Add components to see diagram analysis.</p>
      </div>
    );
  }

  return (
    <div className="analysis">
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-value">{stats.nodeCount}</span>
          <span className="stat-label">Components</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.edgeCount}</span>
          <span className="stat-label">Connections</span>
        </div>
      </div>

      <div className="analysis-section">
        <h4>By category</h4>
        {stats.byCategory.map(([cat, count]) => (
          <div key={cat} className="bar-row">
            <span className="bar-label">{cat}</span>
            <span className="bar-track">
              <span
                className="bar-fill"
                style={{ width: `${(count / stats.nodeCount) * 100}%` }}
              />
            </span>
            <span className="bar-count">{count}</span>
          </div>
        ))}
      </div>

      <div className="analysis-section">
        <h4>Checks</h4>

        <div className={`check ${stats.unconnected.length ? 'warn' : 'ok'}`}>
          {stats.unconnected.length ? <Unplug size={15} /> : <CheckCircle2 size={15} />}
          <div>
            <strong>
              {stats.unconnected.length
                ? `${stats.unconnected.length} unconnected`
                : 'All components connected'}
            </strong>
            {stats.unconnected.length > 0 && (
              <div className="check-tags">
                {stats.unconnected.map((u) => (
                  <button key={u.id} onClick={() => setSelected(u.id)}>
                    {u.tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`check ${stats.missingPart.length ? 'warn' : 'ok'}`}>
          {stats.missingPart.length ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
          <div>
            <strong>
              {stats.missingPart.length
                ? `${stats.missingPart.length} missing part #`
                : 'BOM complete'}
            </strong>
            {stats.missingPart.length > 0 && (
              <div className="check-tags">
                {stats.missingPart.map((u) => (
                  <button key={u.id} onClick={() => setSelected(u.id)}>
                    {u.tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
