require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool, query } = require('../src/config/database');

const isProduction = process.env.NODE_ENV === 'production';
const allowProductionSeed = process.env.ALLOW_PRODUCTION_SEED === 'true';

function devPassword(envKey, label) {
  const fromEnv = process.env[envKey];
  if (fromEnv) return fromEnv;
  const generated = crypto.randomBytes(12).toString('base64url');
  console.log(`  🔑 ${label} password (generated — set ${envKey} in .env to fix): ${generated}`);
  return generated;
}

async function seedDemoUsers() {
  if (isProduction && !allowProductionSeed) {
    console.log('  ⏭️  Demo users skipped (NODE_ENV=production).');
    console.log('      Create admin via /register or your DB — do not use public demo credentials.');
    return;
  }

  if (isProduction && allowProductionSeed) {
    console.warn('  ⚠️  ALLOW_PRODUCTION_SEED=true — creating demo users only for empty DB bootstrap.');
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@localhost.dev';
  const teacherEmail = process.env.SEED_TEACHER_EMAIL || 'teacher@localhost.dev';
  const studentEmail = process.env.SEED_STUDENT_EMAIL || 'student@localhost.dev';

  const adminPassword = devPassword('SEED_ADMIN_PASSWORD', 'Admin');
  const teacherPassword = devPassword('SEED_TEACHER_PASSWORD', 'Teacher');
  const studentPassword = devPassword('SEED_STUDENT_PASSWORD', 'Student');

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const adminRes = await query(
    `INSERT INTO users (name, email, password_hash, role, is_active, created_at)
     VALUES ('Admin User', $2, $1, 'admin', true, NOW())
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [adminHash, adminEmail]
  );
  if (adminRes.rows.length) {
    console.log(`  ✅ Admin user created — ${adminEmail}`);
  } else {
    console.log(`  ℹ️  Admin user already exists — ${adminEmail} (password not changed)`);
  }

  const teacherHash = await bcrypt.hash(teacherPassword, 12);
  const teacherUserRes = await query(
    `INSERT INTO users (name, email, password_hash, role, phone, is_active, created_at)
     VALUES ('Sheikh Ahmed', $2, $1, 'teacher', '+1234567890', true, NOW())
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [teacherHash, teacherEmail]
  );
  if (teacherUserRes.rows.length) {
    await query(
      `INSERT INTO teachers (user_id, specialization, bio, created_at)
       VALUES ($1, 'Tajweed & Quran Memorization', 'Al-Azhar certified teacher with 10 years experience.', NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [teacherUserRes.rows[0].id]
    );
    console.log(`  ✅ Demo teacher created — ${teacherEmail}`);
  } else {
    console.log(`  ℹ️  Demo teacher already exists — ${teacherEmail}`);
  }

  const studentHash = await bcrypt.hash(studentPassword, 12);
  const studentUserRes = await query(
    `INSERT INTO users (name, email, password_hash, role, phone, is_active, created_at)
     VALUES ('Aisha Rahman', $2, $1, 'student', '+9876543210', true, NOW())
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [studentHash, studentEmail]
  );
  if (studentUserRes.rows.length) {
    await query(
      `INSERT INTO students (user_id, level, created_at)
       VALUES ($1, 'Beginner', NOW())
       ON CONFLICT (user_id) DO NOTHING`,
      [studentUserRes.rows[0].id]
    );
    console.log(`  ✅ Demo student created — ${studentEmail}`);
  } else {
    console.log(`  ℹ️  Demo student already exists — ${studentEmail}`);
  }

  const passwordsFromEnv =
    process.env.SEED_ADMIN_PASSWORD &&
    process.env.SEED_TEACHER_PASSWORD &&
    process.env.SEED_STUDENT_PASSWORD;

  if (passwordsFromEnv) {
    console.log('\n  Local login (passwords from your .env):');
    console.log(`    Admin:   ${adminEmail}`);
    console.log(`    Teacher: ${teacherEmail}`);
    console.log(`    Student: ${studentEmail}`);
  } else {
    console.log('\n  Local login emails above — passwords were printed when each user was created.');
    console.log('  Set SEED_ADMIN_PASSWORD, SEED_TEACHER_PASSWORD, SEED_STUDENT_PASSWORD in .env for stable dev passwords.');
  }
}

async function seedContent() {
  const courses = [
    ['Noor Al-Bayan Course', 'Learn to read Arabic and Quran from scratch with clarity and confidence. Perfect for absolute beginners.', 49, 'USD', 12, 'Beginner', 1],
    ['Tajweed Course', 'Beautify your recitation step by step with expert guidance and proper articulation rules.', 59, 'USD', 16, 'Intermediate', 2],
    ['Quran Memorization Program', 'Build a lifelong connection with the Quran through systematic memorization with qualified huffaz.', 79, 'USD', 24, 'All Levels', 3],
    ['Arabic Language Course', 'Understand and speak Arabic — the language of the Quran. From basics to conversational fluency.', 69, 'USD', 20, 'Beginner', 4],
    ['Islamic Studies', 'Discover essential Islamic knowledge in a simple, interactive way. Aqeedah, Fiqh, and Seerah.', 39, 'USD', 8, 'All Levels', 5],
  ];
  for (const [name, desc, price, currency, weeks, level, order] of courses) {
    await query(
      `INSERT INTO courses (name, description, price, currency, duration_weeks, level, is_active, sort_order, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,true,$7,NOW())
       ON CONFLICT DO NOTHING`,
      [name, desc, price, currency, weeks, level, order]
    );
  }
  console.log('  ✅ 5 courses seeded');

  await query(`
    INSERT INTO blog_posts (title, slug, content, excerpt, image_url, media_type, is_published, author_name, created_at)
    VALUES
      ('The Importance of Tajweed in Quran Recitation',
       'importance-of-tajweed-${Date.now()}',
       '<p>Tajweed is the science of reciting the Quran correctly...</p>',
       'Discover why proper Tajweed is essential for every Muslim who recites the Holy Quran.',
       'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1200',
       'image', true, 'Sheikh Ahmed', NOW()),
      ('How to Memorize the Quran: A Practical Guide',
       'how-to-memorize-quran-${Date.now()}',
       '<p>Memorizing the Quran (Hifz) is one of the most noble pursuits...</p>',
       'Learn the proven methods our Al-Azhar certified teachers use to help students memorize the Quran.',
       'https://images.unsplash.com/photo-1597149185560-b8b3c5f6e71c?w=1200',
       'image', true, 'Quran Journey Team', NOW())
    ON CONFLICT (slug) DO NOTHING
  `);
  console.log('  ✅ Sample blog posts seeded');

  const testimonials = [
    ['Keturah Nicole', 'United States', 'Alhamdulillah, I started from zero and now I can read the Quran beautifully. The teacher is so patient and encouraging. Highly recommend Quran Journey!', 5, 1],
    ['Sister Shamila', 'United Kingdom', 'My children love their sessions. The teachers are professional, kind, and make learning fun. Best online Quran academy we have tried.', 5, 2],
    ['Ahmad Al-Farsi', 'United Arab Emirates', 'I enrolled in the Tajweed course and the results are amazing. The one-on-one sessions are very effective and the scheduling is very flexible.', 5, 3],
  ];
  for (const [name, country, content, rating, order] of testimonials) {
    await query(
      `INSERT INTO testimonials (student_name, student_country, content, rating, is_published, sort_order, created_at)
       VALUES ($1,$2,$3,$4,true,$5,NOW())
       ON CONFLICT DO NOTHING`,
      [name, country, content, rating, order]
    );
  }
  console.log('  ✅ Sample testimonials seeded');

  await query(`
    INSERT INTO form_submissions (name, email, phone, country, message, created_at)
    VALUES ('Ahmad Al-Farsi', 'ahmad@example.com', '+971501234567', 'United Arab Emirates',
            'I want to enroll my children in the Quran memorization program.', NOW())
    ON CONFLICT DO NOTHING
  `);
  console.log('  ✅ Sample form submission seeded');
}

async function seed() {
  console.log('\n🌱 Seeding database (safe to run multiple times)...\n');

  try {
    await seedDemoUsers();
    await seedContent();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
