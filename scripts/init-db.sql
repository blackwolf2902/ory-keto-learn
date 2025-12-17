-- Initialize databases for the application
-- Keto database is created by default (specified in docker-compose)

-- Create application database (PostgreSQL syntax)
SELECT 'CREATE DATABASE app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'app')\gexec
