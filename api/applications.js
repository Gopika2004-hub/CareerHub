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
    const { job_id, candidate_id, recruiter_id } = req.query;

    if (req.method === 'GET') {
      let result = [...db.applications];

      if (job_id) {
        result = result.filter(a => String(a.job_id) === String(job_id));
      }

      if (candidate_id) {
        result = result
          .filter(a => a.candidate_id === candidate_id)
          .map(a => {
            const job = db.jobs.find(j => String(j.id) === String(a.job_id));
            const company = db.companies.find(c => c.id === job?.company_id);
            return {
              ...a,
              job_title: job?.title || '—',
              company_name: company?.name || job?.company_name || '—',
              job_location: job?.location || '—'
            };
          });
      }

      // Employer view — return all applications for this recruiter's jobs
      if (recruiter_id) {
        const myJobIds = db.jobs
          .filter(j => j.recruiter_id === recruiter_id)
          .map(j => String(j.id));

        result = result
          .filter(a => myJobIds.includes(String(a.job_id)))
          .map(a => {
            const job = db.jobs.find(j => String(j.id) === String(a.job_id));
            return { ...a, job_title: job?.title || '—', job_location: job?.location || '—' };
          });
      }

      return res.status(200).json(result);
    }

    // For other methods, return method not allowed
    res.status(405).json({ error: 'Method not allowed in read-only mode' });
  } catch (error) {
    console.error('Error in applications endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
