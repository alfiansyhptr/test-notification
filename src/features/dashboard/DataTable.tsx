import React from 'react';

interface DataTableProps {
  columns: { key: string; label: string; render?: (item: any) => React.ReactNode }[];
  data: any[];
}

export const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50">
            {columns.map(col => (
              <th key={col.key} className="py-4 px-6 font-semibold text-sm text-slate-600">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-slate-500">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="py-4 px-6 text-sm text-slate-900">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
