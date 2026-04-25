const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    let conditions = ['1=1'];
    let params = [];
    let idx = 1;

    if (role) { conditions.push(`u.role = $${idx++}`); params.push(role); }
    if (search) {
      conditions.push(`(u.name ILIKE $${idx} OR u.email ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }

    const where = conditions.join(' AND ');
    const countResult = await query(`SELECT COUNT(*) FROM users u WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.is_active, u.created_at
       FROM users u WHERE ${where}
       ORDER BY u.created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      params
    );

    res.json({ success: true, data: result.rows, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

const getUserById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.is_active, u.created_at,
              s.id as student_id, s.notes as student_notes,
              t.id as teacher_id, t.specialization, t.bio
       FROM users u
       LEFT JOIN students s ON s.user_id = u.id
       LEFT JOIN teachers t ON t.user_id = u.id
       WHERE u.id = $1`, [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) return res.status(409).json({ success: false, message: 'Email already exists.' });

    const hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, is_active, created_at)
       VALUES ($1,$2,$3,$4,$5,true,NOW()) RETURNING id,name,email,role,phone,is_active,created_at`,
      [name.trim(), email.toLowerCase().trim(), hash, role, phone || null]
    );
    const user = result.rows[0];
    if (role === 'student') await query('INSERT INTO students (user_id,created_at) VALUES ($1,NOW())', [user.id]);
    if (role === 'teacher') await query('INSERT INTO teachers (user_id,created_at) VALUES ($1,NOW())', [user.id]);

    res.status(201).json({ success: true, message: 'User created.', data: user });
  } catch (error) { next(error); }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, phone, is_active } = req.body;
    const result = await query(
      `UPDATE users SET name=COALESCE($1,name), phone=COALESCE($2,phone),
       is_active=COALESCE($3,is_active), updated_at=NOW()
       WHERE id=$4 RETURNING id,name,email,role,phone,is_active`,
      [name, phone, is_active, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }
    await query('UPDATE users SET is_active=false, updated_at=NOW() WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'User deactivated.' });
  } catch (error) { next(error); }
};

const getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    let params = [];
    let searchClause = '';
    if (search) { searchClause = `AND (u.name ILIKE $1 OR u.email ILIKE $1)`; params.push(`%${search}%`); }

    const countResult = await query(`SELECT COUNT(*) FROM students s JOIN users u ON u.id=s.user_id WHERE u.is_active=true ${searchClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const li = params.length - 1, oi = params.length;
    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.created_at, s.id as student_id, s.notes,
              p.status as payment_status,
              (SELECT COUNT(*) FROM session_enrollments se WHERE se.student_id=s.id) as total_sessions
       FROM students s
       JOIN users u ON u.id=s.user_id
       LEFT JOIN payments p ON p.student_id=s.id AND p.is_latest=true
       WHERE u.is_active=true ${searchClause}
       ORDER BY u.created_at DESC LIMIT $${li} OFFSET $${oi}`,
      params
    );
    res.json({ success: true, data: result.rows, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

const getTeachers = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.created_at, u.is_active,
              t.id as teacher_id, t.specialization, t.bio,
              (SELECT COUNT(*) FROM sessions sess WHERE sess.teacher_id=t.id) as total_sessions
       FROM teachers t
       JOIN users u ON u.id=t.user_id
       ORDER BY u.name ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, getStudents, getTeachers };
