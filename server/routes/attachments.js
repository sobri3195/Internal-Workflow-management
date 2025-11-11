const express = require('express');
const router = express.Router();
const { uploadAttachment, downloadAttachment, deleteAttachment } = require('../controllers/attachmentController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

router.post('/:id/upload', upload.single('file'), uploadAttachment);
router.get('/:attachmentId/download', downloadAttachment);
router.delete('/:attachmentId', deleteAttachment);

module.exports = router;
