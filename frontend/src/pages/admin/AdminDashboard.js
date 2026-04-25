import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard().then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-3xl font-bold text-primary">Dashboard Overview</h1>
        <p className="text-secondary/60 mt-1">Welcome back! Here's what's happening at the Academy.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🎓" label="Total Students" value={stats?.totals.students ?? 0} />
        <StatCard icon="👨‍🏫" label="Teachers" value={stats?.totals.teachers ?? 0} />
        <StatCard icon="📚" label="Active Courses" value={stats?.totals.courses ?? 0} />
        <StatCard icon="📩" label="Form Leads" value={stats?.totals.leads ?? 0} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📅" label="Upcoming Sessions" value={stats?.totals.upcoming_sessions ?? 0} />
        <StatCard icon="✅" label="Completed Sessions" value={stats?.totals.completed_sessions ?? 0} />
        <StatCard icon="💰" label="Revenue (Paid)" value={`$${(stats?.totals.revenue ?? 0).toFixed(0)}`} />
        <StatCard icon="⏳" label="Pending Payments" value={stats?.totals.pending_payments ?? 0} />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-display text-xl font-bold text-primary mb-4">Recent Form Leads</h2>
          {stats?.recent_leads?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_leads.map((lead, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="font-semibold text-secondary text-sm">{lead.name}</div>
                    <div className="text-xs text-gray-400">{lead.email} · {lead.country}</div>
                  </div>
                  <div className="text-xs text-gray-400">{format(new Date(lead.created_at), 'MMM d')}</div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No leads yet.</p>}
        </div>

        <div className="card">
          <h2 className="font-display text-xl font-bold text-primary mb-4">Recent Students</h2>
          {stats?.recent_students?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_students.map((s, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary font-bold text-sm">
                    {s.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-secondary text-sm truncate">{s.name}</div>
                    <div className="text-xs text-gray-400 truncate">{s.email}</div>
                  </div>
                  <div className="text-xs text-gray-400">{format(new Date(s.created_at), 'MMM d')}</div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No students yet.</p>}
        </div>
      </div>
    </div>
  );
}
