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
    if (req.method === 'GET') {
      const db = loadDb();
      const { user_id, email } = req.query;

      if (user_id) {
        const isEmployer = db.employerArchives.some(r => r.recruiter_id === user_id);
        const isCandidate = db.candidateArchives.some(r => r.candidate_id === user_id);
        if (isEmployer) return res.status(200).json({ archived: true, type: 'employer' });
        if (isCandidate) return res.status(200).json({ archived: true, type: 'candidate' });
        return res.status(200).json({ archived: false, type: null });
      }

      if (email) {
        const norm = email.toLowerCase().trim();
        const isEmployer = db.employerArchives.some(r =>
          (r.employer_info?.email || '').toLowerCase() === norm
        );
        const isCandidate = db.candidateArchives.some(r =>
          (r.profile?.email || '').toLowerCase() === norm
        );
        if (isEmployer) return res.status(200).json({ archived: true, type: 'employer' });
        if (isCandidate) return res.status(200).json({ archived: true, type: 'candidate' });
        return res.status(200).json({ archived: false, type: null });
      }

      return res.status(400).json({ error: 'user_id or email required' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in check-archived endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
