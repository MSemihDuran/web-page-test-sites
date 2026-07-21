const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const listingsFile = path.join(__dirname, 'listings.dat');
const messagesFile = path.join(__dirname, 'messages.dat');
const usersFile = path.join(__dirname, 'users.dat');
const appointmentsFile = path.join(__dirname, 'appointments.dat');

const readData = (filePath, defaultData) => {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
            return defaultData;
        }
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content || JSON.stringify(defaultData));
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
        return defaultData;
    }
};

const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`Error writing file ${filePath}:`, err);
        return false;
    }
};

const initialUsers = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@apex.com',
        password: 'admin123',
        role: 'admin',
        name: 'Apex Admin'
    },
    {
        id: 2,
        username: 'burak',
        email: 'burak@gmail.com',
        password: 'user123',
        role: 'user',
        name: 'Burak Test'
    }
];

const initialListings = [
    {
        id: 1,
        title: 'Modern Bosphorus Villa',
        description: 'Bebek\'te harika boğaz manzaralı, geniş bahçeli ve havuzlu ultra lüks villa. Her odasından deniz gören bu mülk, modern mimarisi ve akıllı ev sistemleriyle seçkin bir yaşam sunar.',
        price: 45000000,
        type: 'Villa',
        status: 'Sale',
        location: 'Beşiktaş, İstanbul',
        lat: 41.0772,
        lng: 29.0435,
        bedrooms: 6,
        size: 550,
        imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800',
            'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800',
            'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800',
            'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800'
        ],
        virtualTourUrl: 'https://my.matterport.com/show/?m=JGPnGqyB6q9' // Sample Matterport Tour
    },
    {
        id: 2,
        title: 'Skyland Penthouse Apartment',
        description: 'Şehrin merkezinde, rezidans konforu ve eşsiz şehir manzarası sunan dubleks penthouse. Geniş terası, lüks detayları ve sosyal tesis imkanlarıyla konforu zirveye taşır.',
        price: 18500000,
        type: 'Apartment',
        status: 'Sale',
        location: 'Sarıyer, İstanbul',
        lat: 41.1018,
        lng: 29.0069,
        bedrooms: 3,
        size: 240,
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800',
            'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=800',
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800'
        ],
        virtualTourUrl: '' // Empty so it uses mock panorama
    },
    {
        id: 3,
        title: 'Nişantaşı Luxury Flat',
        description: 'Modanın merkezinde, tamamen yenilenmiş lüks akıllı daire. Yüksek tavanlı, ferah odaları ve prestijli konumuyla hem yaşamak hem de yatırım yapmak için eşsiz bir fırsattır.',
        price: 12000000,
        type: 'Apartment',
        status: 'Sale',
        location: 'Şişli, İstanbul',
        lat: 41.0528,
        lng: 28.9904,
        bedrooms: 2,
        size: 135,
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800',
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800',
            'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800'
        ],
        virtualTourUrl: ''
    },
    {
        id: 4,
        title: 'Caddebostan Seaside Duplex',
        description: 'Anadolu yakasının en prestijli konumunda, denize sıfır dubleks çatı katı. Adalar manzarası eşliğinde kahvenizi yudumlayabileceğiniz, geniş teraslı modern yaşam alanı.',
        price: 28000000,
        type: 'Apartment',
        status: 'Sale',
        location: 'Kadıköy, İstanbul',
        lat: 40.9678,
        lng: 29.0664,
        bedrooms: 4,
        size: 320,
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
            'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800',
            'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800'
        ],
        virtualTourUrl: ''
    },
    {
        id: 5,
        title: 'Bebek Bosphorus View Studio Apartment',
        description: 'Bebek sahiline yürüme mesafesinde, full eşyalı ve eşsiz boğaz manzaralı kiralık lüks stüdyo daire. Akıllı ev sistemleri ve 7/24 güvenlik sunan bu mülk, konforlu bir yaşam arayanlar için idealdir.',
        price: 65000,
        type: 'Apartment',
        status: 'Rent',
        location: 'Beşiktaş, İstanbul',
        lat: 41.0760,
        lng: 29.0410,
        bedrooms: 1,
        size: 65,
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800',
            'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800'
        ],
        virtualTourUrl: ''
    },
    {
        id: 6,
        title: 'Maslak Valley Office Suite',
        description: 'Maslak finans merkezinin kalbinde, metro istasyonuna doğrudan bağlı kiralık A+ hazır ofis. Modern cam bölmeleri, toplantı salonu ve prestijli lobisiyle kullanıma hazırdır.',
        price: 150000,
        type: 'Office',
        status: 'Rent',
        location: 'Sarıyer, İstanbul',
        lat: 41.1120,
        lng: 29.0190,
        bedrooms: 5,
        size: 220,
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
            'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800',
            'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800'
        ],
        virtualTourUrl: ''
    },
    {
        id: 7,
        title: 'Moda Garden Ground Flat',
        description: 'Moda sahiline 2 dakika yürüme mesafesinde, kendine ait 45m² müstakil bahçe kullanımına sahip tamamen yenilenmiş kiralık daire. Sessiz, sakin ve huzurlu bir konumda yer alır.',
        price: 42000,
        type: 'Apartment',
        status: 'Rent',
        location: 'Kadıköy, İstanbul',
        lat: 40.9790,
        lng: 29.0250,
        bedrooms: 2,
        size: 110,
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800',
        images: [
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800',
            'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?q=80&w=800',
            'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=800'
        ],
        virtualTourUrl: ''
    }
];

const initialMessages = [
    {
        id: 1,
        sender: 'Sistem',
        text: 'Apex Real Estate Danışmanlık sistemine hoş geldiniz! Sorularınızı buradan sorabilirsiniz.',
        createdAt: new Date().toISOString()
    }
];

// Helper Middleware to check Admin authority
const requireAdmin = (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Bu işlem için Admin yetkisi gereklidir.' });
    }
};

// --- AUTH ROUTES ---

router.post('/auth/register', (req, res) => {
    const { username, email, password, name } = req.body;
    if (!username || !email || !password || !name) {
        return res.status(400).json({ error: 'Tüm alanları doldurmanız gerekmektedir.' });
    }

    const users = readData(usersFile, initialUsers);
    
    // Check if user exists
    if (users.find(u => u.username === username || u.email === email)) {
        return res.status(400).json({ error: 'Kullanıcı adı veya e-posta zaten kullanımda.' });
    }

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        email,
        password, // stored in plain text for demo simplicity
        role: 'user', // default role
        name
    };

    users.push(newUser);
    writeData(usersFile, users);

    // Return user info excluding password
    const { password: _, ...userInfo } = newUser;
    res.status(201).json(userInfo);
});

router.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });
    }

    const users = readData(usersFile, initialUsers);
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
    }

    const { password: _, ...userInfo } = user;
    res.json(userInfo);
});

// --- LISTINGS ROUTES ---

router.get('/listings', (req, res) => {
    const listings = readData(listingsFile, initialListings);
    res.json(listings);
});

router.post('/listings', requireAdmin, (req, res) => {
    const { title, description, price, type, status, location, lat, lng, bedrooms, size, imageUrl, images, virtualTourUrl } = req.body;

    if (!title || !description || !price || !type || !location) {
        return res.status(400).json({ error: 'Gerekli alanlar eksik.' });
    }

    const listings = readData(listingsFile, initialListings);

    // Set up multiple images array
    let imagesArray = [];
    if (images && Array.isArray(images) && images.length > 0) {
        imagesArray = images;
    } else if (imageUrl) {
        imagesArray = [imageUrl];
    } else {
        imagesArray = ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800'];
    }

    const newListing = {
        id: listings.length > 0 ? Math.max(...listings.map(l => l.id)) + 1 : 1,
        title,
        description,
        price: Number(price),
        type,
        status: status || 'Sale', // default: Satılık
        location,
        lat: Number(lat) || 41.0082,
        lng: Number(lng) || 28.9784,
        bedrooms: Number(bedrooms) || 1,
        size: Number(size) || 50,
        imageUrl: imagesArray[0],
        images: imagesArray,
        virtualTourUrl: virtualTourUrl || '' // Save 3D Virtual Tour URL
    };

    listings.push(newListing);
    writeData(listingsFile, listings);
    res.status(201).json(newListing);
});

router.delete('/listings/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Geçersiz ID formatı.' });
    }

    let listings = readData(listingsFile, initialListings);
    const index = listings.findIndex(l => l.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'İlan bulunamadı.' });
    }

    listings.splice(index, 1);
    writeData(listingsFile, listings);
    res.json({ success: true, message: 'İlan başarıyla silindi.' });
});

// --- APPOINTMENTS ROUTES ---

router.post('/appointments', (req, res) => {
    const { listingId, listingTitle, userName, userEmail, date, time } = req.body;
    if (!listingId || !listingTitle || !userName || !userEmail || !date || !time) {
        return res.status(400).json({ error: 'Tüm randevu bilgileri gereklidir.' });
    }

    const appointments = readData(appointmentsFile, []);
    
    const newAppointment = {
        id: appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1,
        listingId: Number(listingId),
        listingTitle,
        userName,
        userEmail,
        date,
        time,
        createdAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    writeData(appointmentsFile, appointments);
    res.status(201).json(newAppointment);
});

router.get('/appointments', requireAdmin, (req, res) => {
    const appointments = readData(appointmentsFile, []);
    res.json(appointments);
});

router.delete('/appointments/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Geçersiz ID formatı.' });
    }

    let appointments = readData(appointmentsFile, []);
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Randevu talebi bulunamadı.' });
    }

    appointments.splice(index, 1);
    writeData(appointmentsFile, appointments);
    res.json({ success: true, message: 'Randevu talebi arşivlendi/silindi.' });
});

// --- MESSAGES ROUTES ---

router.get('/messages', (req, res) => {
    const messages = readData(messagesFile, initialMessages);
    res.json(messages);
});

router.post('/messages', (req, res) => {
    const { sender, text } = req.body;
    if (!sender || !text) {
        return res.status(400).json({ error: 'Gönderen ve mesaj içeriği gereklidir.' });
    }

    const messages = readData(messagesFile, initialMessages);
    const newMessage = {
        id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
        sender,
        text,
        createdAt: new Date().toISOString()
    };

    messages.push(newMessage);
    writeData(messagesFile, messages);
    res.status(201).json(newMessage);
});

module.exports = router;
