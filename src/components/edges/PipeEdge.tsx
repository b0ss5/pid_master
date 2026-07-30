import {
  memo,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
  type XYPosition,
} from '@xyflow/react';
import type { PipeEdge as PipeEdgeType } from '../../types';
import { GRID, useStore } from '../../store/useStore';

/** Corner rounding of a routed pipe, in flow units. */
const RADIUS = 8;

const snap = (v: number) => Math.round(v / GRID) * GRID;

/** A polyline through `points` with rounded corners — the routed pipe path. */
function roundedPath(points: XYPosition[]): string {
  if (points.length < 2) return '';
  const parts = [`M ${points[0].x},${points[0].y}`];

  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const corner = points[i];
    const next = points[i + 1];

    // Pull back from the corner along both legs, then arc between the two
    // pull-back points. Short legs clamp the radius so corners never overshoot.
    const back = trim(corner, prev);
    const fwd = trim(corner, next);
    parts.push(`L ${back.x},${back.y}`);
    parts.push(`Q ${corner.x},${corner.y} ${fwd.x},${fwd.y}`);
  }

  const end = points[points.length - 1];
  parts.push(`L ${end.x},${end.y}`);
  return parts.join(' ');
}

/** A point `RADIUS` back from `corner` toward `toward` (clamped to halfway). */
function trim(corner: XYPosition, toward: XYPosition): XYPosition {
  const dx = toward.x - corner.x;
  const dy = toward.y - corner.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return corner;
  const r = Math.min(RADIUS, len / 2);
  return { x: corner.x + (dx / len) * r, y: corner.y + (dy / len) * r };
}

const midpoint = (a: XYPosition, b: XYPosition): XYPosition => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

/**
 * A pipe whose route the user can edit by dragging. Each bend in
 * `data.waypoints` gets a handle; the hollow handle at the middle of every
 * segment adds a new bend when dragged. Double-click a bend to remove it.
 *
 * With no waypoints the pipe auto-routes as a smoothstep path, exactly as it
 * did before it was editable.
 */
function PipeEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
  style,
}: EdgeProps<PipeEdgeType>) {
  const { screenToFlowPosition } = useReactFlow();
  const setPipeWaypoints = useStore((s) => s.setPipeWaypoints);
  const waypoints = data?.waypoints ?? [];

  const source = { x: sourceX, y: sourceY };
  const target = { x: targetX, y: targetY };

  let path: string;
  let handles: { at: number; point: XYPosition; insert: boolean }[];

  if (waypoints.length === 0) {
    const [auto, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: RADIUS,
    });
    path = auto;
    // One grab point at the middle of the auto route: dragging it takes the
    // pipe off auto-routing and into an explicit bend.
    handles = [{ at: 0, point: { x: labelX, y: labelY }, insert: true }];
  } else {
    const points = [source, ...waypoints, target];
    path = roundedPath(points);
    handles = waypoints.map((point, i) => ({ at: i, point, insert: false }));
    for (let i = 0; i < points.length - 1; i += 1) {
      handles.push({
        at: i,
        point: midpoint(points[i], points[i + 1]),
        insert: true,
      });
    }
  }

  const startDrag = (
    event: ReactPointerEvent,
    at: number,
    insert: boolean,
  ) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();

    const toFlow = (e: { clientX: number; clientY: number }, alt: boolean) => {
      const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      return alt ? p : { x: snap(p.x), y: snap(p.y) };
    };

    // An insert handle materialises its bend on the first press, so the rest of
    // the gesture is an ordinary waypoint drag.
    const base = [...waypoints];
    if (insert) base.splice(at, 0, toFlow(event, event.altKey));

    const move = (e: PointerEvent) => {
      const next = [...base];
      next[at] = toFlow(e, e.altKey);
      setPipeWaypoints(id, next);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);

    setPipeWaypoints(id, base);
  };

  const removeWaypoint = (event: ReactMouseEvent, at: number) => {
    event.stopPropagation();
    setPipeWaypoints(
      id,
      waypoints.filter((_, i) => i !== at),
    );
  };

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
      {selected && (
        <EdgeLabelRenderer>
          {handles.map(({ at, point, insert }) => (
            <div
              key={`${insert ? 'add' : 'pt'}-${at}`}
              className={`pipe-handle nodrag nopan${insert ? ' insert' : ''}`}
              style={{
                transform: `translate(-50%, -50%) translate(${point.x}px, ${point.y}px)`,
              }}
              title={
                insert ? 'Drag to bend the pipe' : 'Drag to move · double-click to remove'
              }
              onPointerDown={(e) => startDrag(e, at, insert)}
              onDoubleClick={(e) => !insert && removeWaypoint(e, at)}
            />
          ))}
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(PipeEdgeComponent);
