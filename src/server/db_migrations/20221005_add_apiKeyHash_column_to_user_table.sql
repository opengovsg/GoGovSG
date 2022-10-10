-- This adds column to users
-- table, which are backwards-compatible with the current
-- codebase as they default to empty strings.

BEGIN TRANSACTION;

ALTER TABLE users ADD "apiKeyHash" text NOT NULL DEFAULT '';

COMMIT;

-- Down migration
-- ALTER TABLE users DROP COLUMN "apiKeyHash";
