const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/analyticsController');
const router = express.Router();

router.get('/dashboard', authenticate, authorize('admin'), getDashboardStats);

module.exports = router;
