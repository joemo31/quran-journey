const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getAll, create, update, remove } = require('../controllers/testimonialsController');
const router = express.Router();

router.get('/', getAll);
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;
