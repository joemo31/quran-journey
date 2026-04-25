const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getByPage, getAll, upsert, bulkUpdate } = require('../controllers/siteContentController');
const router = express.Router();

// Public read endpoints — anyone can fetch site content (it's public website data)
router.get('/',      getAll);        // all rows — used by SiteContentContext
router.get('/:page', getByPage);     // rows for a specific page + global

// Write endpoints — admin only
router.post('/',      authenticate, authorize('admin'), upsert);
router.post('/bulk',  authenticate, authorize('admin'), bulkUpdate);

module.exports = router;
