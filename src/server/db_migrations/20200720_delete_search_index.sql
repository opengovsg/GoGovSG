-- This migration script adds the old index for GoSearch
-- The new index will be managed by sequelize
-- This must be run before the deployment of the sequelize managed index.
DROP INDEX IF EXISTS urls_weighted_search_idx;