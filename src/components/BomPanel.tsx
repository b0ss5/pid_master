import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getSymbol } from '../lib/symbols';
import { createPipeData, pipeSizeLabel } from '../lib/pipe';
import { exportBomCsv, type BomRow } from '../lib/export';

interface Row extends BomRow {
  id: string;
  kind: 'node' | 'pipe';
}

export default function BomPanel() {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const selectNode = useStore((s) => s.selectNode);
  const selectEdge = useStore((s) => s.selectEdge);

  const rows = useMemo<Row[]>(() => {
    const nodeRows: Row[] = nodes.map((n) => ({
      id: n.id,
      kind: 'node',
      tag: n.data.label,
      description: getSymbol(n.data.symbolId)?.label ?? n.data.symbolId,
      manufacturer: n.data.manufacturer,
      partNumber: n.data.partNumber,
    }));

    const pipeRows: Row[] = edges.map((e, i) => {
      const d = e.data ?? createPipeData();
      const size = pipeSizeLabel(d);
      const desc = [d.material, size].filter(Boolean).join(' — ') || 'Pipe';
      return {
        id: e.id,
        kind: 'pipe',
        tag: d.tag || `Pipe ${i + 1}`,
        description: desc,
        manufacturer: d.manufacturer,
        partNumber: d.partNumber,
      };
    });

    return [...nodeRows, ...pipeRows].sort((a, b) =>
      a.tag.localeCompare(b.tag, undefined, { numeric: true }),
    );
  }, [nodes, edges]);

  if (rows.length === 0) {
    return (
      <div className="panel-empty">
        <p>No components yet. Add equipment and pipes to build the BOM.</p>
      </div>
    );
  }

  return (
    <div className="bom">
      <div className="bom-toolbar">
        <span>{rows.length} line items</span>
        <button
          className="tb-btn small"
          onClick={() =>
            exportBomCsv(
              rows.map(({ tag, description, manufacturer, partNumber }) => ({
                tag,
                description,
                manufacturer,
                partNumber,
              })),
            )
          }
        >
          <Download size={14} /> CSV
        </button>
      </div>
      <div className="bom-scroll">
        <table className="bom-table">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Description</th>
              <th>Part&nbsp;#</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                onClick={() =>
                  r.kind === 'node' ? selectNode(r.id) : selectEdge(r.id)
                }
                title="Click to select on canvas"
              >
                <td className="mono">
                  {r.kind === 'pipe' && <span className="pipe-dot" />}
                  {r.tag}
                </td>
                <td>{r.description}</td>
                <td className={r.partNumber ? '' : 'muted'}>
                  {r.partNumber || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
