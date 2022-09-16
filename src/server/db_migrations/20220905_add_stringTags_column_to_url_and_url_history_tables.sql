-- This adds columns to both urls and url_histories
-- tables, which are backwards-compatible with the current
-- codebase as they default to empty strings.

BEGIN TRANSACTION;

ALTER TABLE urls ADD "tagStrings" text NOT NULL DEFAULT '';

ALTER TABLE url_histories ADD "tagStrings" text NOT NULL DEFAULT '';

COMMIT;