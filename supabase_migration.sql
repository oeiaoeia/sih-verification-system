-- Migration to add qr_token
ALTER TABLE instruments 
ADD COLUMN IF NOT EXISTS qr_token TEXT UNIQUE;

-- (Optional) If you want to replace qr_code_id entirely, but we'll just add qr_token.
-- Update existing rows if any
UPDATE instruments SET qr_token = md5(random()::text) WHERE qr_token IS NULL;

ALTER TABLE instruments
ALTER COLUMN qr_token SET NOT NULL;
