import React, { useState } from 'react';
import { MOCK_EMPLOYEES, MOCK_COMPENSATION_CHANGES } from '../constants';
import { Employee, CompensationChange } from '../types';
import { DollarSign, TrendingUp, History, Plus, ChevronDown, Check, X } from 'lucide-react';

const SalaryManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [changes, setChanges] = useState<CompensationChange[]>(MOCK_COMPENSATION_CHANGES);
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'Increment' | 'Bonus'>('Increment');
  
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const selectedEmployee = employees.find(e => e.id === selectedEmpId);
  const employeeHistory = changes.filter(c => c.employeeId === selectedEmpId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleProcess = () => {
    if (!selectedEmployee) return;

    const val = Number(amount);
    if (!val) return;

    const newChange: CompensationChange = {
      id: `cc${Date.now()}`,
      employeeId: selectedEmployee.id,
      date: new Date().toISOString().split('T')[0],
      type: actionType,
      amount: actionType === 'Bonus' ? val : 0,
      previousSalary: selectedEmployee.salary,
      newSalary: actionType === 'Increment' ? selectedEmployee.salary + val : undefined, // Assuming amount is increment value
      reason: reason || 'Manual adjustment',
      approvedBy: 'Current Admin'
    };

    if (actionType === 'Increment') {
      const updatedEmps = employees.map(e => e.id === selectedEmployee.id ? { ...e, salary: e.salary + val } : e);
      setEmployees(updatedEmps);
    }

    setChanges([newChange, ...changes]);
    setIsModalOpen(false);
    setAmount('');
    setReason('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Employee List */}
      <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
         <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-slate-800">Employees</h2>
            <p className="text-xs text-slate-500">Select an employee to manage compensation</p>
         </div>
         <div className="flex-1 overflow-y-auto">
            {employees.map(emp => (
               <div 
                 key={emp.id} 
                 onClick={() => setSelectedEmpId(emp.id)}
                 className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${selectedEmpId === emp.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
               >
                  <div className="flex justify-between items-start">
                     <div>
                        <h3 className="font-medium text-slate-900">{emp.name}</h3>
                        <p className="text-xs text-slate-500">{emp.role}</p>
                     </div>
                     <span className="text-sm font-mono text-slate-600 font-semibold">
                        {emp.currency} {emp.salary.toLocaleString()}
                     </span>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Details Panel */}
      <div className="lg:col-span-2 space-y-6">
         {!selectedEmployee ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col items-center justify-center text-slate-400">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <DollarSign size={32} />
               </div>
               <p>Select an employee to view details</p>
            </div>
         ) : (
            <>
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-900">{selectedEmployee.name}</h2>
                        <p className="text-slate-500">{selectedEmployee.role} • {selectedEmployee.department}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-sm text-slate-500">Current Annual Base</p>
                        <p className="text-3xl font-bold text-indigo-600 font-mono">
                           {selectedEmployee.currency} {selectedEmployee.salary.toLocaleString()}
                        </p>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <button 
                       onClick={() => { setActionType('Increment'); setIsModalOpen(true); }}
                       className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm transition-all"
                     >
                        <TrendingUp size={16} /> Process Increment
                     </button>
                     <button 
                        onClick={() => { setActionType('Bonus'); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium shadow-sm transition-all"
                     >
                        <DollarSign size={16} /> Grant Bonus
                     </button>
                  </div>
               </div>

               <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                     <History size={16} className="text-slate-500" />
                     <h3 className="font-bold text-slate-800">Compensation History</h3>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-white border-b border-slate-100">
                           <tr>
                              <th className="px-6 py-3 font-semibold">Date</th>
                              <th className="px-6 py-3 font-semibold">Type</th>
                              <th className="px-6 py-3 font-semibold">Details</th>
                              <th className="px-6 py-3 font-semibold">Amount</th>
                              <th className="px-6 py-3 font-semibold">Approver</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {employeeHistory.length === 0 ? (
                              <tr>
                                 <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No history available</td>
                              </tr>
                           ) : (
                              employeeHistory.map(record => (
                                 <tr key={record.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">{record.date}</td>
                                    <td className="px-6 py-4">
                                       <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                          record.type === 'Increment' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                                       }`}>
                                          {record.type}
                                       </span>
                                    </td>
                                    <td className="px-6 py-4">
                                       <div className="flex flex-col">
                                          <span>{record.reason}</span>
                                          {record.type === 'Increment' && (
                                             <span className="text-xs text-slate-400">
                                                {record.previousSalary?.toLocaleString()} → {record.newSalary?.toLocaleString()}
                                             </span>
                                          )}
                                       </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium text-slate-800">
                                       {record.type === 'Bonus' ? `+${record.amount.toLocaleString()}` : `+${((record.newSalary || 0) - (record.previousSalary || 0)).toLocaleString()}`}
                                    </td>
                                    <td className="px-6 py-4 text-xs">{record.approvedBy}</td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </>
         )}
      </div>

      {/* Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">{actionType === 'Increment' ? 'Process Salary Increment' : 'Grant Performance Bonus'}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
               </div>
               <div className="p-6 space-y-4">
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-sm text-indigo-800 mb-2">
                     Current Base Salary: <strong>{selectedEmployee?.currency} {selectedEmployee?.salary.toLocaleString()}</strong>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">
                        {actionType === 'Increment' ? 'Increment Amount (Annual)' : 'Bonus Amount'}
                     </label>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                        <input 
                           type="number" 
                           value={amount}
                           onChange={(e) => setAmount(e.target.value)}
                           className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                           placeholder="0.00"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                     <textarea 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                        placeholder="e.g. Annual Performance Review"
                     />
                  </div>
               </div>
               <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium">Cancel</button>
                  <button 
                     onClick={handleProcess}
                     disabled={!amount}
                     className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                  >
                     Confirm
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default SalaryManagement;
