import { loadDb } from '../_lib/db.js';

const ADMIN_TOKEN = 'CAREERHUB_ADMIN_2026';

function verifyAdmin(req) {
  const auth = req.headers.authorization;
  return auth === `Bearer ${ADMIN_TOKEN}`;
}

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
    if (!verifyAdmin(req)) {
      return res.status(401).json({ error: 'Admin unauthorized' });
    }

    if (req.method === 'GET') {
      const db = loadDb();
      const { job_id } = req.query;

      if (job_id) {
        const applications = db.applications.filter(a => String(a.job_id) === String(job_id));
        return res.status(200).json(applications);
      }

      // Return all applications
      return res.status(200).json(db.applications);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin applications endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
