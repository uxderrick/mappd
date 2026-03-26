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
  onRequestLoad?: (nodeId: string) => void;
  onIframeLoaded?: (nodeId: string) => void;
  onOpenPinEditor?: (nodeId: string) => void;
  onSendPinToIframe?: (nodeId: string, iframe: HTMLIFrameElement) => void;
  [key: string]: unknown;
}

export interface MappdMessage {
  type: 'fc-navigate';
  from: string;
  to: string;
  data?: Record<string, any>;
}
