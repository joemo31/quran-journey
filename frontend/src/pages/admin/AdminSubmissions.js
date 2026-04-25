import React, { useState, useEffect } from 'react';
import { submissionsAPI } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { useApi } from '../../hooks/useApi';
import { format } from 'date-fns';

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const { execute } = useApi();

  const fetch = async () => {
    setLoading(true);
    try {
      const r = await submissionsAPI.getAll({ page, limit: 20 });
      setSubmissions(r.data.data || []);
      setPagination(r.data.pagination || {});
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this submission?')) return;
    await execute(() => submissionsAPI.delete(id), { successMsg: 'Deleted.', onSuccess: fetch });
  };

  const columns = [
    {
      key: 'name', label: 'Name',
      render: (v, row) => (
        <div>
          <div className="font-semibold text-sm">{v}</div>
          <a href={`mailto:${row.email}`} className="text-xs text-primary hover:underline">{row.email}</a>
        </div>
      )
    },
    { key: 'phone', label: 'Phone', render: v => v || '—' },
    { key: 'country', label: 'Country', render: v => <span className="badge badge-info">{v}</span> },
    {
      key: 'course_interest', label: 'Course Interest',
      render: v => v ? <span className="badge bg-primary-50 text-primary text-xs">{v}</span> : <span className="text-gray-400 text-xs">Not specified</span>
    },
    {
      key: 'message', label: 'Message',
      render: (v, row) => v
        ? <button onClick={() => setExpanded(expanded === row.id ? null : row.id)} className="text-xs text-primary hover:underline font-medium">
            {expanded === row.id ? '▲ Hide' : '▼ View'}
          </button>
        : <span className="text-gray-300 text-xs">—</span>
    },
    { key: 'created_at', label: 'Date', render: v => format(new Date(v), 'MMM d, yyyy h:mm a') },
    {
      key: 'actions', label: '',
      render: (_, row) => (
        <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:underline text-sm font-medium">Delete</button>
      )
    },
  ];

  // Stats
  const byCourse = submissions.reduce((acc, s) => {
    if (s.course_interest) acc[s.course_interest] = (acc[s.course_interest] || 0) + 1;
    return acc;
  }, {});

  const byCountry = submissions.reduce((acc, s) => {
    acc[s.country] = (acc[s.country] || 0) + 1;
    return acc;
  }, {});

  const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topCourses = Object.entries(byCourse).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Form Submissions</h1>
        <p className="text-secondary/60 text-sm mt-0.5">{pagination.total || 0} total leads</p>
      </div>

      {/* Quick stats */}
      {submissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topCountries.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-primary mb-3 text-sm">Top Countries</h3>
              <div className="space-y-2">
                {topCountries.map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-sm text-secondary">{country}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-primary-100 rounded-full overflow-hidden w-24">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(count / submissions.length) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-primary w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {topCourses.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-primary mb-3 text-sm">Course Interest</h3>
              <div className="space-y-2">
                {topCourses.map(([course, count]) => (
                  <div key={course} className="flex items-center justify-between">
                    <span className="text-sm text-secondary truncate max-w-[160px]">{course}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-primary-100 rounded-full overflow-hidden w-24">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(count / submissions.length) * 100}%` }} />
                      </div>
                      <span className="text-xs font-bold text-primary w-4 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        {/* Expandable message rows */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {columns.map(col => (
                  <th key={col.key} className="text-left text-xs font-bold text-secondary uppercase tracking-wider px-4 py-3">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={columns.length} className="py-16 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
              ) : submissions.length === 0 ? (
                <tr><td colSpan={columns.length} className="py-16 text-center text-gray-400"><div className="text-5xl mb-3">📭</div><p>No submissions yet.</p></td></tr>
              ) : submissions.map(row => (
                <React.Fragment key={row.id}>
                  <tr className="hover:bg-gray-50/70 transition-colors">
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3.5 text-sm text-secondary">
                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                  {expanded === row.id && row.message && (
                    <tr className="bg-primary-50">
                      <td colSpan={columns.length} className="px-4 py-3">
                        <p className="text-sm text-secondary italic">"{row.message}"</p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${p === page ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
