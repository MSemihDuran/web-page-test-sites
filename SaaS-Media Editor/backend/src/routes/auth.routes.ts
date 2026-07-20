import { Router } from 'express';
import { 
  register, 
  login, 
  me, 
  toggleSubscription, 
  subscribe,
  setup2FA,
  verify2FA,
  disable2FA
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware as any, me as any);
router.post('/toggle-subscription', authMiddleware as any, toggleSubscription as any);

// Subscription and Security endpoints
router.post('/subscribe', authMiddleware as any, subscribe as any);
router.post('/2fa/setup', authMiddleware as any, setup2FA as any);
router.post('/2fa/verify', authMiddleware as any, verify2FA as any);
router.post('/2fa/disable', authMiddleware as any, disable2FA as any);

export default router;
