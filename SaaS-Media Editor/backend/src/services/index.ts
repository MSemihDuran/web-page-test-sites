import path from 'path';
import dotenv from 'dotenv';
import { LocalStorageService } from './storage/LocalStorageService';
import { S3StorageService } from './storage/S3StorageService';
import { IStorageService } from './storage/IStorageService';

dotenv.config();

const port = process.env.PORT || '5000';
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
const uploadDir = path.join(__dirname, '../../uploads');

// ==========================================
// SWAPPABLE STORAGE SERVICE ABSTRACTION
// ==========================================

// ACTIVE: Local file system storage
export const storageService: IStorageService = new LocalStorageService(uploadDir, baseUrl);

// STAGED: S3-Compatible Cloud Storage (Cloudflare R2 / DigitalOcean Spaces)
// To activate, uncomment below and comment the LocalStorageService line above.
// export const storageService: IStorageService = new S3StorageService(
//   process.env.S3_BUCKET_NAME || 'my-photo-editor-bucket',
//   process.env.S3_REGION || 'us-east-1',
//   process.env.S3_ENDPOINT_URL || 'https://xxx.r2.cloudflarestorage.com'
// );
