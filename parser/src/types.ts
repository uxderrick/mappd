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
  metadata: {
    projectName: string;
    framework: 'react-router' | 'nextjs-app' | 'nextjs-pages';
    generatedAt: string;
    mappdVersion: string;
  };
}

export type Framework = 'react-router' | 'nextjs-app' | 'nextjs-pages';

export interface FrameworkDetection {
  framework: Framework;
  entryPoints: string[];
}
