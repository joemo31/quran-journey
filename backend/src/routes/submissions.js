const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const { create, getAll, deleteSubmission } = require('../controllers/submissionsController');
const { validate } = require('../middleware/validate');
const router = express.Router();

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  // country is required for public form but optional for logged-in enrollment
  body('country').optional({ checkFalsy: true }).trim(),
], validate, create);

router.get('/', authenticate, authorize('admin'), getAll);
router.delete('/:id', authenticate, authorize('admin'), deleteSubmission);

module.exports = router;
