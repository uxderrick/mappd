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

  // Serve flow-graph.json from .flowcanvas directory
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
  app.get('/flowcanvas-config.json', (_req, res) => {
    res.json({
      targetPort,
      wsPort: port,
    });
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
            <p>Redirecting to <a href="http://localhost:4200">FlowCanvas Canvas</a>...</p>
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
