-- =============================================
-- Author:      Yuanruo Liang
-- Create date: 11 July 2019
-- Description: Migrates links from one user account to another.
--              This is useful if a user loses control of their email.
--              Otherwise, users should use our app and transfer control manually.
-- Usage     :  SELECT migrate_user_links('from_user@domain.gov.sg','to_user@domain.gov.sg')
-- Parameters:
--   @from_user_email - email of transferrer
--   @to_user_email   - email of transferree
-- Returns:     Integer - number of links transferred
--
-- Change History:
--   11 July 2019 Yuanruo Liang: Function created
--   12 June 2020 Foo Yong Jie: Update function's url_history insertion step to include
--                              compulsory isFile column
--   07 Oct  2020 @LoneRifle: Update function's url_history insertion step to include
--                            compulsory isSearchable column
--   16 Nov  2020 @LoneRifle: Update function's url_history insertion step to remove 
--                            isSearchable column
--   01 Apr  2021 Alexis Goh: Update function's url_history insertion step to include
--                            description column
--   12 July 2022 Lim Zi Wei: Update function to return the number of migrated links
-- =============================================
CREATE OR REPLACE FUNCTION migrate_user_links(from_user_email text, to_user_email text) RETURNS integer AS
$BODY$
DECLARE
    from_user_email text := from_user_email;
    to_user_email text := to_user_email;
    from_user_id integer;
    to_user_id integer;
    num_migrated_links integer;
BEGIN
-- Look for the users in question
    SELECT id INTO from_user_id FROM users WHERE email = from_user_email LIMIT 1;
    SELECT id INTO to_user_id FROM users WHERE email = to_user_email LIMIT 1;
-- Make sure that we found the users
	IF from_user_id IS NULL THEN
		RAISE EXCEPTION '% not found', from_user_email;
	END IF;

	IF to_user_id IS NULL THEN
		RAISE EXCEPTION '% not found', to_user_email;
	END IF;
-- Make sure they are not the same person
    IF from_user_id = to_user_id THEN
		RAISE EXCEPTION 'No transferring of links to the same user';
	END IF;
-- Insert the intended changes into URL history table
    INSERT INTO url_histories ("urlShortUrl","longUrl","state","userId","isFile","description","createdAt","updatedAt")
        SELECT "shortUrl", "longUrl", "state", "to_user_id", "isFile", "description", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM urls
        WHERE "userId" = from_user_id;
-- Update the links in the URL table
    UPDATE urls
        SET "userId" = to_user_id,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "userId" = from_user_id;
    GET DIAGNOSTICS num_migrated_links = ROW_COUNT;
    RETURN num_migrated_links;
END
$BODY$
LANGUAGE plpgsql;
