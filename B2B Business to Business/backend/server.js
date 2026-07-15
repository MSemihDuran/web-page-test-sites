const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const { router: authRouter } = require('./routes/auth');
const productsRouter = require('./routes/products');
const quotesRouter = require('./routes/quotes');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    socket.on('join_user', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined user room: user_${userId}`);
    });

    socket.on('join_quote', (quoteId) => {
        socket.join(`quote_${quoteId}`);
        console.log(`Socket ${socket.id} joined quote room: quote_${quoteId}`);
    });

    socket.on('disconnect', () => {
        console.log(`Socket client disconnected: ${socket.id}`);
    });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/quotes', quotesRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'B2B Furniture Marketplace Backend running' });
});

const seedDatabase = async () => {
    try {
        const userCount = await prisma.user.count();
        let sellerUser = null;

        if (userCount === 0) {

            const passwordHash = await bcrypt.hash('password123', 10);

            const admin = await prisma.user.create({
                data: {
                    email: 'admin@rootweb.core',
                    password: passwordHash,
                    name: 'Ahmet Yılmaz',
                    companyName: 'Root Web Core',
                    role: 'SUPER_ADMIN'
                }
            });

            const seller = await prisma.user.create({
                data: {
                    email: 'mobilya@uretici.com',
                    password: passwordHash,
                    name: 'Mustafa Kaya',
                    companyName: 'Lüks Orman Mobilya A.Ş.',
                    role: 'SELLER'
                }
            });
            sellerUser = seller;

            const buyer = await prisma.user.create({
                data: {
                    email: 'magaza@alici.com',
                    password: passwordHash,
                    name: 'Selim Şahin',
                    companyName: 'Moda Konsept Mağazaları Ltd. Şti.',
                    role: 'BUYER'
                }
            });

            console.log('Default user accounts seeded successfully!');
        } else {
            sellerUser = await prisma.user.findFirst({ where: { role: 'SELLER' } });
        }

        console.log('Seeding products with 5 color-specific gallery images each...');
        await prisma.product.deleteMany({});

        if (sellerUser) {

            await prisma.product.create({
                data: {
                    title: 'Chesterfield Hakiki Deri Koltuk',
                    description: 'Tamamen el işçiliği, masif ahşap ayaklı, fırınlanmış gürgen iskelete sahip premium kahverengi deri koltuk.',
                    category: 'Living Room',
                    dimensions: '220x95x75 cm',
                    color: 'Kestane Kahve',
                    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
                    sellerId: sellerUser.id,
                    colorImages: {
                        create: [

                            { color: 'Kestane Kahve', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Kestane Kahve', imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Kestane Kahve', imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Kestane Kahve', imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Kestane Kahve', imageUrl: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&w=600&q=80' },

                            { color: 'Zümrüt Yeşili', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Zümrüt Yeşili', imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Zümrüt Yeşili', imageUrl: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Zümrüt Yeşili', imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Zümrüt Yeşili', imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80' }
                        ]
                    }
                }
            });

            await prisma.product.create({
                data: {
                    title: 'Nordic Meşe Yemek Masası',
                    description: '6 kişilik, İskandinav tarzı, doğal cilalı meşe kaplama yemek masası takımı.',
                    category: 'Dining Room',
                    dimensions: '180x90x75 cm',
                    color: 'Doğal Meşe',
                    imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80',
                    sellerId: sellerUser.id,
                    colorImages: {
                        create: [

                            { color: 'Doğal Meşe', imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Doğal Meşe', imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Doğal Meşe', imageUrl: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Doğal Meşe', imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Doğal Meşe', imageUrl: 'https://images.unsplash.com/photo-1611048267451-e6ed903d4a38?auto=format&fit=crop&w=600&q=80' },

                            { color: 'Kül Siyahı', imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Kül Siyahı', imageUrl: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Kül Siyahı', imageUrl: 'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Kül Siyahı', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Kül Siyahı', imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80' }
                        ]
                    }
                }
            });

            await prisma.product.create({
                data: {
                    title: 'Orto-Flex Ergonomik Çalışma Koltuğu',
                    description: 'Bel ve boyun destekli, 3D ayarlanabilir kolçaklı, yüksek taşıma kapasiteli yönetici çalışma koltuğu.',
                    category: 'Office',
                    dimensions: '65x65x120 cm',
                    color: 'Antrasit',
                    imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=600&q=80',
                    sellerId: sellerUser.id,
                    colorImages: {
                        create: [

                            { color: 'Antrasit', imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Antrasit', imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Antrasit', imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Antrasit', imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Antrasit', imageUrl: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=600&q=80' },

                            { color: 'Gök Mavisi', imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Gök Mavisi', imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Gök Mavisi', imageUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Gök Mavisi', imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80' },
                            { color: 'Gök Mavisi', imageUrl: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=600&q=80' }
                        ]
                    }
                }
            });

            console.log('Seeded products with 5 color-specific galleries successfully.');
        }
    } catch (e) {
        console.error('Error seeding database:', e);
    }
};

const PORT = process.env.PORT || 5005;
server.listen(PORT, async () => {
    console.log(`B2B Marketplace Backend running on port ${PORT}`);
    await seedDatabase();
});
