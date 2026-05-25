import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import * as admin from 'firebase-admin';
import { sendOTP } from '../utils/email';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_college_discovery';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'YOUR_FIREBASE_PROJECT_ID_HERE',
  });
}

// 1. Authenticate (Login or Signup)
router.post('/authenticate', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    
    // Check if user exists
    if (user) {
      if (user.passwordHash) {
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // If password is correct and verified, login directly
        if (user.verificationStatus === 'VERIFIED') {
          const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
          return res.json({
            requireOtp: false,
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
          });
        }
      } else {
        // User exists but has no password (e.g. only logged in via Google previously)
        const passwordHash = await bcrypt.hash(password, 10);
        user = await prisma.user.update({
          where: { email },
          data: { passwordHash }
        });
      }
    } else {
      // User doesn't exist, create a new one
      const passwordHash = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          passwordHash,
          verificationStatus: 'UNVERIFIED'
        }
      });
    }

    // Need to verify via OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiry }
    });

    const sent = await sendOTP(email, otpCode);
    if (!sent) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.json({ requireOtp: true, message: 'Verification OTP sent' });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate OTP
    if (user.otpCode !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return res.status(401).json({ error: 'OTP has expired' });
    }

    // Clear OTP, set verified, and generate JWT
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiry: null, verificationStatus: 'VERIFIED' }
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Google Sign-in
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body; // credential is the Google ID Token
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(credential);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid Google Token' });
    }

    if (!decodedToken || !decodedToken.email) {
      return res.status(400).json({ error: 'Google Token payload is missing email' });
    }

    const { email, name, uid: googleId } = decodedToken;

    // Upsert User based on email, link googleId if not present
    const user = await prisma.user.upsert({
      where: { email },
      update: { googleId },
      create: {
        email,
        name: name || email.split('@')[0],
        googleId,
      }
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
