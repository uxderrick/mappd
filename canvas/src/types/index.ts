export interface PinnedAuth {
  isLoggedIn: boolean;
  username?: string;
  role?: string;
  token?: string;
}

export interface PinnedState {
  urlParams?: Record<string, string>;
  auth?: PinnedAuth;
}

export interface ScreenNodeData {
  routePath: string;
  componentName: string;
  iframeSrc: string;
  isActive?: boolean;
  screenshotUrl?: string;
  zoomLevel?: number;
  canGoLive?: boolean;
  nodeId?: string;
  pinnedState?: PinnedState;
  hasPinnedState?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  forceLive?: boolean;
  reloadKey?: number;
  hugContent?: boolean;
  scrollHeight?: number;
  hideLabel?: boolean;
  onDoubleClick?: (nodeId: string) => void;
  onRequestLoad?: (nodeId: string) => void;
  onIframeLoaded?: (nodeId: string) => void;
  onOpenPinEditor?: (nodeId: string) => void;
  onSendPinToIframe?: (nodeId: string, iframe: HTMLIFrameElement) => void;
  devToolsState?: DevToolsNodeState;
  onClearConsole?: (nodeId: string) => void;
  onClearNetwork?: (nodeId: string) => void;
  onRequestStorage?: (iframe: HTMLIFrameElement) => void;
  [key: string]: unknown;
}

export interface MappdMessage {
  type: 'fc-navigate';
  from: string;
  to: string;
  data?: Record<string, any>;
}

// --- DevTools types ---

export type ConsoleLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

export interface DevToolsConsoleEntry {
  id: string;
  level: ConsoleLevel;
  args: string[];
  timestamp: number;
}

export interface DevToolsNetworkEntry {
  id: string;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  duration?: number;
  size?: number;
  requestBody?: string;
  responseBody?: string;
  error?: string;
  startTime: number;
  completed: boolean;
}

export interface DevToolsStorageSnapshot {
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  cookies: string;
  capturedAt: number;
}

export interface DevToolsNodeState {
  console: DevToolsConsoleEntry[];
  network: DevToolsNetworkEntry[];
  storage: DevToolsStorageSnapshot | null;
}
