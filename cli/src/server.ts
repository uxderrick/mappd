import express from 'express';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { WebSocketServer, WebSocket } from 'ws';
import pc from 'picocolors';

interface ServerOptions {
  port: number;
  flowGraphDir: string;
  canvasDir: string;
  targetPort: number;
}

export function createServer(options: ServerOptions) {
  const { port, flowGraphDir, canvasDir, targetPort } = options;
  const app = express();
  const server = http.createServer(app);

  // WebSocket server for live updates
  const wss = new WebSocketServer({ server });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });

  // Serve flow-graph.json from .mappd directory
  app.get('/flow-graph.json', (_req, res) => {
    const graphPath = path.join(flowGraphDir, 'flow-graph.json');
    if (fs.existsSync(graphPath)) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.sendFile(graphPath);
    } else {
      res.status(404).json({ error: 'Flow graph not found. Parser may have failed.' });
    }
  });

  // Serve config (target port, etc.) for the canvas to know where to point iframes
  app.get('/mappd-config.json', (_req, res) => {
    res.json({
      targetPort,
      wsPort: port,
    });
  });

  // Serve the inject script
  app.get('/mappd-inject.js', (_req, res) => {
    const scriptPath = path.join(canvasDir, 'mappd-inject.js');
    if (fs.existsSync(scriptPath)) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.sendFile(scriptPath);
    } else {
      // Fallback: serve inline inject script
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send('/* mappd-inject.js not found */');
    }
  });

  // Proxy route: /proxy/* fetches from target dev server and injects mappd script
  // Iframes should point here instead of directly at the target
  app.get('/proxy/*', async (req, res) => {
    const targetPath = req.params[0] || '';
    const targetUrl = `http://localhost:${targetPort}/${targetPath}`;

    try {
      const response = await fetch(targetUrl, {
        headers: { 'Accept': req.headers.accept || '*/*' },
      });

      const contentType = response.headers.get('content-type') || '';

      // Only inject into HTML responses
      if (contentType.includes('text/html')) {
        let html = await response.text();

        // Inject our script before </head> or </body>
        const injectTag = `<script src="http://localhost:${port}/mappd-inject.js"></script>`;
        if (html.includes('</head>')) {
          html = html.replace('</head>', injectTag + '</head>');
        } else if (html.includes('</body>')) {
          html = html.replace('</body>', injectTag + '</body>');
        } else {
          html = html + injectTag;
        }

        // Add base tag so relative asset URLs resolve to the target server
        if (!html.includes('<base')) {
          const baseTag = `<base href="http://localhost:${targetPort}/">`;
          if (html.includes('<head>')) {
            html = html.replace('<head>', '<head>' + baseTag);
          } else if (html.includes('<head ')) {
            html = html.replace(/<head[^>]*>/, '$&' + baseTag);
          }
        }

        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        // Non-HTML: pipe through as-is
        res.setHeader('Content-Type', contentType);
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
    } catch (err) {
      res.status(502).send(`Proxy error: ${err instanceof Error ? err.message : err}`);
    }
  });

  // Serve the canvas app (built static files)
  // For development, we'll proxy to the canvas dev server instead
  if (fs.existsSync(canvasDir)) {
    app.use(express.static(canvasDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(canvasDir, 'index.html'));
    });
  } else {
    // Dev mode: serve a redirect page to the canvas dev server
    app.get('/', (_req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><meta http-equiv="refresh" content="0;url=http://localhost:4200" /></head>
          <body>
            <p>Redirecting to <a href="http://localhost:4200">Mappd Canvas</a>...</p>
            <p>In production, the canvas is bundled. For development, run the canvas dev server separately.</p>
          </body>
        </html>
      `);
    });
  }

  server.listen(port, () => {});

  return {
    broadcast(data: any) {
      const message = JSON.stringify(data);
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      }
    },
    close() {
      wss.close();
      server.close();
    },
  };
}
