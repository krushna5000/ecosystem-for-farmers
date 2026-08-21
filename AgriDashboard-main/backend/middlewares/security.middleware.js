import helmet from "helmet";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";

// 1. Helmet (secure HTTP headers)
export const helmetMiddleware = helmet();

// 2. CORS (control frontend access)
export const corsMiddleware = cors({
    origin: "*", // change to frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
});

// 3. Prevent MongoDB Injection
export const mongoSanitizeMiddleware = mongoSanitize();

// 4. Prevent XSS attacks
export const xssMiddleware = xss();

// 5. Prevent HTTP Parameter Pollution
export const hppMiddleware = hpp();