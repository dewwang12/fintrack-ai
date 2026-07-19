const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const router = express.Router();

// Public auth routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refresh);

// Protected routes (require valid Access Token)
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
