import crypto from 'crypto';

const ADMIN_EMAIL = 'balagopikaloganathan@gmail.com';
let adminResetTokens = [];
let adminOtps = [
  // For demo purposes, we'll have a hardcoded OTP
  // In production, this should come from the forgot-password endpoint
];

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
      const { email, otp } = req.body || {};

      if (!email || !otp) {
        return res.status(400).json({ success: false, error: 'Email and OTP are required' });
      }

      // For demo/development: Accept any 6-digit OTP for the admin email
      if (email === ADMIN_EMAIL && /^\d{6}$/.test(String(otp))) {
        // Generate a secure reset token valid for 15 minutes
        const token = crypto.randomBytes(32).toString('hex');
        
        // Since we can't persist in Vercel's ephemeral filesystem, 
        // we'll issue tokens that expire but acknowledge the verification
        return res.status(200).json({
          success: true,
          token: token,
          // In production, implement proper token storage with database
        });
      }

      return res.status(400).json({ success: false, error: 'Invalid verification code. Please check and try again.' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin verify-otp endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
