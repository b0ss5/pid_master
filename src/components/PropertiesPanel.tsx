import { MousePointerSquareDashed, RotateCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getSymbol } from '../lib/symbols';

export default function PropertiesPanel() {
  const selectedId = useStore((s) => s.selectedId);
  const node = useStore((s) => s.nodes.find((n) => n.id === s.selectedId));
  const updateNodeData = useStore((s) => s.updateNodeData);
  const setNodeSize = useStore((s) => s.setNodeSize);

  if (!node || !selectedId) {
    return (
      <div className="panel-empty">
        <MousePointerSquareDashed size={28} />
        <p>Select an element to edit its properties.</p>
      </div>
    );
  }

  const symbol = getSymbol(node.data.symbolId);
  const width = Math.round(node.width ?? 0);
  const height = Math.round(node.height ?? 0);

  return (
    <div className="props">
      <div className="props-symbol-tag">{symbol?.label ?? 'Unknown'}</div>

      <label className="field">
        <span>Tag / Name</span>
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
        <span>Quantity</span>
        <input
          type="number"
          min={1}
          value={node.data.quantity}
          onChange={(e) =>
            updateNodeData(selectedId, {
              quantity: Math.max(1, Number(e.target.value) || 1),
            })
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
