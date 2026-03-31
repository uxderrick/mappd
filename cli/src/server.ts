import express from 'express';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { WebSocketServer, WebSocket } from 'ws';
import pc from 'picocolors';
import { captureOnDemand } from './screenshot.js';

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
  const wss = new WebSocketServer({ server, noServer: false });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
  });

  // Handle WSS errors (e.g. EADDRINUSE bubbles here too)
  wss.on('error', () => {});

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

  // Serve screenshots from .mappd/screenshots/
  app.get('/screenshots/:filename', (req, res) => {
    const screenshotPath = path.join(flowGraphDir, 'screenshots', req.params.filename);
    if (fs.existsSync(screenshotPath)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.resolve(screenshotPath));
    } else {
      res.status(404).send('Screenshot not found');
    }
  });

  // Serve screenshots manifest
  app.get('/screenshots.json', (_req, res) => {
    const manifestPath = path.join(flowGraphDir, 'screenshots.json');
    if (fs.existsSync(manifestPath)) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.sendFile(manifestPath);
    } else {
      res.json({});
    }
  });

  // On-demand screenshot API — Puppeteer captures a fresh screenshot
  app.get('/api/screenshot', async (req, res) => {
    const routePath = (req.query.path as string) || '/';
    const width = parseInt(req.query.width as string, 10) || 1280;
    const height = parseInt(req.query.height as string, 10) || 800;

    try {
      const buffer = await captureOnDemand(targetPort, routePath, { width, height });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="mappd-${routePath.replace(/\//g, '-').replace(/^-/, '') || 'screen'}.png"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.send(buffer);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: `Screenshot failed: ${msg}` });
    }
  });

  // Serve config (target port, etc.) for the canvas to know where to point iframes
  app.get('/mappd-config.json', (_req, res) => {
    res.json({
      targetPort,
      wsPort: port,
    });
  });

  // Serve an iframe loader page — nested iframe with inject script loaded first
  // The outer iframe (served by Mappd) loads the inject script, then embeds
  // the target page. The inject script intercepts navigation in the outer frame.
  app.get('/mappd-frame', (req, res) => {
    const targetPath = req.query.path || '/';
    const targetUrl = `http://localhost:${targetPort}${targetPath}`;
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html><head>
<style>*{margin:0;padding:0}html,body{width:100%;height:100%;overflow:hidden}</style>
</head><body>
<script>
// Override history API BEFORE loading the target app
(function(){
  if(window.self===window.top)return;
  var origPath=new URL("${targetUrl}").pathname;
  var realPush=history.pushState.bind(history);
  var realReplace=history.replaceState.bind(history);
  var restoring=false;
  function restore(){
    if(restoring)return;restoring=true;
    Promise.resolve().then(function(){setTimeout(function(){
      if(window.location.pathname!==origPath)realReplace(null,'',origPath);
      restoring=false;
    },0)});
  }
  document.addEventListener('click',function(e){
    var el=e.target;while(el&&el.tagName!=='A')el=el.parentElement;
    if(!el||!el.href)return;
    try{var url=new URL(el.href,location.origin);
    if(url.origin!==location.origin||url.pathname===origPath)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    window.parent.postMessage({type:'fc-navigate',from:origPath,to:url.pathname},'*');
    }catch(_){}
  },true);
  history.pushState=function(){
    var u=arguments[2];if(u&&typeof u==='string'&&!restoring){
    try{var p=new URL(u,location.origin);
    if(p.origin===location.origin&&p.pathname!==origPath){
    window.parent.postMessage({type:'fc-navigate',from:origPath,to:p.pathname},'*');
    restore();return;}}catch(_){}}
    return realPush.apply(history,arguments);
  };
  history.replaceState=function(){
    var u=arguments[2];if(u&&typeof u==='string'&&!restoring){
    try{var p=new URL(u,location.origin);
    if(p.origin===location.origin&&p.pathname!==origPath){
    window.parent.postMessage({type:'fc-navigate',from:origPath,to:p.pathname},'*');
    restore();return;}}catch(_){}}
    return realReplace.apply(history,arguments);
  };
  window.addEventListener('popstate',function(){
    if(location.pathname!==origPath&&!restoring)restore();
  });
  window.addEventListener('wheel',function(e){
    window.parent.postMessage({type:'fc-wheel',deltaX:e.deltaX,deltaY:e.deltaY,
    clientX:e.clientX,clientY:e.clientY,ctrlKey:e.ctrlKey,metaKey:e.metaKey},'*');
  },{passive:true});
  window.addEventListener('message',function(e){
    if(e.data&&e.data.type==='fc-pin-state'){
    window.__fcPinState=e.data.payload;
    var p=e.data.payload;
    if(p.auth){
      if(p.auth.token)localStorage.setItem('fc-auth-token',p.auth.token);
      if(p.auth.username)localStorage.setItem('fc-auth-username',p.auth.username);
      if(p.auth.role)localStorage.setItem('fc-auth-role',p.auth.role);
      localStorage.setItem('fc-auth-logged-in',String(p.auth.isLoggedIn));
    }
    window.dispatchEvent(new CustomEvent('fc-pin-state',{detail:p}));
    }
  });
})();
// Now navigate to the target — overrides are already in place
window.location.replace("${targetUrl}");
</script>
</body></html>`);
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
        const targetOrigin = `http://localhost:${targetPort}`;

        // Inject our script before </head> or </body>
        const injectTag = `<script src="http://localhost:${port}/mappd-inject.js"></script>`;
        if (html.includes('</head>')) {
          html = html.replace('</head>', injectTag + '</head>');
        } else if (html.includes('</body>')) {
          html = html.replace('</body>', injectTag + '</body>');
        } else {
          html = html + injectTag;
        }

        // Rewrite relative asset URLs to absolute (so they resolve to the target server)
        // Do NOT use <base href> — it breaks client-side routing
        html = html.replace(/src="\/([^"]*?)"/g, `src="${targetOrigin}/$1"`);
        html = html.replace(/href="\/([^"]*?)"/g, (match, p1) => {
          // Don't rewrite anchor links or route hrefs — only asset hrefs
          if (p1.startsWith('_next/') || p1.startsWith('static/') || p1.endsWith('.css') || p1.endsWith('.js') || p1.endsWith('.ico') || p1.endsWith('.svg') || p1.endsWith('.png') || p1.endsWith('.jpg')) {
            return `href="${targetOrigin}/${p1}"`;
          }
          return match;
        });

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

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.log(pc.red(`\n  Error: Port ${port} is already in use.`));
      console.log(pc.dim(`  Kill the existing process: lsof -ti:${port} | xargs kill -9`));
      console.log(pc.dim(`  Or use a different port: mappd dev --port 3570\n`));
      process.exit(1);
    }
    throw err;
  });

  server.listen(port, () => {
    // Confirm the server started — silence is confusing when debugging
  });

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
