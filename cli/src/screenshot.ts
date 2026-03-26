import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import type { FlowGraph } from 'mappd-parser';

interface ScreenshotOptions {
  targetPort: number;
  outputDir: string;
  width?: number;
  height?: number;
  concurrency?: number;
}

/**
 * Capture screenshots for all routes in the flow graph.
 * Saves PNGs to .mappd/screenshots/
 */
export async function captureScreenshots(
  graph: FlowGraph,
  options: ScreenshotOptions,
): Promise<void> {
  const {
    targetPort,
    outputDir,
    width = 1280,
    height = 800,
    concurrency = 2,
  } = options;

  const screenshotDir = path.join(outputDir, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const routes = graph.nodes.map((n) => ({
    id: n.id,
    routePath: n.routePath,
    isDynamic: n.isDynamic,
  }));

  // Process in batches to avoid overwhelming the dev server
  for (let i = 0; i < routes.length; i += concurrency) {
    const batch = routes.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (route) => {
        let urlPath = route.routePath;
        if (route.isDynamic) {
          urlPath = urlPath.replace(/:(\w+)/g, '1');
        }

        const url = `http://localhost:${targetPort}${urlPath}`;
        const outputPath = path.join(screenshotDir, `${route.id}.png`);

        try {
          const page = await browser.newPage();
          await page.setViewport({ width, height });
          await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 15000,
          });
          // Wait a bit for client-side rendering to settle
          await new Promise(resolve => setTimeout(resolve, 1000));
          await page.screenshot({ path: outputPath, type: 'png' });
          await page.close();
          console.log(pc.dim(`    Captured: ${route.routePath}`));
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.log(pc.yellow(`    Failed: ${route.routePath} — ${msg}`));
          // Create a placeholder image on failure
          createPlaceholder(outputPath, route.routePath, width, height);
        }
      }),
    );
  }

  await browser.close();

  // Write a manifest so the canvas knows which screenshots exist
  const manifest: Record<string, string> = {};
  for (const route of routes) {
    const filename = `${route.id}.png`;
    if (fs.existsSync(path.join(screenshotDir, filename))) {
      manifest[route.id] = `/screenshots/${filename}`;
    }
  }
  fs.writeFileSync(
    path.join(outputDir, 'screenshots.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8',
  );
}

/**
 * Create a simple SVG placeholder for failed captures.
 */
function createPlaceholder(
  outputPath: string,
  routePath: string,
  width: number,
  height: number,
) {
  // Write a minimal 1x1 transparent PNG as fallback
  const minimalPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  );
  fs.writeFileSync(outputPath, minimalPng);
}
