-- This script should be the first to be run because it adds
-- a nullable column isFile to both urls and url_histories
-- tables, which is backwards-compatible with the current
-- codebase.

BEGIN TRANSACTION;

ALTER TABLE urls ADD "isFile" boolean;

ALTER TABLE url_histories ADD "isFile" boolean;

COMMIT;
