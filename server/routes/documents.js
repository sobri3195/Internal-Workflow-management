const express = require('express');
const router = express.Router();
const {
  createDocument,
  updateDocument,
  submitDocument,
  getDocuments,
  getDocument,
  deleteDocument
} = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', createDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);
router.post('/:id/submit', submitDocument);

module.exports = router;
