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
      
      // Count unique employers
      const knownIds = new Set(db.employers.map(e => e.recruiter_id));
      db.jobs.forEach(j => { if (j.recruiter_id) knownIds.add(j.recruiter_id); });
      const totalEmployers = knownIds.size;
      
      // Candidates
      const knownCandIds = new Set(db.profiles.map(p => p.user_id));
      db.applications.forEach(a => { if (a.candidate_id) knownCandIds.add(a.candidate_id); });
      const totalCandidates = knownCandIds.size;
      
      return res.status(200).json({
        employers: totalEmployers,
        candidates: totalCandidates,
        applications: db.applications.length
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin stats endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
