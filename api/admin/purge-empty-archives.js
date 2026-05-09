import { loadDb } from '../_lib/db.js';

const ADMIN_TOKEN = 'CAREERHUB_ADMIN_2026';

function verifyAdmin(req) {
  const auth = req.headers.authorization;
  return auth === `Bearer ${ADMIN_TOKEN}`;
}

export default function handler(req, res) {
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
    if (!verifyAdmin(req)) {
      return res.status(401).json({ error: 'Admin unauthorized' });
    }

    if (req.method === 'DELETE') {
      const db = loadDb();
      const { type } = req.query;
      const isEmpty = (p) => !((p?.full_name || '').trim()) && !((p?.email || '').trim());

      let removed = 0;
      if (type === 'candidates' || !type) {
        const before = db.candidateArchives.length;
        removed += before - db.candidateArchives.filter(r => !isEmpty(r.profile)).length;
      }
      if (type === 'employers' || !type) {
        const before = db.employerArchives.length;
        removed += before - db.employerArchives.filter(r => !isEmpty(r.employer_info)).length;
      }

      // Read-only on Vercel — returns count of what would be removed
      return res.status(200).json({ success: true, removed });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in purge-empty-archives endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
