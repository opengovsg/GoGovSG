-- This migration script is to be run only after backend code
-- has been updated to write into the isFile column. This is because
-- the column will be made NOT NULL here.

BEGIN TRANSACTION;

UPDATE urls SET "isFile" = false WHERE "isFile" IS NULL;

UPDATE url_histories SET "isFile" = false WHERE "isFile" IS NULL;

ALTER TABLE urls ALTER COLUMN "isFile" SET NOT NULL;

ALTER TABLE url_histories ALTER COLUMN "isFile" SET NOT NULL;

COMMIT;
