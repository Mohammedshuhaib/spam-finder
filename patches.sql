CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    is_delete BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    email TEXT UNIQUE NOT NULL DEFAULT '',
    phone_number TEXT NOT NULL UNIQUE DEFAULT '',
    password TEXT NOT NULL DEFAULT '',
	created_by int NULL REFERENCES users (id),
    refresh_token TEXT NOT NULL DEFAULT '',
    is_spam BOOLEAN NOT NULL DEFAULT false
);