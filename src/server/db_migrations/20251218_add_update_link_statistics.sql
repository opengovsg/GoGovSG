BEGIN TRANSACTION;
SELECT pg_advisory_xact_lock(2142616474639426746);
CREATE OR REPLACE FUNCTION update_link_statistics (inputShortUrl text, device text)
RETURNS void AS $$
BEGIN
 UPDATE "url_clicks" SET "clicks" = "url_clicks"."clicks" + 1
 WHERE "shortUrl" = inputShortUrl;
 -- Update devices clicks.
 IF device='mobile' THEN
   INSERT INTO "devices_stats" ("shortUrl", "mobile", "tablet", "desktop", "others", "createdAt", "updatedAt")
   VALUES (inputShortUrl, 1, 0, 0, 0, current_timestamp, current_timestamp)
   ON CONFLICT ("shortUrl")
   DO UPDATE SET "mobile" = "devices_stats"."mobile" + 1;
 ELSIF device='tablet' THEN
   INSERT INTO "devices_stats" ("shortUrl", "mobile", "tablet", "desktop", "others", "createdAt", "updatedAt")
   VALUES (inputShortUrl, 0, 1, 0, 0, current_timestamp, current_timestamp)
   ON CONFLICT ("shortUrl")
   DO UPDATE SET "tablet" = "devices_stats"."tablet" + 1;
 ELSIF device='desktop' THEN
   INSERT INTO "devices_stats" ("shortUrl", "mobile", "tablet", "desktop", "others", "createdAt", "updatedAt")
   VALUES (inputShortUrl, 0, 0, 1, 0, current_timestamp, current_timestamp)
   ON CONFLICT ("shortUrl")
   DO UPDATE SET "desktop" = "devices_stats"."desktop" + 1;
 ELSIF device='others' THEN
   INSERT INTO "devices_stats" ("shortUrl", "mobile", "tablet", "desktop", "others", "createdAt", "updatedAt")
   VALUES (inputShortUrl, 0, 0, 0, 1, current_timestamp, current_timestamp)
   ON CONFLICT ("shortUrl")
   DO UPDATE SET "others" = "devices_stats"."others" + 1;
 END IF;
 -- Update daily clicks.
 INSERT INTO "daily_stats" ("shortUrl", "date", "clicks", "createdAt", "updatedAt")
 VALUES (inputShortUrl, date(current_timestamp at time zone 'Asia/Singapore'), 1, current_timestamp, current_timestamp)
 ON CONFLICT ("shortUrl", "date")
 DO UPDATE SET "clicks" = "daily_stats"."clicks" + 1;
 -- Update weekday clicks.
 INSERT INTO "weekday_stats" ("shortUrl", "weekday", "hours", "clicks", "createdAt", "updatedAt")
 VALUES (inputShortUrl, extract(dow from date(current_timestamp at time zone 'Asia/Singapore')), extract(hour from current_timestamp at time zone 'Asia/Singapore'), 1, current_timestamp, current_timestamp)
 ON CONFLICT ("shortUrl", "weekday", "hours")
 DO UPDATE SET "clicks" = "weekday_stats"."clicks" + 1;
 END; $$ LANGUAGE plpgsql;
 COMMIT;
