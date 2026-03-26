import { parseAndWrite, type FlowGraph } from 'mappd-parser';
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
