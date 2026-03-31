import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseAndWriteGraph, parseWithConfig } from '../parse';

// Mock the mappd-parser module
vi.mock('mappd-parser', () => ({
  parseAndWrite: vi.fn(),
  parseProject: vi.fn(),
}));

import { parseAndWrite } from 'mappd-parser';

describe('parse', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseAndWriteGraph', () => {
    it('returns the flow graph on success', () => {
      const fakeGraph = {
        nodes: [{ id: 'a', routePath: '/' }],
        edges: [],
      };
      vi.mocked(parseAndWrite).mockReturnValue(fakeGraph as any);

      const result = parseAndWriteGraph('/some/project');
      expect(result).toBe(fakeGraph);
      expect(parseAndWrite).toHaveBeenCalledWith('/some/project');
    });

    it('returns null and logs warning on error', () => {
      vi.mocked(parseAndWrite).mockImplementation(() => {
        throw new Error('Parse failed');
      });
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = parseAndWriteGraph('/bad/project');
      expect(result).toBeNull();
      expect(logSpy).toHaveBeenCalled();
    });

    it('handles non-Error throws', () => {
      vi.mocked(parseAndWrite).mockImplementation(() => {
        throw 'string error';
      });
      vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = parseAndWriteGraph('/bad/project');
      expect(result).toBeNull();
    });
  });

  describe('parseWithConfig', () => {
    it('passes framework and entry point overrides', () => {
      const fakeGraph = { nodes: [], edges: [] };
      vi.mocked(parseAndWrite).mockReturnValue(fakeGraph as any);

      const config = { framework: 'react-router', entryPoint: 'src/main.tsx' };
      const result = parseWithConfig('/project', config);
      expect(result).toBe(fakeGraph);
      expect(parseAndWrite).toHaveBeenCalledWith('/project', {
        frameworkOverride: 'react-router',
        entryPointOverride: 'src/main.tsx',
      });
    });

    it('returns null on error', () => {
      vi.mocked(parseAndWrite).mockImplementation(() => {
        throw new Error('bad config');
      });
      vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = parseWithConfig('/project', {
        framework: 'nextjs-app',
        entryPoint: 'app',
      });
      expect(result).toBeNull();
    });
  });
});
