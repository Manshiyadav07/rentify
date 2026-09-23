const grokService = require('../services/grokService');

// @desc    Chat with Grok AI Assistant (Platform-aware)
// @route   POST /api/ai/chat
// @access  Public (Enhanced if authenticated)
const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }

    const userId = req.user ? req.user._id : null;
    const userName = req.user ? req.user.name : 'Reader';

    const result = await grokService.chat({
      userMessage: message,
      conversationHistory: conversationHistory || [],
      userId,
      userName
    });

    res.json({
      success: true,
      reply: result.reply,
      modelUsed: result.modelUsed
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { chatWithAssistant };
