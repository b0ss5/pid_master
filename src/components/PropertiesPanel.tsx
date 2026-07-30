import { Layers, MousePointerSquareDashed, RotateCw, Spline } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getSymbol } from '../lib/symbols';
import { createPipeData, recomputePipe } from '../lib/pipe';
import type { EquipmentNode, PipeData, PipeEdge, PipeSolveFor } from '../types';

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

function EmptySelection() {
  return (
    <div className="panel-empty">
      <MousePointerSquareDashed size={28} />
      <p>Select an element or pipe to edit its properties.</p>
    </div>
  );
}

function EquipmentProperties() {
  const selectedId = useStore((s) => s.selectedId)!;
  const node = useStore((s) => s.nodes.find((n) => n.id === s.selectedId));
  const updateNodeData = useStore((s) => s.updateNodeData);
  const setNodeSize = useStore((s) => s.setNodeSize);

  if (!node) return <EmptySelection />;

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
  const edge = useStore((s) => s.edges.find((e) => e.id === s.selectedEdgeId));
  const updateEdgeData = useStore((s) => s.updateEdgeData);

  if (!edge) return <EmptySelection />;

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

/* ---------------------------------------------------------------- batch ---- */

/** One selected thing. Pipes and equipment carry different property sets. */
type Target =
  | { kind: 'node'; id: string; node: EquipmentNode }
  | { kind: 'edge'; id: string; edge: PipeEdge };

/**
 * A property that can be edited across a selection. `appliesTo` is what makes a
 * mixed selection safe: a field is only offered when *every* selected kind
 * carries it, so picking tanks + valves keeps their shared properties while
 * picking tanks + pipes narrows to the ones both actually have.
 */
interface BatchField {
  id: string;
  label: string;
  input: 'text' | 'textarea' | 'number';
  appliesTo: Target['kind'][];
  min?: number;
  placeholder?: string;
  read: (t: Target) => string;
  write: (raw: string) => void;
}

const pipeOf = (t: Target): PipeData =>
  t.kind === 'edge' ? { ...createPipeData(), ...t.edge.data } : createPipeData();

function MultiProperties({ targets }: { targets: Target[] }) {
  const updateNodesData = useStore((s) => s.updateNodesData);
  const setNodesSize = useStore((s) => s.setNodesSize);
  const updatePipesData = useStore((s) => s.updatePipesData);

  const nodeIds = targets.filter((t) => t.kind === 'node').map((t) => t.id);
  const edgeIds = targets.filter((t) => t.kind === 'edge').map((t) => t.id);
  const kinds = [...new Set(targets.map((t) => t.kind))];

  const num = (raw: string): number | null => {
    const trimmed = raw.trim();
    if (trimmed === '') return null;
    const value = Number(trimmed);
    return Number.isNaN(value) ? null : value;
  };

  /** Write a BOM field that both equipment and pipes share. */
  const writeShared = (patch: Record<string, string>) => {
    if (nodeIds.length) updateNodesData(nodeIds, patch);
    if (edgeIds.length) updatePipesData(edgeIds, patch);
  };

  const fields: BatchField[] = [
    {
      id: 'width',
      label: 'Width',
      input: 'number',
      appliesTo: ['node'],
      min: 28,
      read: (t) => (t.kind === 'node' ? String(Math.round(t.node.width ?? 0)) : ''),
      write: (raw) => setNodesSize(nodeIds, { width: num(raw) ?? 28 }),
    },
    {
      id: 'height',
      label: 'Height',
      input: 'number',
      appliesTo: ['node'],
      min: 28,
      read: (t) => (t.kind === 'node' ? String(Math.round(t.node.height ?? 0)) : ''),
      write: (raw) => setNodesSize(nodeIds, { height: num(raw) ?? 28 }),
    },
    {
      id: 'rotation',
      label: 'Rotation (°)',
      input: 'number',
      appliesTo: ['node'],
      read: (t) => (t.kind === 'node' ? String(t.node.data.rotation) : ''),
      write: (raw) => updateNodesData(nodeIds, { rotation: num(raw) ?? 0 }),
    },
    {
      id: 'material',
      label: 'Material',
      input: 'text',
      appliesTo: ['edge'],
      placeholder: 'e.g. CS A106-B, 316SS',
      read: (t) => pipeOf(t).material,
      write: (raw) => updatePipesData(edgeIds, { material: raw }),
    },
    {
      id: 'innerDiameter',
      label: 'Inner Ø (ID)',
      input: 'number',
      appliesTo: ['edge'],
      read: (t) => String(pipeOf(t).innerDiameter ?? ''),
      write: (raw) => updatePipesData(edgeIds, { innerDiameter: num(raw) }),
    },
    {
      id: 'outerDiameter',
      label: 'Outer Ø (OD)',
      input: 'number',
      appliesTo: ['edge'],
      read: (t) => String(pipeOf(t).outerDiameter ?? ''),
      write: (raw) => updatePipesData(edgeIds, { outerDiameter: num(raw) }),
    },
    {
      id: 'thickness',
      label: 'Wall thickness',
      input: 'number',
      appliesTo: ['edge'],
      read: (t) => String(pipeOf(t).thickness ?? ''),
      write: (raw) => updatePipesData(edgeIds, { thickness: num(raw) }),
    },
    {
      id: 'manufacturer',
      label: 'Manufacturer',
      input: 'text',
      appliesTo: ['node', 'edge'],
      read: (t) => (t.kind === 'node' ? t.node.data.manufacturer : pipeOf(t).manufacturer),
      write: (raw) => writeShared({ manufacturer: raw }),
    },
    {
      id: 'partNumber',
      label: 'Part Number',
      input: 'text',
      appliesTo: ['node', 'edge'],
      read: (t) => (t.kind === 'node' ? t.node.data.partNumber : pipeOf(t).partNumber),
      write: (raw) => writeShared({ partNumber: raw }),
    },
    {
      id: 'notes',
      label: 'Notes',
      input: 'textarea',
      appliesTo: ['node', 'edge'],
      read: (t) => (t.kind === 'node' ? t.node.data.notes : pipeOf(t).notes),
      write: (raw) => writeShared({ notes: raw }),
    },
  ];

  const applicable = fields.filter((f) =>
    kinds.every((k) => f.appliesTo.includes(k)),
  );
  const bomStart = applicable.findIndex((f) => f.id === 'manufacturer');

  const summary = [
    nodeIds.length && `${nodeIds.length} element${nodeIds.length > 1 ? 's' : ''}`,
    edgeIds.length && `${edgeIds.length} pipe${edgeIds.length > 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="props">
      <div className="props-symbol-tag batch">
        <Layers size={13} /> {summary}
      </div>
      <p className="props-hint">
        Editing applies to the whole selection. Only properties shared by
        everything selected are shown.
      </p>

      {applicable.map((field, i) => {
        const values = targets.map(field.read);
        const mixed = new Set(values).size > 1;
        const value = mixed ? '' : values[0];
        const placeholder = mixed ? 'Mixed' : field.placeholder;

        return (
          <div key={field.id}>
            {i === bomStart && <div className="props-divider">Bill of Materials</div>}
            <label className="field">
              <span>{field.label}</span>
              {field.input === 'textarea' ? (
                <textarea
                  rows={3}
                  value={value}
                  placeholder={placeholder}
                  onChange={(e) => field.write(e.target.value)}
                />
              ) : (
                <input
                  type={field.input}
                  min={field.min}
                  value={value}
                  placeholder={placeholder}
                  onChange={(e) => field.write(e.target.value)}
                />
              )}
            </label>
          </div>
        );
      })}
    </div>
  );
}

export default function PropertiesPanel() {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const selectedId = useStore((s) => s.selectedId);
  const selectedEdgeId = useStore((s) => s.selectedEdgeId);

  const targets: Target[] = [
    ...nodes
      .filter((n) => n.selected)
      .map((node): Target => ({ kind: 'node', id: node.id, node })),
    ...edges
      .filter((e) => e.selected)
      .map((edge): Target => ({ kind: 'edge', id: edge.id, edge })),
  ];

  if (targets.length > 1) return <MultiProperties targets={targets} />;
  if (selectedId) return <EquipmentProperties />;
  if (selectedEdgeId) return <PipeProperties />;

  return <EmptySelection />;
}
