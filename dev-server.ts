import serverApp from './server';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import express from 'express';

async function startDevServer() {
  const PORT = 3000;
  const app = express();
  
  // Mount the server app
  app.use(serverApp);
  
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  
  app.use(vite.middlewares);
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dev Server running on http://localhost:${PORT}`);
  });
}

startDevServer();
