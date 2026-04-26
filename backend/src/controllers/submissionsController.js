const { query } = require('../config/database');
const { sendFormSubmissionNotification } = require('../config/email');
const { sendEnrollmentNotification } = require('../config/notifications');

const create = async (req, res, next) => {
  try {
    const { name, email, phone, country, message, course_interest } = req.body;

    const result = await query(
      `INSERT INTO form_submissions (name, email, phone, country, message, course_interest, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        phone || null,
        country || null,
        message || null,
        course_interest || null,
      ]
    );

    const submission = { name, email, phone, country, message, course_interest };

    // Send instant notification (Telegram or WhatsApp) — non-blocking
    sendEnrollmentNotification(submission).catch(err =>
      console.error('[Notification] Error:', err.message)
    );

    // Send email — non-blocking
    sendFormSubmissionNotification(submission).catch(err =>
      console.error('[Email] Error:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Enrollment request received! We will contact you soon.',
      data: result.rows[0],
    });
  } catch (error) { next(error); }
};

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, country, course_interest } = req.query;
    const offset = (page - 1) * limit;
    let where = '1=1';
    const params = [];
    let idx = 1;
    if (country) { where += ` AND country=$${idx++}`; params.push(country); }
    if (course_interest) { where += ` AND course_interest=$${idx++}`; params.push(course_interest); }
    params.push(limit, offset);
    const li = params.length - 1, oi = params.length;
    const countRes = await query(`SELECT COUNT(*) FROM form_submissions WHERE ${where}`, params.slice(0, -2));
    const result = await query(
      `SELECT * FROM form_submissions WHERE ${where} ORDER BY created_at DESC LIMIT $${li} OFFSET $${oi}`,
      params
    );
    res.json({ success: true, data: result.rows, pagination: { total: parseInt(countRes.rows[0].count), page: +page, limit: +limit } });
  } catch (error) { next(error); }
};

const deleteSubmission = async (req, res, next) => {
  try {
    await query('DELETE FROM form_submissions WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'Submission deleted.' });
  } catch (error) { next(error); }
};

module.exports = { create, getAll, deleteSubmission };
