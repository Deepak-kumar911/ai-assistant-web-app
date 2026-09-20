import React from 'react';

export const Table = ({ children, className = '', ...props }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-[#0F172A]/80 backdrop-blur-sm custom-scrollbar">
    <table className={`w-full text-left text-sm text-[#F8FAFC] border-collapse ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '', ...props }) => (
  <thead className={`bg-[#131D31] text-xs font-semibold uppercase tracking-wider text-[#94A3B8] border-b border-white/10 ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={`divide-y divide-white/5 ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', hover = true, ...props }) => (
  <tr 
    className={`transition-colors duration-150 ${hover ? 'hover:bg-white/[0.03]' : ''} ${className}`} 
    {...props}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '', ...props }) => (
  <th className={`px-4 py-3 text-xs font-medium tracking-wider text-[#94A3B8] ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '', ...props }) => (
  <td className={`px-4 py-3.5 text-sm text-[#F8FAFC] align-middle ${className}`} {...props}>
    {children}
  </td>
);

export const TableEmpty = ({ message = 'No records found', colSpan = 5 }) => (
  <tr>
    <td colSpan={colSpan} className="text-center py-12 text-sm text-[#64748B]">
      {message}
    </td>
  </tr>
);

export default Table;
