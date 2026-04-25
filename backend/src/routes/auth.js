const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, updatePassword, adminResetPassword } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['student','teacher']).withMessage('Role must be student or teacher'),
], validate, register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], validate, login);

router.get('/me', authenticate, getMe);

router.put('/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password min 8 characters'),
], validate, updatePassword);

// Admin resets another user's password
router.put('/reset/:userId', authenticate, authorize('admin'), [
  body('newPassword').isLength({ min: 8 }).withMessage('New password min 8 characters'),
], validate, adminResetPassword);

module.exports = router;
