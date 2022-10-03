-- This adds enum types for the async_jobs table

BEGIN TRANSACTION;

CREATE TYPE enum_job_status AS ENUM ('READY', 'IN_PROGRESS', 'SUCCESS', 'FAILED');
CREATE TYPE enum_job_type AS ENUM ('QR_CODE_GENERATION');

COMMIT;