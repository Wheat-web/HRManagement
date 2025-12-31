
import React, { useState } from 'react';
import { MOCK_EMPLOYEES, MOCK_COMPENSATION_CHANGES } from '../constants';
import { Employee, CompensationChange, PaymentFrequency } from '../types';
import { DollarSign, TrendingUp, History, Plus, ChevronDown, Check, X, Clock, Briefcase, Calculator, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const SalaryManagement: React.FC = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [changes, setChanges] = useState<CompensationChange[]>(MOCK_COMPENSATION_CHANGES);
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'Structure' | 'Payment'>('Structure');
  
  // View State
  const [viewAsMonthly, setViewAsMonthly] = useState(false);

  // Form State
  const [actionType, setActionType] = useState<'Structure Change' | 'Bonus' | 'Overtime'>('Structure Change');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  
  // Structure Specific
  const [newFrequency, setNewFrequency] = useState<PaymentFrequency>('Annual');
  
  // Overtime Specific
  const [otHours, setOtHours] = useState('');
  const [otMultiplier, setOtMultiplier] = useState('1.5');

  const selectedEmployee = employees.find(e => e.id === selectedEmpId);
  const employeeHistory = changes.filter(c => c.employeeId === selectedEmpId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getAnnualEquivalent = (salary: number, freq: PaymentFrequency) => {
    switch(freq) {
      case 'Hourly': return salary * 2080; // 40hrs * 52wks
      case 'Daily': return salary * 260;   // 5days * 52wks
      case 'Weekly': return salary * 52;
      case 'Monthly': return salary * 12;
      default: return salary;
    }
  };

  const getMonthlyEquivalent = (salary: number, freq: PaymentFrequency) => {
    return getAnnualEquivalent(salary, freq) / 12;
  };

  const getHourlyRate = (emp: Employee) => {
    const annual = getAnnualEquivalent(emp.salary, emp.paymentFrequency);
    return annual / 2080;
  };

  const calculateOTAmount = () => {
    if (!selectedEmployee || !otHours) return 0;
    const rate = getHourlyRate(selectedEmployee);
    return rate * Number(otHours) * Number(otMultiplier);
  };

  const handleProcess = () => {
    if (!selectedEmployee) return;

    let finalAmount = Number(amount);
    
    // Logic based on Action Type
    if (actionType === 'Overtime') {
        finalAmount = calculateOTAmount();
    }

    if (actionType === 'Structure Change') {
        const updatedEmps = employees.map(e => e.id === selectedEmployee.id ? { 
            ...e, 
            salary: finalAmount, 
            paymentFrequency: newFrequency 
        } : e);
        setEmployees(updatedEmps);
    }

    const newChange: CompensationChange = {
      id: `cc${Date.now()}`,
      employeeId: selectedEmployee.id,
      date: new Date().toISOString().split('T')[0],
      type: actionType,
      amount: (actionType === 'Bonus' || actionType === 'Overtime') ? finalAmount : 0,
      previousSalary: actionType === 'Structure Change' ? selectedEmployee.salary : undefined,
      newSalary: actionType === 'Structure Change' ? finalAmount : undefined,
      newFrequency: actionType === 'Structure Change' ? newFrequency : undefined,
      reason: reason || (actionType === 'Overtime' ? `${otHours} hours @ ${otMultiplier}x` : 'Manual adjustment'),
      approvedBy: 'Current Admin'
    };

    setChanges([newChange, ...changes]);
    setIsModalOpen(false);
    resetForm();
    showToast('Compensation updated successfully', 'success');
  };

  const resetForm = () => {
    setAmount('');
    setReason('');
    setOtHours('');
    setOtMultiplier('1.5');
  };

  const openModal = (mode: 'Structure' | 'Payment') => {
    setModalMode(mode);
    if (mode === 'Structure') {
        setActionType('Structure Change');
        setNewFrequency(selectedEmployee?.paymentFrequency || 'Annual');
        setAmount(selectedEmployee?.salary.toString() || '');
    } else {
        setActionType('Bonus'); // Default to Bonus
    }
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Salary Management</h1>
           <p className="text-slate-500">Manage base salaries, hourly rates, overtime, and bonuses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Employee List */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
           <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                 <h2 className="font-bold text-slate-800">Employees</h2>
                 <p className="text-xs text-slate-500">Select to manage</p>
              </div>
              <button 
                 onClick={() => setViewAsMonthly(!viewAsMonthly)}
                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    viewAsMonthly 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                 }`}
                 title="Normalize all salaries to monthly equivalent"
              >
                 {viewAsMonthly ? <Eye size={12} /> : <EyeOff size={12} />}
                 {viewAsMonthly ? 'Monthly View' : 'Default View'}
              </button>
           </div>
           <div className="flex-1 overflow-y-auto">
              {employees.map(emp => {
                 const displayAmount = viewAsMonthly 
                    ? Math.round(getMonthlyEquivalent(emp.salary, emp.paymentFrequency))
                    : emp.salary;
                 
                 const displayFreq = viewAsMonthly ? 'Monthly (Est.)' : emp.paymentFrequency;

                 return (
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
                          <div className="text-right">
                             <span className={`block text-sm font-mono font-semibold ${viewAsMonthly ? 'text-emerald-600' : 'text-slate-600'}`}>
                                {emp.currency} {displayAmount.toLocaleString()}
                             </span>
                             <span className="text-[10px] text-slate-400 uppercase font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                {displayFreq}
                             </span>
                          </div>
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto">
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
                          <p className="text-sm text-slate-500">Current Compensation</p>
                          <div className="flex items-baseline justify-end gap-2">
                             <p className="text-3xl font-bold text-indigo-600 font-mono">
                                {selectedEmployee.currency} {selectedEmployee.salary.toLocaleString()}
                             </p>
                             <span className="text-sm font-medium text-slate-400 uppercase">
                                / {selectedEmployee.paymentFrequency}
                             </span>
                          </div>
                          <div className="flex flex-col items-end gap-1 mt-1">
                             {selectedEmployee.paymentFrequency !== 'Annual' && (
                                <p className="text-xs text-slate-400">
                                   ~{selectedEmployee.currency} {Math.round(getAnnualEquivalent(selectedEmployee.salary, selectedEmployee.paymentFrequency)).toLocaleString()} / year
                                </p>
                             )}
                             {selectedEmployee.paymentFrequency !== 'Monthly' && (
                                <p className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                                   ~{selectedEmployee.currency} {Math.round(getMonthlyEquivalent(selectedEmployee.salary, selectedEmployee.paymentFrequency)).toLocaleString()} / month
                                </p>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-4 border-t border-slate-100 pt-4">
                       <button 
                         onClick={() => openModal('Structure')}
                         className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm font-medium shadow-sm transition-all"
                       >
                          <Briefcase size={16} /> Edit Salary Structure
                       </button>
                       <button 
                          onClick={() => openModal('Payment')}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm transition-all"
                       >
                          <Plus size={16} /> Add Bonus / Overtime
                       </button>
                    </div>
                 </div>

                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden min-h-[300px]">
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
                                <th className="px-6 py-3 font-semibold">Amount / Impact</th>
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
                                            record.type === 'Structure Change' ? 'bg-purple-100 text-purple-700' : 
                                            record.type === 'Overtime' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                                         }`}>
                                            {record.type}
                                         </span>
                                      </td>
                                      <td className="px-6 py-4">
                                         <div className="flex flex-col">
                                            <span>{record.reason}</span>
                                            {record.type === 'Structure Change' && (
                                               <span className="text-xs text-slate-400">
                                                  {record.previousSalary?.toLocaleString()} → {record.newSalary?.toLocaleString()} ({record.newFrequency || 'Annual'})
                                               </span>
                                            )}
                                         </div>
                                      </td>
                                      <td className="px-6 py-4 font-mono font-medium text-slate-800">
                                         {(record.type === 'Bonus' || record.type === 'Overtime') 
                                            ? `+${record.amount.toLocaleString()}` 
                                            : `${((record.newSalary || 0) - (record.previousSalary || 0)) > 0 ? '+' : ''}${((record.newSalary || 0) - (record.previousSalary || 0)).toLocaleString()}`
                                         }
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
      </div>

      {/* Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">
                     {modalMode === 'Structure' ? 'Edit Salary Structure' : 'Add Payment'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
               </div>
               
               <div className="p-6 space-y-4">
                  
                  {/* Mode Switching within Modal if needed, otherwise just title */}
                  {modalMode === 'Payment' && (
                     <div className="flex gap-2 mb-4 bg-slate-100 p-1 rounded-lg">
                        <button 
                           onClick={() => setActionType('Bonus')}
                           className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${actionType === 'Bonus' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}
                        >
                           Bonus
                        </button>
                        <button 
                           onClick={() => setActionType('Overtime')}
                           className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${actionType === 'Overtime' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}
                        >
                           Overtime
                        </button>
                     </div>
                  )}

                  {actionType === 'Structure Change' && (
                     <>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                           <select 
                              value={newFrequency}
                              onChange={(e) => setNewFrequency(e.target.value as PaymentFrequency)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                           >
                              <option>Annual</option>
                              <option>Monthly</option>
                              <option>Weekly</option>
                              <option>Daily</option>
                              <option>Hourly</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">New Rate Amount</label>
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
                           {amount && (
                              <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100 text-xs text-slate-500 space-y-1">
                                 <div className="flex justify-between">
                                    <span>Est. Annual:</span>
                                    <span className="font-medium">${Math.round(getAnnualEquivalent(Number(amount), newFrequency)).toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span>Est. Monthly:</span>
                                    <span className="font-medium text-indigo-600">${Math.round(getMonthlyEquivalent(Number(amount), newFrequency)).toLocaleString()}</span>
                                 </div>
                              </div>
                           )}
                        </div>
                     </>
                  )}

                  {actionType === 'Bonus' && (
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Bonus Amount</label>
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
                  )}

                  {actionType === 'Overtime' && (
                     <>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-center text-sm">
                           <span className="text-blue-800">Hourly Rate (Est.)</span>
                           <span className="font-bold text-blue-900">${getHourlyRate(selectedEmployee!).toFixed(2)}/hr</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
                              <input 
                                 type="number" 
                                 value={otHours}
                                 onChange={(e) => setOtHours(e.target.value)}
                                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                 placeholder="e.g. 5"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Multiplier</label>
                              <select 
                                 value={otMultiplier}
                                 onChange={(e) => setOtMultiplier(e.target.value)}
                                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                              >
                                 <option value="1.0">1.0x (Regular)</option>
                                 <option value="1.5">1.5x (Standard OT)</option>
                                 <option value="2.0">2.0x (Double)</option>
                              </select>
                           </div>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                           <span className="font-bold text-slate-700">Total Payout:</span>
                           <span className="text-xl font-bold text-emerald-600">${calculateOTAmount().toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                     </>
                  )}

                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Notes</label>
                     <textarea 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                        placeholder="e.g. Weekend Shift"
                     />
                  </div>
               </div>

               <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium">Cancel</button>
                  <button 
                     onClick={handleProcess}
                     disabled={actionType === 'Overtime' ? !otHours : !amount}
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
