import puppeteer, { type Browser } from 'puppeteer';
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

// Shared browser instance — launched once, reused for batch + on-demand
let sharedBrowser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!sharedBrowser || !sharedBrowser.connected) {
    sharedBrowser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return sharedBrowser;
}

/**
 * Close the shared browser. Call on CLI shutdown.
 */
export async function closeBrowser(): Promise<void> {
  if (sharedBrowser && sharedBrowser.connected) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
}

/**
 * Capture a single screenshot on demand.
 * Returns the PNG buffer.
 */
export async function captureOnDemand(
  targetPort: number,
  routePath: string,
  options?: { width?: number; height?: number },
): Promise<Buffer> {
  const width = options?.width ?? 1280;
  const height = options?.height ?? 800;
  const url = `http://localhost:${targetPort}${routePath}`;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewport({ width, height });
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });
    // Wait for client-side rendering
    await new Promise(resolve => setTimeout(resolve, 1000));
    const buffer = await page.screenshot({ type: 'png' });
    return Buffer.from(buffer);
  } finally {
    await page.close();
  }
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

  const browser = await getBrowser();

  const routes = graph.nodes.map((n) => ({
    id: n.id,
    routePath: n.routePath,
    isDynamic: n.isDynamic,
  }));

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
          await new Promise(resolve => setTimeout(resolve, 1000));
          await page.screenshot({ path: outputPath, type: 'png' });
          await page.close();
          console.log(pc.dim(`    Captured: ${route.routePath}`));
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.log(pc.yellow(`    Failed: ${route.routePath} — ${msg}`));
          createPlaceholder(outputPath);
        }
      }),
    );
  }

  // Write manifest
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

function createPlaceholder(outputPath: string) {
  const minimalPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  );
  fs.writeFileSync(outputPath, minimalPng);
}
