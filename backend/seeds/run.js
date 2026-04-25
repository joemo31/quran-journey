require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool, query } = require('../src/config/database');

async function seed() {
  console.log('\n🌱 Seeding database (safe to run multiple times)...\n');

  try {
    // ── Admin user ────────────────────────────────────────────────────────────
    const adminHash = await bcrypt.hash('Admin@12345', 12);
    const adminRes  = await query(
      `INSERT INTO users (name, email, password_hash, role, is_active, created_at)
       VALUES ('Admin User', 'admin@quranjourney.academy', $1, 'admin', true, NOW())
       ON CONFLICT (email) DO UPDATE SET password_hash = $1
       RETURNING id`,
      [adminHash]
    );
    console.log('  ✅ Admin user — admin@quranjourney.academy / Admin@12345');

    // ── Demo teacher ──────────────────────────────────────────────────────────
    const teacherHash    = await bcrypt.hash('Teacher@123', 12);
    const teacherUserRes = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, is_active, created_at)
       VALUES ('Sheikh Ahmed', 'teacher@quranjourney.academy', $1, 'teacher', '+1234567890', true, NOW())
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [teacherHash]
    );
    if (teacherUserRes.rows.length) {
      await query(
        `INSERT INTO teachers (user_id, specialization, bio, created_at)
         VALUES ($1, 'Tajweed & Quran Memorization', 'Al-Azhar certified teacher with 10 years experience.', NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [teacherUserRes.rows[0].id]
      );
    }
    console.log('  ✅ Demo teacher — teacher@quranjourney.academy / Teacher@123');

    // ── Demo student ──────────────────────────────────────────────────────────
    const studentHash    = await bcrypt.hash('Student@123', 12);
    const studentUserRes = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, is_active, created_at)
       VALUES ('Aisha Rahman', 'student@quranjourney.academy', $1, 'student', '+9876543210', true, NOW())
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [studentHash]
    );
    if (studentUserRes.rows.length) {
      await query(
        `INSERT INTO students (user_id, level, created_at)
         VALUES ($1, 'Beginner', NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [studentUserRes.rows[0].id]
      );
    }
    console.log('  ✅ Demo student  — student@quranjourney.academy / Student@123');

    // ── Courses ───────────────────────────────────────────────────────────────
    const courses = [
      ['Noor Al-Bayan Course',       'Learn to read Arabic and Quran from scratch with clarity and confidence. Perfect for absolute beginners.',        49, 'USD', 12, 'Beginner',     1],
      ['Tajweed Course',              'Beautify your recitation step by step with expert guidance and proper articulation rules.',                        59, 'USD', 16, 'Intermediate', 2],
      ['Quran Memorization Program',  'Build a lifelong connection with the Quran through systematic memorization with qualified huffaz.',               79, 'USD', 24, 'All Levels',   3],
      ['Arabic Language Course',      'Understand and speak Arabic — the language of the Quran. From basics to conversational fluency.',                69, 'USD', 20, 'Beginner',     4],
      ['Islamic Studies',             'Discover essential Islamic knowledge in a simple, interactive way. Aqeedah, Fiqh, and Seerah.',                  39, 'USD',  8, 'All Levels',   5],
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

    // ── Blog posts ────────────────────────────────────────────────────────────
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

    // ── Testimonials ──────────────────────────────────────────────────────────
    const testimonials = [
      ['Keturah Nicole',  'United States',  'Alhamdulillah, I started from zero and now I can read the Quran beautifully. The teacher is so patient and encouraging. Highly recommend Quran Journey!', 5, 1],
      ['Sister Shamila',  'United Kingdom',  'My children love their sessions. The teachers are professional, kind, and make learning fun. Best online Quran academy we have tried.',                5, 2],
      ['Ahmad Al-Farsi',  'United Arab Emirates', 'I enrolled in the Tajweed course and the results are amazing. The one-on-one sessions are very effective and the scheduling is very flexible.',  5, 3],
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

    // ── Sample form submission ────────────────────────────────────────────────
    await query(`
      INSERT INTO form_submissions (name, email, phone, country, message, created_at)
      VALUES ('Ahmad Al-Farsi', 'ahmad@example.com', '+971501234567', 'United Arab Emirates',
              'I want to enroll my children in the Quran memorization program.', NOW())
      ON CONFLICT DO NOTHING
    `);
    console.log('  ✅ Sample form submission seeded');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Admin:   admin@quranjourney.academy  /  Admin@12345');
    console.log('  Teacher: teacher@quranjourney.academy /  Teacher@123');
    console.log('  Student: student@quranjourney.academy /  Student@123');
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
