import { useCallback, useMemo, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Browser, CaretDown, MagnifyingGlass, FolderOpen } from '@phosphor-icons/react';

interface ScreenItem {
  id: string;
  routePath: string;
  componentName: string;
}

interface RouteGroup {
  prefix: string;
  label: string;
  screens: ScreenItem[];
}

interface ScreenListPanelProps {
  screens: ScreenItem[];
  activeNodeId: string | null;
  onSelect: (nodeId: string) => void;
}

/**
 * Group screens by their first path segment.
 * / → "root", /login → "root", /dashboard/* → "dashboard", etc.
 */
function groupScreens(screens: ScreenItem[]): RouteGroup[] {
  const groups = new Map<string, ScreenItem[]>();

  for (const screen of screens) {
    const parts = screen.routePath.split('/').filter(Boolean);
    const prefix = parts.length === 0 ? 'root' : parts[0] === '*' ? 'other' : parts[0];
    const existing = groups.get(prefix) ?? [];
    existing.push(screen);
    groups.set(prefix, existing);
  }

  // Sort: root first, then alphabetically, "other" last
  const sorted = [...groups.entries()].sort(([a], [b]) => {
    if (a === 'root') return -1;
    if (b === 'root') return 1;
    if (a === 'other') return 1;
    if (b === 'other') return -1;
    return a.localeCompare(b);
  });

  return sorted.map(([prefix, screens]) => ({
    prefix,
    label: prefix === 'root' ? '/' : `/${prefix}`,
    screens,
  }));
}

export default function ScreenListPanel({
  screens,
  activeNodeId,
  onSelect,
}: ScreenListPanelProps) {
  const { fitView } = useReactFlow();
  const [search, setSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const handleClick = useCallback(
    (nodeId: string) => {
      onSelect(nodeId);
      fitView({ nodes: [{ id: nodeId }], duration: 600, padding: 0.5, maxZoom: 1.5 });
    },
    [onSelect, fitView]
  );

  const toggleGroup = useCallback((prefix: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(prefix)) next.delete(prefix);
      else next.add(prefix);
      return next;
    });
  }, []);

  // Filter screens by search query
  const filteredScreens = useMemo(() => {
    if (!search.trim()) return screens;
    const q = search.toLowerCase();
    return screens.filter(
      (s) => s.routePath.toLowerCase().includes(q) || s.componentName.toLowerCase().includes(q)
    );
  }, [screens, search]);

  // Group filtered screens
  const groups = useMemo(() => groupScreens(filteredScreens), [filteredScreens]);

  // Don't group if there are few routes or search is active
  const useGroups = screens.length > 8 && !search.trim();

  return (
    <div className="fc-screen-list">
      <div className="fc-sl-header">
        <span className="fc-sl-title">Screens</span>
        <span className="fc-sl-count">{screens.length}</span>
      </div>

      {/* Search */}
      <div className="fc-sl-search">
        <MagnifyingGlass size={12} className="fc-sl-search-icon" />
        <input
          className="fc-sl-search-input"
          type="text"
          placeholder="Filter routes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="fc-sl-body">
        {useGroups ? (
          // Grouped view
          groups.map((group) => (
            <div key={group.prefix} className="fc-sl-group">
              <button
                className="fc-sl-group-header"
                onClick={() => toggleGroup(group.prefix)}
              >
                <CaretDown
                  size={10}
                  className={`fc-sl-group-chevron ${collapsedGroups.has(group.prefix) ? '' : 'is-open'}`}
                />
                <FolderOpen size={12} className="fc-sl-group-icon" />
                <span className="fc-sl-group-label">{group.label}</span>
                <span className="fc-sl-group-count">{group.screens.length}</span>
              </button>
              {!collapsedGroups.has(group.prefix) && (
                <div className="fc-sl-group-items">
                  {group.screens.map((s) => (
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
              )}
            </div>
          ))
        ) : (
          // Flat view (few routes or searching)
          filteredScreens.map((s) => (
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
          ))
        )}

        {filteredScreens.length === 0 && search && (
          <div className="fc-sl-empty">No routes match "{search}"</div>
        )}
      </div>
    </div>
  );
}
