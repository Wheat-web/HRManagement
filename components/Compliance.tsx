import React from 'react';
import { AuditLog, Role } from '../types';
import { ShieldAlert, CheckCircle, Search, Filter, AlertTriangle } from 'lucide-react';

interface ComplianceProps {
  logs: AuditLog[];
}

const Compliance: React.FC<ComplianceProps> = ({ logs }) => {
  const handleExport = () => {
    if (logs.length === 0) {
      alert("No logs to export");
      return;
    }
    const headers = Object.keys(logs[0]).join(',');
    const rows = logs.map(obj => Object.values(obj).map(val => typeof val === 'string' ? `"${val}"` : val).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Governance & Audit Log</h1>
          <p className="text-slate-500">Track all AI decisions and human interventions.</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50">
                <Filter size={16} /> Filter
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm hover:bg-slate-50">
                Export CSV
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Header Filter */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search logs by user, action, or risk level..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex gap-2 text-sm text-slate-500">
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Low Risk</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Med Risk</span>
             <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> High Risk</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User / Agent</th>
                <th className="px-6 py-4">Action Type</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${log.aiInvolved ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                        {log.aiInvolved ? 'AI' : log.user.charAt(0)}
                      </div>
                      <span className="text-slate-700">{log.user}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{log.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 font-medium ${
                      log.riskLevel === 'High' ? 'text-red-600' : 
                      log.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {log.riskLevel === 'High' ? <ShieldAlert size={16} /> : 
                       log.riskLevel === 'Medium' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                      {log.riskLevel}
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
           <span>Showing recent 50 logs</span>
           <div className="flex gap-1">
             <button className="px-2 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
             <button className="px-2 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50">Next</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Compliance;