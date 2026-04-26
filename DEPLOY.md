# Deployment Guide

This project is now prepared for the stack you described:

- `Backend`: Fly.io
- `Database`: Supabase Postgres
- `Media uploads`: Supabase Storage
- `Frontend`: Hostinger static hosting
- `Domain registrar`: Namecheap

## What changed in the code

- Backend CORS now supports multiple frontend origins via `FRONTEND_URLS`.
- Backend rate limiting now respects Fly client IP headers.
- Media uploads can use Supabase Storage, so files do not disappear on Fly restarts.
- Frontend media URLs are normalized, so Hostinger pages can load assets served from Fly or Supabase.
- Hostinger SPA routing support was added with `frontend/public/.htaccess`.

## 1. Set up Supabase

### Database

1. Open your Supabase project.
2. Click `Connect`.
3. Copy one of these connection strings:
   - Use the `Direct connection` string first. Supabase says this is ideal for persistent servers like VMs.
   - If direct connection gives you networking trouble, switch to the `Session pooler` string.
4. Keep the password ready for Fly secrets.

### Storage

1. Go to `Storage`.
2. Create a bucket named `media`.
3. Make the bucket `Public`.
4. Optional but recommended:
   - Restrict MIME types to images, videos, and PDFs.
   - Set a size limit that matches your business needs.

### API values you need from Supabase

From `Project Settings -> API`, copy:

- `Project URL` -> becomes `SUPABASE_URL`
- `service_role` key -> becomes `SUPABASE_SERVICE_ROLE_KEY`

Do not use the anon key for backend uploads.

## 2. Set Fly.io backend secrets

From the `backend` folder, set your secrets on Fly:

```bash
fly secrets set ^
  NODE_ENV=production ^
  PORT=8080 ^
  DATABASE_URL="your-supabase-connection-string" ^
  DB_SSL=true ^
  JWT_SECRET="generate-a-long-random-secret" ^
  JWT_EXPIRES_IN=7d ^
  FRONTEND_URL="https://yourdomain.com" ^
  FRONTEND_URLS="https://yourdomain.com,https://www.yourdomain.com" ^
  ADMIN_EMAIL="admin@yourdomain.com" ^
  EMAILJS_SERVICE_ID="service_xxxxxxx" ^
  EMAILJS_TEMPLATE_ID="template_xxxxxxx" ^
  EMAILJS_PUBLIC_KEY="public_xxxxxxx" ^
  EMAILJS_PRIVATE_KEY="private_xxxxxxx" ^
  SUPABASE_URL="https://your-project-ref.supabase.co" ^
  SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" ^
  SUPABASE_STORAGE_BUCKET="media" ^
  -a quran-journey-backend
```

If you use Telegram or WhatsApp notifications, also set:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `ULTRAMSG_INSTANCE`
- `ULTRAMSG_TOKEN`
- `WHAPI_TOKEN`
- `WHATSAPP_ADMIN_NUMBER`

## 3. Deploy backend to Fly.io

From `backend/`:

```bash
fly deploy
```

Then run migrations against the live Supabase database:

```bash
fly ssh console -a quran-journey-backend -C "cd /app && npm run migrate"
```

Seed only if this is a brand new database:

```bash
fly ssh console -a quran-journey-backend -C "cd /app && npm run seed"
```

Check:

```bash
https://quran-journey-backend.fly.dev/api/health
```

Notes:

- Your `fly.toml` already points traffic to port `8080`, which matches the app now.
- `min_machines_running = 0` saves money but allows cold starts. Change it to `1` later if you want the admin/dashboard to wake instantly.

## 4. Build and upload the frontend to Hostinger

`frontend/.env.production` should point to your Fly API:

```env
REACT_APP_API_URL=https://quran-journey-backend.fly.dev/api
```

Then build:

```bash
cd frontend
npm run build
```

Upload everything inside `frontend/build/` to your Hostinger `public_html` folder.

Important:

- Upload the contents of `build`, not the `build` folder itself.
- Keep the generated `.htaccess` file in `public_html`.
- That `.htaccess` is what makes `/admin`, `/blog/post-slug`, and other React routes work after refresh.

## 5. Point your Namecheap domain to Hostinger

Choose one DNS approach and stick to it:

### Option A: Move DNS to Hostinger

This is usually the simplest if the frontend lives on Hostinger.

1. In Hostinger hPanel, find the nameservers or domain connection values they want you to use.
2. In Namecheap:
   - `Domain List`
   - `Manage`
   - `Nameservers`
   - choose `Custom DNS`
   - paste the Hostinger nameservers
3. Wait for propagation. It can take up to 24 hours.

### Option B: Keep DNS at Namecheap

If you want to keep DNS management in Namecheap:

1. Point the root domain `@` to the Hostinger IP shown in hPanel.
2. Point `www` as Hostinger recommends, usually via `CNAME`.
3. Add any extra records there too.

If you switch nameservers to Hostinger, all future DNS records should be managed in Hostinger, not Namecheap.

## 6. Optional: add a branded API subdomain

If you want `api.yourdomain.com` instead of the default `fly.dev` URL:

1. Add a custom domain for the Fly app in Fly.io.
2. Create the DNS record Fly asks for.
3. Update `frontend/.env.production` to:

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

4. Rebuild the frontend and re-upload `frontend/build/`.

## 7. Final production checklist

1. Open the live homepage and confirm it loads over HTTPS.
2. Refresh a nested route like `/blog` or `/admin` and confirm there is no 404.
3. Log in to the dashboard.
4. Submit the contact form.
5. Upload an image in the media library.
6. Use that image in the Site Editor.
7. Re-open the site and confirm the image still exists after a new Fly deploy.
8. Confirm emails or notifications are arriving.
9. Change the seeded admin password immediately if you used seed data.

## Useful commands

```bash
# frontend production build
cd frontend
npm run build

# backend deployment check
cd ..
node check-ready.js

# Fly logs
cd backend
fly logs -a quran-journey-backend

# Run migrations again if needed
fly ssh console -a quran-journey-backend -C "cd /app && npm run migrate"
```

## Source docs

- [Fly.io `fly secrets set`](https://fly.io/docs/flyctl/secrets-set/)
- [Fly.io `fly ssh console`](https://fly.io/docs/flyctl/ssh-console/)
- [Supabase connection strings](https://supabase.com/docs/reference/postgres/connection-strings)
- [Supabase creating buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets)
- [Supabase public storage URLs](https://supabase.com/docs/guides/storage/serving/downloads)
- [Hostinger domain pointing guide](https://support.hostinger.com/en/articles/1863967-how-to-point-a-domain-to-hostinger)
- [Namecheap nameserver change guide](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-can-i-change-the-nameservers-for-my-domain)
