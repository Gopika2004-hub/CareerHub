import { loadDb } from './_lib/db.js';

const ADMIN_EMAIL = 'balagopikaloganathan@gmail.com';
const ADMIN_TOKEN = 'CAREERHUB_ADMIN_2026';

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
    if (req.method === 'POST') {
      const db = loadDb();
      const { email, password } = req.body;
      
      const isValidId = email === ADMIN_EMAIL || email === 'Bala@123';
      if (isValidId && password === db.adminPassword) {
        return res.status(200).json({ success: true, token: ADMIN_TOKEN });
      }
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin login endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
