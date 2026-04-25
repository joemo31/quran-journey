const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getSessions, createSession, updateSession, deleteSession } = require('../controllers/sessionsController');
const router = express.Router();

router.use(authenticate);
router.get('/', getSessions);
router.post('/', authorize('admin'), createSession);
router.put('/:id', authorize('admin', 'teacher'), updateSession);
router.delete('/:id', authorize('admin'), deleteSession);

module.exports = router;
