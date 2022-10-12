-- This adds column to users
-- table, which are backwards-compatible with the current
-- codebase as they default to empty strings.

BEGIN TRANSACTION;

ALTER TABLE users ADD "apiKeyHash" text;
ALTER TABLE users ADD CONSTRAINT users_apiKeyHash_unique UNIQUE ("apiKeyHash");

COMMIT;

-- Down migration
-- ALTER TABLE users DROP COLUMN "apiKeyHash";
