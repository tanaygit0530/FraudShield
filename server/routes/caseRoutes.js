const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const upload = require('../middleware/upload');

router.get('/', caseController.getCases);
router.post('/', caseController.createCase);
router.get('/:id/intelligence', caseController.getCaseIntelligence);
router.post('/ingest/ocr', upload.single('screenshot'), caseController.ingestOCR);
router.post('/:id/escalate', caseController.escalateCase);
router.patch('/:id/status', caseController.updateCaseStatus);

module.exports = router;
