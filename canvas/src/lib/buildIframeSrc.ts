/**
 * Build the iframe src URL, replacing :param segments with pinned values.
 */
export function buildIframeSrc(
  devServerUrl: string,
  routePath: string,
  urlParams?: Record<string, string>,
): string {
  let resolvedPath = routePath;

  if (urlParams && Object.keys(urlParams).length > 0) {
    // Replace each :param with the pinned value
    resolvedPath = resolvedPath.replace(/:(\w+)/g, (_, paramName) => {
      return urlParams[paramName] ?? '1';
    });
  } else {
    // Fallback: replace all params with '1'
    resolvedPath = resolvedPath.replace(/:(\w+)/g, '1');
  }

  return `${devServerUrl}${resolvedPath}?mappd=true`;
}
