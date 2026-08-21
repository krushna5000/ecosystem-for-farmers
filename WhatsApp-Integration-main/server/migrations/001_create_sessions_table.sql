-- Migration: Create user_sessions table for persistent session storage
-- Date: 2026-05-07
-- Purpose: Store WhatsApp user sessions persistently across server restarts

CREATE TABLE IF NOT EXISTS user_schema.user_sessions (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    session_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expired_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create index on phone_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_phone ON user_schema.user_sessions(phone_number);

-- Create index on expired_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_expired ON user_schema.user_sessions(expired_at);

-- Comment on table
COMMENT ON TABLE user_schema.user_sessions IS 'Stores WhatsApp user session data persistently across server restarts';
COMMENT ON COLUMN user_schema.user_sessions.session_data IS 'JSON object containing session state: {step, authenticated, userId, userName, language, onboardingData, etc.}';
COMMENT ON COLUMN user_schema.user_sessions.expired_at IS 'Session expiration time, sessions older than this can be deleted';
