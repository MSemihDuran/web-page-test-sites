import { Response } from 'express';
import { storageService } from '../services';
import { SubscriptionService } from '../services/subscription/subscription.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function uploadAsset(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileExtension = req.file.originalname.split('.').pop() || 'png';
    const filename = `${req.user.id}_asset_${Date.now()}.${fileExtension}`;
    
    // Upload file using the cloud-ready storage abstraction layer
    const fileUrl = await storageService.uploadFile(
      req.file.buffer,
      filename,
      req.file.mimetype
    );

    return res.json({ fileUrl });
  } catch (error) {
    console.error('Asset upload error:', error);
    return res.status(500).json({ error: 'Internal server error uploading asset.' });
  }
}

export async function exportCanvasImage(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Strict premium checking using SubscriptionService
    const hasPremium = await SubscriptionService.hasActiveSubscription(req.user);
    if (!hasPremium) {
      return res.status(403).json({
        error: 'Subscription Required',
        message: 'Please subscribe to unlock the canvas export feature.',
      });
    }

    const { imageData } = req.body; // base64 string
    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    // Convert base64 data to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `${req.user.id}_export_${Date.now()}.png`;

    // Save exported canvas via storage interface
    const fileUrl = await storageService.uploadFile(
      buffer,
      filename,
      'image/png'
    );

    return res.json({ fileUrl });
  } catch (error) {
    console.error('Canvas export error:', error);
    return res.status(500).json({ error: 'Internal server error exporting canvas.' });
  }
}
