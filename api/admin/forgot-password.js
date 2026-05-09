import { loadDb } from '../_lib/db.js';
import crypto from 'crypto';

const ADMIN_EMAIL = 'balagopikaloganathan@gmail.com';
let adminOtps = [];

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
      adminOtps = adminOtps.filter(o => o.email !== email);
      adminOtps.push({ email, otp, expiresAt, used: false });
      console.log(`Admin OTP generated for ${email}: ${otp}`);

      // For now, return the OTP in devOtp (in production, send via email)
      return res.status(200).json({
        success: true,
        devOtp: otp,
        message: 'OTP generated (email delivery would happen here)',
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin forgot-password endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
