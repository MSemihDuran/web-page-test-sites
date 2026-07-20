"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
// Middleware
app.use((0, cors_1.default)({
    origin: CLIENT_URL,
    credentials: true
}));
// Fabric.js canvas base64 image exports can be large, so we increase limits
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ limit: '15mb', extended: true }));
// Serve local uploads statically
const uploadsDir = path_1.default.join(__dirname, '../uploads');
app.use('/uploads', express_1.default.static(uploadsDir));
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'SaaS Photo Editor Backend is active' });
});
// Start Server
app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Storage] Local upload folder is served at: http://localhost:${PORT}/uploads`);
});
