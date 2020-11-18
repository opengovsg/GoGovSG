-- =============================================
-- Author:      github.com/jeantanzj
-- Create date: 31 July 2019
-- Description: Migrates one short url from a user account to another.
-- Usage     :  SELECT migrate_url_to_user('shortUrl','to_user@domain.gov.sg')
-- Parameters:
--   @short_url_value - short url to be transferred
--   @to_user_email   - email of transferree
-- Returns:     Void
--
-- Change History:
--   31 July 2019 github.com/jeantanzj: Function created
--   12 June 2020 Foo Yong Jie:         Update function's url_history insertion step to include compulsory
--                                      isFile column
--   07 Oct  2020 @LoneRifle:           Update function's url_history insertion step to include compulsory
--                                      isSearchable column
--   16 Nov  2020 @LoneRifle:           Update function's url_history insertion step to remove 
--                                      isSearchable column
-- =============================================
CREATE OR REPLACE FUNCTION migrate_url_to_user(short_url_value text, to_user_email text) RETURNS void AS
$BODY$
DECLARE
    to_user_email text := to_user_email;
    to_user_id integer;
    short_url_value text := short_url_value;
    short_url text;
    short_url_user_id integer;
BEGIN
-- Look for the user in question
    SELECT "id" INTO to_user_id FROM users WHERE "email" = to_user_email LIMIT 1;
-- Make sure that we found the user to transfer to
    IF to_user_id IS NULL THEN
        RAISE EXCEPTION 'User % not found', to_user_email;
    END IF;
-- Look for the url in question
    SELECT "shortUrl", "userId" INTO short_url, short_url_user_id FROM urls WHERE "shortUrl" = short_url_value LIMIT 1;
-- Make sure that we found the short url
    IF short_url IS NULL THEN
        RAISE EXCEPTION 'Short url % not found', short_url_value;
    END IF;
-- Make sure we found the owner of the shortUrl
    IF short_url_user_id IS NULL THEN
        RAISE EXCEPTION 'Owner for % not found', short_url;
    END IF;
-- Make sure they are not the same person
    IF short_url_user_id = to_user_id THEN
        RAISE EXCEPTION 'No transferring of links to the same user';
    END IF;
-- Insert the intended changes into URL history table
    INSERT INTO url_histories ("urlShortUrl","longUrl","state","userId","isFile","createdAt","updatedAt")
        SELECT "shortUrl", "longUrl", "state", "to_user_id", "isFile", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM urls
        WHERE "shortUrl" = short_url LIMIT 1;
-- Update the link in the URL table
    UPDATE urls
        SET "userId" = to_user_id,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "shortUrl" = short_url AND "userId" = short_url_user_id;
END
$BODY$
LANGUAGE plpgsql;
