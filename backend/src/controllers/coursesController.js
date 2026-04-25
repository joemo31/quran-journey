const { query } = require('../config/database');

const getAllCourses = async (req, res, next) => {
  try {
    const { is_active } = req.query;
    let where = '1=1';
    let params = [];
    if (is_active !== undefined) { where += ` AND is_active=$1`; params.push(is_active === 'true'); }

    const result = await query(
      `SELECT id, name, description, price, currency, duration_weeks, level,
              image_url, is_active, sort_order, created_at, updated_at
       FROM courses WHERE ${where} ORDER BY sort_order ASC, created_at DESC`,
      params
    );
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
};

const getCourseById = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM courses WHERE id=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const createCourse = async (req, res, next) => {
  try {
    const { name, description, price, currency = 'USD', duration_weeks, level, image_url, is_active = true, sort_order = 0 } = req.body;
    const result = await query(
      `INSERT INTO courses (name,description,price,currency,duration_weeks,level,image_url,is_active,sort_order,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING *`,
      [name, description, price, currency, duration_weeks, level, image_url, is_active, sort_order]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const updateCourse = async (req, res, next) => {
  try {
    const { name, description, price, currency, duration_weeks, level, image_url, is_active, sort_order } = req.body;
    const result = await query(
      `UPDATE courses SET name=COALESCE($1,name), description=COALESCE($2,description),
       price=COALESCE($3,price), currency=COALESCE($4,currency),
       duration_weeks=COALESCE($5,duration_weeks), level=COALESCE($6,level),
       image_url=COALESCE($7,image_url), is_active=COALESCE($8,is_active),
       sort_order=COALESCE($9,sort_order), updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [name, description, price, currency, duration_weeks, level, image_url, is_active, sort_order, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const deleteCourse = async (req, res, next) => {
  try {
    await query('UPDATE courses SET is_active=false, updated_at=NOW() WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'Course deactivated.' });
  } catch (error) { next(error); }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
