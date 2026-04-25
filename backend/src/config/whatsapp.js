const https = require('https');

/**
 * Send a WhatsApp message directly to the admin's phone via CallMeBot API.
 *
 * FREE service — no WhatsApp Business API needed.
 *
 * Setup (one time, takes 2 minutes):
 * 1. Save this contact in your phone: +34 644 59 78 46  (name it "CallMeBot")
 * 2. Send this exact message to that contact on WhatsApp:
 *      I allow callmebot to send me messages
 * 3. You'll receive an API key back within 60 seconds (looks like: 1234567)
 * 4. Add to your .env:
 *      CALLMEBOT_PHONE=201508018609   (your number, digits only, no + or spaces)
 *      CALLMEBOT_APIKEY=1234567       (the key you received)
 */
const sendWhatsApp = async (message) => {
  const phone  = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;

  if (!phone || !apikey) {
    console.log('[WhatsApp] Not configured — skipping. Set CALLMEBOT_PHONE and CALLMEBOT_APIKEY in .env');
    return { success: false, reason: 'not_configured' };
  }

  const encodedMsg = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMsg}&apikey=${apikey}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('[WhatsApp] Message sent successfully via CallMeBot');
          resolve({ success: true });
        } else {
          console.error('[WhatsApp] CallMeBot error:', res.statusCode, data);
          resolve({ success: false, error: data });
        }
      });
    }).on('error', (err) => {
      console.error('[WhatsApp] Request failed:', err.message);
      resolve({ success: false, error: err.message });
    });
  });
};

/**
 * Build and send enrollment notification to admin WhatsApp
 */
const sendEnrollmentNotification = async (submission) => {
  const lines = [
    '🎓 *New Enrollment — Quran Journey Academy*',
    '',
    `👤 *Name:* ${submission.name}`,
    `📧 *Email:* ${submission.email}`,
    `📱 *Phone:* ${submission.phone || 'Not provided'}`,
    `🌍 *Country:* ${submission.country || 'Not specified'}`,
    `📚 *Course:* ${submission.course_interest || 'Not specified'}`,
    `💬 *Message:* ${submission.message || '—'}`,
    '',
    `🕐 ${new Date().toLocaleString('en-US', {
      timeZone: 'Africa/Cairo',
      dateStyle: 'medium',
      timeStyle: 'short',
    })}`,
  ];

  return sendWhatsApp(lines.join('\n'));
};

module.exports = { sendWhatsApp, sendEnrollmentNotification };
