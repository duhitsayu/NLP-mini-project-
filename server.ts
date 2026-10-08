import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { auditAgreement, askInvestigator } from './lib/vericlause';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Endpoint: NLP Agreement Audit
app.post('/api/audit-agreement', async (req: Request, res: Response) => {
  const { status, body } = await auditAgreement(req.body ?? {});
  res.status(status).json(body);
});

// Endpoint: Interactive Q&A with Legal Investigator
app.post('/api/ask-investigator', async (req: Request, res: Response) => {
  const { status, body } = await askInvestigator(req.body ?? {});
  res.status(status).json(body);
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode.');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static build from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VeriClause server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
