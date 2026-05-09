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

    if (req.method === 'DELETE') {
      const { recruiter_id } = req.query;
      const { reason } = req.body || {};

      if (!recruiter_id) {
        return res.status(400).json({ error: 'recruiter_id required' });
      }

      // In Vercel's read-only environment, we cannot actually delete from db.json
      // This would need a real database for persistence
      // For now, return a success response

      return res.status(200).json({
        success: true,
        message: 'Employer archived (would be persisted in production)',
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin employer-full endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
