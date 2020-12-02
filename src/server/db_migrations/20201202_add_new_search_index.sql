-- This migration script changes the index for GoDirectory
-- New search index that includes longUrl 

BEGIN TRANSACTION;

-- Search will be run on a concatenation of vectors formed from short links, 
-- long links and their description. Short link words can be taken as the 
-- title and words there are likely to be more important. Long links are the
-- alternative keyword searches done by users, as spotted in GA . The descriptions
-- are no longer being filled by users and have the least importance.
-- Search queries will have to use this exact expresion to be able to utilize the index.
CREATE INDEX new_urls_weighted_search_idx ON urls USING gin ((setweight(to_tsvector(
'english', urls."shortUrl"), 'A') || setweight(to_tsvector(
'english', urls."longUrl"), 'B') || setweight(to_tsvector('english',
urls."description"), 'C')));

COMMIT;