import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Diagnostic Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Setup multer for file uploads
const uploadDir = path.join(__dirname, 'backend', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const upload = multer({ storage });

// ==================== PERSISTENT JSON DATABASE ====================
const dbFilePath = path.join(__dirname, 'db.json');
const dbTempPath = path.join(__dirname, 'db.json.tmp');

// Default data
const DEFAULT_COMPANIES = [
  { id: 1, name: 'Google', logo_url: '/google.webp' },
  { id: 2, name: 'Amazon', logo_url: '/amazon.svg' },
  { id: 3, name: 'Microsoft', logo_url: '/microsoft.webp' }
];

let companies = [...DEFAULT_COMPANIES];
let jobs = [];
let applications = [];
let savedJobs = [];
let profiles = [];
let nextCompanyId = 4;
let nextJobId = 1;
let nextAppId = 1;
let nextSavedJobId = 1;
let adminLogo = '';
let employers = [];
let nextEmployerId = 1;
let employerArchives = [];
let candidateArchives = [];
let ADMIN_PASSWORD = 'Bala@2004'; // persisted to db.json on reset

function saveDb() {
  try {
    const data = {
      companies,
      jobs,
      applications,
      savedJobs,
      profiles,
      nextCompanyId,
      nextJobId,
      nextAppId,
      nextSavedJobId,
      adminLogo,
      employers,
      nextEmployerId,
      employerArchives,
      candidateArchives,
      adminPassword: ADMIN_PASSWORD,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    // Atomic write: write to temp file first, then rename
    fs.writeFileSync(dbTempPath, jsonStr, 'utf8');
    fs.renameSync(dbTempPath, dbFilePath);
    console.log(`💾 [DB SAVED] db.json written successfully (${jobs.length} jobs, ${applications.length} applications, ${companies.length} companies)`);
  } catch (err) {
    console.error('❌ [DB SAVE ERROR] Failed to write db.json:', err.message);
    console.error(err.stack);
  }
}

function loadDb() {
  console.log(`📂 [DB LOAD] Looking for db.json at: ${dbFilePath}`);

  if (!fs.existsSync(dbFilePath)) {
    console.log('⚠️  [DB LOAD] db.json not found. Creating initial database...');
    // Create the file immediately so it exists for future loads
    saveDb();
    return;
  }

  try {
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    if (!raw || raw.trim().length === 0) {
      console.log('⚠️  [DB LOAD] db.json is empty. Using defaults.');
      saveDb();
      return;
    }
    const data = JSON.parse(raw);
    companies = data.companies && data.companies.length > 0 ? data.companies : [...DEFAULT_COMPANIES];
    jobs = data.jobs || [];
    applications = data.applications || [];
    savedJobs = data.savedJobs || [];
    profiles = data.profiles || [];
    nextCompanyId = data.nextCompanyId || 4;
    nextJobId = data.nextJobId || 1;
    nextAppId = data.nextAppId || 1;
    nextSavedJobId = data.nextSavedJobId || 1;
    adminLogo = data.adminLogo || '';
    employers = data.employers || [];
    nextEmployerId = data.nextEmployerId || 1;
    employerArchives = data.employerArchives || [];
    candidateArchives = data.candidateArchives || [];
    if (data.adminPassword) ADMIN_PASSWORD = data.adminPassword;
    console.log(`✅ [DB LOADED] Successfully loaded db.json:`);
    console.log(`   📋 Jobs: ${jobs.length}`);
    console.log(`   🏢 Companies: ${companies.length}`);
    console.log(`   📄 Applications: ${applications.length}`);
    console.log(`   💾 Saved Jobs: ${savedJobs.length}`);
    console.log(`   🔢 Next Job ID: ${nextJobId}`);
  } catch (err) {
    console.error('❌ [DB LOAD ERROR] Failed to read/parse db.json:', err.message);
    console.error('   Using default empty data. The file may be corrupted.');
    // Keep defaults and overwrite the corrupted file
    saveDb();
  }
}

// Load existing data from file on startup
loadDb();

// Graceful shutdown: save data before the process exits
function gracefulShutdown(signal) {
  console.log(`\n🛑 [SHUTDOWN] Received ${signal}. Saving database before exit...`);
  saveDb();
  console.log('👋 [SHUTDOWN] Database saved. Goodbye!');
  process.exit(0);
}
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('exit', () => {
  console.log('🔚 [EXIT] Process exiting.');
});

// Token verification middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = authHeader.replace('Bearer ', '');
  next();
}

// ==================== COMPANIES ====================
app.get('/backend/companies.php', (req, res) => {
  if (req.query.from_jobs === '1') {
    const names = [...new Set(jobs.map(j => j.company_name).filter(Boolean))];
    return res.json(names.map(name => ({ id: name, name })));
  }
  res.json(companies);
});

app.post('/backend/companies.php', upload.single('logo'), (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Company name is required' });
  }

  const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const newCompany = {
    id: nextCompanyId++,
    name,
    logo_url: logoUrl
  };

  companies.push(newCompany);
  saveDb();
  res.json({ success: true, ...newCompany });
});

// ==================== JOBS ====================
app.get('/backend/jobs.php', verifyToken, (req, res) => {
  const { id, state, city: cityFilter, company_id, company_name: companyNameFilter, search, recruiter_id, category: categoryFilter } = req.query;

  if (id) {
    const job = jobs.find(j => j.id == id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const jobApplications = applications.filter(a => a.job_id == id);
    return res.json({ ...job, applications: jobApplications });
  }

  let filteredJobs = [...jobs];

  if (recruiter_id) {
    filteredJobs = filteredJobs.filter(j => j.recruiter_id === recruiter_id);
  }

  if (state) {
    filteredJobs = filteredJobs.filter(j => j.state === state);
  }

  if (cityFilter) {
    filteredJobs = filteredJobs.filter(j =>
      (j.city || '').toLowerCase() === cityFilter.toLowerCase() ||
      (j.location || '').toLowerCase().includes(cityFilter.toLowerCase())
    );
  }

  if (company_id) {
    filteredJobs = filteredJobs.filter(j => j.company_id == company_id);
  }

  if (companyNameFilter) {
    filteredJobs = filteredJobs.filter(j =>
      (j.company_name || '').toLowerCase() === companyNameFilter.toLowerCase()
    );
  }

  if (search) {
    filteredJobs = filteredJobs.filter(j =>
      j.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (categoryFilter) {
    filteredJobs = filteredJobs.filter(j => {
      if (!j.category) return false;
      try {
        const cats = typeof j.category === 'string' ? JSON.parse(j.category) : j.category;
        return Array.isArray(cats) ? cats.includes(categoryFilter) : cats === categoryFilter;
      } catch {
        return String(j.category).includes(categoryFilter);
      }
    });
  }

  res.json(filteredJobs);
});

app.post('/backend/jobs.php', verifyToken, upload.single('company_logo'), (req, res) => {
  const {
    title,
    description,
    location,
    state,
    city,
    company_id,
    company_name,
    role_department,
    job_type,
    salary_range,
    experience_level,
    application_deadline,
    qualifications,
    company_size,
    founded_year,
    contact_phone,
    contact_email,
    hr_name,
    isOpen,
    category
  } = req.body;

  const { id } = req.query;
  const logoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.company_logo;

  // category arrives as a JSON string e.g. '["IT & Software","Remote Jobs"]'
  let categoryValue = null;
  if (category) {
    try {
      const parsed = typeof category === 'string' ? JSON.parse(category) : category;
      categoryValue = JSON.stringify(Array.isArray(parsed) ? parsed : [String(parsed)]);
    } catch {
      categoryValue = JSON.stringify([String(category)]);
    }
  }

  const jobData = {
    title,
    description,
    location,
    state,
    city,
    company_id: company_id || null,
    recruiter_id: req.userId,
    company_logo: logoUrl,
    company_name,
    role_department,
    job_type,
    salary_range,
    experience_level,
    application_deadline,
    qualifications: typeof qualifications === 'string' ? qualifications : JSON.stringify(qualifications),
    company_size,
    founded_year,
    contact_phone,
    contact_email,
    hr_name,
    isOpen: isOpen === '1' || isOpen === true || isOpen === 'true',
    category: categoryValue,
  };

  if (id) {
    const jobIndex = jobs.findIndex(j => j.id == id);
    if (jobIndex !== -1) {
      jobs[jobIndex] = { ...jobs[jobIndex], ...jobData, updated_at: new Date().toISOString() };
      saveDb();
      return res.json({ id, success: true, updated: true });
    }
    return res.status(404).json({ error: 'Job not found for update' });
  }

  const newJob = {
    ...jobData,
    id: nextJobId++,
    created_at: new Date().toISOString()
  };

  jobs.push(newJob);
  saveDb();
  res.json({ id: newJob.id, success: true });
});

app.put('/backend/jobs.php', verifyToken, (req, res) => {
  const { id } = req.query;
  const { isOpen } = req.body;

  const job = jobs.find(j => j.id == id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  job.isOpen = isOpen;
  saveDb();
  res.json({ success: true });
});

app.delete('/backend/jobs.php', verifyToken, (req, res) => {
  const { id } = req.query;
  jobs = jobs.filter(j => j.id != id);
  saveDb();
  res.json({ success: true });
});

// ==================== APPLICATIONS ====================

// GET — list applications (filter by job_id / candidate_id / recruiter_id)
app.get('/backend/applications.php', verifyToken, (req, res) => {
  const { job_id, candidate_id, recruiter_id } = req.query;
  let result = [...applications];

  if (job_id) {
    result = result.filter(a => String(a.job_id) === String(job_id));
  }

  if (candidate_id) {
    result = result
      .filter(a => a.candidate_id === candidate_id)
      .map(a => {
        const job = jobs.find(j => String(j.id) === String(a.job_id));
        const company = companies.find(c => c.id === job?.company_id);
        return { ...a, job_title: job?.title || '—', company_name: company?.name || job?.company_name || '—', job_location: job?.location || '—' };
      });
  }

  // Employer view — return all applications for this recruiter's jobs
  if (recruiter_id) {
    const myJobIds = jobs
      .filter(j => j.recruiter_id === recruiter_id)
      .map(j => String(j.id));

    result = result
      .filter(a => myJobIds.includes(String(a.job_id)))
      .map(a => {
        const job = jobs.find(j => String(j.id) === String(a.job_id));
        return { ...a, job_title: job?.title || '—', job_location: job?.location || '—' };
      });
  }

  res.json(result);
});

// POST — upload a resume separately
app.post('/backend/upload-resume.php', verifyToken, upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ success: true, filename: req.file.filename });
});

// POST — submit a new application (plain JSON body — no multer)
app.post('/backend/applications.php', verifyToken, (req, res) => {
  const {
    job_id, name, email, phone,
    experience, education, skills,
    resume_name, availability, expected_salary, cover_letter
  } = req.body;

  const newApp = {
    id: nextAppId++,
    job_id: job_id,
    candidate_id: req.userId,
    name: name || '',
    email: email || '',
    phone: phone || '',
    experience: experience || '',
    education: education || '',
    skills: skills || '',
    resume_name: resume_name || '',
    availability: availability || '',
    expected_salary: expected_salary || '',
    cover_letter: cover_letter || '',
    status: 'applied',
    created_at: new Date().toISOString()
  };

  applications.push(newApp);

  // Ensure candidate profile exists so they always appear in admin panel,
  // even if this application is later deleted by employer/admin.
  if (!profiles.find(p => p.user_id === req.userId)) {
    profiles.push({
      user_id: req.userId,
      photo: '',
      full_name: name || '',
      mobile: phone || '',
      email: email || '',
      dob: '', gender: '', location: '',
      highest_qualification: '', course: '', college: '',
      year_of_passing: '', experience_type: 'Fresher',
      skills: [], resume: '',
      created_at: new Date().toISOString(),
    });
  }

  saveDb();

  console.log('✅ New application saved:', JSON.stringify(newApp, null, 2));
  res.json({ id: newApp.id, success: true });
});

// PUT — update application status
app.put('/backend/applications.php', verifyToken, (req, res) => {
  const { id } = req.query;
  const { status } = req.body;

  const app = applications.find(a => a.id == id);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  app.status = status;
  saveDb();
  res.json({ success: true });
});

// DELETE — remove an application
app.delete('/backend/applications.php', verifyToken, (req, res) => {
  const { id } = req.query;
  const idx = applications.findIndex(a => a.id == id);
  if (idx === -1) return res.status(404).json({ error: 'Application not found' });

  applications.splice(idx, 1);
  saveDb();
  res.json({ success: true });
});

// ==================== SAVED JOBS ====================
app.get('/backend/saved-jobs.php', verifyToken, (req, res) => {
  const userId = req.userId;

  const userSavedJobs = savedJobs
    .filter(sj => sj.user_id === userId)
    .map(sj => {
      const job = jobs.find(j => j.id == sj.job_id);
      return {
        id: sj.id,
        user_id: sj.user_id,
        job_id: sj.job_id,
        created_at: sj.created_at,
        job: job || null
      };
    });

  res.json(userSavedJobs);
});

app.post('/backend/saved-jobs.php', verifyToken, (req, res) => {
  const userId = req.userId;
  const { job_id } = req.body;

  if (!job_id) {
    return res.status(400).json({ error: 'job_id is required' });
  }

  // Check if already saved
  const exists = savedJobs.find(sj => sj.user_id === userId && sj.job_id == job_id);
  if (exists) {
    return res.status(400).json({ error: 'Job already saved' });
  }

  const newSavedJob = {
    id: nextSavedJobId++,
    user_id: userId,
    job_id,
    created_at: new Date().toISOString()
  };

  savedJobs.push(newSavedJob);
  saveDb();
  res.json({ id: newSavedJob.id, success: true });
});

app.delete('/backend/saved-jobs.php', verifyToken, (req, res) => {
  const userId = req.userId;
  const { job_id } = req.body;

  savedJobs = savedJobs.filter(sj => !(sj.user_id === userId && sj.job_id == job_id));
  saveDb();
  res.json({ success: true });
});

// ==================== PROFILES ====================
app.get('/backend/profile.php', verifyToken, (req, res) => {
  const userId = req.userId;
  let profile = profiles.find(p => p.user_id === userId);

  if (!profile) {
    profile = {
      user_id: userId,
      photo: '',
      full_name: '',
      mobile: '',
      email: '',
      dob: '',
      gender: '',
      location: '',
      highest_qualification: '',
      course: '',
      college: '',
      year_of_passing: '',
      experience_type: 'Fresher',
      skills: [],
      resume: '',
      created_at: new Date().toISOString(),
    };
    profiles.push(profile);
    saveDb();
  }

  res.json(profile);
});

app.post('/backend/profile.php', verifyToken, upload.single('photo'), (req, res) => {
  const userId = req.userId;
  const body = req.body;

  // If this candidate was previously archived (re-registration), remove from archives
  const archiveIdx = candidateArchives.findIndex(r => r.candidate_id === userId);
  if (archiveIdx >= 0) {
    candidateArchives.splice(archiveIdx, 1);
  }

  let profileIndex = profiles.findIndex(p => p.user_id === userId);
  const existing = profileIndex >= 0 ? profiles[profileIndex] : {};
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : body.photo;

  // Patch-style: if a field is absent from the request body, keep the existing value
  const pick = (key, fallback = '') =>
    key in body ? (body[key] || fallback) : (existing[key] ?? fallback);

  const updatedProfile = {
    user_id: userId,
    photo: photoUrl || existing.photo || '',
    full_name: pick('full_name'),
    mobile: pick('mobile'),
    email: pick('email'),
    dob: pick('dob'),
    gender: pick('gender'),
    location: pick('location'),
    highest_qualification: pick('highest_qualification'),
    course: pick('course'),
    college: pick('college'),
    year_of_passing: pick('year_of_passing'),
    experience_type: pick('experience_type', 'Fresher'),
    skills: 'skills' in body
      ? (typeof body.skills === 'string' ? JSON.parse(body.skills || '[]') : (body.skills || []))
      : (existing.skills || []),
    resume: pick('resume'),
    updated_at: new Date().toISOString()
  };

  if (profileIndex >= 0) {
    profiles[profileIndex] = { ...existing, ...updatedProfile };
  } else {
    profiles.push(updatedProfile);
  }

  saveDb();
  res.json({ success: true, profile: profileIndex >= 0 ? profiles[profileIndex] : updatedProfile });
});

// ==================== RESUME ====================
// POST — save resume filename to profile
app.post('/backend/resume.php', verifyToken, (req, res) => {
  const userId = req.userId;
  const { resume } = req.body;
  const idx = profiles.findIndex(p => p.user_id === userId);
  if (idx >= 0) {
    profiles[idx].resume = resume || '';
  } else {
    profiles.push({ user_id: userId, resume: resume || '' });
  }
  saveDb();
  res.json({ success: true });
});

// DELETE — clear resume from profile
app.delete('/backend/resume.php', verifyToken, (req, res) => {
  const userId = req.userId;
  const idx = profiles.findIndex(p => p.user_id === userId);
  if (idx >= 0) {
    profiles[idx].resume = '';
    saveDb();
  }
  res.json({ success: true });
});

// ==================== EMPLOYER PROFILE ====================
// GET — fetch own employer profile
app.get('/backend/employer-profile.php', verifyToken, (req, res) => {
  const emp = employers.find(e => e.recruiter_id === req.userId) || {};
  res.json({
    hr_name:      emp.hr_name      || '',
    company_name: emp.company_name || '',
    email:        emp.email        || '',
    mobile:       emp.mobile       || '',
    photo:        emp.photo        || '',
  });
});

// POST — upsert employer profile (called on every dashboard load)
app.post('/backend/employer-profile.php', verifyToken, (req, res) => {
  const { hr_name, company_name, email, mobile } = req.body;
  const recruiter_id = req.userId;

  // If this recruiter was previously archived (re-registration), remove from archives
  const archiveIdx = employerArchives.findIndex(r => r.recruiter_id === recruiter_id);
  if (archiveIdx >= 0) {
    employerArchives.splice(archiveIdx, 1);
  }

  const idx = employers.findIndex(e => e.recruiter_id === recruiter_id);
  if (idx >= 0) {
    employers[idx] = {
      ...employers[idx],
      hr_name:      hr_name      !== undefined ? (hr_name      || employers[idx].hr_name)      : employers[idx].hr_name,
      company_name: company_name !== undefined ? (company_name || employers[idx].company_name) : employers[idx].company_name,
      email:        email        !== undefined ? email        : employers[idx].email,
      mobile:       mobile       !== undefined ? mobile       : employers[idx].mobile,
      updated_at:   new Date().toISOString(),
    };
  } else {
    employers.push({
      id:           nextEmployerId++,
      recruiter_id,
      hr_name:      hr_name      || '',
      company_name: company_name || '',
      email:        email        || '',
      mobile:       mobile       || '',
      created_at:   new Date().toISOString(),
    });
  }
  saveDb();
  res.json({ success: true });
});

// ==================== EMPLOYER AVATAR ====================
app.get('/backend/employer-avatar.php', verifyToken, (req, res) => {
  const emp = employers.find(e => e.recruiter_id === req.userId);
  res.json({ photo: emp?.photo || '' });
});

app.post('/backend/employer-avatar.php', verifyToken, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const photoUrl = `/uploads/${req.file.filename}`;
  const idx = employers.findIndex(e => e.recruiter_id === req.userId);
  if (idx >= 0) {
    employers[idx].photo = photoUrl;
  } else {
    employers.push({
      id: nextEmployerId++,
      recruiter_id: req.userId,
      photo: photoUrl,
      hr_name: '', company_name: '', email: '', mobile: '',
      created_at: new Date().toISOString(),
    });
  }
  saveDb();
  res.json({ success: true, photo: photoUrl });
});

// ==================== ADMIN ====================
const ADMIN_EMAIL = 'balagopikaloganathan@gmail.com';
const ADMIN_TOKEN = 'CAREERHUB_ADMIN_2026';
let adminResetTokens = [];
let adminOtps = []; // { email, otp, expiresAt, used }

async function sendOtpEmail(toEmail, otp) {
  const mailOptions = {
    from: `"CareerHub Admin" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'CareerHub Admin — Password Reset Code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">Admin Password Reset</h2>
        <p style="color:#475569;margin-bottom:24px;">Use the code below to reset your CareerHub admin password. It expires in <strong>10 minutes</strong>.</p>
        <div style="background:#1e293b;color:#f97316;font-size:36px;font-weight:bold;letter-spacing:12px;
                    text-align:center;padding:24px;border-radius:10px;margin-bottom:24px;">
          ${otp}
        </div>
        <p style="color:#94a3b8;font-size:13px;">If you did not request this, please ignore this email. Do not share this code with anyone.</p>
      </div>
    `,
  };

  // Try port 587 (STARTTLS), then 465 (SSL) — both forced to IPv4
  const configs = [
    { host: 'smtp.gmail.com', port: 587, secure: false },
    { host: 'smtp.gmail.com', port: 465, secure: true  },
  ];

  let lastError = null;
  for (const cfg of configs) {
    try {
      const transporter = nodemailer.createTransport({
        ...cfg,
        family: 4,
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        tls: { rejectUnauthorized: false },
      });
      await transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent via port ${cfg.port}`);
      return { sent: true };
    } catch (err) {
      lastError = err;
      console.error(`❌ Port ${cfg.port} failed: ${err.message}`);
    }
  }
  return { sent: false, error: lastError?.message || 'Unknown error' };
}

function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Admin unauthorized' });
  }
  next();
}

// POST — admin login (accepts full email OR short alias "Bala@123")
app.post('/backend/admin/login.php', (req, res) => {
  const { email, password } = req.body;
  const isValidId = email === ADMIN_EMAIL || email === 'Bala@123';
  if (isValidId && password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_TOKEN });
  }
  return res.status(401).json({ success: false, error: 'Invalid credentials' });
});

// POST — admin forgot password: validate email, generate OTP, send via Gmail
app.post('/backend/admin/forgot-password.php', async (req, res) => {
  const { email } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }

  if (email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(404).json({ success: false, error: 'No Registered Email Id Found' });
  }

  // Generate 6-digit OTP, valid for 10 minutes
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + 1000 * 60 * 10;
  // Invalidate any previous unused OTPs for this email
  adminOtps = adminOtps.filter(o => o.email !== email);
  adminOtps.push({ email, otp, expiresAt, used: false });
  console.log(`Admin OTP generated for ${email}: ${otp}`);

  const result = await sendOtpEmail(email, otp);
  if (result.sent) {
    return res.json({ success: true, message: 'OTP sent to admin email' });
  }
  // Email delivery failed — return OTP for local dev + include the real error
  return res.json({
    success: true,
    devOtp: otp,
    emailError: result.error,
    message: 'OTP generated (email delivery failed)',
  });
});

// POST — admin verify OTP and obtain reset token
app.post('/backend/admin/verify-otp.php', (req, res) => {
  const { email, otp } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP are required' });
  }

  const record = adminOtps.find(
    o => o.email === email && o.otp === String(otp) && !o.used
  );

  if (!record) {
    return res.status(400).json({ success: false, error: 'Invalid verification code. Please check and try again.' });
  }

  if (record.expiresAt < Date.now()) {
    return res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new one.' });
  }

  record.used = true;

  // Generate a secure reset token valid for 15 minutes
  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiresAt = Date.now() + 1000 * 60 * 15;
  adminResetTokens.push({ email, token, expiresAt: tokenExpiresAt, used: false });

  return res.json({ success: true, token });
});

// POST — admin reset password
app.post('/backend/admin/reset-password.php', (req, res) => {
  const { token, password } = req.body || {};

  if (!token || !password) {
    return res.status(400).json({ success: false, error: 'Token and new password are required' });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' });
  }

  const tokenRecord = adminResetTokens.find((record) => record.token === token);
  if (!tokenRecord || tokenRecord.used || tokenRecord.email !== ADMIN_EMAIL) {
    return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
  }

  if (tokenRecord.expiresAt < Date.now()) {
    return res.status(400).json({ success: false, error: 'Reset token has expired' });
  }

  tokenRecord.used = true;
  ADMIN_PASSWORD = password;
  saveDb();
  return res.json({ success: true, message: 'Password updated successfully' });
});

// DELETE — archive + delete an entire employer (all jobs + applications)
app.delete('/backend/admin/employer-full.php', verifyAdmin, (req, res) => {
  const { recruiter_id } = req.query;
  const { reason } = req.body || {};
  if (!recruiter_id) return res.status(400).json({ error: 'recruiter_id required' });

  const employerProfile = employers.find(e => e.recruiter_id === recruiter_id) || {};
  const employerJobs = jobs.filter(j => j.recruiter_id === recruiter_id);
  const jobIds = employerJobs.map(j => String(j.id));
  const employerApplications = applications.filter(a => jobIds.includes(String(a.job_id)));

  employerArchives.push({
    recruiter_id,
    employer_info: {
      hr_name:      employerProfile.hr_name      || '',
      company_name: employerProfile.company_name || '',
      email:        employerProfile.email        || '',
      mobile:       employerProfile.mobile       || '',
      created_at:   employerProfile.created_at   || null,
    },
    jobs: employerJobs,
    applications: employerApplications,
    reason: reason || '',
    archived_at: new Date().toISOString(),
    archived_by: 'admin',
  });

  employers    = employers.filter(e => e.recruiter_id !== recruiter_id);
  jobs         = jobs.filter(j => j.recruiter_id !== recruiter_id);
  applications = applications.filter(a => !jobIds.includes(String(a.job_id)));
  savedJobs    = savedJobs.filter(s => !jobIds.includes(String(s.job_id)));
  saveDb();
  res.json({ success: true });
});

// DELETE — archive + delete an entire candidate (profile + all applications)
app.delete('/backend/admin/candidate-full.php', verifyAdmin, (req, res) => {
  const { candidate_id } = req.query;
  const { reason } = req.body || {};
  if (!candidate_id) return res.status(400).json({ error: 'candidate_id required' });

  const profile = profiles.find(p => p.user_id === candidate_id) || {};
  const candidateApps = applications.filter(a => a.candidate_id === candidate_id);

  candidateArchives.push({
    candidate_id,
    profile: {
      full_name:  profile.full_name  || '',
      email:      profile.email      || '',
      mobile:     profile.mobile     || '',
      created_at: profile.created_at || null,
    },
    applications: candidateApps,
    reason: reason || '',
    archived_at: new Date().toISOString(),
    archived_by: 'admin',
  });

  profiles     = profiles.filter(p => p.user_id !== candidate_id);
  applications = applications.filter(a => a.candidate_id !== candidate_id);
  savedJobs    = savedJobs.filter(s => s.user_id !== candidate_id);
  saveDb();
  res.json({ success: true });
});

// GET — archived employers or candidates (admin view)
app.get('/backend/admin/archives.php', verifyAdmin, (req, res) => {
  const { type } = req.query;
  if (type === 'candidates') return res.json(candidateArchives);
  return res.json(employerArchives);
});

// POST — lift access (restore an archived user — removes from archive entirely)
app.post('/backend/admin/lift-access.php', verifyAdmin, (req, res) => {
  const { user_id, type } = req.body || {};
  if (!user_id || !type) return res.status(400).json({ error: 'user_id and type required' });

  if (type === 'employer') {
    const idx = employerArchives.findIndex(r => r.recruiter_id === user_id);
    if (idx === -1) return res.status(404).json({ error: 'Archive record not found' });
    employerArchives.splice(idx, 1);
  } else if (type === 'candidate') {
    const idx = candidateArchives.findIndex(r => r.candidate_id === user_id);
    if (idx === -1) return res.status(404).json({ error: 'Archive record not found' });
    candidateArchives.splice(idx, 1);
  } else {
    return res.status(400).json({ error: 'Invalid type' });
  }

  saveDb();
  res.json({ success: true });
});

// POST — permanently block an archived user (marks the archive record as permanent)
app.post('/backend/admin/permanently-block.php', verifyAdmin, (req, res) => {
  const { user_id, type } = req.body || {};
  if (!user_id || !type) return res.status(400).json({ error: 'user_id and type required' });

  if (type === 'employer') {
    const record = employerArchives.find(r => r.recruiter_id === user_id);
    if (!record) return res.status(404).json({ error: 'Archive record not found' });
    record.permanently_blocked = true;
    record.permanently_blocked_at = new Date().toISOString();
  } else if (type === 'candidate') {
    const record = candidateArchives.find(r => r.candidate_id === user_id);
    if (!record) return res.status(404).json({ error: 'Archive record not found' });
    record.permanently_blocked = true;
    record.permanently_blocked_at = new Date().toISOString();
  } else {
    return res.status(400).json({ error: 'Invalid type' });
  }

  saveDb();
  res.json({ success: true });
});

// GET — check if a user_id or email is archived (used by frontend before login/forgot-password)
app.get('/backend/check-archived.php', (req, res) => {
  const { user_id, email } = req.query;

  if (user_id) {
    const isEmployer  = employerArchives.some(r => r.recruiter_id === user_id);
    const isCandidate = candidateArchives.some(r => r.candidate_id === user_id);
    if (isEmployer)  return res.json({ archived: true, type: 'employer' });
    if (isCandidate) return res.json({ archived: true, type: 'candidate' });
    return res.json({ archived: false, type: null });
  }

  if (email) {
    const norm = email.toLowerCase().trim();
    const isEmployer  = employerArchives.some(r =>
      (r.employer_info?.email || '').toLowerCase() === norm
    );
    const isCandidate = candidateArchives.some(r =>
      (r.profile?.email || '').toLowerCase() === norm
    );
    if (isEmployer)  return res.json({ archived: true, type: 'employer' });
    if (isCandidate) return res.json({ archived: true, type: 'candidate' });
    return res.json({ archived: false, type: null });
  }

  return res.status(400).json({ error: 'user_id or email required' });
});

// GET — admin stats
app.get('/backend/admin/stats.php', verifyAdmin, (req, res) => {
  // Count unique employers: from employers table + any recruiter_ids in jobs not yet in table
  const knownIds = new Set(employers.map(e => e.recruiter_id));
  jobs.forEach(j => { if (j.recruiter_id) knownIds.add(j.recruiter_id); });
  const totalEmployers  = knownIds.size;
  // Candidates: profiles table + any candidate_ids in applications not yet profiled
  const knownCandIds = new Set(profiles.map(p => p.user_id));
  applications.forEach(a => { if (a.candidate_id) knownCandIds.add(a.candidate_id); });
  const totalCandidates = knownCandIds.size;
  res.json({ employers: totalEmployers, candidates: totalCandidates, applications: applications.length });
});

// GET — admin logo
app.get('/backend/admin/logo.php', verifyAdmin, (req, res) => {
  res.json({ logo: adminLogo });
});

// POST — upload admin logo
app.post('/backend/admin/logo.php', verifyAdmin, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  adminLogo = `/uploads/${req.file.filename}`;
  saveDb();
  res.json({ success: true, logo: adminLogo });
});

// GET — all employers with their jobs (one row per job; employers with no jobs get one row too)
app.get('/backend/admin/employers.php', verifyAdmin, (req, res) => {
  const result = [];

  // Build lookup: recruiter_id → employer profile row
  const empMap = {};
  employers.forEach(e => { empMap[e.recruiter_id] = e; });

  // Jobs grouped per recruiter
  const jobsByRecruiter = {};
  jobs.forEach(j => {
    if (!jobsByRecruiter[j.recruiter_id]) jobsByRecruiter[j.recruiter_id] = [];
    jobsByRecruiter[j.recruiter_id].push(j);
  });

  // Collect all recruiter IDs (from both employers table and jobs)
  const allRecruiters = new Set([
    ...employers.map(e => e.recruiter_id),
    ...jobs.map(j => j.recruiter_id).filter(Boolean),
  ]);

  allRecruiters.forEach(rid => {
    const emp   = empMap[rid] || {};
    const rJobs = jobsByRecruiter[rid] || [];

    if (rJobs.length === 0) {
      // Employer registered but no jobs posted yet
      result.push({
        job_id:        null,
        recruiter_id:  rid,
        hr_name:       emp.hr_name      || '—',
        company_name:  emp.company_name || '—',
        contact_phone: emp.mobile       || '—',
        contact_email: emp.email        || '—',
        job_title:     '—',
        location:      '—',
        created_at:    emp.created_at   || null,
        applicants:    [],
        applicant_count: 0,
      });
    } else {
      rJobs.forEach(job => {
        const jobApps = applications.filter(a => String(a.job_id) === String(job.id));
        result.push({
          job_id:               job.id,
          recruiter_id:         rid,
          hr_name:              emp.hr_name || job.hr_name || '',
          company_name:         emp.company_name  || job.company_name  || '—',
          contact_phone:        emp.mobile        || job.contact_phone || '—',
          contact_email:        emp.email         || job.contact_email || '—',
          job_title:            job.title,
          role_department:      job.role_department || '—',
          location:             job.location || job.city || job.state || '—',
          state:                job.state || '—',
          city:                 job.city || '—',
          job_type:             job.job_type      || '—',
          salary_range:         job.salary_range  || '—',
          experience_level:     job.experience_level || '—',
          application_deadline: job.application_deadline || '—',
          company_size:         job.company_size  || '—',
          founded_year:         job.founded_year  || '—',
          description:          job.description   || '—',
          qualifications:       job.qualifications || '',
          created_at:           job.created_at,
          applicants:           jobApps,
          applicant_count:      jobApps.length,
        });
      });
    }
  });

  res.json(result);
});

// DELETE — admin delete a job (and its applications)
app.delete('/backend/admin/employers.php', verifyAdmin, (req, res) => {
  const { job_id } = req.query;
  const before = jobs.length;
  jobs = jobs.filter(j => j.id != job_id);
  if (jobs.length === before) return res.status(404).json({ error: 'Job not found' });
  applications = applications.filter(a => String(a.job_id) !== String(job_id));
  saveDb();
  res.json({ success: true });
});

// PUT — admin edit a job
app.put('/backend/admin/employers.php', verifyAdmin, upload.single('company_logo'), (req, res) => {
  const { job_id } = req.query;
  const idx = jobs.findIndex(j => j.id == job_id);
  if (idx === -1) return res.status(404).json({ error: 'Job not found' });
  const {
    hr_name,
    company_name,
    contact_email,
    contact_phone,
    job_title,
    location,
    role_department,
    job_type,
    salary_range,
    experience_level,
    application_deadline,
    company_size,
    founded_year,
    description,
    qualifications,
    state,
    city,
    category,
  } = req.body;
  if (req.file) {
    jobs[idx].company_logo = `/uploads/${req.file.filename}`;
  }
  if (hr_name            !== undefined) jobs[idx].hr_name              = hr_name;
  if (company_name       !== undefined) jobs[idx].company_name        = company_name;
  if (contact_email      !== undefined) jobs[idx].contact_email        = contact_email;
  if (contact_phone      !== undefined) jobs[idx].contact_phone        = contact_phone;
  if (job_title          !== undefined) jobs[idx].title                = job_title;
  if (location           !== undefined) jobs[idx].location             = location;
  if (role_department    !== undefined) jobs[idx].role_department      = role_department;
  if (job_type           !== undefined) jobs[idx].job_type             = job_type;
  if (salary_range       !== undefined) jobs[idx].salary_range         = salary_range;
  if (experience_level   !== undefined) jobs[idx].experience_level     = experience_level;
  if (application_deadline !== undefined) jobs[idx].application_deadline = application_deadline;
  if (company_size       !== undefined) jobs[idx].company_size         = company_size;
  if (founded_year       !== undefined) jobs[idx].founded_year         = founded_year;
  if (description        !== undefined) jobs[idx].description          = description;
  if (qualifications !== undefined) {
    if (typeof qualifications === 'string' && qualifications.trim()) {
      try {
        const parsed = JSON.parse(qualifications);
        jobs[idx].qualifications = JSON.stringify(Array.isArray(parsed) ? parsed : [String(parsed)]);
      } catch {
        const qualsArray = qualifications.split(',').map(q => q.trim()).filter(q => q);
        jobs[idx].qualifications = JSON.stringify(qualsArray);
      }
    } else {
      jobs[idx].qualifications = qualifications;
    }
  }
  if (category !== undefined) {
    try {
      const parsed = typeof category === 'string' ? JSON.parse(category) : category;
      jobs[idx].category = JSON.stringify(Array.isArray(parsed) ? parsed : [String(parsed)]);
    } catch {
      jobs[idx].category = JSON.stringify([String(category)]);
    }
  }
  if (state              !== undefined) jobs[idx].state                = state;
  if (city               !== undefined) jobs[idx].city                 = city;
  jobs[idx].updated_at = new Date().toISOString();
  saveDb();
  res.json({ success: true });
});

// GET — all candidates (profiles + applications merged, one row per application)
app.get('/backend/admin/candidates.php', verifyAdmin, (req, res) => {
  const result = [];
  const profileMap = {};
  profiles.forEach(p => { profileMap[p.user_id] = p; });

  // Candidates who have applied — enriched with profile data
  const seenCandidates = new Set();
  applications.forEach(a => {
    const prof = profileMap[a.candidate_id] || {};
    const job  = jobs.find(j => String(j.id) === String(a.job_id));
    seenCandidates.add(a.candidate_id);
    result.push({
      id:           a.id,
      candidate_id: a.candidate_id,
      name:         prof.full_name  || a.name  || '—',
      email:        prof.email      || a.email || '—',
      phone:        prof.mobile     || a.phone || '—',
      company_name: job?.company_name || '—',
      job_title:    job?.title        || '—',
      applied_date: a.created_at,
      status:       a.status || 'applied',
    });
  });

  // Candidates who have a profile but haven't applied yet
  profiles.forEach(p => {
    if (!seenCandidates.has(p.user_id)) {
      result.push({
        id:           p.user_id,
        candidate_id: p.user_id,
        name:         p.full_name || '—',
        email:        p.email     || '—',
        phone:        p.mobile    || '—',
        company_name: '—',
        job_title:    '—',
        applied_date: null,
        status:       'registered',
      });
    }
  });

  res.json(result);
});

// DELETE — admin delete a candidate application
app.delete('/backend/admin/candidates.php', verifyAdmin, (req, res) => {
  const { app_id } = req.query;
  applications = applications.filter(a => a.id != app_id);
  saveDb();
  res.json({ success: true });
});

// GET — applications (job-centric view)
app.get('/backend/admin/applications.php', verifyAdmin, (req, res) => {
  const result = jobs.map(job => {
    const jobApps = applications.filter(a => String(a.job_id) === String(job.id));
    return {
      job_id:             job.id,
      company_name:       job.company_name   || '—',
      company_email:      job.contact_email  || '—',
      company_phone:      job.contact_phone  || '—',
      job_title:          job.title,
      location:           job.location || job.city || '—',
      posted_date:        job.created_at,
      application_deadline: job.application_deadline || '—',
      application_count:  jobApps.length,
      applicants:         jobApps,
    };
  });
  res.json(result);
});

// DELETE — admin delete a job via applications view
app.delete('/backend/admin/applications.php', verifyAdmin, (req, res) => {
  const { job_id } = req.query;
  const before = jobs.length;
  jobs = jobs.filter(j => j.id != job_id);
  if (jobs.length === before) return res.status(404).json({ error: 'Job not found' });
  applications = applications.filter(a => String(a.job_id) !== String(job_id));
  saveDb();
  res.json({ success: true });
});

// ==================== HEALTH CHECK ====================
app.get('/backend/health', (req, res) => {
  const dbExists = fs.existsSync(dbFilePath);
  res.json({
    status: 'ok',
    dbFile: dbFilePath,
    dbExists,
    counts: {
      jobs: jobs.length,
      companies: companies.length,
      applications: applications.length,
      savedJobs: savedJobs.length,
      profiles: profiles.length
    }
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log(`🚀 Job Portal Backend running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`💾 Database file: ${dbFilePath}`);
  console.log(`📊 Current data: ${jobs.length} jobs, ${companies.length} companies`);
  console.log('='.repeat(60));
  console.log('');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});