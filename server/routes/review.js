const express = require('express');
const router = express.Router();
const { reviewDocument, addComment } = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/:id/review', authorize('reviewer1', 'reviewer2', 'reviewer3', 'admin'), reviewDocument);
router.post('/:id/comment', addComment);

module.exports = router;
