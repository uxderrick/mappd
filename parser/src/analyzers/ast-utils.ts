import fs from 'node:fs';
import path from 'node:path';
import { parse } from '@babel/parser';
import type { File } from '@babel/types';

const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

/**
 * Parse a file into a Babel AST.
 */
export function parseFile(filePath: string): File {
  const code = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath);
  const isTS = ext === '.ts' || ext === '.tsx';
  const isJSX = ext === '.tsx' || ext === '.jsx';

  return parse(code, {
    sourceType: 'module',
    plugins: [
      ...(isTS ? ['typescript' as const] : []),
      ...(isJSX || isTS ? ['jsx' as const] : []),
      'decorators-legacy' as const,
    ],
  });
}

/**
 * Resolve a relative import path to an absolute file path.
 * Handles missing extensions and index files.
 */
export function resolveImport(importPath: string, fromFile: string): string | null {
  const dir = path.dirname(fromFile);
  const resolved = path.resolve(dir, importPath);

  // Try exact path first
  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    return resolved;
  }

  // Try with extensions
  for (const ext of EXTENSIONS) {
    const withExt = resolved + ext;
    if (fs.existsSync(withExt)) {
      return withExt;
    }
  }

  // Try as directory with index file
  for (const ext of EXTENSIONS) {
    const indexFile = path.join(resolved, `index${ext}`);
    if (fs.existsSync(indexFile)) {
      return indexFile;
    }
  }

  return null;
}

/**
 * Build a map of import local names to their source paths and resolved file paths.
 */
export interface ImportInfo {
  source: string;
  importedName: string;
  resolvedPath: string | null;
}

export function getImportMap(ast: File, filePath: string): Map<string, ImportInfo> {
  const imports = new Map<string, ImportInfo>();

  for (const node of ast.program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    const source = node.source.value;
    const resolvedPath = source.startsWith('.')
      ? resolveImport(source, filePath)
      : null;

    for (const spec of node.specifiers) {
      const localName = spec.local.name;
      let importedName = localName;

      if (spec.type === 'ImportSpecifier' && spec.imported.type === 'Identifier') {
        importedName = spec.imported.name;
      } else if (spec.type === 'ImportDefaultSpecifier') {
        importedName = 'default';
      }

      imports.set(localName, { source, importedName, resolvedPath });
    }
  }

  return imports;
}

/**
 * Slugify a route path into a valid node ID.
 * e.g., "/dashboard/settings" => "dashboard-settings"
 *        "/" => "index"
 */
export function routePathToId(routePath: string): string {
  if (routePath === '/') return 'index';
  return routePath
    .replace(/^\//, '')
    .replace(/\//g, '-')
    .replace(/:/g, '')
    .replace(/[^a-zA-Z0-9-]/g, '');
}
