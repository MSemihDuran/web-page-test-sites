"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_controller_1 = require("../controllers/project.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware to all project routes
router.use(auth_middleware_1.authMiddleware);
router.post('/', project_controller_1.createProject);
router.get('/', project_controller_1.getProjects);
router.get('/:id', project_controller_1.getProject);
router.put('/:id', project_controller_1.updateProject);
router.delete('/:id', project_controller_1.deleteProject);
exports.default = router;
