
import React, { useState } from 'react';
import { PayrollRecord, Employee } from '../types';
import { DollarSign, Calendar, CheckCircle2, AlertCircle, Download, FileText, Filter, Search, Calculator, Wallet, ChevronRight, Loader2, Printer, Edit2, X, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface PayrollManagementProps {
  employees: Employee[];
  payrollRecords: PayrollRecord[];
  onGeneratePayroll: (period: string) => void;
  onProcessPayroll: (ids: string[]) => void;
  onUpdatePayroll: (record: PayrollRecord) => void;
}

const PayrollManagement: React.FC<PayrollManagementProps> = ({ 
  employees, 
  payrollRecords, 
  onGeneratePayroll, 
  onProcessPayroll,
  onUpdatePayroll
}) => {
  const { showToast } = useToast();
  
  // State
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toLocaleString('en-US', { month: 'short' }));
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null); // For Payslip Modal
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null); // For Edit Modal
  
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPeriod = `${selectedMonth} ${selectedYear}`;
  
  // Derived Data
  const currentRecords = payrollRecords.filter(r => r.period === currentPeriod);
  const pendingRecords = currentRecords.filter(r => r.status === 'Pending' || r.status === 'Hold');
  const processedRecords = currentRecords.filter(r => r.status === 'Processed');
  
  const totalPayrollCost = currentRecords.reduce((sum, r) => sum + r.netPay, 0);
  const totalPaid = processedRecords.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalPending = pendingRecords.reduce((sum, r) => sum + r.netPay, 0);

  // Filtered List for Table
  const filteredRecords = currentRecords.filter(r => 
    r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRunPayroll = () => {
    onGeneratePayroll(currentPeriod);
    showToast(`Generated payroll records for ${currentPeriod}`, 'success');
  };

  const handleBulkPay = () => {
    if (pendingRecords.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      onProcessPayroll(pendingRecords.map(r => r.id));
      setIsProcessing(false);
      showToast(`Processed payments for ${pendingRecords.length} employees`, 'success');
    }, 2000);
  };

  const handlePaySingle = (id: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      onProcessPayroll([id]);
      setIsProcessing(false);
      showToast('Payment processed successfully', 'success');
    }, 1000);
  };

  const handleSaveEdit = () => {
    if (editingRecord) {
      // Recalculate netPay just in case
      const updatedRecord = {
        ...editingRecord,
        netPay: editingRecord.baseSalary + editingRecord.bonus - editingRecord.deductions
      };
      onUpdatePayroll(updatedRecord);
      setEditingRecord(null);
      showToast('Payment details updated', 'success');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Processed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Hold': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
          <p className="text-slate-500">Manage monthly payroll cycles, tax deductions, and pay runs.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
           <select 
             value={selectedMonth}
             onChange={(e) => setSelectedMonth(e.target.value)}
             className="px-3 py-2 bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
           >
             {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
               <option key={m} value={m}>{m}</option>
             ))}
           </select>
           <div className="w-px bg-slate-200 my-2"></div>
           <select 
             value={selectedYear}
             onChange={(e) => setSelectedYear(e.target.value)}
             className="px-3 py-2 bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
           >
             <option value="2022">2022</option>
             <option value="2023">2023</option>
             <option value="2024">2024</option>
           </select>
        </div>
      </div>

      {/* Main Content Area */}
      {currentRecords.length === 0 ? (
        // Empty State: Generate Prompt
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-12">
           <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <Calculator size={40} className="text-indigo-500" />
           </div>
           <h2 className="text-xl font-bold text-slate-900 mb-2">No Payroll Records for {currentPeriod}</h2>
           <p className="text-slate-500 max-w-md text-center mb-8">
             There are currently no payroll records generated for this period. 
             Click below to calculate salaries, taxes, and deductions for all active employees.
           </p>
           <button 
             onClick={handleRunPayroll}
             className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
           >
             <Wallet size={20} /> Run Payroll Calculation
           </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Payroll Cost</p>
                <div className="flex items-end justify-between mt-2">
                   <h3 className="text-2xl font-bold text-slate-900">${totalPayrollCost.toLocaleString()}</h3>
                   <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                      <DollarSign size={20} />
                   </div>
                </div>
                <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-slate-800" style={{width: '100%'}}></div>
                </div>
             </div>

             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Paid</p>
                <div className="flex items-end justify-between mt-2">
                   <h3 className="text-2xl font-bold text-slate-900">${totalPaid.toLocaleString()}</h3>
                   <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                      <CheckCircle2 size={20} />
                   </div>
                </div>
                <div className="mt-4 w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 transition-all duration-500" style={{width: `${(totalPaid / totalPayrollCost) * 100}%`}}></div>
                </div>
             </div>

             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending</p>
                <div className="flex items-end justify-between mt-2">
                   <h3 className="text-2xl font-bold text-slate-900">${totalPending.toLocaleString()}</h3>
                   <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                      <AlertCircle size={20} />
                   </div>
                </div>
                <div className="mt-4 w-full bg-amber-100 h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-500 transition-all duration-500" style={{width: `${(totalPending / totalPayrollCost) * 100}%`}}></div>
                </div>
             </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden min-h-[400px]">
             {/* Toolbar */}
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div className="relative w-72">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input 
                      type="text" 
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                   />
                </div>
                
                <div className="flex gap-2">
                   <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
                      <Filter size={16} /> Filter
                   </button>
                   <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
                      <Download size={16} /> Export CSV
                   </button>
                   {pendingRecords.length > 0 && (
                      <button 
                        onClick={handleBulkPay}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm disabled:opacity-70"
                      >
                        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
                        Pay {pendingRecords.length} Employees
                      </button>
                   )}
                </div>
             </div>

             {/* Table */}
             <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                         <th className="px-6 py-3 font-semibold text-slate-700">Employee</th>
                         <th className="px-6 py-3 font-semibold text-slate-700">Department</th>
                         <th className="px-6 py-3 font-semibold text-slate-700 text-right">Base Salary</th>
                         <th className="px-6 py-3 font-semibold text-slate-700 text-right">Bonus/Add</th>
                         <th className="px-6 py-3 font-semibold text-slate-700 text-right">Deductions</th>
                         <th className="px-6 py-3 font-semibold text-slate-700 text-right">Net Pay</th>
                         <th className="px-6 py-3 font-semibold text-slate-700 text-center">Status</th>
                         <th className="px-6 py-3 font-semibold text-slate-700 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {filteredRecords.map((record) => (
                         <tr key={record.id} className="hover:bg-slate-50 group">
                            <td className="px-6 py-4 font-medium text-slate-900">{record.employeeName}</td>
                            <td className="px-6 py-4 text-slate-500">{record.department}</td>
                            <td className="px-6 py-4 text-right font-mono text-slate-600">${record.baseSalary.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right font-mono text-emerald-600">{record.bonus > 0 ? `+${record.bonus}` : '-'}</td>
                            <td className="px-6 py-4 text-right font-mono text-red-500">-${record.deductions.toLocaleString()}</td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">${record.netPay.toLocaleString()}</td>
                            <td className="px-6 py-4 text-center">
                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                                  {record.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  {record.status !== 'Processed' && (
                                    <>
                                       <button 
                                          onClick={() => setEditingRecord(record)}
                                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                          title="Edit Amounts"
                                       >
                                          <Edit2 size={14} />
                                       </button>
                                       <button
                                          onClick={() => handlePaySingle(record.id)}
                                          disabled={isProcessing}
                                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 disabled:opacity-50"
                                       >
                                          Pay
                                       </button>
                                    </>
                                  )}
                                  <button 
                                    onClick={() => setSelectedRecord(record)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                                    title="View Payslip"
                                  >
                                     <FileText size={14} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </>
      )}

      {/* Edit Payment Modal */}
      {editingRecord && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">Edit Payment Details</h3>
                  <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
               </div>
               
               <div className="p-6 space-y-4">
                  <div className="flex justify-between text-sm mb-4">
                     <span className="font-semibold text-slate-700">{editingRecord.employeeName}</span>
                     <span className="text-slate-500">{editingRecord.period}</span>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base Salary (Fixed)</label>
                     <input 
                        type="number" 
                        value={editingRecord.baseSalary}
                        disabled
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bonus / Additions</label>
                        <input 
                           type="number" 
                           value={editingRecord.bonus}
                           onChange={(e) => setEditingRecord({...editingRecord, bonus: Number(e.target.value)})}
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-emerald-700 font-medium"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deductions</label>
                        <input 
                           type="number" 
                           value={editingRecord.deductions}
                           onChange={(e) => setEditingRecord({...editingRecord, deductions: Number(e.target.value)})}
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 text-red-600 font-medium"
                        />
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                     <span className="text-sm font-medium text-slate-600">Net Pay Preview</span>
                     <span className="text-xl font-bold text-slate-900">
                        ${(editingRecord.baseSalary + editingRecord.bonus - editingRecord.deductions).toLocaleString()}
                     </span>
                  </div>
               </div>

               <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                  <button onClick={() => setEditingRecord(null)} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium">Cancel</button>
                  <button 
                     onClick={handleSaveEdit}
                     className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
                  >
                     <Save size={16} /> Save Changes
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Payslip Modal */}
      {selectedRecord && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
               {/* Modal Header */}
               <div className="bg-slate-800 text-white p-6 flex justify-between items-start">
                  <div>
                     <h2 className="text-xl font-bold tracking-wide">PAYSLIP</h2>
                     <p className="text-slate-400 text-sm mt-1">{selectedRecord.period}</p>
                  </div>
                  <div className="text-right">
                     <h3 className="font-bold text-lg">TalentFlow AI Inc.</h3>
                     <p className="text-xs text-slate-400">123 Business Park, NY</p>
                  </div>
               </div>

               <div className="p-8">
                  {/* Emp Details */}
                  <div className="grid grid-cols-2 gap-8 mb-8 border-b border-slate-100 pb-6">
                     <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Employee Name</p>
                        <p className="font-semibold text-slate-900">{selectedRecord.employeeName}</p>
                        <p className="text-sm text-slate-500">{selectedRecord.department}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Pay Date</p>
                        <p className="font-semibold text-slate-900">{selectedRecord.paymentDate || 'Pending'}</p>
                        <p className="text-xs text-slate-500 uppercase font-bold mt-2">Status</p>
                        <p className={`font-bold ${selectedRecord.status === 'Processed' ? 'text-emerald-600' : 'text-amber-600'}`}>{selectedRecord.status}</p>
                     </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                     <div>
                        <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Earnings</h4>
                        <div className="space-y-2 text-sm">
                           <div className="flex justify-between">
                              <span className="text-slate-600">Basic Salary</span>
                              <span className="font-mono text-slate-900">${(selectedRecord.baseSalary * 0.6).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-600">HRA</span>
                              <span className="font-mono text-slate-900">${(selectedRecord.baseSalary * 0.3).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-600">Special Allowance</span>
                              <span className="font-mono text-slate-900">${(selectedRecord.baseSalary * 0.1).toLocaleString()}</span>
                           </div>
                           {selectedRecord.bonus > 0 && (
                              <div className="flex justify-between">
                                 <span className="text-slate-600">Performance Bonus</span>
                                 <span className="font-mono text-slate-900">${selectedRecord.bonus.toLocaleString()}</span>
                              </div>
                           )}
                        </div>
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 mb-3">Deductions</h4>
                        <div className="space-y-2 text-sm">
                           <div className="flex justify-between">
                              <span className="text-slate-600">Income Tax</span>
                              <span className="font-mono text-red-500">-${(selectedRecord.deductions * 0.7).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-600">Provident Fund</span>
                              <span className="font-mono text-red-500">-${(selectedRecord.deductions * 0.3).toLocaleString()}</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Net Pay */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex justify-between items-center mb-6">
                     <div>
                        <p className="text-sm text-slate-500 font-medium">Net Payable Amount</p>
                        <p className="text-xs text-slate-400">Total earnings minus total deductions</p>
                     </div>
                     <div className="text-2xl font-bold text-slate-900 font-mono">
                        ${selectedRecord.netPay.toLocaleString()}
                     </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                     <button 
                       onClick={() => setSelectedRecord(null)}
                       className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm"
                     >
                        Close
                     </button>
                     <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">
                        <Printer size={16} /> Print
                     </button>
                     <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium text-sm">
                        <Download size={16} /> Download PDF
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default PayrollManagement;
