import { Router } from 'express';
import multer from 'multer';
import { uploadAsset, exportCanvasImage } from '../controllers/upload.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All upload routes require authentication
router.use(authMiddleware as any);

router.post('/asset', upload.single('file'), uploadAsset as any);
router.post('/export', exportCanvasImage as any);

export default router;
