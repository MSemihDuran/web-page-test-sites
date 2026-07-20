import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

export async function createProject(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { name, canvasJson } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Project name is required.' });
    }

    const defaultCanvas = canvasJson || JSON.stringify({ version: '5.3.0', objects: [] });

    const project = await prisma.project.create({
      data: {
        name,
        canvasJson: defaultCanvas,
        userId: req.user.id,
      },
    });

    return res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    return res.status(500).json({ error: 'Internal server error creating project.' });
  }
}

export async function getProjects(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return res.status(500).json({ error: 'Internal server error fetching projects.' });
  }
}

export async function getProject(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id as string;
    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return res.status(500).json({ error: 'Internal server error fetching project.' });
  }
}

export async function updateProject(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id as string;
    const { name, canvasJson } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: name !== undefined ? name : project.name,
        canvasJson: canvasJson !== undefined ? canvasJson : project.canvasJson,
      },
    });

    return res.json({ project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    return res.status(500).json({ error: 'Internal server error saving project.' });
  }
}

export async function deleteProject(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id as string;

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    await prisma.project.delete({ where: { id } });

    return res.json({ message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Delete project error:', error);
    return res.status(500).json({ error: 'Internal server error deleting project.' });
  }
}
