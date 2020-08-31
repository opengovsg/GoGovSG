-- This migration script adds Urls.isSearchable with a default
-- of true and changes the index to take the column into account
-- It also updates url entries, setting those without a description
-- to false
BEGIN TRANSACTION;

ALTER TABLE urls ADD COLUMN "isSearchable" boolean NOT NULL DEFAULT true;
UPDATE urls SET "isSearchable" = false WHERE description = '';

-- Set "isSearchable" in url_histories to be false, 
-- update entries where there is a description to be true
-- drop the default later on when release is complete
ALTER TABLE url_histories ADD COLUMN "isSearchable" boolean NOT NULL DEFAULT false;
UPDATE url_histories SET "isSearchable" = true WHERE description != '';

DROP INDEX IF EXISTS urls_weighted_search_idx;

-- Search will be run on a concatenation of vectors formed from short links and their
-- description. Descriptions are given a lower weight than short links as short link
-- words can be taken as the title and words there are likely to be more important than
-- those in their corresponding description.
-- Search queries will have to use this exact expresion to be able to utilize the index.
CREATE INDEX urls_weighted_search_idx ON urls USING gin ((setweight(to_tsvector(
'english', urls."shortUrl"), 'A') || setweight(to_tsvector('english',
urls."description"), 'B'))) WHERE urls.state = 'ACTIVE' AND urls."isSearchable" = true;

COMMIT;