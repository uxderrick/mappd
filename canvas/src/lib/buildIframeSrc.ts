/**
 * Build the iframe src URL, replacing :param segments with pinned values.
 * Routes through the Mappd proxy (/proxy/...) so the inject script gets added.
 */
export function buildIframeSrc(
  _devServerUrl: string,
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

  // Strip leading slash for proxy path
  const proxyPath = resolvedPath.startsWith('/') ? resolvedPath.slice(1) : resolvedPath;

  // Route through Mappd's proxy so the inject script gets added to the HTML
  return `/proxy/${proxyPath}`;
}
