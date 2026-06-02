# Security & production handoff

Use this checklist after delivery or when the repository is public.

## Immediate actions (live site)

1. **Change all admin and staff passwords** if the site was ever set up with default or documented demo credentials.
2. **Delete or disable** unused demo accounts (`admin@quranjourney.academy`, etc.) if they still exist in production.
3. **Rotate secrets** if they were ever committed to git or shared in chat:
   - `JWT_SECRET` (Fly: `fly secrets set JWT_SECRET=...`)
   - Database password (Supabase → reset → update `DATABASE_URL` on Fly)
   - Supabase `service_role` key (if exposed)
   - EmailJS / SMTP / Telegram / WhatsApp tokens
4. **Do not run** `npm run seed` on production unless you understand what it does (demo users are skipped when `NODE_ENV=production`).

## Change admin email or password (after login)

1. Sign in to the admin dashboard.
2. Open **Account** in the sidebar (or click your name at the bottom).
3. Update **Login email**, **Full name**, and **Password** (current password required for profile changes).

URL: `/admin/account`

## Creating the first production admin

Preferred options (pick one):

1. **Register** at `/register` then promote the user to `admin` in the database (one-time SQL in Supabase SQL editor):

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'you@yourdomain.com';
   ```

2. **Admin dashboard** — if you already have an admin, use **Students/Teachers** management and password reset.

3. **Never** rely on passwords published in old README versions or Git history.

## Local development only

Demo users are created when `NODE_ENV` is not `production` (default for `npm run dev` / `npm run setup`).

Configure optional values in `backend/.env` (see `.env.example`):

- `SEED_ADMIN_EMAIL`, `SEED_TEACHER_EMAIL`, `SEED_STUDENT_EMAIL`
- `SEED_ADMIN_PASSWORD`, `SEED_TEACHER_PASSWORD`, `SEED_STUDENT_PASSWORD`

If passwords are omitted, the seed script generates random passwords and prints them **once** in the terminal. They are not stored in the repository.

## Repository hygiene

- Keep the GitHub repo **private** for client-owned projects when possible.
- Never commit `.env`, Fly secrets, or real passwords.
- If credentials were ever pushed, assume they are compromised: rotate and consider [removing secrets from git history](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository).

## Reporting issues

Contact the project owner for security concerns related to a deployed instance.
