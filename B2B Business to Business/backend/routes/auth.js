const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'b2b-marketplace-super-secret-key-12345';

const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, role: true, companyName: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found or deleted' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
        }
        next();
    };
};

router.post('/register', async (req, res) => {
    const { email, password, name, companyName, phone, logoUrl, about, role } = req.body;

    if (!email || !password || !name || !role) {
        return res.status(400).json({ error: 'Email, password, name and role are required' });
    }

    const validRoles = ['SUPER_ADMIN', 'SELLER', 'BUYER'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role configuration' });
    }

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'Email address is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                companyName: companyName || null,
                phone: phone || null,
                logoUrl: logoUrl || null,
                about: about || null,
                role
            },
            select: { id: true, email: true, name: true, role: true, companyName: true, phone: true, logoUrl: true, about: true, createdAt: true }
        });

        res.status(201).json({ success: true, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (user.twoFactorEnabled) {
            return res.json({
                success: true,
                twoFactorRequired: true,
                userId: user.id
            });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyName: user.companyName,
                phone: user.phone,
                logoUrl: user.logoUrl,
                about: user.about
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

router.post('/verify-2fa', async (req, res) => {
    const { userId, code } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (code !== '123456') {
            return res.status(400).json({ error: 'Geçersiz doğrulama kodu! Test için 123456 yazın.' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyName: user.companyName,
                phone: user.phone,
                logoUrl: user.logoUrl,
                about: user.about
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error during 2FA verification' });
    }
});

router.get('/profile', authenticateJWT, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                companyName: true,
                phone: true,
                logoUrl: true,
                about: true,
                role: true,
                pendingEmail: true,
                pendingPhone: true,
                twoFactorEnabled: true,
                avatarUrl: true,
                companyEmail: true,
                companyPhone: true,
                companyEmailVerified: true,
                companyPhoneVerified: true
            }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve profile details' });
    }
});

router.put('/profile', authenticateJWT, async (req, res) => {
    const { companyName, logoUrl, about, email, phone, twoFactorEnabled, avatarUrl, companyEmail, companyPhone, companyEmailVerified, companyPhoneVerified } = req.body;
    try {
        const currentUser = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        const updateData = {};

        if (companyName !== undefined) updateData.companyName = companyName;
        if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
        if (about !== undefined) updateData.about = about;
        if (twoFactorEnabled !== undefined) updateData.twoFactorEnabled = twoFactorEnabled;
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
        if (companyEmail !== undefined) updateData.companyEmail = companyEmail;
        if (companyPhone !== undefined) updateData.companyPhone = companyPhone;

        if (email !== undefined && email !== currentUser.email) {
            updateData.pendingEmail = email;
        }
        if (phone !== undefined && phone !== currentUser.phone) {
            updateData.pendingPhone = phone;
        }

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                companyName: true,
                phone: true,
                logoUrl: true,
                about: true,
                role: true,
                pendingEmail: true,
                pendingPhone: true,
                twoFactorEnabled: true,
                avatarUrl: true,
                companyEmail: true,
                companyPhone: true,
                companyEmailVerified: true,
                companyPhoneVerified: true
            }
        });

        res.json({ success: true, user: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update profile settings' });
    }
});

router.get('/pending-approvals', authenticateJWT, requireRole(['SUPER_ADMIN']), async (req, res) => {
    try {
        const list = await prisma.user.findMany({
            where: {
                OR: [
                    { NOT: { pendingEmail: null } },
                    { NOT: { pendingPhone: null } }
                ]
            },
            select: {
                id: true,
                email: true,
                phone: true,
                name: true,
                companyName: true,
                pendingEmail: true,
                pendingPhone: true
            }
        });
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch pending approval list' });
    }
});

router.post('/approve-profile/:userId', authenticateJWT, requireRole(['SUPER_ADMIN']), async (req, res) => {
    const userId = Number(req.params.userId);
    try {
        const target = await prisma.user.findUnique({ where: { id: userId } });
        if (!target) return res.status(404).json({ error: 'User not found' });

        const updateData = {};
        if (target.pendingEmail) updateData.email = target.pendingEmail;
        if (target.pendingPhone) updateData.phone = target.pendingPhone;

        updateData.pendingEmail = null;
        updateData.pendingPhone = null;

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        res.json({ success: true, message: 'Profil degisiklikleri onaylandi.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to approve profile changes' });
    }
});

router.post('/reject-profile/:userId', authenticateJWT, requireRole(['SUPER_ADMIN']), async (req, res) => {
    const userId = Number(req.params.userId);
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                pendingEmail: null,
                pendingPhone: null
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to reject profile changes' });
    }
});

router.post('/verify-company', authenticateJWT, async (req, res) => {
    const { type, code } = req.body;
    if (!type || !code) {
        return res.status(400).json({ error: 'Verification type and code are required' });
    }

    if (code !== '123456') {
        return res.status(400).json({ error: 'Geçersiz doğrulama kodu! Test için 123456 yazın.' });
    }

    try {
        const updateData = {};
        if (type === 'email') {
            updateData.companyEmailVerified = true;
        } else if (type === 'phone') {
            updateData.companyPhoneVerified = true;
        } else {
            return res.status(400).json({ error: 'Invalid verification type' });
        }

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                companyName: true,
                phone: true,
                logoUrl: true,
                about: true,
                role: true,
                pendingEmail: true,
                pendingPhone: true,
                twoFactorEnabled: true,
                avatarUrl: true,
                companyEmail: true,
                companyPhone: true,
                companyEmailVerified: true,
                companyPhoneVerified: true
            }
        });

        res.json({ success: true, user: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to verify company detail' });
    }
});

module.exports = {
    router,
    authenticateJWT,
    requireRole
};
