-- This SQL file is used to populate the url_clicks table with data from the
-- url_table, and also add the necessary hooks such that they will always be
-- in sync. These include 1) when a url_table row's click is changed, and
-- 2) when a new url_table row is created.
BEGIN TRANSACTION;

INSERT INTO "url_clicks" ("shortUrl", "clicks", "createdAt", "updatedAt")
SELECT "shortUrl", "clicks", "createdAt", "updatedAt" from urls;

CREATE OR REPLACE FUNCTION update_clicks()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE url_clicks
    SET "clicks" = NEW."clicks", "updatedAt" = current_timestamp
    WHERE url_clicks."shortUrl" = NEW."shortUrl";
    RETURN NEW;
END; $$ LANGUAGE PLPGSQL;

CREATE TRIGGER url_table_click_incremented
    AFTER UPDATE of "clicks" on urls
    FOR EACH ROW
    WHEN (OLD."clicks" <> NEW."clicks")
    EXECUTE PROCEDURE update_clicks();

CREATE OR REPLACE FUNCTION create_clicks()
    RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO url_clicks ("shortUrl", "clicks", "createdAt", "updatedAt")
    VALUES (NEW."shortUrl", NEW."clicks", NEW."createdAt", NEW."updatedAt");
    RETURN NEW;
END; $$ LANGUAGE PLPGSQL;

CREATE TRIGGER url_created
    AFTER INSERT on urls
    FOR EACH ROW
    EXECUTE PROCEDURE create_clicks();

COMMIT;
