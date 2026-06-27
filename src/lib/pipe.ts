import type { PipeData } from '../types';

/** Default data for a freshly drawn pipe. */
export function createPipeData(): PipeData {
  return {
    tag: '',
    material: '',
    innerDiameter: null,
    outerDiameter: null,
    thickness: null,
    solveFor: 'od',
    manufacturer: '',
    partNumber: '',
    notes: '',
  };
}

const round = (v: number) => Math.round(v * 1000) / 1000;
const isNum = (v: number | null): v is number => v != null && !Number.isNaN(v);

/**
 * Enforce OD = ID + 2·thickness. The dimension named by `solveFor` is derived
 * from the other two when both are known; otherwise the data is returned
 * unchanged. This is what makes "any 2 of 3 constrain the last".
 */
export function recomputePipe(d: PipeData): PipeData {
  const { innerDiameter: id, outerDiameter: od, thickness: th, solveFor } = d;
  if (solveFor === 'od' && isNum(id) && isNum(th)) {
    return { ...d, outerDiameter: round(id + 2 * th) };
  }
  if (solveFor === 'id' && isNum(od) && isNum(th)) {
    return { ...d, innerDiameter: round(od - 2 * th) };
  }
  if (solveFor === 'thickness' && isNum(id) && isNum(od)) {
    return { ...d, thickness: round((od - id) / 2) };
  }
  return d;
}

/** A short human-readable size summary used in the BOM, e.g. "OD 60.3 · t 3.9". */
export function pipeSizeLabel(d: PipeData): string {
  const parts: string[] = [];
  if (isNum(d.outerDiameter)) parts.push(`OD ${d.outerDiameter}`);
  if (isNum(d.innerDiameter)) parts.push(`ID ${d.innerDiameter}`);
  if (isNum(d.thickness)) parts.push(`t ${d.thickness}`);
  return parts.join(' · ');
}
