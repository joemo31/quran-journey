# 🚀 Deployment Guide — Quran Journey Academy LMS

## Overview

| Part | Deploy to | Cost |
|------|-----------|------|
| **Backend (API)** | Railway or Render | Free tier available |
| **Database** | Supabase or Neon | Free tier (500MB) |
| **Frontend** | Hostinger or Vercel | Free on Vercel / Your Hostinger plan |
| **Media files** | Same server as backend | Stored in /uploads |

---

## STEP 1 — Set up the Database (Supabase — Free)

1. Go to **https://supabase.com** → Sign up → New Project
2. Set a strong database password (save it!)
3. Wait ~2 minutes for the project to provision
4. Go to **Settings → Database**
5. Copy the **Connection String** (URI format) — looks like:
   ```
   postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
   ```
6. Save this — you'll need it in Step 2

---

## STEP 2 — Deploy the Backend (Railway — Free tier)

### Option A: Railway (Recommended — easiest)

1. Go to **https://railway.app** → Sign up with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Connect your GitHub account and push your project:
   ```bash
   cd quran-journey-lms
   git init
   git add .
   git commit -m "Initial commit"
   # Create a repo on github.com first, then:
   git remote add origin https://github.com/YOURNAME/quran-journey-lms.git
   git push -u origin main
   ```
4. In Railway → select your repo → select the **`backend`** folder as root
5. Railway auto-detects Node.js and deploys

**Set environment variables in Railway dashboard:**
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
DB_SSL=true
JWT_SECRET=<generate: openssl rand -hex 32>
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=quranjourney026@gmail.com
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
EMAILJS_PRIVATE_KEY=xxxxxxxxxxxxxxx
FRONTEND_URL=https://quranjourney.academy
```

6. After deploy, go to **Settings → Domains** → copy your Railway URL (e.g. `https://quran-journey-backend.up.railway.app`)
7. Run migrations on the cloud DB:
   - In Railway dashboard → your service → **Shell** tab
   - Run: `npm run setup`

### Option B: Render (also free)

1. Go to **https://render.com** → New → Web Service
2. Connect GitHub → select `backend` folder
3. Build command: `npm install`
4. Start command: `node src/index.js`
5. Add the same environment variables as above
6. After deploy, open Shell and run: `npm run setup`

---

## STEP 3 — Deploy the Frontend (Vercel — Free)

### Option A: Vercel (Recommended — free, fast, works with React)

1. Go to **https://vercel.com** → Sign up with GitHub
2. Click **New Project → Import** your GitHub repo
3. Set **Root Directory** to `frontend`
4. Framework: **Create React App** (auto-detected)
5. Add environment variable:
   ```
   REACT_APP_API_URL = https://quran-journey-backend.up.railway.app/api
   ```
   (Replace with your actual Railway/Render URL from Step 2)
6. Click **Deploy** — takes ~2 minutes
7. Vercel gives you a URL like `https://quran-journey.vercel.app`

### Option B: Hostinger (your existing hosting)

```bash
# On your local machine:
cd frontend

# Set your production API URL
echo "REACT_APP_API_URL=https://your-backend.railway.app/api" > .env.production

# Build
npm run build

# The /build folder is your static site
# Upload ALL contents of /build to Hostinger public_html via:
# - Hostinger File Manager, OR
# - FTP (FileZilla): host=ftp.yourdomain.com, user/pass from Hostinger panel
```

**Important for Hostinger — create `.htaccess` in public_html:**
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```
This makes React routing work (without it, refreshing a page gives 404).

---

## STEP 4 — Set up EmailJS (no app password needed)

1. Go to **https://www.emailjs.com** → Sign up free
2. **Email Services** → Add Service → Gmail → Connect `quranjourney026@gmail.com`
3. **Email Templates** → Create Template → paste this:

**Template content:**
```
Subject: New Lead: {{from_name}} - {{subject}}

New enrollment/inquiry from Quran Journey Academy website:

Name: {{from_name}}
Subject: {{subject}}
Message:
{{message}}

Reply to: {{reply_to}}
```

4. **Account** → copy **Public Key** and **Private Key**
5. Add these to your Railway environment variables:
   ```
   EMAILJS_SERVICE_ID=service_xxxxx   (from Email Services page)
   EMAILJS_TEMPLATE_ID=template_xxxxx (from Email Templates page)
   EMAILJS_PUBLIC_KEY=xxxxx           (from Account page)
   EMAILJS_PRIVATE_KEY=xxxxx          (from Account page)
   ```

---

## STEP 5 — Update CORS for your domain

In Railway → Environment Variables, update:
```
FRONTEND_URL=https://quranjourney.academy
```

If you have multiple domains (e.g. www + non-www):
Edit `backend/src/index.js` and change the CORS section:
```js
app.use(cors({
  origin: [
    'https://quranjourney.academy',
    'https://www.quranjourney.academy',
    'https://quran-journey.vercel.app',
  ],
  credentials: true,
}));
```

---

## STEP 6 — Connect your domain (quranjourney.academy)

### If using Vercel:
1. Vercel Dashboard → your project → **Settings → Domains**
2. Add `quranjourney.academy`
3. Vercel shows you DNS records to add
4. In Hostinger → **DNS Zone** → add the records Vercel shows you

### If using Hostinger for frontend:
- Just upload to `public_html` — your domain already points there

---

## Post-deployment checklist

```
□ Backend deployed and responding at /api/health
□ Database migrations run (npm run setup)
□ Frontend deployed and loads
□ Frontend REACT_APP_API_URL points to backend
□ Admin login works (admin@quranjourney.academy / Admin@12345)
□ CHANGE the admin password immediately after first login!
□ Contact form submits and email arrives at quranjourney026@gmail.com
□ Media uploads work
□ Site Editor changes appear on the website
```

---

## Monitoring & Maintenance

**Check if backend is alive:**
```
https://your-backend.railway.app/api/health
```

**If something breaks:**
- Railway → your service → **Logs** tab — shows all errors in real time
- Render → your service → **Logs** — same

**Update your site:**
```bash
git add .
git commit -m "Update"
git push
# Railway/Render/Vercel auto-redeploys on every push
```

**Backup database:**
```bash
# From Supabase dashboard → Database → Backups
# Or via pg_dump:
pg_dump "postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres" > backup.sql
```

---

## Cost Summary

| Service | Free Tier | Paid (if needed) |
|---------|-----------|-----------------|
| Railway | $5/mo free credit | $5-20/mo |
| Render | 750 hours/mo free | $7/mo |
| Supabase | 500MB, 2 projects | $25/mo |
| Neon | 3GB, unlimited projects | $19/mo |
| Vercel | Unlimited deploys | $20/mo (Pro) |
| EmailJS | 200 emails/mo | $15/mo (500 emails) |

**For a startup academy, free tiers are enough.** Upgrade only when you hit limits.

