CREATE TABLE users1 (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    last_login_time TIMESTAMP,
    registration_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    last_activity_time TIMESTAMP
);

-- Create unique index for email
CREATE UNIQUE INDEX idx_users_email ON users (email);