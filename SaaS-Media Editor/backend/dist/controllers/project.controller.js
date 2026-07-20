"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProject = exports.getProjects = exports.createProject = void 0;
const db_1 = require("../config/db");
async function createProject(req, res) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { name, canvasJson } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Project name is required.' });
        }
        const defaultCanvas = canvasJson || JSON.stringify({ version: '5.3.0', objects: [] });
        const project = await db_1.prisma.project.create({
            data: {
                name,
                canvasJson: defaultCanvas,
                userId: req.user.id,
            },
        });
        return res.status(201).json({ project });
    }
    catch (error) {
        console.error('Create project error:', error);
        return res.status(500).json({ error: 'Internal server error creating project.' });
    }
}
exports.createProject = createProject;
async function getProjects(req, res) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const projects = await db_1.prisma.project.findMany({
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
    }
    catch (error) {
        console.error('Get projects error:', error);
        return res.status(500).json({ error: 'Internal server error fetching projects.' });
    }
}
exports.getProjects = getProjects;
async function getProject(req, res) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const id = req.params.id;
        const project = await db_1.prisma.project.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }
        return res.json({ project });
    }
    catch (error) {
        console.error('Get project error:', error);
        return res.status(500).json({ error: 'Internal server error fetching project.' });
    }
}
exports.getProject = getProject;
async function updateProject(req, res) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const id = req.params.id;
        const { name, canvasJson } = req.body;
        const project = await db_1.prisma.project.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }
        const updatedProject = await db_1.prisma.project.update({
            where: { id },
            data: {
                name: name !== undefined ? name : project.name,
                canvasJson: canvasJson !== undefined ? canvasJson : project.canvasJson,
            },
        });
        return res.json({ project: updatedProject });
    }
    catch (error) {
        console.error('Update project error:', error);
        return res.status(500).json({ error: 'Internal server error saving project.' });
    }
}
exports.updateProject = updateProject;
async function deleteProject(req, res) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const id = req.params.id;
        const project = await db_1.prisma.project.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }
        await db_1.prisma.project.delete({ where: { id } });
        return res.json({ message: 'Project deleted successfully.' });
    }
    catch (error) {
        console.error('Delete project error:', error);
        return res.status(500).json({ error: 'Internal server error deleting project.' });
    }
}
exports.deleteProject = deleteProject;
