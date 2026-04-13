
CREATE TABLE IF NOT EXISTS public.fridge_logs (
    id SERIAL PRIMARY KEY,
    device_name VARCHAR(255) NOT NULL,
    temperature DECIMAL NOT NULL,
    humidity DECIMAL NOT NULL,
    status VARCHAR(10) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table: public.users
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);