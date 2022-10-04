BEGIN TRANSACTION;

CREATE TYPE enum_urls_source AS ENUM ('BULK', 'API', 'CONSOLE');

ALTER TABLE urls ADD "source" enum_urls_source;

ALTER TABLE url_histories ADD "source" enum_urls_source;

COMMIT;

-- Down migration
-- ALTER TABLE urls DROP COLUMN "source";
-- ALTER TABLE url_histories DROP COLUMN "source";
-- DROP TYPE enum_urls_source;