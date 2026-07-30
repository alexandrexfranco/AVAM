import app from './app.ts';
import path from 'path';
import express from 'express';

const PORT = 3000;

async function startDevServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vitePkg = 'vite';
    const { createServer: createViteServer } = await import(vitePkg);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server listen if not running in Vercel Serverless environment
if (!process.env.VERCEL) {
  startDevServer();
}

export default app;

