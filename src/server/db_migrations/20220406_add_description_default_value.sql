-- This script was written to fix an incorrect url_histories model.
-- The description column in the url_histories model had a non-null 
-- constraint without a default value. As edusg and healthsg tables
-- were set up with the faulty model, there were errors writing into 
-- the tables when description was empty.
-- This script was written for migration on edusg and healthsg.

BEGIN TRANSACTION;

ALTER TABLE url_histories ADD "description" text NOT NULL DEFAULT '';

COMMIT;