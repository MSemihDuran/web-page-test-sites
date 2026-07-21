const express = require('express');
const path = require('path');
const apiRouter = require('./api');

const app = express();
const PORT = process.env.PORT || 5003;

app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount API router under /api/apex
app.use('/api/apex', apiRouter);

// Fallback to index.html for single page application behavior
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
