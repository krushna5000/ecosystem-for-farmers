-- Schema for Firebase OTP Auth PostgreSQL Database

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS users_schema;

-- Users table
-- Stores user information including full name, phone number, and verification status
CREATE TABLE IF NOT EXISTS users_schema.users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- OTP verifications table
-- Stores OTP codes with expiration and usage tracking
CREATE TABLE IF NOT EXISTS users_schema.otp_verifications (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE
);

