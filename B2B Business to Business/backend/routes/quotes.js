const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT, requireRole } = require('./auth');

const prisma = new PrismaClient();

const emitSocketEvent = (req, room, eventName, payload) => {
    const io = req.app.get('io');
    if (io) {
        io.to(room).emit(eventName, payload);
    }
};

router.get('/', authenticateJWT, async (req, res) => {
    try {
        let whereClause = {};
        if (req.user.role === 'BUYER') {
            whereClause.buyerId = req.user.id;
        } else if (req.user.role === 'SELLER') {
            whereClause.sellerId = req.user.id;
        }

        const quotes = await prisma.quoteRequest.findMany({
            where: whereClause,
            include: {
                product: {
                    select: { id: true, title: true, imageUrl: true }
                },
                buyer: {
                    select: { id: true, name: true, companyName: true, email: true }
                },
                seller: {
                    select: { id: true, name: true, companyName: true, email: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json(quotes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve quotes' });
    }
});

router.get('/:id', authenticateJWT, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid quote ID' });

    try {
        const quote = await prisma.quoteRequest.findUnique({
            where: { id },
            include: {
                product: true,
                buyer: { select: { id: true, name: true, companyName: true, email: true } },
                seller: { select: { id: true, name: true, companyName: true, email: true } },
                messages: {
                    include: {
                        sender: { select: { id: true, name: true, role: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!quote) return res.status(404).json({ error: 'Quote request not found' });

        if (quote.buyerId !== req.user.id && quote.sellerId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Forbidden: You are not a participant in this quote request' });
        }

        res.json(quote);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve quote details' });
    }
});

router.post('/', authenticateJWT, requireRole(['BUYER', 'SUPER_ADMIN']), async (req, res) => {
    const { productId, notes } = req.body;

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
        const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.sellerId === req.user.id) {
            return res.status(400).json({ error: 'You cannot request a quote for your own product' });
        }

        const quote = await prisma.quoteRequest.create({
            data: {
                productId: product.id,
                buyerId: req.user.id,
                sellerId: product.sellerId,
                status: 'PENDING',
                notes: notes || null
            },
            include: {
                product: { select: { title: true } },
                buyer: { select: { name: true, companyName: true } }
            }
        });

        emitSocketEvent(req, `user_${product.sellerId}`, 'quote_notification', {
            type: 'NEW_QUOTE',
            quoteId: quote.id,
            message: `${quote.buyer.name} (${quote.buyer.companyName || 'Alıcı'}) adlı firmadan '${quote.product.title}' ürünü için yeni bir teklif talebi geldi!`
        });

        res.status(201).json({ success: true, quote });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit quote request' });
    }
});

router.post('/:id/offer', authenticateJWT, requireRole(['SELLER', 'BUYER', 'SUPER_ADMIN']), async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid quote ID' });

    const { proposedPrice } = req.body;
    if (!proposedPrice || isNaN(Number(proposedPrice))) {
        return res.status(400).json({ error: 'Valid proposed price is required' });
    }

    try {
        const quote = await prisma.quoteRequest.findUnique({
            where: { id },
            include: { product: { select: { title: true } }, seller: { select: { name: true } } }
        });

        if (!quote) return res.status(404).json({ error: 'Quote request not found' });

        if (quote.sellerId !== req.user.id && quote.buyerId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Forbidden: You do not own this quote request' });
        }

        const updated = await prisma.quoteRequest.update({
            where: { id },
            data: {
                status: 'OFFERED',
                proposedPrice: Number(proposedPrice),
                lastProposerId: req.user.id
            }
        });

        const notifyUserId = req.user.id === quote.buyerId ? quote.sellerId : quote.buyerId;
        emitSocketEvent(req, `user_${notifyUserId}`, 'quote_notification', {
            type: 'OFFER_MADE',
            quoteId: quote.id,
            message: `${quote.seller.name} firması '${quote.product.title}' ürünü için fiyat teklifi verdi: ${Number(proposedPrice).toLocaleString()} TRY`
        });

        emitSocketEvent(req, `quote_${quote.id}`, 'quote_update', updated);

        res.json({ success: true, quote: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to post price proposal' });
    }
});

router.post('/:id/status', authenticateJWT, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid quote ID' });

    const { status } = req.body;
    const allowedStatuses = ['APPROVED', 'REJECTED'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED' });
    }

    try {
        const quote = await prisma.quoteRequest.findUnique({
            where: { id },
            include: { product: { select: { title: true } }, buyer: { select: { name: true } } }
        });

        if (!quote) return res.status(404).json({ error: 'Quote request not found' });

        if ((quote.lastProposerId === null || quote.lastProposerId === req.user.id) && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Only the other party can accept or reject a proposal' });
        }

        const updated = await prisma.quoteRequest.update({
            where: { id },
            data: { status }
        });

        const statusLabel = status === 'APPROVED' ? 'onayladı' : 'reddetti';
        emitSocketEvent(req, `user_${quote.lastProposerId}`, 'quote_notification', {
            type: 'STATUS_CHANGED',
            quoteId: quote.id,
            message: `${quote.buyer.name} firması '${quote.product.title}' ürünü için verdiğiniz fiyat teklifini ${statusLabel}!`
        });

        emitSocketEvent(req, `quote_${quote.id}`, 'quote_update', updated);

        res.json({ success: true, quote: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update quote status' });
    }
});

router.post('/:id/messages', authenticateJWT, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid quote ID' });

    const { text } = req.body;
    if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Message text is required' });
    }

    try {
        const quote = await prisma.quoteRequest.findUnique({ where: { id } });
        if (!quote) return res.status(404).json({ error: 'Quote request not found' });

        if (quote.buyerId !== req.user.id && quote.sellerId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Forbidden: You are not a participant in this quote request' });
        }

        const message = await prisma.quoteMessage.create({
            data: {
                quoteId: id,
                senderId: req.user.id,
                text: text.trim()
            },
            include: {
                sender: { select: { id: true, name: true, role: true } }
            }
        });

        emitSocketEvent(req, `quote_${id}`, 'new_message', message);

        const recipientId = req.user.id === quote.buyerId ? quote.sellerId : quote.buyerId;
        emitSocketEvent(req, `user_${recipientId}`, 'quote_notification', {
            type: 'NEW_CHAT_MESSAGE',
            quoteId: id,
            message: `${req.user.name}: ${text.length > 30 ? text.substring(0, 30) + '...' : text}`
        });

        res.status(201).json({ success: true, message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;
