import React from 'react';

export default function DataTable({ columns, data, loading, emptyMessage = 'No data found.' }) {
  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  if (!data?.length) return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-5xl mb-3">📭</div>
      <p className="font-medium">{emptyMessage}</p>
    </div>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columns.map(col => (
              <th key={col.key} className="text-left text-xs font-bold text-secondary uppercase tracking-wider px-4 py-3">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, i) => (
            <tr key={row.id || i} className="hover:bg-gray-50/70 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3.5 text-sm text-secondary">
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
