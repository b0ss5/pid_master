import { useState, type ReactNode } from 'react';
import { ListChecks, SlidersHorizontal, Table2 } from 'lucide-react';
import PropertiesPanel from './PropertiesPanel';
import BomPanel from './BomPanel';
import AnalysisPanel from './AnalysisPanel';

type Tab = 'properties' | 'bom' | 'analysis';

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'properties', label: 'Properties', icon: <SlidersHorizontal size={15} /> },
  { id: 'bom', label: 'BOM', icon: <Table2 size={15} /> },
  { id: 'analysis', label: 'Analysis', icon: <ListChecks size={15} /> },
];

export default function RightPanel() {
  const [tab, setTab] = useState<Tab>('properties');

  return (
    <aside className="right-panel">
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <div className="tab-body">
        {tab === 'properties' && <PropertiesPanel />}
        {tab === 'bom' && <BomPanel />}
        {tab === 'analysis' && <AnalysisPanel />}
      </div>
    </aside>
  );
}
