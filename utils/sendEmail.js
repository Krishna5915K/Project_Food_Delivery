const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const sendEmail = async (options) => {
    const emailLogPath = path.join(__dirname, '../logs/emails.log');
    
    // Ensure logs folder exists
    const logsDir = path.dirname(emailLogPath);
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    const emailDetails = `
==================================================
Date: ${new Date().toISOString()}
To: ${options.email}
Subject: ${options.subject}
Message: ${options.message}
==================================================
\n`;

    fs.appendFileSync(emailLogPath, emailDetails);
    
    logger.info(`📧 Mock Email Sent to ${options.email} with Subject: "${options.subject}" (logged in logs/emails.log)`);
    return true;
};

module.exports = sendEmail;
