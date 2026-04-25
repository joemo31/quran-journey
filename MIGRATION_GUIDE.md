# 🗄️ Database Migration Guide

## How it works now

The migration system tracks which files have already been applied in a `_migrations` table.
Running `npm run migrate` **only applies NEW files** — it never re-runs what's already done.

---

## Commands

```bash
# Apply only new/pending migrations (safe to run anytime)
npm run migrate

# Seed demo data (safe to run multiple times — uses ON CONFLICT DO NOTHING)
npm run seed

# Do both at once (first-time setup)
npm run setup

# ⚠️ DANGER: Drop everything and start fresh (asks for confirmation)
npm run db:reset
# then run: npm run setup
```

---

## First-time setup (fresh database)

```bash
# 1. Create the database in PostgreSQL
psql -U postgres -c "CREATE DATABASE quran_journey_lms"

# 2. Run migrations + seed in one command
cd backend
npm run setup
```

Output you'll see:
```
🔄 Found 4 new migration(s) to apply...

  ▶ Applying: 001_initial_schema.sql
  ✅ Done: 001_initial_schema.sql
  ▶ Applying: 002_updates.sql
  ✅ Done: 002_updates.sql
  ▶ Applying: 003_full_site_content.sql
  ✅ Done: 003_full_site_content.sql
  ▶ Applying: 004_hero_image.sql
  ✅ Done: 004_hero_image.sql

🎉 All migrations applied successfully!
```

---

## After pulling new project updates

If a new migration file is added (e.g. `005_something.sql`), just run:

```bash
npm run migrate
```

Output will show:
```
✅ Database is already up to date. No new migrations to run.
```
...if nothing is new, OR:
```
🔄 Found 1 new migration(s) to apply...
  ▶ Applying: 005_something.sql
  ✅ Done: 005_something.sql
```

---

## If migrate fails mid-way

Each migration runs inside a transaction. If it fails:
- That file is rolled back completely
- Previous files stay applied
- Fix the error, then run `npm run migrate` again

---

## Adding a new migration file

Name it sequentially: `005_description.sql`

Make sure every statement is **idempotent** (safe to run more than once):

```sql
-- ✅ Good
CREATE TABLE IF NOT EXISTS my_table (...);
CREATE INDEX IF NOT EXISTS idx_name ON my_table(col);
ALTER TABLE ... ADD COLUMN IF NOT EXISTS new_col TEXT;

-- Use DO block for conditional ALTER:
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='my_table' AND column_name='new_col'
  ) THEN
    ALTER TABLE my_table ADD COLUMN new_col TEXT;
  END IF;
END $$;

-- ✅ For INSERT use ON CONFLICT
INSERT INTO my_table (...) VALUES (...) ON CONFLICT DO NOTHING;

-- ❌ Never do this in a migration:
CREATE INDEX idx_name ON ...;          -- fails if exists
ALTER TABLE t ADD COLUMN c TEXT;       -- fails if exists
DELETE FROM table;                     -- dangerous
DROP TABLE table;                      -- dangerous
```
