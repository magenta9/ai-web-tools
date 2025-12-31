-- Migration: 001_initial_schema
-- Description: Initial database schema with version tracking
-- Version: 1

-- Create schema_migrations table for tracking applied migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tool history table
CREATE TABLE IF NOT EXISTS tool_history (
    id SERIAL PRIMARY KEY,
    tool_name VARCHAR(50) NOT NULL,
    input_data JSONB,
    output_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Config table
CREATE TABLE IF NOT EXISTS config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tool_history
CREATE INDEX IF NOT EXISTS idx_tool_history_tool_name ON tool_history(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_history_created_at ON tool_history(created_at DESC);
