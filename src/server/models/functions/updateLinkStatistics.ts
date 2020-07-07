import { Url } from '../url'
import { Clicks } from '../statistics/daily'
import { Devices } from '../statistics/devices'
import { WeekdayClicks } from '../statistics/weekday'

/**
 * Name of the link statistics update SQL function.
 */
export const rawFunctionName = 'update_link_statistics'

/**
 * This query drops the previous implementation of updateLinkStatistics.
 * This is useful as functions cannot be automatically replaced when parameter datatypes changes.
 */
export const dropLinkStatistics = `DROP FUNCTION IF EXISTS ${rawFunctionName};`

// Get the relevant table names from their models.
const urlTable = Url.getTableName()
const devicesTable = Devices.getTableName()
const clicksTable = Clicks.getTableName()
const weekdayTable = WeekdayClicks.getTableName()

/**
 * This function is used to update the relevant link statistics tables, when called.
 */
export const updateLinkStatistics = `CREATE OR REPLACE FUNCTION ${rawFunctionName} (inputShortUrl text, device text)
RETURNS void AS $$
BEGIN
-- Update total clicks.
UPDATE "${urlTable}" SET "clicks" = "${urlTable}"."clicks" + 1
WHERE "shortUrl" = inputShortUrl;
-- Update devices clicks.
IF device='mobile' THEN
  INSERT INTO "${devicesTable}" ("shortUrl", "mobile", "tablet", "desktop", "others", "createdAt", "updatedAt")
  VALUES (inputShortUrl, 1, 0, 0, 0, current_timestamp, current_timestamp)
  ON CONFLICT ("shortUrl")
  DO UPDATE SET "mobile" = "${devicesTable}"."mobile" + 1;
ELSIF device='tablet' THEN
  INSERT INTO "${devicesTable}" ("shortUrl", "mobile", "tablet", "desktop", "others", "createdAt", "updatedAt")
  VALUES (inputShortUrl, 0, 1, 0, 0, current_timestamp, current_timestamp)
  ON CONFLICT ("shortUrl")
  DO UPDATE SET "tablet" = "${devicesTable}"."tablet" + 1;
ELSIF device='desktop' THEN
  INSERT INTO "${devicesTable}" ("shortUrl", "mobile", "tablet", "desktop", "others", "createdAt", "updatedAt")
  VALUES (inputShortUrl, 0, 0, 1, 0, current_timestamp, current_timestamp)
  ON CONFLICT ("shortUrl")
  DO UPDATE SET "desktop" = "${devicesTable}"."desktop" + 1;
ELSIF device='others' THEN
  INSERT INTO "${devicesTable}" ("shortUrl", "mobile", "tablet", "desktop", "others", "createdAt", "updatedAt")
  VALUES (inputShortUrl, 0, 0, 0, 1, current_timestamp, current_timestamp)
  ON CONFLICT ("shortUrl")
  DO UPDATE SET "others" = "${devicesTable}"."others" + 1;
END IF;
-- Update daily clicks.
INSERT INTO "${clicksTable}" ("shortUrl", "date", "clicks", "createdAt", "updatedAt")
VALUES (inputShortUrl, current_timestamp::date, 1, current_timestamp, current_timestamp)
ON CONFLICT ("shortUrl", "date")
DO UPDATE SET "clicks" = "${clicksTable}"."clicks" + 1;
-- Update weekday clicks.
INSERT INTO "${weekdayTable}" ("shortUrl", "weekday", "hours", "clicks", "createdAt", "updatedAt")
VALUES (inputShortUrl, extract(dow from current_timestamp), extract(hour from current_timestamp), 1, current_timestamp, current_timestamp)
ON CONFLICT ("shortUrl", "weekday", "hours")
DO UPDATE SET "clicks" = "${weekdayTable}"."clicks" + 1;
END; $$ LANGUAGE plpgsql;
`

export default updateLinkStatistics
