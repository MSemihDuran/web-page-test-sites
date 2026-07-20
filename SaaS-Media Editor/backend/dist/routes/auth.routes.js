"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.me);
router.post('/toggle-subscription', auth_middleware_1.authMiddleware, auth_controller_1.toggleSubscription);
// Subscription and Security endpoints
router.post('/subscribe', auth_middleware_1.authMiddleware, auth_controller_1.subscribe);
router.post('/2fa/setup', auth_middleware_1.authMiddleware, auth_controller_1.setup2FA);
router.post('/2fa/verify', auth_middleware_1.authMiddleware, auth_controller_1.verify2FA);
router.post('/2fa/disable', auth_middleware_1.authMiddleware, auth_controller_1.disable2FA);
exports.default = router;
