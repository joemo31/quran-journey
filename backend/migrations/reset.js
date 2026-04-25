require('dotenv').config();
const { pool } = require('../src/config/database');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function reset() {
  rl.question(
    '\n⚠️  WARNING: This will DROP ALL TABLES and re-run all migrations.\n' +
    '   Type "yes" to confirm, anything else to cancel: ',
    async (answer) => {
      rl.close();
      if (answer.trim().toLowerCase() !== 'yes') {
        console.log('\n❌ Cancelled. No changes made.\n');
        await pool.end();
        return;
      }

      const client = await pool.connect();
      try {
        console.log('\n🗑  Dropping all tables...');
        await client.query(`
          DROP TABLE IF EXISTS
            _migrations, session_enrollments, sessions, payments,
            form_submissions, blog_posts, testimonials, site_content,
            media_library, site_settings, students, teachers, courses, users
          CASCADE
        `);
        console.log('  ✅ All tables dropped');
        client.release();
        await pool.end();

        console.log('\n🔄 Now run:  npm run migrate\n');
      } catch (err) {
        console.error('❌ Reset failed:', err.message);
        client.release();
        await pool.end();
        process.exit(1);
      }
    }
  );
}

reset();
