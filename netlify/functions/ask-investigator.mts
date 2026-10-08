import type { Config } from '@netlify/functions';
import { askInvestigator } from '../../lib/vericlause';

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed.' }, { status: 405 });
  }
  const body = await req.json().catch(() => ({}));
  const { status, body: payload } = await askInvestigator(body ?? {});
  return Response.json(payload, { status });
};

export const config: Config = {
  path: '/api/ask-investigator',
};
