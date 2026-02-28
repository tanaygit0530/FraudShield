const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/otp/generate', authController.generateOTP);
router.post('/otp/verify', authController.verifyOTP);

module.exports = router;
