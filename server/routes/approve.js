const express = require('express');
const router = express.Router();
const { approveDocument } = require('../controllers/approveController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/:id/approve', authorize('approver', 'admin'), approveDocument);

module.exports = router;
