CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    bio VARCHAR(1000),
    avatar_url VARCHAR(255)
);
