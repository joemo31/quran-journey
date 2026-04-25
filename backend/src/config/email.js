const https = require('https');

// Send email via EmailJS REST API - no SMTP, no app password needed
// Uses EmailJS free tier: https://www.emailjs.com (100 emails/month free)
const sendViaEmailJS = async ({ to_email, to_name, from_name, subject, message, reply_to }) => {
  const serviceId  = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey  = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.log('[Email] EmailJS not configured. Skipping email send.');
    return { success: false, error: 'EmailJS not configured' };
  }

  const payload = JSON.stringify({
    service_id:  serviceId,
    template_id: templateId,
    user_id:     publicKey,
    accessToken: privateKey,
    template_params: {
      to_email,
      to_name:   to_name   || 'Admin',
      from_name: from_name || 'Quran Journey Academy',
      subject,
      message,
      reply_to:  reply_to  || to_email,
    },
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.emailjs.com',
      path:     '/api/v1.0/email/send',
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('[Email] Sent via EmailJS:', subject);
          resolve({ success: true });
        } else {
          console.error('[Email] EmailJS error:', res.statusCode, data);
          resolve({ success: false, error: data });
        }
      });
    });
    req.on('error', (e) => { console.error('[Email] Request error:', e); resolve({ success: false, error: e.message }); });
    req.write(payload);
    req.end();
  });
};

// Also keep SMTP as fallback if configured
const sendViaSMTP = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return { success: false, error: 'SMTP not configured' };
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER, to, subject, html, text });
    return { success: true };
  } catch (e) {
    console.error('[Email] SMTP error:', e.message);
    return { success: false, error: e.message };
  }
};

const sendFormSubmissionNotification = async (submission) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'quranjourney026@gmail.com';

  const message = `
New Lead from Quran Journey Academy Website!

Name:            ${submission.name}
Email:           ${submission.email}
Phone:           ${submission.phone || 'Not provided'}
Country:         ${submission.country}
Course Interest: ${submission.course_interest || 'Not specified'}
Message:         ${submission.message || 'No message'}
Submitted:       ${new Date().toLocaleString()}
  `.trim();

  // Try EmailJS first (no app password needed)
  const emailJSResult = await sendViaEmailJS({
    to_email:  adminEmail,
    to_name:   'Quran Journey Admin',
    from_name: submission.name,
    subject:   `New Lead: ${submission.name} from ${submission.country}${submission.course_interest ? ` — ${submission.course_interest}` : ''}`,
    message,
    reply_to:  submission.email,
  });

  if (!emailJSResult.success) {
    // Fallback to SMTP if configured
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
        <div style="background:#033455;padding:20px;text-align:center">
          <h2 style="color:white;margin:0">📬 New Lead — Quran Journey Academy</h2>
        </div>
        <div style="padding:24px;background:#f9f9f9">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;font-weight:bold;color:#033455;width:35%">Name</td><td style="padding:8px">${submission.name}</td></tr>
            <tr style="background:#fff"><td style="padding:8px;font-weight:bold;color:#033455">Email</td><td style="padding:8px"><a href="mailto:${submission.email}">${submission.email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;color:#033455">Phone</td><td style="padding:8px">${submission.phone || '—'}</td></tr>
            <tr style="background:#fff"><td style="padding:8px;font-weight:bold;color:#033455">Country</td><td style="padding:8px">${submission.country}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;color:#033455">Course Interest</td><td style="padding:8px">${submission.course_interest || 'Not specified'}</td></tr>
            <tr style="background:#fff"><td style="padding:8px;font-weight:bold;color:#033455">Message</td><td style="padding:8px">${submission.message || '—'}</td></tr>
          </table>
        </div>
        <div style="padding:16px;text-align:center;background:#033455">
          <p style="color:#cce4ff;margin:0;font-size:13px">Quran Journey Academy — Lead Notification</p>
        </div>
      </div>`;
    await sendViaSMTP({ to: adminEmail, subject: `New Lead: ${submission.name}`, html });
  }

  return emailJSResult;
};

module.exports = { sendFormSubmissionNotification, sendViaEmailJS, sendViaSMTP };
