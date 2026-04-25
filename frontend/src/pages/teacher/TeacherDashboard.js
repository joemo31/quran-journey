import React, { useState, useEffect } from 'react';
import { sessionsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([sessionsAPI.getAll(), usersAPI.getStudents()])
      .then(([s, st]) => { setSessions(s.data.data || []); setStudents(st.data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = sessions.filter(s => s.status === 'upcoming');
  const completed = sessions.filter(s => s.status === 'completed');

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Banner */}
      <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="text-white/60 text-sm mb-1">Teacher Portal 👨‍🏫</div>
          <h1 className="font-display text-3xl font-bold mb-2">{user?.name}</h1>
          <p className="text-white/70">Manage your sessions and students from here.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '📅', label: 'Upcoming Sessions', value: upcoming.length },
          { icon: '✅', label: 'Completed Sessions', value: completed.length },
          { icon: '🎓', label: 'Total Students', value: students.length },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className="text-4xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold font-display text-primary">{s.value}</div>
            <div className="text-sm text-secondary font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming sessions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-primary">Upcoming Sessions</h2>
          {upcoming.length > 0 && <span className="badge badge-info">{upcoming.length} scheduled</span>}
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-5xl mb-3">📅</div>
            <p>No upcoming sessions. Admin will assign sessions to you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map(s => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-primary-50 rounded-xl gap-3">
                <div>
                  <div className="font-semibold text-primary">{s.student_name}</div>
                  <div className="text-sm text-secondary mt-0.5">
                    📅 {format(new Date(s.scheduled_at), 'EEEE, MMMM d yyyy')} at {format(new Date(s.scheduled_at), 'h:mm a')}
                  </div>
                  <div className="text-xs text-gray-400">{s.course_name || 'General Session'}</div>
                </div>
                {s.meeting_link ? (
                  <a href={s.meeting_link} target="_blank" rel="noreferrer" className="btn-primary text-sm py-2 px-5 whitespace-nowrap self-start sm:self-center">
                    🎥 Start Session
                  </a>
                ) : (
                  <span className="text-xs text-gray-400 italic">No link yet</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="card">
          <h2 className="font-display text-xl font-bold text-primary mb-4">Past Sessions</h2>
          <div className="space-y-3">
            {completed.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-semibold text-secondary text-sm">{s.student_name}</div>
                  <div className="text-xs text-gray-400">{format(new Date(s.scheduled_at), 'MMM d, yyyy')} · {s.course_name || 'General'}</div>
                </div>
                <span className="badge badge-success">Completed ✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My profile */}
      <div className="card">
        <h2 className="font-display text-xl font-bold text-primary mb-4">My Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', value: user?.name },
            { label: 'Email Address', value: user?.email },
            { label: 'Role', value: 'Teacher' },
          ].map(item => (
            <div key={item.label} className="p-4 bg-gray-50 rounded-xl">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{item.label}</div>
              <div className="font-semibold text-secondary">{item.value || '—'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
