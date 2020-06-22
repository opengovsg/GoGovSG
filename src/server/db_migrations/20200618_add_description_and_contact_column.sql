-- This script should be the first to be run before search data
-- collection is deployed. This adds columns to both urls and url_histories
-- tables, which are backwards-compatible with the current
-- codebase as they default to empty strings.

BEGIN TRANSACTION;

ALTER TABLE urls ADD "description" text NOT NULL DEFAULT '';

ALTER TABLE url_histories ADD "description" text NOT NULL DEFAULT '';

ALTER TABLE urls ADD "contactEmail" text NOT NULL DEFAULT '';

ALTER TABLE url_histories ADD "contactEmail" text NOT NULL DEFAULT '';

COMMIT;