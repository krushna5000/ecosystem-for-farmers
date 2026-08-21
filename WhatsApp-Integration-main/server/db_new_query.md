-- Migration: Create onboarding_data table for new onboarding flow
-- This table stores detailed onboarding information collected during the new WhatsApp onboarding process

CREATE TABLE IF NOT EXISTS user_schema.onboarding_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_schema.users(id) ON DELETE CASCADE,
    state_id INTEGER REFERENCES location_schema.states(state_id),
    district_id INTEGER REFERENCES location_schema.districts(district_id),
    village_id INTEGER REFERENCES location_schema.villages(village_id),
    land_size_hectares NUMERIC(10, 2),
    current_crop_name VARCHAR(255),
    sowing_date VARCHAR(50), -- Format: "2nd June" or similar
    crop_stage_image_url VARCHAR(500), -- S3 URL
    crop_stage VARCHAR(100), -- AI-verified crop stage (e.g., "Vegetative", "Flowering", etc.)
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_data_user_id ON user_schema.onboarding_data(user_id);

-- Update user table if needed to ensure full_name is populated during registration
-- (Already exists in the schema, just ensuring comments are clear)
COMMENT ON TABLE user_schema.onboarding_data IS 'Stores detailed onboarding information for new users collected through the WhatsApp bot';



-- Migration: Add missing columns to onboarding_data table for complete user profile storage
-- Date: 2024
-- Purpose: Store user name, language, and village name to fetch user profile information later

-- Add missing columns
ALTER TABLE user_schema.onboarding_data
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS language VARCHAR(5),
ADD COLUMN IF NOT EXISTS village_name VARCHAR(255);

-- Add indexes for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON user_schema.onboarding_data(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_language ON user_schema.onboarding_data(language);

-- Show the updated table structure
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'user_schema' AND table_name = 'onboarding_data' ORDER BY ordinal_position;
