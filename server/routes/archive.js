const express = require('express');
const router = express.Router();
const { getArchivedDocuments, getArchivedDocument, getArchiveStatistics } = require('../controllers/archiveController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getArchivedDocuments);
router.get('/statistics', getArchiveStatistics);
router.get('/:id', getArchivedDocument);

module.exports = router;
