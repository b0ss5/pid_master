import { toPng, toSvg } from 'html-to-image';
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { jsPDF } from 'jspdf';
import type { Edge } from '@xyflow/react';
import type { EquipmentNode, PidDocument } from '../types';

const VIEWPORT_SELECTOR = '.react-flow__viewport';

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function stamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
}

/* ---- Native project format (.pidproj) -------------------------------- */

export function saveProject(nodes: EquipmentNode[], edges: Edge[]): void {
  const doc: PidDocument = {
    app: 'pid_master',
    version: 1,
    savedAt: new Date().toISOString(),
    nodes,
    edges,
  };
  const blob = new Blob([JSON.stringify(doc, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `pid-master-${stamp()}.pidproj`);
  URL.revokeObjectURL(url);
}

export function openProject(file: File): Promise<PidDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const doc = JSON.parse(String(reader.result)) as PidDocument;
        if (doc.app !== 'pid_master') {
          throw new Error('Not a PID Master project file.');
        }
        resolve(doc);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/* ---- Raster / vector image export ------------------------------------ */

interface ImageOptions {
  background: string;
  scale?: number;
  padding?: number;
}

async function renderViewport(
  format: 'png' | 'svg',
  nodes: EquipmentNode[],
  { background, scale = 2, padding = 0.12 }: ImageOptions,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const viewportEl = document.querySelector<HTMLElement>(VIEWPORT_SELECTOR);
  if (!viewportEl) throw new Error('Canvas viewport not found.');

  const bounds = getNodesBounds(nodes);
  const contentW = Math.max(bounds.width, 100);
  const contentH = Math.max(bounds.height, 100);
  const width = Math.round(contentW * (1 + padding * 2) * scale);
  const height = Math.round(contentH * (1 + padding * 2) * scale);
  const viewport = getViewportForBounds(bounds, width, height, 0.1, 4, padding);

  const options = {
    backgroundColor: background,
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
    pixelRatio: 1,
  };

  const dataUrl =
    format === 'svg'
      ? await toSvg(viewportEl, options)
      : await toPng(viewportEl, options);
  return { dataUrl, width, height };
}

export async function exportImage(
  format: 'png' | 'svg',
  nodes: EquipmentNode[],
  opts: ImageOptions,
): Promise<void> {
  if (nodes.length === 0) throw new Error('Nothing to export — canvas is empty.');
  const { dataUrl } = await renderViewport(format, nodes, opts);
  triggerDownload(dataUrl, `pid-master-${stamp()}.${format}`);
}

export async function exportPDF(
  nodes: EquipmentNode[],
  opts: ImageOptions,
): Promise<void> {
  if (nodes.length === 0) throw new Error('Nothing to export — canvas is empty.');
  const { dataUrl, width, height } = await renderViewport('png', nodes, {
    ...opts,
    scale: opts.scale ?? 2.5,
  });

  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
    compress: true,
  });
  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
  pdf.save(`pid-master-${stamp()}.pdf`);
}

/* ---- BOM CSV --------------------------------------------------------- */

export interface BomRow {
  tag: string;
  description: string;
  manufacturer: string;
  partNumber: string;
  quantity: number;
}

export function exportBomCsv(rows: BomRow[]): void {
  const header = ['Tag', 'Description', 'Manufacturer', 'Part Number', 'Qty'];
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [r.tag, r.description, r.manufacturer, r.partNumber, r.quantity]
        .map(escape)
        .join(','),
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `pid-master-bom-${stamp()}.csv`);
  URL.revokeObjectURL(url);
}
