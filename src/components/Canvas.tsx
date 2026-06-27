import { useCallback, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  SelectionMode,
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
  const setSelection = useStore((s) => s.setSelection);

  const { screenToFlowPosition } = useReactFlow();

  // Direction-aware box selection: drag right = window (fully enclosed, blue),
  // drag left = crossing (touch, green) — mirroring CAD tools.
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(
    SelectionMode.Partial,
  );
  const [selectDir, setSelectDir] = useState<'right' | 'left' | null>(null);
  const dragStartX = useRef<number | null>(null);

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

  const onPaneMouseDown = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (event.button === 0 && target.classList.contains('react-flow__pane')) {
      dragStartX.current = event.clientX;
      setSelectDir('right');
      setSelectionMode(SelectionMode.Full);
    }
  }, []);

  const onCanvasMouseMove = useCallback((event: MouseEvent) => {
    if (dragStartX.current === null) return;
    const dir = event.clientX >= dragStartX.current ? 'right' : 'left';
    setSelectDir(dir);
    setSelectionMode(dir === 'right' ? SelectionMode.Full : SelectionMode.Partial);
  }, []);

  const endBoxSelect = useCallback(() => {
    dragStartX.current = null;
    setSelectDir(null);
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes: selNodes, edges: selEdges }: OnSelectionChangeParams) => {
      const nodeId = selNodes.length === 1 ? selNodes[0].id : null;
      const edgeId =
        selNodes.length === 0 && selEdges.length === 1 ? selEdges[0].id : null;
      setSelection(nodeId, edgeId);
    },
    [setSelection],
  );

  return (
    <div
      className="canvas"
      data-seldir={selectDir ?? undefined}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onMouseDownCapture={onPaneMouseDown}
      onMouseMove={onCanvasMouseMove}
      onMouseUp={endBoxSelect}
      onMouseLeave={endBoxSelect}
    >
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
        panOnDrag={[1]}
        selectionOnDrag
        selectionKeyCode={null}
        selectionMode={selectionMode}
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
