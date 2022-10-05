-- This adds columns to both urls and url_histories
-- tables, which are backwards-compatible with the current
-- codebase as they default to empty strings.

BEGIN TRANSACTION;

ALTER TABLE users ADD "apiKeyHash" text NOT NULL DEFAULT '';

COMMIT;