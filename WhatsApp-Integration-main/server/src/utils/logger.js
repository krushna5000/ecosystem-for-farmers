import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // 1. Write all logs to app.log
        new winston.transports.File({ 
            filename: path.join('logs', 'app.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // 2. Write error logs to error.log
        new winston.transports.File({ 
            filename: path.join('logs', 'error.log'), 
            level: 'error' 
        }),
        // 3. Output to console for development
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            )
        })
    ]
});

// Global console override (Optional but helps consolidate logs)
// console.log = (...args) => logger.info(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
// console.error = (...args) => logger.error(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));

export default logger;
