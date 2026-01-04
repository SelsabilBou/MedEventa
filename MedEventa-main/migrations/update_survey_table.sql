-- Add missing columns to survey table
ALTER TABLE survey ADD COLUMN IF NOT EXISTS description TEXT AFTER title;
ALTER TABLE survey ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER description;
ALTER TABLE survey ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Check survey_question table columns too
ALTER TABLE survey_question ADD COLUMN IF NOT EXISTS question_type ENUM('text', 'rating', 'yesno', 'multiple') DEFAULT 'text' AFTER question_text;
