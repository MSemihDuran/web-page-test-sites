const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const listingsFile = path.join(__dirname, 'listings.dat');
const messagesFile = path.join(__dirname, 'messages.dat');

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

const initialListings = [
    {
        id: 1,
        title: 'Modern Bosphorus Villa',
        description: 'Bebek\'te harika boğaz manzaralı, geniş bahçeli ve havuzlu ultra lüks villa.',
        price: 45000000,
        type: 'Villa',
        location: 'Beşiktaş, İstanbul',
        lat: 41.0772,
        lng: 29.0435,
        bedrooms: 6,
        size: 550,
        imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800'
    },
    {
        id: 2,
        title: 'Skyland Penthouse Apartment',
        description: 'Şehrin merkezinde, rezidans konforu ve eşsiz şehir manzarası sunan dubleks penthouse.',
        price: 18500000,
        type: 'Apartment',
        location: 'Sarıyer, İstanbul',
        lat: 41.1018,
        lng: 29.0069,
        bedrooms: 3,
        size: 240,
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800'
    },
    {
        id: 3,
        title: 'Nişantaşı Luxury Flat',
        description: 'Modanın merkezinde, tamamen yenilenmiş lüks akıllı daire.',
        price: 12000000,
        type: 'Apartment',
        location: 'Şişli, İstanbul',
        lat: 41.0528,
        lng: 28.9904,
        bedrooms: 2,
        size: 135,
        imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800'
    },
    {
        id: 4,
        title: 'Caddebostan Seaside Duplex',
        description: 'Anadolu yakasının en prestijli konumunda, deniz sıfır dubleks çatı katı.',
        price: 28000000,
        type: 'Apartment',
        location: 'Kadıköy, İstanbul',
        lat: 40.9678,
        lng: 29.0664,
        bedrooms: 4,
        size: 320,
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800'
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

router.get('/listings', (req, res) => {
    const listings = readData(listingsFile, initialListings);
    res.json(listings);
});

router.post('/listings', (req, res) => {
    const { title, description, price, type, location, lat, lng, bedrooms, size, imageUrl } = req.body;

    if (!title || !description || !price || !type || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const listings = readData(listingsFile, initialListings);

    const newListing = {
        id: listings.length > 0 ? Math.max(...listings.map(l => l.id)) + 1 : 1,
        title,
        description,
        price: Number(price),
        type,
        location,
        lat: Number(lat) || 41.0082,
        lng: Number(lng) || 28.9784,
        bedrooms: Number(bedrooms) || 1,
        size: Number(size) || 50,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800'
    };

    listings.push(newListing);
    writeData(listingsFile, listings);
    res.status(201).json(newListing);
});

router.delete('/listings/:id', (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    let listings = readData(listingsFile, initialListings);
    const index = listings.findIndex(l => l.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Listing not found' });
    }

    listings.splice(index, 1);
    writeData(listingsFile, listings);
    res.json({ success: true, message: 'Listing deleted successfully' });
});

router.get('/messages', (req, res) => {
    const messages = readData(messagesFile, initialMessages);
    res.json(messages);
});

router.post('/messages', (req, res) => {
    const { sender, text } = req.body;
    if (!sender || !text) {
        return res.status(400).json({ error: 'Sender and text are required' });
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
