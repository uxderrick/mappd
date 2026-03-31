import { describe, it, expect, vi, afterEach } from 'vitest';
import { startWatcher } from '../watcher';

// Mock chokidar
vi.mock('chokidar', () => {
  const handlers: Record<string, Function> = {};
  return {
    default: {
      watch: vi.fn(() => ({
        on: vi.fn((event: string, handler: Function) => {
          handlers[event] = handler;
          return { on: vi.fn() };
        }),
        close: vi.fn(),
        __handlers: handlers,
      })),
    },
  };
});

import chokidar from 'chokidar';

describe('startWatcher', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('watches the src subdirectory', () => {
    const onChange = vi.fn();
    startWatcher('/project', onChange);

    expect(chokidar.watch).toHaveBeenCalledWith(
      '/project/src',
      expect.objectContaining({
        persistent: true,
        ignoreInitial: true,
      }),
    );
  });

  it('ignores node_modules and .mappd directories', () => {
    const onChange = vi.fn();
    startWatcher('/project', onChange);

    const callArgs = vi.mocked(chokidar.watch).mock.calls[0][1];
    expect(callArgs?.ignored).toContain('**/node_modules/**');
    expect(callArgs?.ignored).toContain('**/.mappd/**');
  });

  it('returns a watcher object', () => {
    const onChange = vi.fn();
    const watcher = startWatcher('/project', onChange);
    expect(watcher).toBeDefined();
    expect(watcher.on).toBeDefined();
  });
});
