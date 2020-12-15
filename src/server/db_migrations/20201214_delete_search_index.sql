-- This migration script deletes the urls_weighted_search_idx
-- The urls_combined_weighted_search_idx will be used instead

DROP INDEX IF EXISTS urls_weighted_search_idx;