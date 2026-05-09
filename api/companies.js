import { loadDb } from './_lib/db.js';

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = loadDb();

    if (req.method === 'GET') {
      if (req.query.from_jobs === '1') {
        // Get unique company names from jobs
        const names = [...new Set(db.jobs.map(j => j.company_name).filter(Boolean))];
        return res.status(200).json(names.map(name => ({ id: name, name })));
      }
      return res.status(200).json(db.companies);
    }

    // For other methods, return method not allowed (no persistence in read-only mode)
    res.status(405).json({ error: 'Method not allowed in read-only mode' });
  } catch (error) {
    console.error('Error in companies endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
