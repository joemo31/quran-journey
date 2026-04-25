const { query } = require('../config/database');

const getAll = async (req, res, next) => {
  try {
    const { is_published } = req.query;
    let where = '1=1';
    const params = [];
    if (is_published !== undefined) { where += ' AND is_published=$1'; params.push(is_published === 'true'); }
    const result = await query(`SELECT * FROM testimonials WHERE ${where} ORDER BY sort_order ASC, created_at DESC`, params);
    res.json({ success: true, data: result.rows });
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { student_name, student_country, student_avatar_url, content, video_url, media_type = 'text', rating = 5, is_published = true, sort_order = 0 } = req.body;
    const result = await query(
      `INSERT INTO testimonials (student_name,student_country,student_avatar_url,content,video_url,media_type,rating,is_published,sort_order,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *`,
      [student_name, student_country, student_avatar_url, content, video_url, media_type, rating, is_published, sort_order]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const { student_name, student_country, student_avatar_url, content, video_url, media_type, rating, is_published, sort_order } = req.body;
    const result = await query(
      `UPDATE testimonials SET student_name=COALESCE($1,student_name), student_country=COALESCE($2,student_country),
       student_avatar_url=COALESCE($3,student_avatar_url), content=COALESCE($4,content), video_url=COALESCE($5,video_url),
       media_type=COALESCE($6,media_type), rating=COALESCE($7,rating), is_published=COALESCE($8,is_published),
       sort_order=COALESCE($9,sort_order), updated_at=NOW() WHERE id=$10 RETURNING *`,
      [student_name, student_country, student_avatar_url, content, video_url, media_type, rating, is_published, sort_order, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    await query('DELETE FROM testimonials WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'Deleted.' });
  } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
