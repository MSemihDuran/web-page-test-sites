import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isSubscribed: boolean;
    createdAt: Date;
    twoFactorEnabled: boolean;
    fullName: string;
    companyName: string | null;
    designPurpose: string | null;
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'local_dev_secret_key_12345') as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        email: true, 
        isSubscribed: true, 
        createdAt: true, 
        twoFactorEnabled: true,
        fullName: true,
        companyName: true,
        designPurpose: true
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found or deleted.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}
