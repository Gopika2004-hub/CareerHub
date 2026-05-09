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
    const { id, state, city, company_name, search, recruiter_id, category } = req.query;

    if (req.method === 'GET') {
      // Get single job by ID
      if (id) {
        const job = db.jobs.find(j => j.id == id);
        if (!job) {
          return res.status(404).json({ error: 'Job not found' });
        }
        const jobApplications = db.applications.filter(a => a.job_id == id);
        return res.status(200).json({ ...job, applications: jobApplications });
      }

      // Get all jobs with filters
      let filteredJobs = [...db.jobs];

      if (recruiter_id) {
        filteredJobs = filteredJobs.filter(j => j.recruiter_id === recruiter_id);
      }

      if (state) {
        filteredJobs = filteredJobs.filter(j => j.state === state);
      }

      if (city) {
        filteredJobs = filteredJobs.filter(j =>
          (j.city || '').toLowerCase() === city.toLowerCase() ||
          (j.location || '').toLowerCase().includes(city.toLowerCase())
        );
      }

      if (company_name) {
        filteredJobs = filteredJobs.filter(j =>
          (j.company_name || '').toLowerCase() === company_name.toLowerCase()
        );
      }

      if (search) {
        filteredJobs = filteredJobs.filter(j =>
          j.title.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (category) {
        filteredJobs = filteredJobs.filter(j => {
          if (!j.category) return false;
          try {
            const cats = typeof j.category === 'string' ? JSON.parse(j.category) : j.category;
            return Array.isArray(cats) ? cats.includes(category) : cats === category;
          } catch {
            return String(j.category).includes(category);
          }
        });
      }

      return res.status(200).json(filteredJobs);
    }

    // For other methods, return method not allowed
    res.status(405).json({ error: 'Method not allowed in read-only mode' });
  } catch (error) {
    console.error('Error in jobs endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
