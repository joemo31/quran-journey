const { query } = require('../config/database');

// Get all content for a specific page + global fields
const getByPage = async (req, res, next) => {
  try {
    const { page } = req.params;
    const result = await query(
      `SELECT * FROM site_content WHERE page = $1 OR page = 'global' ORDER BY page, section, key`,
      [page]
    );
    res.json({ success: true, data: result.rows });
  } catch (e) { next(e); }
};

// Get ALL content (for admin editor)
const getAll = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM site_content ORDER BY page, section, key');
    res.json({ success: true, data: result.rows });
  } catch (e) { next(e); }
};

// Upsert single field
const upsert = async (req, res, next) => {
  try {
    const { page, section, key, value, type = 'text', label } = req.body;
    const result = await query(
      `INSERT INTO site_content (page, section, key, value, type, label, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())
       ON CONFLICT (page, section, key) DO UPDATE
       SET value=$4, type=$5, label=COALESCE($6, site_content.label), updated_at=NOW()
       RETURNING *`,
      [page, section, key, value, type, label]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (e) { next(e); }
};

// Bulk update multiple fields at once
const bulkUpdate = async (req, res, next) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No updates provided.' });
    }
    const results = [];
    for (const u of updates) {
      const r = await query(
        `INSERT INTO site_content (page, section, key, value, type, label, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,NOW())
         ON CONFLICT (page, section, key) DO UPDATE
         SET value=$4, updated_at=NOW()
         RETURNING *`,
        [u.page, u.section, u.key, u.value ?? '', u.type || 'text', u.label || null]
      );
      results.push(r.rows[0]);
    }
    res.json({ success: true, data: results, count: results.length });
  } catch (e) { next(e); }
};

module.exports = { getByPage, getAll, upsert, bulkUpdate };
