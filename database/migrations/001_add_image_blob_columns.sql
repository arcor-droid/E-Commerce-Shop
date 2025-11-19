-- Migration: Add image blob storage to Products table
-- Date: 2025-11-19
-- Description: Add columns to store images as binary data in database

ALTER TABLE Products 
ADD COLUMN image_data LONGBLOB COMMENT 'Binary image data',
ADD COLUMN image_mime_type VARCHAR(50) COMMENT 'MIME type of the image (e.g., image/jpeg)';

-- Index for better performance when querying images
CREATE INDEX idx_products_has_image_data ON Products(image_data(1));
