# 🕌 Quran Journey Academy — Full Stack LMS

A production-ready Learning Management System for **Quran Journey Academy** — built with React, Node.js/Express, and PostgreSQL.

---

## 📁 Project Structure

```
quran-journey-lms/
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/           # DB connection, email config
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/        # Auth, validation, error handling
│   │   └── routes/           # API route definitions
│   ├── migrations/           # SQL schema files
│   ├── seeds/                # Demo data seeder
│   ├── .env.example          # Environment template
│   └── package.json
└── frontend/                 # React application
    ├── src/
    │   ├── components/
    │   │   ├── common/        # Reusable UI (Modal, DataTable, StatCard, ContactForm)
    │   │   └── layout/        # PublicLayout, DashboardLayout
    │   ├── context/          # AuthContext
    │   ├── hooks/            # useApi hook
    │   ├── pages/
    │   │   ├── public/        # Home, Courses, Pricing, Blog, About, Contact, Login
    │   │   ├── admin/         # Dashboard, Students, Teachers, Courses, Sessions, Blog, Payments, Submissions
    │   │   ├── student/       # Student Dashboard
    │   │   └── teacher/       # Teacher Dashboard
    │   ├── services/         # axios API layer
    │   └── styles/           # Global CSS + Tailwind
    └── package.json
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- npm or yarn

---

### 1. Clone & Install

```bash
# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

---

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=quran_journey_lms
DB_USER=postgres
DB_PASSWORD=yourpassword

JWT_SECRET=change_this_to_a_random_string_min_32_chars
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=Quran Journey Academy <info@quranjourney.academy>
ADMIN_EMAIL=admin@quranjourney.academy

FRONTEND_URL=http://localhost:3000
```

> **Gmail SMTP:** Enable 2FA on your Gmail, then generate an App Password at https://myaccount.google.com/apppasswords

---

### 3. Create the Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE quran_journey_lms;
\q
```

---

### 4. Run Migrations & Seeds

```bash
cd backend

# Create all tables
npm run migrate

# Seed demo data (admin, teacher, student, courses, blog posts)
npm run seed
```

---

### 5. Start the Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# App running at http://localhost:3000
```

---

### Demo Accounts

| Role    | Email                              | Password      |
|---------|-------------------------------------|---------------|
| Admin   | admin@quranjourney.academy          | Admin@12345   |
| Teacher | teacher@quranjourney.academy        | Teacher@123   |
| Student | student@quranjourney.academy        | Student@123   |

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint           | Auth | Description         |
|--------|--------------------|------|---------------------|
| POST   | /auth/login        | No   | Login               |
| POST   | /auth/register     | No   | Register            |
| GET    | /auth/me           | Yes  | Get current user    |
| PUT    | /auth/password     | Yes  | Update password     |

### Users
| Method | Endpoint           | Role  | Description         |
|--------|--------------------|-------|---------------------|
| GET    | /users             | Admin | List all users      |
| GET    | /users/students    | Admin | List students       |
| GET    | /users/teachers    | Admin | List teachers       |
| POST   | /users             | Admin | Create user         |
| PUT    | /users/:id         | Admin | Update user         |
| DELETE | /users/:id         | Admin | Deactivate user     |

### Courses
| Method | Endpoint           | Auth     | Description         |
|--------|---------------------|----------|---------------------|
| GET    | /courses           | No       | List courses        |
| POST   | /courses           | Admin    | Create course       |
| PUT    | /courses/:id       | Admin    | Update course       |
| DELETE | /courses/:id       | Admin    | Deactivate course   |

### Sessions
| Method | Endpoint           | Auth     | Description           |
|--------|---------------------|----------|-----------------------|
| GET    | /sessions          | Yes      | List sessions (filtered by role) |
| POST   | /sessions          | Admin    | Create session        |
| PUT    | /sessions/:id      | Admin/Teacher | Update session  |
| DELETE | /sessions/:id      | Admin    | Delete session        |

### Blog
| Method | Endpoint           | Auth  | Description         |
|--------|--------------------|-------|---------------------|
| GET    | /blog              | No    | List posts          |
| GET    | /blog/:slug        | No    | Get post by slug    |
| POST   | /blog              | Admin | Create post         |
| PUT    | /blog/:id          | Admin | Update post         |
| DELETE | /blog/:id          | Admin | Delete post         |

### Form Submissions
| Method | Endpoint           | Auth  | Description         |
|--------|--------------------|-------|---------------------|
| POST   | /submissions       | No    | Submit contact form |
| GET    | /submissions       | Admin | List submissions    |
| DELETE | /submissions/:id   | Admin | Delete submission   |

### Payments
| Method | Endpoint           | Auth  | Description         |
|--------|--------------------|-------|---------------------|
| GET    | /payments          | Admin | List payments       |
| POST   | /payments          | Admin | Record payment      |
| PUT    | /payments/:id      | Admin | Update payment      |

### Analytics
| Method | Endpoint               | Auth  | Description         |
|--------|------------------------|-------|---------------------|
| GET    | /analytics/dashboard   | Admin | Dashboard stats     |

---

## 🗄️ Database Schema

```
users               — central auth table (admin/student/teacher roles)
├── students        — student profiles (linked to users)
├── teachers        — teacher profiles (linked to users)
courses             — course catalog with pricing
sessions            — scheduled 1-on-1 lessons
session_enrollments — many-to-many sessions <> students
payments            — payment tracking (pending/paid/refunded)
blog_posts          — CMS blog (image or video media)
form_submissions    — contact/lead form with country
site_settings       — key-value store for dynamic site content
```

---

## 🚀 Deployment

### Frontend → Hostinger (Static)

```bash
cd frontend

# Create .env.production
echo "REACT_APP_API_URL=https://your-backend-domain.com/api" > .env.production

# Build
npm run build

# Upload /build folder contents to Hostinger public_html via FTP or File Manager
```

### Backend → Railway / Render

1. Push your `backend/` folder to a GitHub repo
2. Connect to [Railway](https://railway.app) or [Render](https://render.com)
3. Set all environment variables from `.env.example`
4. Set start command: `npm start`
5. Add a PostgreSQL plugin/service

### Database → Supabase / Neon / Railway Postgres

1. Create a free PostgreSQL database at [Supabase](https://supabase.com) or [Neon](https://neon.tech)
2. Copy the connection string to your `DB_*` environment variables
3. Run `npm run migrate` pointing to the cloud DB
4. Run `npm run seed` for initial data

---

## 🔐 Security Features

- JWT authentication with role-based access control
- Bcrypt password hashing (12 rounds)
- Helmet.js security headers
- Rate limiting (200 req/15min, 20 login attempts/15min)
- Input validation with express-validator
- SQL injection protection via parameterized queries
- CORS configured for specific frontend URL

---

## 🎨 Design System

| Token      | Value    | Usage                    |
|------------|----------|--------------------------|
| Primary    | #033455  | Brand color, buttons, headings |
| Secondary  | #4C4C4C  | Body text, labels        |
| White      | #FFFFFF  | Backgrounds, cards       |
| Accent     | #C9A84C  | Highlights (optional)    |

**Fonts:**
- Display: Playfair Display (headings)
- Body: Nunito (UI text)
- Arabic: Amiri (Arabic text)

---

## 🔧 Extending the System

**Add a new admin page:**
1. Create `frontend/src/pages/admin/AdminNew.js`
2. Add route in `App.js`
3. Add nav item in `DashboardLayout.js`

**Add a new API endpoint:**
1. Create controller in `backend/src/controllers/`
2. Create route file in `backend/src/routes/`
3. Register in `backend/src/index.js`

**Add email notifications:**
- Edit `backend/src/config/email.js`
- Add new template functions following `sendFormSubmissionNotification`

---

## 📞 Support

- WhatsApp: +20 150 801 8609
- Email: info@quranjourney.com
- Website: quranjourney.academy
