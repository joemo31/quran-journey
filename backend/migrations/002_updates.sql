-- Add course_id + course_name to form_submissions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='form_submissions' AND column_name='course_interest') THEN
    ALTER TABLE form_submissions ADD COLUMN course_interest VARCHAR(255);
  END IF;
END $$;

-- Testimonials / feedback table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name VARCHAR(255) NOT NULL,
  student_country VARCHAR(100),
  student_avatar_url TEXT,
  content TEXT NOT NULL,
  video_url TEXT,
  media_type VARCHAR(10) DEFAULT 'text' CHECK (media_type IN ('text', 'video')),
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Site content blocks (for full page editing)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page VARCHAR(100) NOT NULL,
  section VARCHAR(100) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value TEXT,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text','html','image','video','json')),
  label VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page, section, key)
);

-- Media library (uploaded files)
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(500) NOT NULL,
  original_name VARCHAR(500) NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  file_size INTEGER,
  folder VARCHAR(255) DEFAULT 'general',
  alt_text VARCHAR(500),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page, section);

-- Seed default site content blocks
INSERT INTO site_content (page, section, key, value, type, label) VALUES
  ('home','hero','title','Start Your Qur''an Journey Today 🌟','text','Hero Title'),
  ('home','hero','subtitle','Learn Qur''an, Tajweed, Arabic, and Islamic Studies with native Arabic teachers from Al-Azhar University.','text','Hero Subtitle'),
  ('home','hero','cta_primary','Book Your Free Trial Class','text','Primary Button Text'),
  ('home','hero','cta_secondary','Explore Courses','text','Secondary Button Text'),
  ('home','hero','bg_image','','image','Hero Background Image'),
  ('home','about','title','Learn, Connect, and Grow with the Qur''an','text','About Title'),
  ('home','about','body','At Qur''an Journey Institute, we''re passionate about making Qur''anic education accessible, engaging, and transformative. With over 15 years of experience, our certified teachers guide students of all ages.','html','About Body'),
  ('home','about','image','','image','About Image'),
  ('global','nav','logo_url','','image','Logo Image'),
  ('global','nav','logo_text','Quran Journey','text','Logo Text'),
  ('global','nav','logo_subtitle','Academy','text','Logo Subtitle'),
  ('global','contact','whatsapp','+201508018609','text','WhatsApp Number'),
  ('global','contact','email','info@quranjourney.com','text','Email Address'),
  ('global','footer','tagline','Excellence in Quranic Education','text','Footer Tagline'),
  ('about','hero','title','About Quran Journey Academy','text','About Page Title'),
  ('about','hero','subtitle','Learn, Connect, and Grow with the Qur''an','text','About Page Subtitle'),
  ('about','mission','body','At Qur''an Journey Institute, we''re passionate about making Qur''anic education accessible, engaging, and transformative.','html','Mission Text'),
  ('contact','hero','title','Contact Us','text','Contact Page Title'),
  ('blog','hero','title','Academy Blog','text','Blog Page Title'),
  ('courses','hero','title','Our Programs','text','Courses Page Title'),
  ('pricing','hero','title','Simple, Transparent Pricing','text','Pricing Page Title'),
  ('feedback','hero','title','Student Feedback','text','Feedback Page Title'),
  ('feedback','hero','subtitle','Real stories from our global community of learners','text','Feedback Subtitle')
ON CONFLICT (page, section, key) DO NOTHING;

-- Seed sample testimonials
INSERT INTO testimonials (student_name, student_country, content, rating, is_published, sort_order) VALUES
  ('Keturah Nicole', 'United States', 'Alhamdulillah, I started from zero and now I can read the Quran beautifully. The teacher is so patient and encouraging. Highly recommend Quran Journey!', 5, true, 1),
  ('Sister Shamila', 'United Kingdom', 'My children love their sessions. The teachers are professional, kind, and make learning fun. Best online Quran academy we have tried.', 5, true, 2),
  ('Ahmad Al-Farsi', 'United Arab Emirates', 'I enrolled in the Tajweed course and the results are amazing. The one-on-one sessions are very effective and the scheduling is very flexible.', 5, true, 3)
ON CONFLICT DO NOTHING;
