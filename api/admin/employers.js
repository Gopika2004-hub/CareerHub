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
      const result = [];

      // Build lookup: recruiter_id → employer profile row
      const empMap = {};
      db.employers.forEach(e => { empMap[e.recruiter_id] = e; });

      // Jobs grouped per recruiter
      const jobsByRecruiter = {};
      db.jobs.forEach(j => {
        if (!jobsByRecruiter[j.recruiter_id]) jobsByRecruiter[j.recruiter_id] = [];
        jobsByRecruiter[j.recruiter_id].push(j);
      });

      // Collect all recruiter IDs
      const allRecruiters = new Set([
        ...db.employers.map(e => e.recruiter_id),
        ...db.jobs.map(j => j.recruiter_id).filter(Boolean),
      ]);

      allRecruiters.forEach(rid => {
        const emp = empMap[rid] || {};
        const rJobs = jobsByRecruiter[rid] || [];

        if (rJobs.length === 0) {
          result.push({
            job_id: null,
            recruiter_id: rid,
            hr_name: emp.hr_name || '—',
            company_name: emp.company_name || '—',
            contact_phone: emp.mobile || '—',
            contact_email: emp.email || '—',
            job_title: '—',
            location: '—',
            created_at: emp.created_at || null,
            applicants: [],
            applicant_count: 0,
          });
        } else {
          rJobs.forEach(job => {
            const jobApps = db.applications.filter(a => String(a.job_id) === String(job.id));
            result.push({
              job_id: job.id,
              recruiter_id: rid,
              hr_name: emp.hr_name || job.hr_name || '',
              company_name: emp.company_name || job.company_name || '—',
              contact_phone: emp.mobile || job.contact_phone || '—',
              contact_email: emp.email || job.contact_email || '—',
              job_title: job.title,
              role_department: job.role_department || '—',
              location: job.location || job.city || job.state || '—',
              state: job.state || '—',
              city: job.city || '—',
              job_type: job.job_type || '—',
              salary_range: job.salary_range || '—',
              experience_level: job.experience_level || '—',
              application_deadline: job.application_deadline || '—',
              company_size: job.company_size || '—',
              founded_year: job.founded_year || '—',
              description: job.description || '—',
              qualifications: job.qualifications || '',
              created_at: job.created_at,
              applicants: jobApps,
              applicant_count: jobApps.length,
            });
          });
        }
      });

      return res.status(200).json(result);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin employers endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
