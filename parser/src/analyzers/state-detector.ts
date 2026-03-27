import _traverse from '@babel/traverse';
const traverse = (_traverse as any).default ?? _traverse;
import * as t from '@babel/types';
import { parseFile } from './ast-utils.js';
import type { DetectedStateScreen } from '../types.js';

// ===== Internal tracking types =====

interface TrackedUseState {
  hookIndex: number;
  varName: string;
  initType: 'boolean' | 'number' | 'string';
  initValue: boolean | number | string;
}

interface TrackedUseReducer {
  hookIndex: number;
  stateVarName: string;
}

interface TrackedStateMachine {
  hookIndex: number;
  varName: string;
  type: 'xstate' | 'zustand';
}

interface ConditionalRender {
  /** The identifier being compared (e.g., "step", "view", "show") */
  varName: string;
  /** For member expressions like state.step, the full path */
  memberPath: string | null;
  /** The comparison value — null for bare boolean checks */
  comparisonValue: string | number | boolean | null;
  /** The JSX component name rendered in the conditional branch */
  componentName: string;
  /** Source location */
  line: number;
  column: number;
  /** Rough size indicator for the JSX content (character count estimate) */
  jsxSize: number;
}

/**
 * Scan a React component file for state-driven screen patterns.
 * Detects useState, useReducer, XState (useMachine), and Zustand (useStore)
 * patterns that control conditional rendering of screen-level components.
 */
export function detectStateScreens(
  filePath: string,
  routePath: string,
): DetectedStateScreen[] {
  const ast = parseFile(filePath);

  // ===== Collection phase =====

  const useStateVars: TrackedUseState[] = [];
  const useReducerVars: TrackedUseReducer[] = [];
  const stateMachineVars: TrackedStateMachine[] = [];
  let hookIndex = 0;

  // Map from variable name to tracked hook info (for quick lookup in detection phase)
  const stateVarNames = new Set<string>();

  const conditionalRenders: ConditionalRender[] = [];

  traverse(ast, {
    // --- Collection: find hook calls ---
    VariableDeclarator(nodePath: any) {
      const init = nodePath.node.init;
      if (!t.isCallExpression(init)) return;

      const callee = init.callee;

      // --- useState ---
      if (t.isIdentifier(callee) && callee.name === 'useState') {
        // Expect: const [x, setX] = useState(initValue)
        if (!t.isArrayPattern(nodePath.node.id)) return;
        const elements = nodePath.node.id.elements;
        if (!elements[0] || !t.isIdentifier(elements[0])) return;

        const varName = elements[0].name;
        const firstArg = init.arguments[0];

        let initType: TrackedUseState['initType'] | null = null;
        let initValue: boolean | number | string | null = null;

        if (t.isBooleanLiteral(firstArg)) {
          initType = 'boolean';
          initValue = firstArg.value;
        } else if (t.isNumericLiteral(firstArg)) {
          initType = 'number';
          initValue = firstArg.value;
        } else if (t.isStringLiteral(firstArg)) {
          initType = 'string';
          initValue = firstArg.value;
        }

        if (initType !== null && initValue !== null) {
          useStateVars.push({ hookIndex, varName, initType, initValue });
          stateVarNames.add(varName);
        }

        hookIndex++;
        return;
      }

      // --- useReducer ---
      if (t.isIdentifier(callee) && callee.name === 'useReducer') {
        if (!t.isArrayPattern(nodePath.node.id)) return;
        const elements = nodePath.node.id.elements;
        if (!elements[0] || !t.isIdentifier(elements[0])) return;

        const stateVarName = elements[0].name;
        useReducerVars.push({ hookIndex, stateVarName });
        stateVarNames.add(stateVarName);

        hookIndex++;
        return;
      }

      // --- useMachine (XState) ---
      if (t.isIdentifier(callee) && callee.name === 'useMachine') {
        // Expect: const [state] = useMachine(...) or const [state, send] = useMachine(...)
        let varName: string | null = null;

        if (t.isArrayPattern(nodePath.node.id)) {
          const first = nodePath.node.id.elements[0];
          if (first && t.isIdentifier(first)) {
            varName = first.name;
          }
        } else if (t.isIdentifier(nodePath.node.id)) {
          varName = nodePath.node.id.name;
        }

        if (varName) {
          stateMachineVars.push({ hookIndex, varName, type: 'xstate' });
          stateVarNames.add(varName);
        }

        hookIndex++;
        return;
      }

      // --- useStore (Zustand) ---
      if (t.isIdentifier(callee) && callee.name === 'useStore') {
        let varName: string | null = null;

        if (t.isIdentifier(nodePath.node.id)) {
          varName = nodePath.node.id.name;
        }

        if (varName) {
          stateMachineVars.push({ hookIndex, varName, type: 'zustand' });
          stateVarNames.add(varName);
        }

        hookIndex++;
        return;
      }

      // Also count other hooks for correct hookIndex tracking
      if (
        t.isIdentifier(callee) &&
        callee.name.startsWith('use') &&
        callee.name.length > 3 &&
        callee.name[3] === callee.name[3].toUpperCase()
      ) {
        hookIndex++;
      }
    },

    // --- Detection: find conditional JSX renders ---

    // {x && <Component />} — LogicalExpression
    LogicalExpression(nodePath: any) {
      if (nodePath.node.operator !== '&&') return;

      const condition = nodePath.node.left;
      const consequent = nodePath.node.right;

      const jsxInfo = extractJSXComponentInfo(consequent);
      if (!jsxInfo) return;

      const condInfo = extractConditionInfo(condition, stateVarNames);
      if (!condInfo) return;

      conditionalRenders.push({
        varName: condInfo.varName,
        memberPath: condInfo.memberPath,
        comparisonValue: condInfo.comparisonValue,
        componentName: jsxInfo.name,
        line: nodePath.node.loc?.start.line ?? 0,
        column: nodePath.node.loc?.start.column ?? 0,
        jsxSize: jsxInfo.estimatedSize,
      });
    },

    // {x ? <A /> : <B />} — ConditionalExpression
    ConditionalExpression(nodePath: any) {
      const test = nodePath.node.test;
      const consequent = nodePath.node.consequent;
      const alternate = nodePath.node.alternate;

      const condInfo = extractConditionInfo(test, stateVarNames);
      if (!condInfo) return;

      // Consequent branch
      const consequentJsx = extractJSXComponentInfo(consequent);
      if (consequentJsx) {
        conditionalRenders.push({
          varName: condInfo.varName,
          memberPath: condInfo.memberPath,
          comparisonValue: condInfo.comparisonValue,
          componentName: consequentJsx.name,
          line: nodePath.node.loc?.start.line ?? 0,
          column: nodePath.node.loc?.start.column ?? 0,
          jsxSize: consequentJsx.estimatedSize,
        });
      }

      // Alternate branch (only if it's JSX, not null)
      const alternateJsx = extractJSXComponentInfo(alternate);
      if (alternateJsx) {
        // For ternary with boolean, the alternate is the "false" case
        let altValue: string | number | boolean | null = null;
        if (condInfo.comparisonValue === true) {
          altValue = false;
        } else if (condInfo.comparisonValue === false) {
          altValue = true;
        }
        // For non-boolean ternary, we can't easily determine the alternate value
        // so we skip creating a conditional render for the alternate

        if (altValue !== null) {
          conditionalRenders.push({
            varName: condInfo.varName,
            memberPath: condInfo.memberPath,
            comparisonValue: altValue,
            componentName: alternateJsx.name,
            line: nodePath.node.loc?.start.line ?? 0,
            column: nodePath.node.loc?.start.column ?? 0,
            jsxSize: alternateJsx.estimatedSize,
          });
        }
      }
    },
  });

  // ===== Scoring and assembly phase =====

  // Group conditional renders by variable name to detect multi-state patterns
  const rendersByVar = new Map<string, ConditionalRender[]>();
  for (const cr of conditionalRenders) {
    const key = cr.memberPath ?? cr.varName;
    const existing = rendersByVar.get(key) ?? [];
    existing.push(cr);
    rendersByVar.set(key, existing);
  }

  const results: DetectedStateScreen[] = [];

  // Process useState patterns
  for (const tracked of useStateVars) {
    const renders = rendersByVar.get(tracked.varName);
    if (!renders || renders.length === 0) continue;

    const isMultiState = renders.length > 1;

    for (const render of renders) {
      const stateValue = render.comparisonValue ?? true;
      const confidence = scoreConfidence(
        tracked.initType,
        isMultiState,
        render.jsxSize,
        false, // not xstate
      );

      results.push({
        parentRoutePath: routePath,
        parentComponentFile: filePath,
        name: deriveScreenName(tracked.varName, stateValue, render.componentName),
        hookType: 'useState',
        hookIndex: tracked.hookIndex,
        stateValue,
        componentName: render.componentName,
        confidence,
        sourceLine: render.line,
        sourceColumn: render.column,
      });
    }
  }

  // Process useReducer patterns
  for (const tracked of useReducerVars) {
    // Check for both direct variable and member expression patterns
    const directRenders = rendersByVar.get(tracked.stateVarName) ?? [];

    // Also collect member expression renders (e.g., state.step)
    const memberRenders: ConditionalRender[] = [];
    for (const [key, renders] of rendersByVar) {
      if (key.startsWith(tracked.stateVarName + '.')) {
        memberRenders.push(...renders);
      }
    }

    const allRenders = [...directRenders, ...memberRenders];
    if (allRenders.length === 0) continue;

    const isMultiState = allRenders.length > 1;

    for (const render of allRenders) {
      const stateValue = render.comparisonValue ?? true;
      const confidence = isMultiState ? 'high' : 'medium';

      results.push({
        parentRoutePath: routePath,
        parentComponentFile: filePath,
        name: deriveScreenName(
          render.memberPath ?? tracked.stateVarName,
          stateValue,
          render.componentName,
        ),
        hookType: 'useReducer',
        hookIndex: tracked.hookIndex,
        stateValue,
        componentName: render.componentName,
        confidence,
        sourceLine: render.line,
        sourceColumn: render.column,
      });
    }
  }

  // Process XState / Zustand patterns
  for (const tracked of stateMachineVars) {
    const directRenders = rendersByVar.get(tracked.varName) ?? [];

    const memberRenders: ConditionalRender[] = [];
    for (const [key, renders] of rendersByVar) {
      if (key.startsWith(tracked.varName + '.')) {
        memberRenders.push(...renders);
      }
    }

    const allRenders = [...directRenders, ...memberRenders];
    if (allRenders.length === 0) continue;

    const isMultiState = allRenders.length > 1;

    for (const render of allRenders) {
      const stateValue = render.comparisonValue ?? true;
      const confidence = scoreConfidence(
        'string', // state machines typically use string states
        isMultiState,
        render.jsxSize,
        tracked.type === 'xstate',
      );

      results.push({
        parentRoutePath: routePath,
        parentComponentFile: filePath,
        name: deriveScreenName(
          render.memberPath ?? tracked.varName,
          stateValue,
          render.componentName,
        ),
        hookType: tracked.type,
        hookIndex: tracked.hookIndex,
        stateValue,
        componentName: render.componentName,
        confidence,
        sourceLine: render.line,
        sourceColumn: render.column,
      });
    }
  }

  return results;
}

// ===== Helpers =====

interface ConditionInfo {
  varName: string;
  memberPath: string | null;
  comparisonValue: string | number | boolean | null;
}

/**
 * Extract state variable and comparison value from a condition expression.
 * Returns null if the condition does not reference a tracked state variable.
 */
function extractConditionInfo(
  node: t.Node,
  trackedVars: Set<string>,
): ConditionInfo | null {
  // Bare identifier: {show && <X />}
  if (t.isIdentifier(node) && trackedVars.has(node.name)) {
    return { varName: node.name, memberPath: null, comparisonValue: true };
  }

  // Unary negation: {!show && <X />}
  if (
    t.isUnaryExpression(node) &&
    node.operator === '!' &&
    t.isIdentifier(node.argument) &&
    trackedVars.has(node.argument.name)
  ) {
    return {
      varName: node.argument.name,
      memberPath: null,
      comparisonValue: false,
    };
  }

  // Binary expression: x === value
  if (
    t.isBinaryExpression(node) &&
    (node.operator === '===' || node.operator === '==')
  ) {
    const info = extractBinaryComparison(node.left, node.right, trackedVars);
    if (info) return info;
  }

  return null;
}

/**
 * Extract variable and value from a binary comparison (left === right).
 * Handles both `varName === literal` and `literal === varName`.
 */
function extractBinaryComparison(
  left: t.Node,
  right: t.Node,
  trackedVars: Set<string>,
): ConditionInfo | null {
  // Try left as variable, right as literal
  const leftInfo = extractVarReference(left, trackedVars);
  const rightValue = extractLiteralValue(right);
  if (leftInfo && rightValue !== undefined) {
    return { ...leftInfo, comparisonValue: rightValue };
  }

  // Try right as variable, left as literal
  const rightInfo = extractVarReference(right, trackedVars);
  const leftValue = extractLiteralValue(left);
  if (rightInfo && leftValue !== undefined) {
    return { ...rightInfo, comparisonValue: leftValue };
  }

  return null;
}

/**
 * Check if a node references a tracked state variable.
 * Handles plain identifiers and member expressions (state.step).
 */
function extractVarReference(
  node: t.Node,
  trackedVars: Set<string>,
): { varName: string; memberPath: string | null } | null {
  // Plain identifier: step, view, show
  if (t.isIdentifier(node) && trackedVars.has(node.name)) {
    return { varName: node.name, memberPath: null };
  }

  // Member expression: state.step, state.value
  if (t.isMemberExpression(node) && !node.computed) {
    const rootVar = getMemberRoot(node);
    if (rootVar && trackedVars.has(rootVar)) {
      const fullPath = memberExpressionToString(node);
      return { varName: rootVar, memberPath: fullPath };
    }
  }

  return null;
}

/**
 * Get the root identifier name of a member expression chain.
 */
function getMemberRoot(node: t.Node): string | null {
  if (t.isIdentifier(node)) return node.name;
  if (t.isMemberExpression(node)) return getMemberRoot(node.object);
  return null;
}

/**
 * Convert a member expression to a dotted string path.
 */
function memberExpressionToString(node: t.Node): string | null {
  if (t.isIdentifier(node)) return node.name;
  if (
    t.isMemberExpression(node) &&
    t.isIdentifier(node.property) &&
    !node.computed
  ) {
    const obj = memberExpressionToString(node.object);
    if (obj) return `${obj}.${node.property.name}`;
  }
  return null;
}

/**
 * Extract a literal value from an AST node.
 */
function extractLiteralValue(
  node: t.Node,
): string | number | boolean | undefined {
  if (t.isStringLiteral(node)) return node.value;
  if (t.isNumericLiteral(node)) return node.value;
  if (t.isBooleanLiteral(node)) return node.value;
  return undefined;
}

interface JSXComponentInfo {
  name: string;
  estimatedSize: number;
}

/**
 * Extract JSX component information from a node.
 * Returns the component name and an estimated size of the JSX content.
 */
function extractJSXComponentInfo(node: t.Node): JSXComponentInfo | null {
  if (t.isJSXElement(node)) {
    const opening = node.openingElement;
    const name = extractJSXElementName(opening.name);
    if (!name) return null;

    return {
      name,
      estimatedSize: estimateJSXSize(node),
    };
  }

  // Parenthesized JSX fragment: (<> ... </>)
  if (t.isJSXFragment(node)) {
    return {
      name: 'Fragment',
      estimatedSize: estimateJSXFragmentSize(node),
    };
  }

  return null;
}

/**
 * Get a human-readable name from a JSX element name node.
 */
function extractJSXElementName(
  name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName,
): string | null {
  if (t.isJSXIdentifier(name)) return name.name;
  if (t.isJSXMemberExpression(name)) {
    const obj = extractJSXElementName(name.object);
    return obj ? `${obj}.${name.property.name}` : name.property.name;
  }
  return null;
}

/**
 * Estimate the character size of a JSX element and its children.
 * This is a rough heuristic — not exact, but good enough for confidence scoring.
 */
function estimateJSXSize(node: t.JSXElement): number {
  let size = 0;

  // Count attributes
  for (const attr of node.openingElement.attributes) {
    if (t.isJSXAttribute(attr)) {
      size += 20; // rough estimate per attribute
    }
  }

  // Count children recursively
  for (const child of node.children) {
    if (t.isJSXText(child)) {
      size += child.value.trim().length;
    } else if (t.isJSXElement(child)) {
      size += estimateJSXSize(child);
    } else if (t.isJSXExpressionContainer(child)) {
      size += 30; // rough estimate for expressions
    } else if (t.isJSXFragment(child)) {
      size += estimateJSXFragmentSize(child);
    }
  }

  // Self-closing tags with no children still count as a component
  size += 20;

  return size;
}

/**
 * Estimate the character size of a JSX fragment.
 */
function estimateJSXFragmentSize(node: t.JSXFragment): number {
  let size = 0;
  for (const child of node.children) {
    if (t.isJSXText(child)) {
      size += child.value.trim().length;
    } else if (t.isJSXElement(child)) {
      size += estimateJSXSize(child);
    } else if (t.isJSXExpressionContainer(child)) {
      size += 30;
    } else if (t.isJSXFragment(child)) {
      size += estimateJSXFragmentSize(child);
    }
  }
  return size;
}

/**
 * Assign confidence based on the detected pattern.
 */
function scoreConfidence(
  initType: 'boolean' | 'number' | 'string',
  isMultiState: boolean,
  jsxSize: number,
  isXState: boolean,
): 'high' | 'medium' | 'low' {
  // XState with explicit states is always high confidence
  if (isXState) return 'high';

  // Multiple states from the same variable (wizard/tabs) is high confidence
  if (isMultiState) return 'high';

  // Step counter or string enum with substantial JSX
  if (initType === 'number' || initType === 'string') {
    return jsxSize > 50 ? 'high' : 'medium';
  }

  // Boolean toggle: depends on JSX size
  if (initType === 'boolean') {
    if (jsxSize > 50) return 'medium';
    return 'low';
  }

  return 'medium';
}

/**
 * Derive a human-readable screen name from the state variable, value, and component.
 */
function deriveScreenName(
  varNameOrPath: string,
  stateValue: string | number | boolean,
  componentName: string,
): string {
  // If the component name is descriptive enough, use it
  // e.g., "ShippingForm" → "Shipping Form"
  const readableComponent = componentName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  // For numbered steps, include the step number
  if (typeof stateValue === 'number') {
    return `Step ${stateValue}: ${readableComponent}`;
  }

  // For string states, use the value as context
  if (typeof stateValue === 'string') {
    const readableValue = stateValue
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return `${readableValue}: ${readableComponent}`;
  }

  // For booleans, describe the toggle
  if (typeof stateValue === 'boolean') {
    // Strip common suffixes like "Modal", "Drawer", "Dialog" from component name
    // for a cleaner label
    const cleanVar = varNameOrPath
      .replace(/^(is|show|has|should)/, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

    if (cleanVar) {
      return `${cleanVar}: ${readableComponent}`;
    }
    return readableComponent;
  }

  return readableComponent;
}
