-- Add country field to users table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='users' AND column_name='country'
  ) THEN
    ALTER TABLE users ADD COLUMN country VARCHAR(100);
  END IF;
END $$;

-- Add country to students table for quick access
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='students' AND column_name='country'
  ) THEN
    ALTER TABLE students ADD COLUMN country VARCHAR(100);
  END IF;
END $$;

-- country is already in form_submissions, just make sure index exists
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
