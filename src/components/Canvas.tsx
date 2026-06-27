import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
} from 'react';
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  SelectionMode,
  useReactFlow,
  type Node,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import { useStore } from '../store/useStore';
import EquipmentNode from './nodes/EquipmentNode';

const nodeTypes = { equipment: EquipmentNode };

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  );
}

export default function Canvas() {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const theme = useStore((s) => s.theme);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const onEdgesChange = useStore((s) => s.onEdgesChange);
  const onConnect = useStore((s) => s.onConnect);
  const addNode = useStore((s) => s.addNode);
  const setSelection = useStore((s) => s.setSelection);
  const duplicateNodeInPlace = useStore((s) => s.duplicateNodeInPlace);

  const { screenToFlowPosition, fitView } = useReactFlow();

  // Alt = smooth (un-snapped) drag; f = fit view.
  const [altPressed, setAltPressed] = useState(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setAltPressed(true);
      } else if (
        (e.key === 'f' || e.key === 'F') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !isEditableTarget(e.target)
      ) {
        e.preventDefault();
        fitView({ padding: 0.2, duration: 300 });
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setAltPressed(false);
    };
    const reset = () => setAltPressed(false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', reset);
    };
  }, [fitView]);

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

  // Ctrl/Cmd-drag a node to leave a duplicate behind. (DOM event, not React's.)
  const onNodeDragStart = useCallback(
    (event: globalThis.MouseEvent | TouchEvent, node: Node) => {
      if (event.ctrlKey || event.metaKey) duplicateNodeInPlace(node.id);
    },
    [duplicateNodeInPlace],
  );

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
        onNodeDragStart={onNodeDragStart}
        onSelectionChange={onSelectionChange}
        connectionMode={ConnectionMode.Loose}
        colorMode={theme}
        deleteKeyCode={['Delete', 'Backspace']}
        multiSelectionKeyCode="Shift"
        defaultEdgeOptions={{ type: 'smoothstep' }}
        panOnDrag={[1]}
        selectionOnDrag
        selectionKeyCode={null}
        selectionMode={selectionMode}
        minZoom={0.1}
        maxZoom={4}
        fitView
        snapToGrid={!altPressed}
        snapGrid={[8, 8]}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap pannable zoomable nodeStrokeWidth={3} />
      </ReactFlow>
    </div>
  );
}
