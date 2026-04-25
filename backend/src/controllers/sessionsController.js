const { query } = require('../config/database');

const getSessions = async (req, res, next) => {
  try {
    const { student_id, teacher_id, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = ['1=1'];
    let params = [];
    let idx = 1;

    // Role-based filtering
    if (req.user.role === 'student') {
      const st = await query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
      if (!st.rows.length) return res.json({ success: true, data: [] });
      conditions.push(`se.student_id=$${idx++}`);
      params.push(st.rows[0].id);
    } else if (req.user.role === 'teacher') {
      const te = await query('SELECT id FROM teachers WHERE user_id=$1', [req.user.id]);
      if (!te.rows.length) return res.json({ success: true, data: [] });
      conditions.push(`sess.teacher_id=$${idx++}`);
      params.push(te.rows[0].id);
    } else {
      if (student_id) { conditions.push(`se.student_id=$${idx++}`); params.push(student_id); }
      if (teacher_id) { conditions.push(`sess.teacher_id=$${idx++}`); params.push(teacher_id); }
    }
    if (status) { conditions.push(`sess.status=$${idx++}`); params.push(status); }

    const where = conditions.join(' AND ');
    params.push(limit, offset);

    const result = await query(
      `SELECT sess.id, sess.scheduled_at, sess.status, sess.meeting_link, sess.notes, sess.created_at,
              tu.name as teacher_name, tu.email as teacher_email,
              su.name as student_name, su.email as student_email,
              c.name as course_name
       FROM sessions sess
       JOIN session_enrollments se ON se.session_id=sess.id
       JOIN teachers t ON t.id=sess.teacher_id
       JOIN users tu ON tu.id=t.user_id
       JOIN students st ON st.id=se.student_id
       JOIN users su ON su.id=st.user_id
       LEFT JOIN courses c ON c.id=sess.course_id
       WHERE ${where}
       ORDER BY sess.scheduled_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      params
    );
    res.json({ success: true, data: result.rows });
  } catch (error) { next(error); }
};

const createSession = async (req, res, next) => {
  try {
    const { student_id, teacher_id, course_id, scheduled_at, meeting_link, notes } = req.body;
    const client = await require('../config/database').getClient();
    try {
      await client.query('BEGIN');
      const sess = await client.query(
        `INSERT INTO sessions (teacher_id,course_id,scheduled_at,meeting_link,notes,status,created_at)
         VALUES ($1,$2,$3,$4,$5,'upcoming',NOW()) RETURNING *`,
        [teacher_id, course_id, scheduled_at, meeting_link, notes]
      );
      await client.query(
        `INSERT INTO session_enrollments (session_id,student_id,created_at) VALUES ($1,$2,NOW())`,
        [sess.rows[0].id, student_id]
      );
      await client.query('COMMIT');
      res.status(201).json({ success: true, data: sess.rows[0] });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally { client.release(); }
  } catch (error) { next(error); }
};

const updateSession = async (req, res, next) => {
  try {
    const { scheduled_at, status, meeting_link, notes } = req.body;
    const result = await query(
      `UPDATE sessions SET scheduled_at=COALESCE($1,scheduled_at), status=COALESCE($2,status),
       meeting_link=COALESCE($3,meeting_link), notes=COALESCE($4,notes), updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [scheduled_at, status, meeting_link, notes, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Session not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) { next(error); }
};

const deleteSession = async (req, res, next) => {
  try {
    await query('DELETE FROM session_enrollments WHERE session_id=$1', [req.params.id]);
    await query('DELETE FROM sessions WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'Session deleted.' });
  } catch (error) { next(error); }
};

module.exports = { getSessions, createSession, updateSession, deleteSession };
