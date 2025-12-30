import React, { useState } from 'react';
import { MOCK_EMPLOYEES, MOCK_PAYROLL, MOCK_LEAVES } from '../constants';
import { Employee, PayrollRecord, LeaveRecord } from '../types';
import { Filter, Download, Search, FileBarChart, DollarSign, Calendar } from 'lucide-react';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'payroll' | 'leaves'>('employees');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Derive unique Departments for dropdown
  const departments = ['All', ...Array.from(new Set(MOCK_EMPLOYEES.map(e => e.department)))];

  // Helper to filter data based on common properties
  const filterData = (data: any[], type: 'employees' | 'payroll' | 'leaves') => {
    return data.filter(item => {
      const searchMatch = 
        (item.name || item.employeeName).toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const deptMatch = deptFilter === 'All' || item.department === deptFilter;
      
      let statusMatch = true;
      if (statusFilter !== 'All') {
        statusMatch = item.status === statusFilter;
      }

      return searchMatch && deptMatch && statusMatch;
    });
  };

  const handleExport = () => {
    let dataToExport: any[] = [];
    if (activeTab === 'employees') dataToExport = filterData(MOCK_EMPLOYEES, 'employees');
    else if (activeTab === 'payroll') dataToExport = filterData(MOCK_PAYROLL, 'payroll');
    else dataToExport = filterData(MOCK_LEAVES, 'leaves');

    if (dataToExport.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(obj => Object.values(obj).map(val => typeof val === 'string' ? `"${val}"` : val).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFilterBar = (statusOptions: string[]) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
       <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
       </div>
       
       <select 
         value={deptFilter}
         onChange={(e) => setDeptFilter(e.target.value)}
         className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
       >
          {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
       </select>

       <select 
         value={statusFilter}
         onChange={(e) => setStatusFilter(e.target.value)}
         className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
       >
          <option value="All">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
       </select>

       <button onClick={handleExport} className="flex items-center gap-2 text-indigo-600 font-medium text-sm ml-auto hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
          <Download size={16} /> Export CSV
       </button>
    </div>
  );

  return (
    <div className="space-y-6">
       <div>
         <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
         <p className="text-slate-500">Deep dive into workforce metrics, payroll history, and leave trends.</p>
       </div>

       {/* Tab Nav */}
       <div className="flex gap-4 border-b border-slate-200">
         {[
           { id: 'employees', label: 'Workforce', icon: <FileBarChart size={18} /> },
           { id: 'payroll', label: 'Payroll', icon: <DollarSign size={18} /> },
           { id: 'leaves', label: 'Leaves', icon: <Calendar size={18} /> }
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => {
                setActiveTab(tab.id as any);
                setStatusFilter('All'); 
             }}
             className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
               activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
             }`}
           >
             {tab.icon}
             {tab.label}
           </button>
         ))}
       </div>

       {/* Content */}
       <div>
          {activeTab === 'employees' && (
            <>
               {renderFilterBar(['Active', 'On Leave', 'Terminated'])}
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm text-slate-600">
                     <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                       <tr>
                         <th className="px-6 py-4">Employee</th>
                         <th className="px-6 py-4">Role</th>
                         <th className="px-6 py-4">Department</th>
                         <th className="px-6 py-4">Location</th>
                         <th className="px-6 py-4">Salary</th>
                         <th className="px-6 py-4">Joined</th>
                         <th className="px-6 py-4">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {filterData(MOCK_EMPLOYEES, 'employees').map((emp: Employee) => (
                          <tr key={emp.id} className="hover:bg-slate-50">
                             <td className="px-6 py-4 font-medium text-slate-900">{emp.name}</td>
                             <td className="px-6 py-4">{emp.role}</td>
                             <td className="px-6 py-4">{emp.department}</td>
                             <td className="px-6 py-4">{emp.location}</td>
                             <td className="px-6 py-4 font-mono">{emp.currency} {emp.salary.toLocaleString()}</td>
                             <td className="px-6 py-4">{emp.joinDate}</td>
                             <td className="px-6 py-4">
                               <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                 emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                 emp.status === 'On Leave' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                               }`}>
                                 {emp.status}
                               </span>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            </>
          )}

          {activeTab === 'payroll' && (
            <>
              {renderFilterBar(['Processed', 'Pending', 'Hold'])}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm text-slate-600">
                     <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                       <tr>
                         <th className="px-6 py-4">Period</th>
                         <th className="px-6 py-4">Employee</th>
                         <th className="px-6 py-4">Department</th>
                         <th className="px-6 py-4 text-right">Base</th>
                         <th className="px-6 py-4 text-right">Bonus</th>
                         <th className="px-6 py-4 text-right">Net Pay</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4">Paid Date</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {filterData(MOCK_PAYROLL, 'payroll').map((rec: PayrollRecord) => (
                          <tr key={rec.id} className="hover:bg-slate-50">
                             <td className="px-6 py-4 font-medium">{rec.period}</td>
                             <td className="px-6 py-4 font-medium text-slate-900">{rec.employeeName}</td>
                             <td className="px-6 py-4">{rec.department}</td>
                             <td className="px-6 py-4 text-right font-mono text-slate-500">{rec.baseSalary.toLocaleString()}</td>
                             <td className="px-6 py-4 text-right font-mono text-emerald-600">{rec.bonus > 0 ? `+${rec.bonus}` : '-'}</td>
                             <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">{rec.netPay.toLocaleString()}</td>
                             <td className="px-6 py-4">
                               <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                 rec.status === 'Processed' ? 'bg-emerald-100 text-emerald-700' :
                                 rec.status === 'Pending' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                               }`}>
                                 {rec.status}
                               </span>
                             </td>
                             <td className="px-6 py-4 text-xs text-slate-500">{rec.paymentDate || '-'}</td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            </>
          )}

          {activeTab === 'leaves' && (
            <>
              {renderFilterBar(['Approved', 'Pending', 'Rejected'])}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm text-slate-600">
                     <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                       <tr>
                         <th className="px-6 py-4">Employee</th>
                         <th className="px-6 py-4">Department</th>
                         <th className="px-6 py-4">Leave Type</th>
                         <th className="px-6 py-4">Duration</th>
                         <th className="px-6 py-4">Days</th>
                         <th className="px-6 py-4">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {filterData(MOCK_LEAVES, 'leaves').map((leave: LeaveRecord) => (
                          <tr key={leave.id} className="hover:bg-slate-50">
                             <td className="px-6 py-4 font-medium text-slate-900">{leave.employeeName}</td>
                             <td className="px-6 py-4">{leave.department}</td>
                             <td className="px-6 py-4">
                                <span className="bg-slate-100 px-2 py-1 rounded text-xs">{leave.leaveType}</span>
                             </td>
                             <td className="px-6 py-4 text-xs text-slate-500">
                               {leave.startDate} <span className="mx-1">→</span> {leave.endDate}
                             </td>
                             <td className="px-6 py-4 font-bold">{leave.days}</td>
                             <td className="px-6 py-4">
                               <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                 leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                 leave.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                               }`}>
                                 {leave.status}
                               </span>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            </>
          )}
       </div>
    </div>
  );
};

export default Reports;