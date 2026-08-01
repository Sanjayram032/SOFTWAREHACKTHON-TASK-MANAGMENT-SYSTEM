import React from 'react';

const Table = ({ 
  columns = [], 
  data = [], 
  emptyText = "No data found",
  renderRow,
  className = "" 
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
      <table className="w-full text-left border-collapse text-sm text-slate-700">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {columns.map((col, index) => (
              <th key={index} className={`px-4 py-3.5 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length > 0 ? (
            data.map((item, rowIndex) => (
              <tr 
                key={item.id || rowIndex} 
                className="hover:bg-blue-50/40 transition-colors duration-150 group"
              >
                {renderRow ? (
                  renderRow(item, rowIndex)
                ) : (
                  columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-3.5 whitespace-nowrap">
                      {col.accessor ? item[col.accessor] : null}
                    </td>
                  ))
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-3xl">📂</span>
                  <p className="font-medium text-slate-500">{emptyText}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
