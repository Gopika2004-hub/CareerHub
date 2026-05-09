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
    const authHeader = req.headers.authorization;
    const userId = authHeader?.replace('Bearer ', '') || '';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const db = loadDb();

    if (req.method === 'GET') {
      return res.status(200).json({ success: true });
    }

    // For other methods, return method not allowed
    res.status(405).json({ error: 'Method not allowed in read-only mode' });
  } catch (error) {
    console.error('Error in resume endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
