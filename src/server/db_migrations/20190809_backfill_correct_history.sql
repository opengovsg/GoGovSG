-- This SQL file is used to correct the createdAt timestamps in the UrlHistory table from the URL table.
UPDATE "url_histories"
SET "createdAt" = "updatedAt"
WHERE "createdAt" <> "updatedAt"
;
