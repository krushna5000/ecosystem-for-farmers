import "dotenv/config";
import express from "express";
import webhookRoutes from "./routes/webhook.js";
import productRoutes from "./routes/productRoutes.js";
import db from "./config/db.js";
import { clearExpiredSessions } from "./config/session.js";
import logger from "./utils/logger.js";

// Global Console Override to Winston
console.log = (...args) => logger.info(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
console.info = (...args) => logger.info(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
console.warn = (...args) => logger.warn(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
console.error = (...args) => logger.error(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Initialize database and sessions table
async function initializeDatabase() {
    try {
        // Create sessions table if it doesn't exist
        await db.query(`
            CREATE TABLE IF NOT EXISTS user_schema.user_sessions (
                id SERIAL PRIMARY KEY,
                phone_number VARCHAR(20) NOT NULL UNIQUE,
                session_data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                expired_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
            );
            
            CREATE INDEX IF NOT EXISTS idx_user_sessions_phone ON user_schema.user_sessions(phone_number);
            CREATE INDEX IF NOT EXISTS idx_user_sessions_expired ON user_schema.user_sessions(expired_at);

            -- Create Leads table for product interest
            CREATE TABLE IF NOT EXISTS company_schema.leads (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                product_id INTEGER,
                phone_number VARCHAR(20) NOT NULL,
                status VARCHAR(20) DEFAULT 'new',
                source VARCHAR(20) DEFAULT 'whatsapp',
                company_name VARCHAR(255),
                company_id INTEGER,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS idx_leads_phone ON company_schema.leads(phone_number);
            CREATE INDEX IF NOT EXISTS idx_leads_product ON company_schema.leads(product_id);
        `);
        console.log("✅ [DB] Sessions and Leads tables initialized");
    } catch (err) {
        console.error("❌ [DB] Error initializing tables:", err.message);
    }
}

// Webhook routes
app.use("/webhook", webhookRoutes);

// Product API routes
app.use("/api/products", productRoutes);

// Health check
app.get("/", (req, res) => res.send("WhatsApp Bot Server is running"));

app.listen(port, async () => {
    console.log(`WhatsApp Bot Server is running on port ${port}`);

    // Initialize database
    await initializeDatabase();

    // Run session cleanup every 1 hour
    setInterval(() => {
        clearExpiredSessions().catch(err =>
            console.error("[SESSION] Cleanup failed:", err.message)
        );
    }, 60 * 60 * 1000);

    console.log("✅ [SESSION] Database-backed session storage enabled");
});