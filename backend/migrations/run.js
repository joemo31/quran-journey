require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function runMigrations() {
  const client = await pool.connect();
  try {
    // ── 1. Create migrations tracking table if it doesn't exist ──────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // ── 2. Get list of already-applied migrations ─────────────────────────────
    const applied = await client.query('SELECT filename FROM _migrations ORDER BY filename');
    const appliedSet = new Set(applied.rows.map(r => r.filename));

    // ── 3. Find all .sql files, sorted ───────────────────────────────────────
    const files = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const pending = files.filter(f => !appliedSet.has(f));

    if (pending.length === 0) {
      console.log('\n✅ Database is already up to date. No new migrations to run.\n');
      return;
    }

    console.log(`\n🔄 Found ${pending.length} new migration(s) to apply...\n`);

    // ── 4. Run each pending migration in a transaction ────────────────────────
    for (const file of pending) {
      const filePath = path.join(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`  ▶ Applying: ${file}`);
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✅ Done: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌ Failed: ${file}`);
        console.error(`     Error: ${err.message}`);
        console.error('\n💡 Fix the SQL error above, then run migrate again.\n');
        process.exit(1);
      }
    }

    console.log(`\n🎉 All migrations applied successfully!\n`);

    // ── 5. Show full migration history ────────────────────────────────────────
    const history = await client.query('SELECT filename, applied_at FROM _migrations ORDER BY filename');
    console.log('Migration history:');
    history.rows.forEach(r => {
      console.log(`  ✓ ${r.filename} — ${new Date(r.applied_at).toLocaleString()}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
