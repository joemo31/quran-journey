const https = require('https');
const http  = require('http');

/**
 * ═══════════════════════════════════════════════════════════
 *  NOTIFICATION SYSTEM — Quran Journey Academy
 *  Tries each method in order until one succeeds
 * ═══════════════════════════════════════════════════════════
 *
 *  Priority order:
 *  1. Telegram Bot (FREE forever — recommended)
 *  2. UltraMsg WhatsApp (paid but cheap ~$9/mo)
 *  3. Email via EmailJS (free 200/mo)
 */

// ── Helper: make an HTTPS/HTTP GET request ──────────────────────────────────
const httpGet = (url) =>
  new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', (err) => resolve({ status: 0, body: err.message }));
  });

// ── Helper: make a POST request with JSON body ──────────────────────────────
const httpPost = (url, payload) =>
  new Promise((resolve) => {
    const body  = JSON.stringify(payload);
    const urlObj = new URL(url);
    const lib  = urlObj.protocol === 'https:' ? https : http;
    const req  = lib.request({
      hostname: urlObj.hostname,
      path:     urlObj.pathname + urlObj.search,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (err) => resolve({ status: 0, body: err.message }));
    req.write(body);
    req.end();
  });

// ══════════════════════════════════════════════════════════════
//  METHOD 1: TELEGRAM BOT (FREE FOREVER — easiest to set up)
// ══════════════════════════════════════════════════════════════
/**
 * Setup (3 minutes):
 * 1. Open Telegram → search @BotFather → send /start
 * 2. Send /newbot → give it a name (e.g. "Quran Journey Bot")
 * 3. Copy the API token (looks like: 7123456789:AAH...)
 * 4. Search your new bot in Telegram → click Start
 * 5. Open: https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
 *    Find "chat":{"id": XXXXXXX} — that's your chat ID
 * 6. Add to .env:
 *    TELEGRAM_BOT_TOKEN=7123456789:AAH...
 *    TELEGRAM_CHAT_ID=123456789
 */
const sendTelegram = async (message) => {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { success: false, reason: 'telegram_not_configured' };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await httpPost(url, {
    chat_id:    chatId,
    text:       message,
  });

  if (res.status === 200) {
    console.log('[Telegram] ✅ Notification sent');
    return { success: true };
  }
  console.error('[Telegram] ❌ Failed:', res.status, res.body);
  return { success: false, error: res.body };
};

// ══════════════════════════════════════════════════════════════
//  METHOD 2: ULTRAMSG (WhatsApp — $9/mo, 30-day free trial)
// ══════════════════════════════════════════════════════════════
/**
 * Setup:
 * 1. Go to https://ultramsg.com → Sign up → Create Instance
 * 2. Scan QR code with your WhatsApp
 * 3. Get your Instance ID and Token from the dashboard
 * 4. Add to .env:
 *    ULTRAMSG_INSTANCE=instance12345
 *    ULTRAMSG_TOKEN=your_token_here
 *    WHATSAPP_ADMIN_NUMBER=201508018609  (your number with country code)
 */
const sendUltraMsg = async (message) => {
  const instance = process.env.ULTRAMSG_INSTANCE;
  const token    = process.env.ULTRAMSG_TOKEN;
  const phone    = process.env.WHATSAPP_ADMIN_NUMBER;

  if (!instance || !token || !phone) {
    return { success: false, reason: 'ultramsg_not_configured' };
  }

  const url = `https://api.ultramsg.com/${instance}/messages/chat`;
  const res = await httpPost(url, {
    token,
    to:   `+${phone.replace(/\D/g, '')}`,
    body: message,
  });

  if (res.status === 200) {
    console.log('[UltraMsg] ✅ WhatsApp sent');
    return { success: true };
  }
  console.error('[UltraMsg] ❌ Failed:', res.status, res.body);
  return { success: false, error: res.body };
};

// ══════════════════════════════════════════════════════════════
//  METHOD 3: WHAPI.CLOUD (WhatsApp — free 3-day trial, then paid)
// ══════════════════════════════════════════════════════════════
/**
 * Setup:
 * 1. Go to https://whapi.cloud → Sign up → Create Channel
 * 2. Scan QR code with your WhatsApp
 * 3. Copy your API Token from dashboard
 * 4. Add to .env:
 *    WHAPI_TOKEN=your_token_here
 *    WHATSAPP_ADMIN_NUMBER=201508018609
 */
const sendWhapi = async (message) => {
  const token = process.env.WHAPI_TOKEN;
  const phone = process.env.WHATSAPP_ADMIN_NUMBER;

  if (!token || !phone) {
    return { success: false, reason: 'whapi_not_configured' };
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const res = await httpPost('https://gate.whapi.cloud/messages/text', {
    to:   `${cleanPhone}@s.whatsapp.net`,
    body: message,
  });

  // Also need auth header — use fetch-style
  const url     = 'https://gate.whapi.cloud/messages/text';
  const body    = JSON.stringify({ to: `${cleanPhone}@s.whatsapp.net`, body: message });
  const urlObj  = new URL(url);
  const result  = await new Promise((resolve) => {
    const req = https.request({
      hostname: urlObj.hostname,
      path:     urlObj.pathname,
      method:   'POST',
      headers:  {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (err) => resolve({ status: 0, body: err.message }));
    req.write(body);
    req.end();
  });

  if (result.status === 200 || result.status === 201) {
    console.log('[Whapi] ✅ WhatsApp sent');
    return { success: true };
  }
  console.error('[Whapi] ❌ Failed:', result.status, result.body);
  return { success: false, error: result.body };
};

// ══════════════════════════════════════════════════════════════
//  MAIN: Build message and try all methods
// ══════════════════════════════════════════════════════════════
const sendEnrollmentNotification = async (submission) => {
  const time = new Date().toLocaleString('en-US', {
    timeZone:  'Africa/Cairo',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const message = [
    '🎓 *New Enrollment — Quran Journey Academy*',
    '',
    `👤 *Name:* ${submission.name}`,
    `📧 *Email:* ${submission.email}`,
    `📱 *Phone:* ${submission.phone || 'Not provided'}`,
    `🌍 *Country:* ${submission.country || 'Not specified'}`,
    `📚 *Course:* ${submission.course_interest || 'Not specified'}`,
    `💬 *Message:* ${submission.message || '—'}`,
    '',
    `🕐 ${time}`,
  ].join('\n');

  const attempts = [];

  // Try Telegram first (free, most reliable)
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const result = await sendTelegram(message);
    attempts.push({ service: 'telegram', ...result });
    if (result.success) return result;
  }

  // Try UltraMsg WhatsApp
  if (process.env.ULTRAMSG_INSTANCE && process.env.ULTRAMSG_TOKEN) {
    const result = await sendUltraMsg(message);
    attempts.push({ service: 'ultramsg', ...result });
    if (result.success) return result;
  }

  // Try Whapi WhatsApp
  if (process.env.WHAPI_TOKEN) {
    const result = await sendWhapi(message);
    attempts.push({ service: 'whapi', ...result });
    if (result.success) return result;
  }

  if (attempts.length > 0) {
    console.error(
      '[Notifications] All configured messaging services failed:',
      attempts.map(({ service, reason, error }) => ({
        service,
        reason: reason || null,
        error: error || null,
      }))
    );
    return { success: false, reason: 'all_configured_services_failed', attempts };
  }

  console.log('[Notifications] No messaging service configured. Set up Telegram or UltraMsg in .env');
  return { success: false, reason: 'no_service_configured' };
};

module.exports = { sendEnrollmentNotification, sendTelegram, sendUltraMsg, sendWhapi };
