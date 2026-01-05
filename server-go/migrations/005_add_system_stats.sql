-- Migration: 005_add_system_stats
-- Description: Add system_stats table for monitoring history
-- Version: 5

CREATE TABLE IF NOT EXISTS system_stats (
    id SERIAL PRIMARY KEY,
    cpu_percent FLOAT NOT NULL,
    memory_usage FLOAT NOT NULL, -- in MB
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_system_stats_created_at ON system_stats(created_at DESC);
