const winston = require("winston");

const isProduction = process.env.NODE_ENV === "production";

const logger = winston.createLogger({
    level: isProduction ? "info" : "debug",

    format: winston.format.combine(
        winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),

    transports: [
        new winston.transports.Console({
            format: isProduction
                ? winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                )
                : winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple(),
                    winston.format.timestamp({
                        format: "HH:mm:ss",
                    }),
                    winston.format.printf(
                        ({ timestamp, level, message }) => {
                            return `[${timestamp}] ${level}: ${message}`;
                        }
                    )
                ),
        }),
    ],
});

module.exports = logger;