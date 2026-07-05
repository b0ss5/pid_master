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

  const { screenToFlowPosition, fitView, getViewport, setViewport } =
    useReactFlow();

  // Trackpad two-finger scroll pans (panOnScroll) and pinch zooms
  // (zoomOnPinch) — maps.app style. A discrete mouse wheel, however, should
  // zoom. Both gestures arrive as `wheel` events, so we sniff the wheel and,
  // when it looks like a real mouse wheel, intercept it (capture phase, before
  // React Flow's pan handler) and zoom toward the cursor instead.
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Pinch-zoom sets ctrlKey — leave it to React Flow's zoomOnPinch.
      if (e.ctrlKey) return;
      // Line/page deltas are classic mouse wheels; otherwise treat a clean,
      // vertical-only, integer tick as a wheel and everything else (fractional
      // momentum, any horizontal component, fine deltas) as a trackpad pan.
      const isMouseWheel =
        e.deltaMode !== 0 ||
        (e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40);
      if (!isMouseWheel) return;

      // Hijack the wheel before React Flow pans, and zoom about the pointer.
      e.preventDefault();
      e.stopPropagation();

      const { x, y, zoom } = getViewport();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const factor = Math.exp(-e.deltaY * 0.002);
      const nextZoom = Math.min(4, Math.max(0.1, zoom * factor));
      const ratio = nextZoom / zoom;

      // Keep the flow point under the cursor pinned while zooming.
      setViewport({
        x: px - (px - x) * ratio,
        y: py - (py - y) * ratio,
        zoom: nextZoom,
      });
    };

    el.addEventListener('wheel', onWheel, { capture: true, passive: false });
    return () => el.removeEventListener('wheel', onWheel, { capture: true });
  }, [getViewport, setViewport]);

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
      ref={wrapperRef}
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
        panOnScroll
        zoomOnScroll={false}
        zoomOnPinch
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
