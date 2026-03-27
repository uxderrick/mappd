import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Browser } from '@phosphor-icons/react';

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
              <Browser size={12} className="fc-sl-icon" />
              <span className="fc-sl-route">{s.routePath}</span>
            </div>
            <span className="fc-sl-component">{s.componentName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
