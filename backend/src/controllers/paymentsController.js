const { query } = require('../config/database');

const getPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = '1=1';
    let params = [];
    if (status) { where += ` AND p.status=$1`; params.push(status); }
    params.push(limit, offset);
    const li = params.length - 1, oi = params.length;

    const result = await query(
      `SELECT p.id, p.amount, p.currency, p.status, p.notes, p.created_at, p.updated_at,
              u.name as student_name, u.email as student_email, c.name as course_name
       FROM payments p
       JOIN students st ON st.id=p.student_id
       JOIN users u ON u.id=st.user_id
       LEFT JOIN courses c ON c.id=p.course_id
       WHERE ${where} ORDER BY p.created_at DESC LIMIT $${li} OFFSET $${oi}`,
      params
    );
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
};

const createPayment = async (req, res, next) => {
  try {
    const { student_id, course_id, amount, currency = 'USD', status = 'pending', notes } = req.body;
    await query('UPDATE payments SET is_latest=false WHERE student_id=$1 AND course_id=$2', [student_id, course_id]);
    const result = await query(
      `INSERT INTO payments (student_id,course_id,amount,currency,status,notes,is_latest,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,true,NOW()) RETURNING *`,
      [student_id, course_id, amount, currency, status, notes]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const updatePayment = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const result = await query(
      `UPDATE payments SET status=COALESCE($1,status), notes=COALESCE($2,notes), updated_at=NOW()
       WHERE id=$3 RETURNING *`,
      [status, notes, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Payment not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

module.exports = { getPayments, createPayment, updatePayment };
