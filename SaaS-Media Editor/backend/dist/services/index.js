"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const LocalStorageService_1 = require("./storage/LocalStorageService");
dotenv_1.default.config();
const port = process.env.PORT || '5000';
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
const uploadDir = path_1.default.join(__dirname, '../../uploads');
// ==========================================
// SWAPPABLE STORAGE SERVICE ABSTRACTION
// ==========================================
// ACTIVE: Local file system storage
exports.storageService = new LocalStorageService_1.LocalStorageService(uploadDir, baseUrl);
// STAGED: S3-Compatible Cloud Storage (Cloudflare R2 / DigitalOcean Spaces)
// To activate, uncomment below and comment the LocalStorageService line above.
// export const storageService: IStorageService = new S3StorageService(
//   process.env.S3_BUCKET_NAME || 'my-photo-editor-bucket',
//   process.env.S3_REGION || 'us-east-1',
//   process.env.S3_ENDPOINT_URL || 'https://xxx.r2.cloudflarestorage.com'
// );
