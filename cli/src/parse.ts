import { parseAndWrite, parseProject, type FlowGraph } from 'mappd-parser';
import pc from 'picocolors';

export function parseAndWriteGraph(projectDir: string): FlowGraph | null {
  try {
    return parseAndWrite(projectDir);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(pc.yellow(`  Warning: ${message}`));
    return null;
  }
}

/**
 * Parse with manual config override (from saved .mappd/config.json or user prompt).
 * Writes the result to .mappd/flow-graph.json.
 */
export function parseWithConfig(
  projectDir: string,
  config: { framework: string; entryPoint: string },
): FlowGraph | null {
  try {
    return parseAndWrite(projectDir, {
      frameworkOverride: config.framework,
      entryPointOverride: config.entryPoint,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(pc.yellow(`  Warning: ${message}`));
    return null;
  }
}
