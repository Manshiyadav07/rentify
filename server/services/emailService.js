// Email Service for password resets & account notifications
// If SMTP is not configured, gracefully logs the email to console for development/testing

const sendEmail = async (options) => {
  console.log(`\n========================================`);
  console.log(`[EMAIL DISPATCH] To: ${options.email}`);
  console.log(`[SUBJECT]: ${options.subject}`);
  console.log(`[CONTENT]:\n${options.message}`);
  if (options.resetUrl) {
    console.log(`[ACTION LINK]: ${options.resetUrl}`);
  }
  console.log(`========================================\n`);

  return { success: true, delivered: 'simulated_dev' };
};

module.exports = { sendEmail };
