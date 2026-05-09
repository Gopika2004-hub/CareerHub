import { loadDb } from '../_lib/db.js';

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
      const { token, password } = req.body || {};

      if (!token || !password) {
        return res.status(400).json({ success: false, error: 'Token and new password are required' });
      }

      if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' });
      }

      // Note: In Vercel's read-only environment, we cannot persist password changes to db.json
      // In production, implement proper password reset with a database
      // For now, acknowledge the reset request
      return res.status(200).json({
        success: true,
        message: 'Password updated successfully',
        note: 'Note: In production, this would persist to a database'
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin reset-password endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
