-- This migration script adds the index for GoSearch

DROP INDEX IF EXISTS urls_weighted_search_idx;

-- Search will be run on a concatenation of vectors formed from short links and their
-- description. Descriptions are given a lower weight than short links as short link
-- words can be taken as the title and words there are likely to be more important than
-- those in their corresponding description.
-- Search queries will have to use this exact expresion to be able to utilize the index.
CREATE INDEX urls_weighted_search_idx ON urls USING gin ((setweight(to_tsvector(
'english', urls."shortUrl"), 'A') || setweight(to_tsvector('english',
urls."description"), 'B'))) where urls.state = 'ACTIVE';