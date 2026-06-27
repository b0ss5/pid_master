import { MousePointerSquareDashed, RotateCw, Spline } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getSymbol } from '../lib/symbols';
import { createPipeData, recomputePipe } from '../lib/pipe';
import type { PipeData, PipeSolveFor } from '../types';

const SOLVE_OPTIONS: { id: PipeSolveFor; label: string }[] = [
  { id: 'id', label: 'ID' },
  { id: 'od', label: 'OD' },
  { id: 'thickness', label: 'Thickness' },
];

const DIM_FIELDS: { key: keyof PipeData; solve: PipeSolveFor; label: string }[] = [
  { key: 'innerDiameter', solve: 'id', label: 'Inner Ø (ID)' },
  { key: 'outerDiameter', solve: 'od', label: 'Outer Ø (OD)' },
  { key: 'thickness', solve: 'thickness', label: 'Wall thickness' },
];

function EquipmentProperties() {
  const selectedId = useStore((s) => s.selectedId)!;
  const node = useStore((s) => s.nodes.find((n) => n.id === s.selectedId))!;
  const updateNodeData = useStore((s) => s.updateNodeData);
  const setNodeSize = useStore((s) => s.setNodeSize);

  const symbol = getSymbol(node.data.symbolId);
  const width = Math.round(node.width ?? 0);
  const height = Math.round(node.height ?? 0);

  return (
    <div className="props">
      <div className="props-symbol-tag">{symbol?.label ?? 'Unknown'}</div>

      <label className="field">
        <span>ID Tag</span>
        <input
          value={node.data.label}
          onChange={(e) => updateNodeData(selectedId, { label: e.target.value })}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Width</span>
          <input
            type="number"
            min={28}
            value={width}
            onChange={(e) =>
              setNodeSize(selectedId, Number(e.target.value) || 28, height)
            }
          />
        </label>
        <label className="field">
          <span>Height</span>
          <input
            type="number"
            min={28}
            value={height}
            onChange={(e) =>
              setNodeSize(selectedId, width, Number(e.target.value) || 28)
            }
          />
        </label>
      </div>

      <label className="field">
        <span>
          <RotateCw size={12} /> Rotation ({node.data.rotation}°)
        </span>
        <input
          type="range"
          min={0}
          max={360}
          step={15}
          value={node.data.rotation}
          onChange={(e) =>
            updateNodeData(selectedId, { rotation: Number(e.target.value) })
          }
        />
      </label>

      <div className="props-divider">Bill of Materials</div>

      <label className="field">
        <span>Manufacturer</span>
        <input
          value={node.data.manufacturer}
          onChange={(e) =>
            updateNodeData(selectedId, { manufacturer: e.target.value })
          }
        />
      </label>

      <label className="field">
        <span>Part Number</span>
        <input
          value={node.data.partNumber}
          onChange={(e) =>
            updateNodeData(selectedId, { partNumber: e.target.value })
          }
        />
      </label>

      <label className="field">
        <span>Notes</span>
        <textarea
          rows={3}
          value={node.data.notes}
          onChange={(e) => updateNodeData(selectedId, { notes: e.target.value })}
        />
      </label>
    </div>
  );
}

function PipeProperties() {
  const edge = useStore((s) => s.edges.find((e) => e.id === s.selectedEdgeId))!;
  const updateEdgeData = useStore((s) => s.updateEdgeData);

  const pipe: PipeData = edge.data ?? createPipeData();

  const update = (patch: Partial<PipeData>) =>
    updateEdgeData(edge.id, recomputePipe({ ...pipe, ...patch }));

  const onDim = (key: keyof PipeData, raw: string) => {
    const trimmed = raw.trim();
    const value = trimmed === '' ? null : Number(trimmed);
    update({ [key]: value !== null && Number.isNaN(value) ? null : value });
  };

  return (
    <div className="props">
      <div className="props-symbol-tag pipe">
        <Spline size={13} /> Pipe / Line
      </div>

      <label className="field">
        <span>ID Tag (optional)</span>
        <input
          value={pipe.tag}
          onChange={(e) => update({ tag: e.target.value })}
          placeholder="e.g. P-1001-CS"
        />
      </label>

      <label className="field">
        <span>Material</span>
        <input
          value={pipe.material}
          onChange={(e) => update({ material: e.target.value })}
          placeholder="e.g. CS A106-B, 316SS, PVC"
        />
      </label>

      <div className="props-divider">Dimensions</div>
      <div className="solve-for">
        <span>Solve for</span>
        <div className="segmented">
          {SOLVE_OPTIONS.map((o) => (
            <button
              key={o.id}
              className={pipe.solveFor === o.id ? 'active' : ''}
              onClick={() => update({ solveFor: o.id })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {DIM_FIELDS.map((f) => {
        const derived = pipe.solveFor === f.solve;
        const value = pipe[f.key] as number | null;
        return (
          <label className="field" key={f.key as string}>
            <span>
              {f.label}
              {derived && <em className="derived-badge">auto</em>}
            </span>
            <input
              type="number"
              step="any"
              min={0}
              value={value === null ? '' : value}
              disabled={derived}
              onChange={(e) => onDim(f.key, e.target.value)}
              placeholder={derived ? 'computed' : ''}
            />
          </label>
        );
      })}

      <div className="props-divider">Bill of Materials</div>

      <label className="field">
        <span>Manufacturer</span>
        <input
          value={pipe.manufacturer}
          onChange={(e) => update({ manufacturer: e.target.value })}
        />
      </label>

      <label className="field">
        <span>Part Number</span>
        <input
          value={pipe.partNumber}
          onChange={(e) => update({ partNumber: e.target.value })}
        />
      </label>

      <label className="field">
        <span>Notes</span>
        <textarea
          rows={3}
          value={pipe.notes}
          onChange={(e) => update({ notes: e.target.value })}
        />
      </label>
    </div>
  );
}

export default function PropertiesPanel() {
  const selectedId = useStore((s) => s.selectedId);
  const selectedEdgeId = useStore((s) => s.selectedEdgeId);

  if (selectedId) return <EquipmentProperties />;
  if (selectedEdgeId) return <PipeProperties />;

  return (
    <div className="panel-empty">
      <MousePointerSquareDashed size={28} />
      <p>Select an element or pipe to edit its properties.</p>
    </div>
  );
}
