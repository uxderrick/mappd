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
  hookType: 'useState' | 'useReducer' | 'xstate' | 'zustand';
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
}
