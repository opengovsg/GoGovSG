BEGIN TRANSACTION;

ALTER TABLE urls ADD "description" text;

ALTER TABLE url_histories ADD "description" text;

ALTER TABLE urls ADD "contactEmail" text;

ALTER TABLE url_histories ADD "contactEmail" text;

COMMIT;