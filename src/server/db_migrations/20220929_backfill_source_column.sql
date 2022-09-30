-- This migration script is to be run only after backend code
-- has been updated to write into the source column. This is because
-- the column will be made 'CONSOLE' here.

BEGIN TRANSACTION;

UPDATE urls SET "source" = 'CONSOLE' WHERE "source" IS NULL;

UPDATE url_histories SET "source" = 'CONSOLE' WHERE "source" IS NULL;

ALTER TABLE urls ALTER COLUMN "source" SET NOT NULL;

ALTER TABLE url_histories ALTER COLUMN "source" SET NOT NULL;

COMMIT;

-- Down migration
-- ALTER TABLE urls ALTER COLUMN "source" DROP NOT NULL;
-- ALTER TABLE url_histories ALTER COLUMN "source" DROP NOT NULL;