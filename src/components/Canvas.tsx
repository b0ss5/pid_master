import { useCallback, type DragEvent } from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import { useStore } from '../store/useStore';
import EquipmentNode from './nodes/EquipmentNode';

const nodeTypes = { equipment: EquipmentNode };

export default function Canvas() {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const theme = useStore((s) => s.theme);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const onEdgesChange = useStore((s) => s.onEdgesChange);
  const onConnect = useStore((s) => s.onConnect);
  const addNode = useStore((s) => s.addNode);
  const setSelected = useStore((s) => s.setSelected);

  const { screenToFlowPosition } = useReactFlow();

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const symbolId = event.dataTransfer.getData('application/pid-symbol');
      if (!symbolId) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(symbolId, position);
    },
    [screenToFlowPosition, addNode],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      setSelected(selectedNodes.length === 1 ? selectedNodes[0].id : null);
    },
    [setSelected],
  );

  return (
    <div className="canvas" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        connectionMode={ConnectionMode.Loose}
        colorMode={theme}
        deleteKeyCode={['Delete', 'Backspace']}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        minZoom={0.1}
        maxZoom={4}
        fitView
        snapToGrid
        snapGrid={[8, 8]}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap pannable zoomable nodeStrokeWidth={3} />
      </ReactFlow>
    </div>
  );
}
