import { memo, type CSSProperties } from 'react';
import {
  Handle,
  NodeResizer,
  Position,
  type NodeProps,
} from '@xyflow/react';
import type { EquipmentNode as EquipmentNodeType } from '../../types';
import { getSymbol } from '../../lib/symbols';

const SYMBOL_STYLE: CSSProperties = {
  stroke: 'currentColor',
  fill: 'none',
  strokeWidth: 4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/**
 * A single piece of equipment on the canvas. Renders the library SVG, exposes
 * four connection ports (loose connection mode lets any port link to any
 * other), and shows resize handles when selected.
 */
function EquipmentNodeComponent({ data, selected }: NodeProps<EquipmentNodeType>) {
  const symbol = getSymbol(data.symbolId);

  return (
    <div className="equip-node">
      <NodeResizer
        isVisible={selected}
        minWidth={28}
        minHeight={28}
        lineClassName="equip-resize-line"
        handleClassName="equip-resize-handle"
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
            viewBox="0 0 100 100"
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

      <div className="equip-label">{data.label}</div>
    </div>
  );
}

export default memo(EquipmentNodeComponent);
