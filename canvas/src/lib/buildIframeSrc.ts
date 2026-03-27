/**
 * Build the iframe src URL, replacing :param segments with pinned values.
 * Loads directly from the target dev server.
 */
export function buildIframeSrc(
  devServerUrl: string,
  routePath: string,
  urlParams?: Record<string, string>,
): string {
  let resolvedPath = routePath;

  if (urlParams && Object.keys(urlParams).length > 0) {
    resolvedPath = resolvedPath.replace(/:(\w+)/g, (_, paramName) => {
      return urlParams[paramName] ?? '1';
    });
  } else {
    resolvedPath = resolvedPath.replace(/:(\w+)/g, '1');
  }

  return `${devServerUrl}${resolvedPath}`;
}
