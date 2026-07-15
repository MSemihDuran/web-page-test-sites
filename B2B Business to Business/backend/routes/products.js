const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateJWT, requireRole } = require('./auth');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    const { category, search, sellerId } = req.query;

    try {
        const whereClause = {};

        if (category && category !== 'All') {
            whereClause.category = category;
        }

        if (sellerId) {
            whereClause.sellerId = Number(sellerId);
        } else {
            whereClause.isActive = true;
        }

        if (search) {
            whereClause.OR = [
                { title: { contains: search } },
                { description: { contains: search } }
            ];
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            include: {
                seller: {
                    select: { id: true, name: true, companyName: true, email: true }
                },
                colorImages: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve products' });
    }
});

router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                seller: {
                    select: { id: true, name: true, companyName: true, email: true }
                },
                colorImages: true
            }
        });

        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve product details' });
    }
});

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post('/upload', authenticateJWT, requireRole(['SELLER', 'SUPER_ADMIN']), upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
});

router.post('/', authenticateJWT, requireRole(['SELLER', 'SUPER_ADMIN']), async (req, res) => {
    const { title, description, category, dimensions, color, imageUrl, colorImages } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ error: 'Title, description and category are required' });
    }

    try {
        const colorImagesCreate = [];
        if (Array.isArray(colorImages) && colorImages.length > 0) {
            colorImages.forEach(img => {
                if (img.color && img.imageUrl) {
                    colorImagesCreate.push({ color: img.color, imageUrl: img.imageUrl });
                }
            });
        } else {
            colorImagesCreate.push({
                color: color || 'Varsayılan',
                imageUrl: imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800'
            });
        }

        const product = await prisma.product.create({
            data: {
                title,
                description,
                category,
                dimensions: dimensions || null,
                color: color || 'Varsayılan',
                imageUrl: imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800',
                sellerId: req.user.id,
                colorImages: {
                    create: colorImagesCreate
                }
            },
            include: {
                colorImages: true
            }
        });

        res.status(201).json({ success: true, product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

router.put('/:id', authenticateJWT, requireRole(['SELLER', 'SUPER_ADMIN']), async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

    const { title, description, category, dimensions, color, imageUrl, isActive, colorImages } = req.body;

    try {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (product.sellerId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Forbidden: You do not own this product listing' });
        }

        if (Array.isArray(colorImages)) {
            await prisma.productColorImage.deleteMany({ where: { productId: id } });

            if (colorImages.length > 0) {
                await prisma.productColorImage.createMany({
                    data: colorImages.map(img => ({
                        productId: id,
                        color: img.color,
                        imageUrl: img.imageUrl
                    }))
                });
            }
        }

        const updated = await prisma.product.update({
            where: { id },
            data: {
                title: title !== undefined ? title : product.title,
                description: description !== undefined ? description : product.description,
                category: category !== undefined ? category : product.category,
                dimensions: dimensions !== undefined ? dimensions : product.dimensions,
                color: color !== undefined ? color : product.color,
                imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
                isActive: isActive !== undefined ? isActive : product.isActive
            },
            include: {
                colorImages: true
            }
        });

        res.json({ success: true, product: updated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update product details' });
    }
});

router.delete('/:id', authenticateJWT, requireRole(['SELLER', 'SUPER_ADMIN']), async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

    try {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (product.sellerId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Forbidden: You do not own this product listing' });
        }

        await prisma.product.delete({ where: { id } });
        res.json({ success: true, message: 'Product listing deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;
