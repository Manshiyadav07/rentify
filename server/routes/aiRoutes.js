const express = require('express');
const router = express.Router();
const { chatWithAssistant } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/chat', aiLimiter, optionalAuth, chatWithAssistant);

module.exports = router;
