const express = require('express');
const router = express.Router();
const { signDocument, getSignatureStatus } = require('../controllers/signController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/:id/sign', authorize('signer', 'admin'), signDocument);
router.get('/:id/signatures', getSignatureStatus);

module.exports = router;
