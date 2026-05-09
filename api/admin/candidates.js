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

      // Build candidate records with their applications
      const candidateRecords = [];
      const candidates = new Map();

      // Collect all candidates from profiles and applications
      db.profiles.forEach(profile => {
        if (!candidates.has(profile.user_id)) {
          candidates.set(profile.user_id, profile);
        }
      });

      db.applications.forEach(app => {
        if (!candidates.has(app.candidate_id)) {
          candidates.set(app.candidate_id, {
            user_id: app.candidate_id,
            full_name: app.name || '',
            email: app.email || '',
            mobile: app.phone || '',
            created_at: app.created_at || null,
          });
        }
      });

      // Build result with application count
      candidates.forEach((profile, user_id) => {
        const apps = db.applications.filter(a => a.candidate_id === user_id);
        candidateRecords.push({
          user_id,
          full_name: profile.full_name || '',
          email: profile.email || '',
          mobile: profile.mobile || '',
          created_at: profile.created_at || null,
          applications: apps,
          application_count: apps.length,
        });
      });

      return res.status(200).json(candidateRecords);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin candidates endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
