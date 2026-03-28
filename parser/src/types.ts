// ===== Intermediate representations (internal to parser) =====

export interface ParsedRoute {
  path: string;
  componentName: string;
  componentFilePath: string;
  isDynamic: boolean;
  isIndex: boolean;
  isLayout: boolean;
  isOptionalCatchAll?: boolean;
  parentPath?: string;
  children?: ParsedRoute[];
  /** Whether this route is wrapped in an auth guard */
  isProtected?: boolean;
  /** Guard component name (e.g., "ProtectedRoute", "Authenticated") */
  guardName?: string;
  /** Whether the route component is lazy-loaded */
  isLazy?: boolean;
  /** Whether the component is a client component ('use client') */
  isClientComponent?: boolean;
  /** Layout pattern used (Pages Router only) */
  layoutPattern?: 'getLayout' | 'inline' | 'pageWrapper';
  /** Special Next.js App Router files present at this route segment */
  specialFiles?: {
    loading?: string;
    error?: string;
    globalError?: string;
    notFound?: string;
    template?: string;
    forbidden?: string;
    unauthorized?: string;
  };
}

export interface DetectedLink {
  sourceFilePath: string;
  sourceRoutePath: string;
  sourceLine: number;
  sourceColumn: number;
  triggerType: 'link' | 'programmatic';
  targetPath: string;
  labelHint: string;
}

// ===== Output types (consumed by canvas) =====

export interface ScreenNode {
  id: string;
  routePath: string;
  componentName: string;
  componentFilePath: string;
  isIndex: boolean;
  isDynamic: boolean;
  parentLayoutId?: string;
  position: { x: number; y: number };
  /** Whether this route is behind an auth guard */
  isProtected?: boolean;
  /** Whether the route is lazy-loaded */
  isLazy?: boolean;
  /** Whether the component is a client component ('use client') */
  isClientComponent?: boolean;
  /** Layout pattern (Pages Router) */
  layoutPattern?: 'getLayout' | 'inline' | 'pageWrapper';
}

export interface FlowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  triggerType: 'link' | 'programmatic' | 'state';
  triggerLabel: string;
  sourceCodeLocation: {
    file: string;
    line: number;
    column: number;
  };
}

export interface FlowGraph {
  nodes: ScreenNode[];
  edges: FlowEdge[];
  stateScreens: DetectedStateScreen[];
  metadata: {
    projectName: string;
    framework: 'react-router' | 'react-router-v7' | 'nextjs-app' | 'nextjs-pages';
    generatedAt: string;
    mappdVersion: string;
  };
}

export interface DetectedStateScreen {
  parentRoutePath: string;
  parentComponentFile: string;
  name: string;
  hookType: 'useState' | 'useReducer' | 'xstate' | 'zustand' | 'redux' | 'url';
  hookIndex: number;
  stateValue: string | number | boolean;
  componentName: string;
  confidence: 'high' | 'medium' | 'low';
  sourceLine: number;
  sourceColumn: number;
}

export type Framework = 'react-router' | 'react-router-v7' | 'nextjs-app' | 'nextjs-pages';

export interface FrameworkDetection {
  framework: Framework;
  entryPoints: string[];
  projectRoot?: string; // For monorepos: the sub-package directory
}
