import React from 'react';

export default function StatCard({ icon, label, value, sub, color = 'primary' }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-primary-50`}>{icon}</div>
      <div>
        <div className="text-3xl font-bold font-display text-primary">{value}</div>
        <div className="text-sm font-semibold text-secondary">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
