BEGIN TRANSACTION;

DROP TRIGGER IF EXISTS url_table_click_incremented ON urls;
DROP TRIGGER IF EXISTS url_created ON urls;

DROP FUNCTION IF EXISTS update_clicks;
DROP FUNCTION IF EXISTS create_clicks;

ALTER TABLE urls DROP COLUMN clicks;

COMMIT;
