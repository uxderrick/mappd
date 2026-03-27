import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

interface ScreenItem {
  id: string;
  routePath: string;
  componentName: string;
}

interface ScreenListPanelProps {
  screens: ScreenItem[];
  activeNodeId: string | null;
  onSelect: (nodeId: string) => void;
}

export default function ScreenListPanel({
  screens,
  activeNodeId,
  onSelect,
}: ScreenListPanelProps) {
  const { fitView } = useReactFlow();

  const handleClick = useCallback(
    (nodeId: string) => {
      onSelect(nodeId);
      fitView({ nodes: [{ id: nodeId }], duration: 600, padding: 0.5, maxZoom: 1.5 });
    },
    [onSelect, fitView]
  );

  return (
    <div className="fc-screen-list">
      <div className="fc-sl-header">
        <span className="fc-sl-title">Screens</span>
        <span className="fc-sl-count">{screens.length}</span>
      </div>
      <div className="fc-sl-body">
        {screens.map((s) => (
          <button
            key={s.id}
            className={`fc-sl-item ${s.id === activeNodeId ? 'is-active' : ''}`}
            onClick={() => handleClick(s.id)}
          >
            <div className="fc-sl-item-row">
              <svg className="fc-sl-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              <span className="fc-sl-route">{s.routePath}</span>
            </div>
            <span className="fc-sl-component">{s.componentName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
