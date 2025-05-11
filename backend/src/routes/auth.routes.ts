import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { loginUser } from '../repositories/login.user';

dotenv.config();

const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.get('/google', (req, res) => {
  const scope = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

  res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
  const code = req.query.code as string;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    const googleUser = await userInfoResponse.json();

    const user = await loginUser(
      googleUser.given_name,
      googleUser.family_name,
      googleUser.email,
      googleUser.id
    )

    const payload = {
      role: user.role,
      google_subject: googleUser.id,
      email: googleUser.email,
      verified_email: googleUser.verified_email,
      name: googleUser.name,
      given_name: googleUser.given_name,
      family_name: googleUser.family_name,
      picture: googleUser.picture
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.redirect(`${FRONTEND_URL}?token=${token}`);
  } catch (err) {
    console.error('OAuth error', err);
    res.status(500).send('Authentication failed');
  }
});

export default router;
