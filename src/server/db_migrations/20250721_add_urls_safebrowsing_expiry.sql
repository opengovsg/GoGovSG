-- This adds the safeBrowsingExpiry column to the urls table, which is
-- backwards-compatible with the current codebase as it allows NULL values.

BEGIN TRANSACTION;

ALTER TABLE urls ADD "safeBrowsingExpiry" TIMESTAMP WITH TIME ZONE;

COMMIT;

-- Down migration
-- ALTER TABLE urls DROP COLUMN "safeBrowsingExpiry";
