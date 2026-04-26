/**
 * Deployment readiness checker
 * Run with: node check-ready.js
 */
const fs = require('fs');

const checks = [];
const OK = '[OK]';
const ERR = '[ERR]';

function addCheck(label, ok, fix) {
  checks.push({ label, ok, fix });
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFileSafe(filePath) {
  return fileExists(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function envValue(envText, key) {
  const match = envText.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
}

const backendEnvPath = fileExists('backend/.env') ? 'backend/.env' : 'backend/.env.production';
const frontendEnvProdPath = 'frontend/.env.production';
const backendEnv = readFileSafe(backendEnvPath);
const frontendEnv = readFileSafe(frontendEnvProdPath);
const usingBackendTemplate = backendEnvPath.endsWith('.env.production');

addCheck(
  'Backend environment file or template exists',
  fileExists(backendEnvPath),
  'Keep backend/.env.example or backend/.env.production up to date, then set the real values in Fly secrets.'
);

if (backendEnv) {
  const jwtSecret = envValue(backendEnv, 'JWT_SECRET');
  const databaseUrl = envValue(backendEnv, 'DATABASE_URL');
  const dbPassword = envValue(backendEnv, 'DB_PASSWORD');
  const frontendUrl = envValue(backendEnv, 'FRONTEND_URL');
  const frontendUrls = envValue(backendEnv, 'FRONTEND_URLS');
  const supabaseUrl = envValue(backendEnv, 'SUPABASE_URL');
  const supabaseServiceRoleKey = envValue(backendEnv, 'SUPABASE_SERVICE_ROLE_KEY');
  const supabaseStorageBucket = envValue(backendEnv, 'SUPABASE_STORAGE_BUCKET');

  addCheck(
    'JWT_SECRET is configured',
    usingBackendTemplate ? Boolean(jwtSecret) : (jwtSecret && !jwtSecret.includes('replace_with')),
    'Set JWT_SECRET to a long random secret.'
  );
  addCheck(
    'Database connection is configured',
    Boolean(databaseUrl || dbPassword),
    'Set DATABASE_URL or the DB_* values in Fly secrets or backend/.env.'
  );
  addCheck('Frontend origin is configured', Boolean(frontendUrl || frontendUrls), 'Set FRONTEND_URL or FRONTEND_URLS to your live frontend domain.');
  addCheck('Admin email is configured', Boolean(envValue(backendEnv, 'ADMIN_EMAIL')), 'Set ADMIN_EMAIL in backend/.env.');

  const storageConfigured = supabaseUrl && supabaseServiceRoleKey && supabaseStorageBucket;
  addCheck(
    'Persistent media storage is configured',
    Boolean(storageConfigured),
    'Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET for persistent uploads.'
  );
}

addCheck('Frontend .env.production exists', fileExists(frontendEnvProdPath), 'Create frontend/.env.production with REACT_APP_API_URL.');

if (frontendEnv) {
  const apiUrl = envValue(frontendEnv, 'REACT_APP_API_URL');
  addCheck('Frontend API URL is set', apiUrl.startsWith('https://'), 'Set REACT_APP_API_URL to your Fly.io API URL.');
}

addCheck('Hostinger rewrite file exists', fileExists('frontend/public/.htaccess'), 'Create frontend/public/.htaccess for React route rewrites.');
addCheck('Backend entry file exists', fileExists('backend/src/index.js'), 'Missing backend/src/index.js.');
addCheck('Frontend entry file exists', fileExists('frontend/src/App.js'), 'Missing frontend/src/App.js.');
addCheck('Database migrations exist', fileExists('backend/migrations/001_initial_schema.sql'), 'Missing backend migration files.');
addCheck('Backend dependencies are installed', fileExists('backend/node_modules'), 'Run `cd backend && npm install`.');
addCheck('Frontend dependencies are installed', fileExists('frontend/node_modules'), 'Run `cd frontend && npm install`.');

let allOk = true;

console.log('\nQuran Journey LMS Deployment Readiness\n');
for (const check of checks) {
  if (check.ok) {
    console.log(`${OK} ${check.label}`);
    continue;
  }

  allOk = false;
  console.log(`${ERR} ${check.label}`);
  console.log(`      -> ${check.fix}`);
}

console.log('');
console.log(allOk ? `${OK} Ready for deployment.` : `${ERR} Fix the items above before deploying.`);
console.log('');
