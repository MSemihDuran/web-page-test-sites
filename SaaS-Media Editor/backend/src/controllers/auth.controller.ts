import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'local_dev_secret_key_12345';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName, companyName, designPurpose, isSubscribed } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and Full Name are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        companyName: companyName || null,
        designPurpose: designPurpose || null,
        isSubscribed: isSubscribed === true || isSubscribed === 'true',
      },
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        designPurpose: user.designPurpose,
        isSubscribed: user.isSubscribed,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        designPurpose: user.designPurpose,
        isSubscribed: user.isSubscribed,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

export async function me(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    return res.json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export async function toggleSubscription(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { isSubscribed: !req.user.isSubscribed },
      select: { 
        id: true, 
        email: true, 
        fullName: true,
        companyName: true,
        designPurpose: true,
        isSubscribed: true, 
        twoFactorEnabled: true, 
        createdAt: true 
      },
    });

    return res.json({
      message: 'Subscription updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Toggle subscription error:', error);
    return res.status(500).json({ error: 'Internal server error updating subscription.' });
  }
}

export async function subscribe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { cardName, cardNumber, cardExpiry, cardCvv } = req.body;
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      return res.status(400).json({ error: 'All payment fields are required.' });
    }

    // Mock Card validations
    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.length !== 16 || isNaN(Number(cleanNum))) {
      return res.status(400).json({ error: 'Card number must be exactly 16 digits.' });
    }
    if (cardCvv.trim().length !== 3 || isNaN(Number(cardCvv.trim()))) {
      return res.status(400).json({ error: 'CVV code must be 3 digits.' });
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
      return res.status(400).json({ error: 'Expiry date must be in MM/YY format.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { isSubscribed: true },
      select: { 
        id: true, 
        email: true, 
        fullName: true,
        companyName: true,
        designPurpose: true,
        isSubscribed: true, 
        twoFactorEnabled: true, 
        createdAt: true 
      },
    });

    return res.json({
      message: 'Subscription updated successfully. Premium activated!',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Mock check subscription payment error:', error);
    return res.status(500).json({ error: 'Internal server error processing mock transaction.' });
  }
}

export async function setup2FA(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const secret = `STUDIO_2FA_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=8b5cf6&data=${encodeURIComponent(
      `otpauth://totp/SaaS%20Canvas%20Studio:${req.user.email}?secret=${secret}&issuer=SaaSCanvasStudio`
    )}`;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorSecret: secret },
    });

    return res.json({ secret, qrCodeUrl });
  } catch (error) {
    console.error('2FA setup error:', error);
    return res.status(500).json({ error: 'Internal server error initializing 2-factor authentication.' });
  }
}

export async function verify2FA(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { pin } = req.body;
    if (!pin || pin.trim().length !== 6 || isNaN(Number(pin.trim()))) {
      return res.status(400).json({ error: 'Invalid verification pin. Must be a 6-digit code.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorEnabled: true },
      select: { 
        id: true, 
        email: true, 
        fullName: true,
        companyName: true,
        designPurpose: true,
        isSubscribed: true, 
        twoFactorEnabled: true, 
        createdAt: true 
      },
    });

    return res.json({
      message: 'Two-factor authentication enabled successfully!',
      user: updatedUser,
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({ error: 'Internal server error verifying 2-factor code.' });
  }
}

export async function disable2FA(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
      select: { 
        id: true, 
        email: true, 
        fullName: true,
        companyName: true,
        designPurpose: true,
        isSubscribed: true, 
        twoFactorEnabled: true, 
        createdAt: true 
      },
    });

    return res.json({
      message: 'Two-factor authentication disabled successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('2FA disabling error:', error);
    return res.status(500).json({ error: 'Internal server error disabling 2-factor authentication.' });
  }
}
