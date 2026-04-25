-- Add hero right-side image for homepage
INSERT INTO site_content (page, section, key, value, type, label) VALUES
  ('home','hero','hero_image','','image','Hero Right Side Image (appears on right in hero section)')
ON CONFLICT (page, section, key) DO NOTHING;

-- Make sure blog supports youtube links
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='blog_posts' AND column_name='youtube_url') THEN
    ALTER TABLE blog_posts ADD COLUMN youtube_url TEXT;
  END IF;
END $$;
