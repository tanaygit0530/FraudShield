const express = require('express');
const router = express.Router();
const legalController = require('../controllers/legalController');

router.get('/cases/:id/download-legal', legalController.downloadLegalPDF);
router.post('/generate-legal', legalController.generateAndSendLegalPDF);

module.exports = router;
