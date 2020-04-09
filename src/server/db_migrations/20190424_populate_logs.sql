-- This SQL file is used to backfill the Logs table from the URL table, for creation,
-- activation and inactivation, to the best of knowledge.
-- It should only be run once, when the Log table is created for the first time.

BEGIN TRANSACTION;
INSERT INTO "logs" ("type", "details", "createdAt", "updatedAt", "userId")

-- First creation of URL
(
	SELECT
	'CREATE'::enum_logs_type AS "type",
	json_build_object('longUrl', "urls"."longUrl", 'shortUrl', "urls"."shortUrl") AS "details",
	"urls"."createdAt" AS "createdAt",
	"urls"."createdAt" AS "updatedAt",
	"urls"."userId" AS "userId"
	FROM "urls"
)
UNION ALL
-- Last deactivation of URL
(
	SELECT
	'DEACTIVATE'::enum_logs_type AS "type",
	json_build_object('longUrl', "urls"."longUrl", 'shortUrl', "urls"."shortUrl") AS "details",
	"urls"."updatedAt" AS "createdAt",
	"urls"."updatedAt" AS "updatedAt",
	"urls"."userId" AS "userId"
	FROM "urls"
	WHERE
		"urls"."state" = 'INACTIVE' AND
		"urls"."updatedAt" > "urls"."createdAt"
)
-- Last activation of the URL
UNION ALL
(
	SELECT
		'ACTIVATE'::enum_logs_type AS "type",
		json_build_object('longUrl', "urls"."longUrl", 'shortUrl', "urls"."shortUrl") AS "details",
		"urls"."updatedAt" AS "createdAt",
		"urls"."updatedAt" AS "updatedAt",
		"urls"."userId" AS "userId"
	FROM "urls"
	WHERE
		"urls"."state" = 'ACTIVE' AND
		EXTRACT( EPOCH FROM "urls"."updatedAt") - EXTRACT( EPOCH FROM "urls"."createdAt") > 2
)
ORDER BY "createdAt";

COMMIT;