const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', phone, country } = req.body;
    if (role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be self-registered.' });
    }
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, country, is_active, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,true,NOW())
       RETURNING id,name,email,role,phone,country,created_at`,
      [name.trim(), email.toLowerCase().trim(), hashedPassword, role, phone||null, country||null]
    );
    const user = result.rows[0];
    if (role === 'student') {
      await query('INSERT INTO students (user_id,country,created_at) VALUES ($1,$2,NOW())', [user.id, country||null]);
    }
    if (role === 'teacher') {
      await query('INSERT INTO teachers (user_id,created_at) VALUES ($1,NOW())', [user.id]);
    }
    const token = generateToken(user.id);
    res.status(201).json({ success: true, message: 'Account created successfully.', data: { user, token } });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await query(
      'SELECT id,name,email,password_hash,role,phone,country,is_active FROM users WHERE email=$1',
      [email.toLowerCase().trim()]
    );
    if (!result.rows.length) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const user = result.rows[0];
    if (!user.is_active) return res.status(403).json({ success: false, message: 'Account disabled. Contact support.' });
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    const token = generateToken(user.id);
    const { password_hash, ...safe } = user;
    res.json({ success: true, message: 'Login successful.', data: { user: safe, token } });
  } catch (error) { next(error); }
};

const getMe = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id,u.name,u.email,u.role,u.phone,u.country,u.created_at,
              s.id as student_id, t.id as teacher_id
       FROM users u
       LEFT JOIN students s ON s.user_id=u.id
       LEFT JOIN teachers t ON t.user_id=u.id
       WHERE u.id=$1`, [req.user.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValid) return res.status(400).json({ success: false, message: 'Current password incorrect.' });
    const hash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash=$1,updated_at=NOW() WHERE id=$2', [hash, req.user.id]);
    res.json({ success: true, message: 'Password updated.' });
  } catch (error) { next(error); }
};

const adminResetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }
    const hash = await bcrypt.hash(newPassword, 12);
    const result = await query(
      'UPDATE users SET password_hash=$1,updated_at=NOW() WHERE id=$2 RETURNING id,name,email',
      [hash, req.params.userId]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: `Password reset for ${result.rows[0].name}.` });
  } catch (error) { next(error); }
};

module.exports = { register, login, getMe, updatePassword, adminResetPassword };
