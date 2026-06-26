import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getSymbol } from '../lib/symbols';
import { exportBomCsv, type BomRow } from '../lib/export';

export default function BomPanel() {
  const nodes = useStore((s) => s.nodes);
  const setSelected = useStore((s) => s.setSelected);

  const rows = useMemo<(BomRow & { id: string })[]>(
    () =>
      nodes
        .map((n) => ({
          id: n.id,
          tag: n.data.label,
          description: getSymbol(n.data.symbolId)?.label ?? n.data.symbolId,
          manufacturer: n.data.manufacturer,
          partNumber: n.data.partNumber,
          quantity: n.data.quantity,
        }))
        .sort((a, b) => a.tag.localeCompare(b.tag, undefined, { numeric: true })),
    [nodes],
  );

  const totalQty = rows.reduce((sum, r) => sum + r.quantity, 0);

  if (rows.length === 0) {
    return (
      <div className="panel-empty">
        <p>No components yet. Add equipment to build the BOM.</p>
      </div>
    );
  }

  return (
    <div className="bom">
      <div className="bom-toolbar">
        <span>
          {rows.length} line items · {totalQty} units
        </span>
        <button
          className="tb-btn small"
          onClick={() => exportBomCsv(rows.map(({ id, ...r }) => r))}
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
              <th className="num">Qty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => setSelected(r.id)}
                title="Click to select on canvas"
              >
                <td className="mono">{r.tag}</td>
                <td>{r.description}</td>
                <td className={r.partNumber ? '' : 'muted'}>
                  {r.partNumber || '—'}
                </td>
                <td className="num">{r.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
