import dotenv from "dotenv";

dotenv.config();

const bool = (v, d = false) => (v === undefined ? d : String(v).toLowerCase() === "true");
const list = (v, d = []) =>
  v ? v.split(",").map((s) => s.trim()).filter(Boolean) : d;

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  // number of reverse proxies in front of the API (rate limiters key on client IP)
  trustProxy: Number(process.env.TRUST_PROXY ?? (process.env.NODE_ENV === "production" ? 1 : 0)),
  port: Number(process.env.PORT) || 5000,

  // PostgreSQL (either DATABASE_URL or the discrete DB_* variables)
  databaseUrl: process.env.DATABASE_URL,
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: bool(process.env.DB_SSL),
  },

  // Optional MongoDB (crop-ai diagnosis, weather, agronomy, stress, indexes)
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME,

  // Auth
  jwtSecret: process.env.JWT_SECRET,
  refreshSecret: process.env.REFRESH_SECRET,

  // CORS: extra allowed origins on top of each portal's built-in defaults
  corsOrigins: list(process.env.CORS_ORIGINS),

  // File storage — S3 when configured, otherwise local ./uploads
  aws: {
    region: process.env.AWS_REGION || "ap-south-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET_NAME,
  },
  publicBaseUrl: process.env.PUBLIC_BASE_URL, // used for local-disk upload URLs

  // Mail
  mail: {
    consoleOnly: bool(process.env.USE_CONSOLE_EMAIL),
    service: process.env.MAIL_SERVICE, // e.g. "gmail"
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: bool(process.env.SMTP_SECURE),
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
    from: process.env.MAIL_FROM,
  },
  frontendUrls: {
    admin: process.env.ADMIN_FRONTEND_URL || process.env.FRONTEND_URL || "http://localhost:5173",
    company: process.env.COMPANY_FRONTEND_URL || "http://localhost:5173",
    vendor: process.env.VENDOR_FRONTEND_URL || "http://localhost:5176",
  },

  // Third-party integrations used by the farmer app
  farmonautApiKey: process.env.FARMONAUT_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
};
