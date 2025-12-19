-- Initialize databases for the application
-- Keto database is created by default (specified in docker-compose)

-- Create application and kratos databases (PostgreSQL syntax)
SELECT 'CREATE DATABASE app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'app')\gexec

SELECT 'CREATE DATABASE kratos'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'kratos')\gexec
