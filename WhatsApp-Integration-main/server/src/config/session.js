import db from "./db.js";
import redisClient from "./redis.js";

// Local in-memory cache for synchronous access within a single request cycle
const localCache = new Map();
const SESSION_TTL = 24 * 60 * 60; // 24 hours in seconds
const REDIS_PREFIX = "session:";

// Message deduplication (in-memory is fine for this)
const processedMessages = new Set();

export async function getSession(phoneNumber) {
    try {
        // 1. Try Local Cache (instant)
        if (localCache.has(phoneNumber)) {
            return localCache.get(phoneNumber);
        }

        // 2. Try Redis first
        if (redisClient.isOpen) {
            const cached = await redisClient.get(`${REDIS_PREFIX}${phoneNumber}`);
            if (cached) {
                const session = JSON.parse(cached);
                localCache.set(phoneNumber, session);
                return session;
            }
        }

        // 3. Fetch from database if Redis miss
        const result = await db.query(
            `SELECT session_data FROM user_schema.user_sessions 
             WHERE phone_number = $1 AND expired_at > NOW()
             ORDER BY updated_at DESC LIMIT 1`,
            [phoneNumber]
        );

        if (result.rows.length > 0) {
            const session = JSON.parse(result.rows[0].session_data);
            localCache.set(phoneNumber, session);
            // 4. Backfill Redis cache
            if (redisClient.isOpen) {
                await redisClient.setEx(`${REDIS_PREFIX}${phoneNumber}`, SESSION_TTL, JSON.stringify(session));
            }
            return session;
        }
        return null;
    } catch (err) {
        console.error("[SESSION] Error fetching session:", err.message);
        return null;
    }
}

export async function setSession(phoneNumber, sessionData) {
    try {
        const sessionJson = JSON.stringify(sessionData);
        localCache.set(phoneNumber, sessionData);

        // 1. Save to Redis (Fast)
        if (redisClient.isOpen) {
            await redisClient.setEx(`${REDIS_PREFIX}${phoneNumber}`, SESSION_TTL, sessionJson);
        }

        // 2. Persistent Save to DB
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); 
        await db.query(
            `INSERT INTO user_schema.user_sessions (phone_number, session_data, expired_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (phone_number) DO UPDATE SET 
                session_data = $2, 
                updated_at = NOW(),
                expired_at = $3`,
            [phoneNumber, sessionJson, expiresAt]
        );

        return sessionData;
    } catch (err) {
        console.error("[SESSION] Error saving session:", err.message);
        throw err;
    }
}

export async function deleteSession(phoneNumber) {
    try {
        localCache.delete(phoneNumber);
        if (redisClient.isOpen) {
            await redisClient.del(`${REDIS_PREFIX}${phoneNumber}`);
        }
        await db.query(
            `DELETE FROM user_schema.user_sessions WHERE phone_number = $1`,
            [phoneNumber]
        );
    } catch (err) {
        console.error("[SESSION] Error deleting session:", err.message);
    }
}

/**
 * Clear expired sessions from database (call periodically)
 */
export async function clearExpiredSessions() {
    try {
        const result = await db.query(
            `DELETE FROM user_schema.user_sessions WHERE expired_at <= NOW()`
        );
        console.log(`[SESSION] Cleared ${result.rowCount} expired sessions from DB`);
    } catch (err) {
        console.error("[SESSION] Error clearing expired sessions:", err.message);
    }
}

// Create a Map-like wrapper for backward compatibility with existing code
export const userSessions = {
    get(phoneNumber) {
        return localCache.get(phoneNumber);
    },

    set(phoneNumber, sessionData) {
        localCache.set(phoneNumber, sessionData);
        setSession(phoneNumber, sessionData).catch(err =>
            console.error("[SESSION] Background save failed:", err.message)
        );
    },

    delete(phoneNumber) {
        localCache.delete(phoneNumber);
        deleteSession(phoneNumber).catch(err =>
            console.error("[SESSION] Background delete failed:", err.message)
        );
    },

    clear() {
        localCache.clear();
    }
};

export { processedMessages };
