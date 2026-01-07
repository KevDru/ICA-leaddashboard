-- Migration: add color column to lead_columns
-- Run this once against your database to add a nullable `color` column.

ALTER TABLE `lead_columns`
  ADD COLUMN `color` VARCHAR(32) NULL AFTER `position`;

-- Optionally, you can set default colors for existing columns, e.g.:
-- UPDATE lead_columns SET color = '#93c5fd' WHERE id = 1;
