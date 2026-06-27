import {
  memo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import {
  Handle,
  NodeResizer,
  Position,
  type NodeProps,
} from '@xyflow/react';
import type { EquipmentNode as EquipmentNodeType } from '../../types';
import { getSymbol } from '../../lib/symbols';
import { useStore } from '../../store/useStore';

const MIN_SIZE = 28;

const SYMBOL_STYLE: CSSProperties = {
  stroke: 'currentColor',
  fill: 'none',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  overflow: 'visible',
};

/**
 * A single piece of equipment on the canvas: the library SVG, four connection
 * ports, resize handles (with Alt = symmetric/center scaling), and
 * double-click-to-rename of its ID tag.
 */
function EquipmentNodeComponent({
  id,
  data,
  selected,
}: NodeProps<EquipmentNodeType>) {
  const symbol = getSymbol(data.symbolId);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const setNodeBounds = useStore((s) => s.setNodeBounds);

  // Captured at resize start so Alt-resize can scale about the original center.
  const resizeStart = useRef<{ x: number; y: number; w: number; h: number } | null>(
    null,
  );

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(data.label);

  const startEdit = () => {
    setDraft(data.label);
    setEditing(true);
  };
  const commit = () => {
    const value = draft.trim();
    if (value) updateNodeData(id, { label: value });
    setEditing(false);
  };
  const onLabelKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditing(false);
    }
  };

  return (
    <div
      className="equip-node"
      onDoubleClick={(e) => {
        e.stopPropagation();
        startEdit();
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_SIZE}
        minHeight={MIN_SIZE}
        lineClassName="equip-resize-line"
        handleClassName="equip-resize-handle"
        onResizeStart={(_, p) => {
          resizeStart.current = { x: p.x, y: p.y, w: p.width, h: p.height };
        }}
        shouldResize={(e, p) => {
          // Default (no Alt) = one-sided resize handled by React Flow.
          const alt = (e.sourceEvent as MouseEvent).altKey;
          const start = resizeStart.current;
          if (!alt || !start) return true;
          // Alt = symmetric: mirror the change across the original center.
          const w = Math.max(MIN_SIZE, start.w + 2 * (p.width - start.w));
          const h = Math.max(MIN_SIZE, start.h + 2 * (p.height - start.h));
          setNodeBounds(
            id,
            start.x + start.w / 2 - w / 2,
            start.y + start.h / 2 - h / 2,
            w,
            h,
          );
          return false;
        }}
      />

      <Handle id="t" type="source" position={Position.Top} className="equip-port" />
      <Handle id="r" type="source" position={Position.Right} className="equip-port" />
      <Handle id="b" type="source" position={Position.Bottom} className="equip-port" />
      <Handle id="l" type="source" position={Position.Left} className="equip-port" />

      <div
        className="equip-symbol"
        style={{ transform: `rotate(${data.rotation}deg)` }}
      >
        {symbol ? (
          <svg
            viewBox={symbol.viewBox}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            style={SYMBOL_STYLE}
            dangerouslySetInnerHTML={{ __html: symbol.svg }}
          />
        ) : (
          <div className="equip-missing">?</div>
        )}
      </div>

      {editing ? (
        <input
          className="equip-label-input nodrag nopan nowheel"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onLabelKey}
          onDoubleClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="equip-label">{data.label}</div>
      )}
    </div>
  );
}

export default memo(EquipmentNodeComponent);
