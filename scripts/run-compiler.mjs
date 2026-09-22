import http from 'http';
import fs from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const PORT = 8999;
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];

  if (req.method === 'POST' && urlPath === '/save-mind') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { base64, size } = JSON.parse(body);
        const buffer = Buffer.from(base64, 'base64');
        await fs.mkdir('public/targets', { recursive: true });
        await fs.writeFile('public/targets/targets.mind', buffer);
        console.log(`\n🎉 SUCCESS: public/targets/targets.mind saved! Size: ${(size / 1024).toFixed(1)} KB`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));

        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 1500);
      } catch (err) {
        console.error('Error saving:', err);
        res.writeHead(500);
        res.end(err.message);
      }
    });
    return;
  }

  if (req.method === 'POST' && urlPath === '/log') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('[BROWSER]', body);
      res.writeHead(200);
      res.end('ok');
    });
    return;
  }

  let relPath = urlPath === '/' ? 'compile.html' : urlPath.replace(/^\//, '');
  let filePath = path.join(process.cwd(), 'public', relPath);

  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found: ' + filePath);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.glb': 'model/gltf-binary',
    '.css': 'text/css'
  };

  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Access-Control-Allow-Origin': '*'
  });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);

  const edge = spawn(EDGE_PATH, [
    '--headless=new',
    '--no-sandbox',
    '--use-gl=angle',
    '--enable-webgl',
    '--enable-features=SharedArrayBuffer',
    `http://localhost:${PORT}/compile.html`
  ]);

  edge.on('error', (err) => console.error('Edge spawn error:', err));
  edge.on('exit', (code) => console.log('Edge process exited with code:', code));
});
