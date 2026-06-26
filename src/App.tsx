import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './styles/index.css';
import Toolbar from './components/Toolbar';
import Palette from './components/Palette';
import Canvas from './components/Canvas';
import RightPanel from './components/RightPanel';
import { useStore } from './store/useStore';

export default function App() {
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <ReactFlowProvider>
      <div className="app">
        <Toolbar />
        <div className="workspace">
          <Palette />
          <Canvas />
          <RightPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
