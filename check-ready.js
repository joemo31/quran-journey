/**
 * Pre-deployment readiness checker
 * Run with: node check-ready.js
 */
const fs   = require('fs');
const path = require('path');

const checks = [];
const OK  = '✅';
const ERR = '❌';
const WARN = '⚠️ ';

function check(label, condition, fix) {
  checks.push({ label, ok: condition, fix });
}

// ── Backend checks ────────────────────────────────────────────────────────────
const backendEnv = fs.existsSync('backend/.env');
check('Backend .env file exists',           backendEnv,      'Copy backend/.env.example to backend/.env and fill in values');

if (backendEnv) {
  const env = fs.readFileSync('backend/.env', 'utf8');
  check('JWT_SECRET is set',               env.includes('JWT_SECRET=') && !env.includes('JWT_SECRET=your_'),
        'Set JWT_SECRET to a random 32+ char string in backend/.env');
  check('DB_PASSWORD or DATABASE_URL set', env.includes('DATABASE_URL=') || env.includes('DB_PASSWORD='),
        'Set DB_PASSWORD or DATABASE_URL in backend/.env');
  check('ADMIN_EMAIL set',                 env.includes('ADMIN_EMAIL='),
        'Set ADMIN_EMAIL=quranjourney026@gmail.com in backend/.env');
  check('EmailJS configured',              env.includes('EMAILJS_SERVICE_ID=service_'),
        'Set up EmailJS at emailjs.com and add EMAILJS_* vars to backend/.env');
  check('FRONTEND_URL set',                env.includes('FRONTEND_URL='),
        'Set FRONTEND_URL to your frontend domain in backend/.env');
}

// ── Frontend checks ───────────────────────────────────────────────────────────
const frontendEnvProd = fs.existsSync('frontend/.env.production');
check('Frontend .env.production exists',   frontendEnvProd, 'Create frontend/.env.production with REACT_APP_API_URL');

if (frontendEnvProd) {
  const env = fs.readFileSync('frontend/.env.production', 'utf8');
  check('REACT_APP_API_URL set',           env.includes('REACT_APP_API_URL=https://'),
        'Set REACT_APP_API_URL to your deployed backend URL (https://...)');
}

// ── File structure ────────────────────────────────────────────────────────────
check('Backend index.js exists',           fs.existsSync('backend/src/index.js'),    'Missing backend/src/index.js');
check('Backend migrations exist',          fs.existsSync('backend/migrations/001_initial_schema.sql'), 'Missing migration files');
check('Frontend src exists',               fs.existsSync('frontend/src/App.js'),     'Missing frontend/src/App.js');
check('Uploads directory exists',          fs.existsSync('backend/uploads'),         'Run: mkdir -p backend/uploads');

// ── Node modules check ────────────────────────────────────────────────────────
check('Backend node_modules installed',    fs.existsSync('backend/node_modules'),    'Run: cd backend && npm install');
check('Frontend node_modules installed',   fs.existsSync('frontend/node_modules'),   'Run: cd frontend && npm install');

// ── Print results ─────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════');
console.log('  Quran Journey LMS — Deployment Readiness');
console.log('════════════════════════════════════════════\n');

let allOk = true;
for (const c of checks) {
  if (c.ok) {
    console.log(`${OK}  ${c.label}`);
  } else {
    allOk = false;
    console.log(`${ERR}  ${c.label}`);
    console.log(`     → ${c.fix}`);
  }
}

console.log('\n────────────────────────────────────────────');
if (allOk) {
  console.log(`${OK}  All checks passed! Ready to deploy.\n`);
} else {
  console.log(`${ERR}  Fix the errors above before deploying.\n`);
}
