const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getPayments, createPayment, updatePayment } = require('../controllers/paymentsController');
const router = express.Router();

router.use(authenticate);
router.get('/', authorize('admin'), getPayments);
router.post('/', authorize('admin'), createPayment);
router.put('/:id', authorize('admin'), updatePayment);

module.exports = router;
