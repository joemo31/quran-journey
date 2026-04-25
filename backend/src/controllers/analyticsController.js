const { query } = require('../config/database');

const getDashboardStats = async (req, res, next) => {
  try {
    const [students, teachers, sessions, leads, payments, courses] = await Promise.all([
      query('SELECT COUNT(*) FROM students s JOIN users u ON u.id=s.user_id WHERE u.is_active=true'),
      query('SELECT COUNT(*) FROM teachers t JOIN users u ON u.id=t.user_id WHERE u.is_active=true'),
      query(`SELECT COUNT(*) FILTER (WHERE status='upcoming') as upcoming,
             COUNT(*) FILTER (WHERE status='completed') as completed FROM sessions`),
      query('SELECT COUNT(*) FROM form_submissions'),
      query(`SELECT SUM(amount) FILTER (WHERE status='paid') as total_paid,
             COUNT(*) FILTER (WHERE status='pending') as pending_count FROM payments`),
      query('SELECT COUNT(*) FROM courses WHERE is_active=true'),
    ]);

    const recentLeads = await query('SELECT name,email,country,created_at FROM form_submissions ORDER BY created_at DESC LIMIT 5');
    const recentStudents = await query('SELECT u.name,u.email,u.created_at FROM users u WHERE u.role=\'student\' ORDER BY u.created_at DESC LIMIT 5');

    res.json({
      success: true,
      data: {
        totals: {
          students: parseInt(students.rows[0].count),
          teachers: parseInt(teachers.rows[0].count),
          courses: parseInt(courses.rows[0].count),
          leads: parseInt(leads.rows[0].count),
          upcoming_sessions: parseInt(sessions.rows[0].upcoming),
          completed_sessions: parseInt(sessions.rows[0].completed),
          revenue: parseFloat(payments.rows[0].total_paid) || 0,
          pending_payments: parseInt(payments.rows[0].pending_count),
        },
        recent_leads: recentLeads.rows,
        recent_students: recentStudents.rows,
      }
    });
  } catch (error) { next(error); }
};

module.exports = { getDashboardStats };
