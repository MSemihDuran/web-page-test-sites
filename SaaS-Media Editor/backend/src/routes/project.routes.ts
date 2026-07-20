import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middleware to all project routes
router.use(authMiddleware as any);

router.post('/', createProject as any);
router.get('/', getProjects as any);
router.get('/:id', getProject as any);
router.put('/:id', updateProject as any);
router.delete('/:id', deleteProject as any);

export default router;
