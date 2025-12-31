
import React, { useState } from 'react';
import { MOCK_HR_REQUESTS, MOCK_POLICIES, MOCK_EMPLOYEES, MOCK_LETTER_TEMPLATES, MOCK_SHIFTS, MOCK_PAYROLL, MOCK_ATTENDANCE } from '../constants';
import { HROpsRequest, Role, AttendanceRecord, Message, PayrollRecord } from '../types';
import { Search, Send, FileQuestion, CreditCard, CalendarDays, ChevronRight, Check, X, ClipboardList, User, DollarSign, FileText, Briefcase, Mail, PenTool, Printer, Bot, Clock, Wallet, Inbox, Calendar, Wand2, AlertTriangle, CheckCircle, TrendingUp, History, ArrowLeft, Loader2 } from 'lucide-react';
import { answerPolicyQuestion, analyzeLeaveRequest } from '../services/geminiService';
import { useToast } from '../context/ToastContext';

interface HROpsProps {
  role: Role;
  onSendMessage?: (msg: Message) => void;
  payrollRecords?: PayrollRecord[];
  onProcessPayroll?: (ids: string[]) => void;
}

const HROps: React.FC<HROpsProps> = ({ role, onSendMessage, payrollRecords = MOCK_PAYROLL, onProcessPayroll }) => {
  const { showToast } = useToast();
  const isAdmin = role === Role.COMPANY_ADMIN || role === Role.HR_ADMIN;
  // Initialize default view based on Role
  const [activeView, setActiveView] = useState<'overview' | 'payroll' | 'communication' | 'attendance'>('overview');
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState<HROpsRequest[]>(MOCK_HR_REQUESTS);
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);

  // Advance Payment State
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');
  const [repaymentMonths, setRepaymentMonths] = useState('1');

  // Payroll History State
  const [showPayrollHistory, setShowPayrollHistory] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isProcessingPayroll, setIsProcessingPayroll] = useState(false);

  // Communication State
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  // Employee Attendance State
  const [employeeAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);

  
  // Use "Jane Doe" as the logged-in employee for demo purposes
  const currentUser = MOCK_EMPLOYEES.find(e => e.id === 'e1') || MOCK_EMPLOYEES[0];
  const currentShift = MOCK_SHIFTS.find(s => s.id === currentUser.shiftId);
  const latestPayroll = payrollRecords.find(p => p.employeeId === currentUser.id && p.period === 'Oct 2023');
  const payrollHistory = payrollRecords.filter(p => p.employeeId === currentUser.id).sort((a,b) => b.paymentDate && a.paymentDate ? b.paymentDate.localeCompare(a.paymentDate) : 0);

  // Admin Payroll Processing Data
  const pendingPayrolls = payrollRecords.filter(p => p.status !== 'Processed');
  const totalPendingAmount = pendingPayrolls.reduce((sum, p) => sum + p.netPay, 0);

  const handlePolicyAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setAnswer(null);

    // Construct context from mock policies
    const context = MOCK_POLICIES.map(p => `Policy: ${p.title}\nContent: ${p.contentSnippet}`).join('\n\n');
    
    const response = await answerPolicyQuestion(query, context);
    setAnswer(response);
    setIsLoading(false);
  };

  const handleRequestAction = (id: string, action: 'Approved' | 'Rejected') => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
    showToast(`Request ${action} successfully`, action === 'Approved' ? 'success' : 'info');
  };

  const handleAnalyzeRequest = async (req: HROpsRequest) => {
    setAnalyzingIds(prev => [...prev, req.id]);
    try {
      const result = await analyzeLeaveRequest(req.description, req.employeeName);
      setRequests(prev => prev.map(r => r.id === req.id ? { 
        ...r, 
        aiAssessment: {
          recommendation: result.recommendation as 'Approve' | 'Reject',
          reason: result.reason,
          confidenceScore: result.confidenceScore || 90
        } 
      } : r));
      showToast('AI Assessment Complete', 'success');
    } catch (e) {
      console.error(e);
      showToast('AI Analysis Failed', 'error');
    } finally {
      setAnalyzingIds(prev => prev.filter(id => id !== req.id));
    }
  };

  const handleSubmitAdvance = () => {
    if (!advanceAmount || !advanceReason) return;
    
    const newRequest: HROpsRequest = {
      id: `adv_${Date.now()}`,
      type: 'Advance Payment',
      status: 'Pending',
      description: advanceReason,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      employeeName: currentUser.name,
      amount: Number(advanceAmount),
      repaymentMonths: Number(repaymentMonths)
    };

    setRequests(prev => [newRequest, ...prev]);
    setAdvanceAmount('');
    setAdvanceReason('');
    setRepaymentMonths('1');
    showToast('Advance payment request submitted successfully!', 'success');
    setActiveView('overview'); // Go back to overview to see the request
  };

  const handleRunPayroll = () => {
    if (onProcessPayroll) {
      setIsProcessingPayroll(true);
      setTimeout(() => {
        onProcessPayroll(pendingPayrolls.map(p => p.id));
        setIsProcessingPayroll(false);
        setIsPayrollModalOpen(false);
        showToast('Payroll processed successfully for all employees', 'success');
      }, 2000);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = MOCK_LETTER_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    // Replace placeholders with current user data
    const subject = template.subject.replace('{{name}}', currentUser.name);
    let body = template.bodyTemplate
      .replace('{{name}}', currentUser.name)
      .replace('{{role}}', currentUser.role)
      .replace('{{joinDate}}', currentUser.joinDate)
      .replace('{{salary}}', currentUser.salary.toLocaleString())
      .replace('{{currency}}', currentUser.currency);

    setMsgSubject(subject);
    setMsgBody(body);
    setSelectedTemplateId(templateId);
    showToast('Template applied', 'info');
  };

  const handleSendMessage = () => {
    if(!msgSubject || !msgBody) return;
    
    if (onSendMessage) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        recipientId: 'admin',
        recipientName: 'HR Admin',
        subject: msgSubject,
        body: msgBody,
        date: new Date().toISOString().split('T')[0],
        isRead: false,
        type: selectedTemplateId ? 'Template Request' : 'General'
      };
      onSendMessage(newMessage);
      showToast(`Message "${msgSubject}" sent to HR Admin`, 'success');
    } else {
      showToast("Message system not connected.", 'error');
    }
    
    setMsgSubject('');
    setMsgBody('');
    setSelectedTemplateId('');
  };

  const getNavItems = () => {
    if (isAdmin) {
      return ['overview'];
    }
    return ['overview', 'attendance', 'payroll', 'communication'];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Navigation Tabs */}
      <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
            {getNavItems().map((view) => (
                <button
                key={view}
                onClick={() => setActiveView(view as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                    activeView === view 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                >
                {view}
                </button>
            ))}
          </div>
          
          {/* Shift Display - Visible on all tabs for employee */}
          {!isAdmin && currentShift && (
              <div className="hidden md:flex items-center gap-3 bg-white border border-indigo-100 px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Current Shift</span>
                      <span className="text-sm font-bold text-slate-800">{currentShift.name}</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-bold ${currentShift.color}`}>
                      <Clock size={14} /> {currentShift.startTime} - {currentShift.endTime}
                  </div>
              </div>
          )}
      </div>

      {/* Overview View (Default) */}
      {activeView === 'overview' && (
        <>
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isAdmin ? (
              <>
                {[
                  { label: 'Process Payroll', icon: <CreditCard className="text-emerald-600" />, action: () => setIsPayrollModalOpen(true) },
                  { label: 'Review Leaves', icon: <CalendarDays className="text-indigo-600" />, action: () => {} },
                  { label: 'Onboard Employee', icon: <User className="text-blue-600" />, action: () => {} },
                  { label: 'Policy Update', icon: <ClipboardList className="text-purple-600" />, action: () => {} },
                ].map((action, i) => (
                  <button 
                    key={i} 
                    onClick={action.action}
                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
                  >
                    <div className="mb-4 bg-slate-50 w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      {action.icon}
                    </div>
                    <span className="font-semibold text-slate-700 block mb-1">{action.label}</span>
                    <span className="text-xs text-slate-400 flex items-center">Admin Action <ChevronRight size={12} className="ml-1" /></span>
                  </button>
                ))}
              </>
            ) : (
              <>
                {[
                  { label: 'Apply Leave', icon: <CalendarDays className="text-indigo-600" /> },
                  { label: 'View Payslip', icon: <CreditCard className="text-emerald-600" /> },
                  { label: 'Policy Query', icon: <FileQuestion className="text-blue-600" /> },
                  { label: 'Request Advance', icon: <TrendingUp className="text-emerald-600" />, action: () => setActiveView('payroll') },
                  { label: 'Request Letter', icon: <FileText className="text-purple-600" />, action: () => setActiveView('communication') },
                ].map((action, i) => (
                  <button 
                    key={i} 
                    onClick={action.action}
                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
                  >
                    <div className="mb-4 bg-slate-50 w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      {action.icon}
                    </div>
                    <span className="font-semibold text-slate-700 block mb-1">{action.label}</span>
                    <span className="text-xs text-slate-400 flex items-center">Start Action <ChevronRight size={12} className="ml-1" /></span>
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Request Tracker */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">
                  {isAdmin ? 'Incoming Requests' : 'My Recent Requests'}
                </h3>
              </div>
              
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {(isAdmin ? requests.sort((a,b) => a.status === 'Pending' ? -1 : 1) : requests.filter(r => r.employeeName === currentUser.name)).map(req => {
                  const isAnalyzing = analyzingIds.includes(req.id);
                  return (
                    <div key={req.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-slate-900">{req.type}</span>
                          {isAdmin && <span className="text-xs text-slate-500 font-medium">{req.employeeName}</span>}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          req.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                          req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2 mt-1">{req.description}</p>
                      
                      {/* Advance Payment Specific Details for HR */}
                      {req.type === 'Advance Payment' && req.amount && (
                         <div className="bg-slate-50 p-2 rounded mb-2 border border-slate-100">
                            <div className="flex items-center gap-4 text-xs text-slate-600 mb-1">
                                <span className="font-bold flex items-center gap-1"><DollarSign size={10} /> Amount: {req.amount.toLocaleString()}</span>
                                <span className="flex items-center gap-1"><History size={10} /> Repay in: {req.repaymentMonths}mo</span>
                            </div>
                            {req.repaymentMonths && (
                                <p className="text-[10px] text-slate-400">
                                    Est. Deduction: ~{Math.round(req.amount / req.repaymentMonths).toLocaleString()}/mo
                                </p>
                            )}
                         </div>
                      )}

                      {/* AI Assessment Result */}
                      {isAdmin && req.status === 'Pending' && req.aiAssessment && (
                        <div className={`mb-3 p-2 rounded text-xs border ${
                          req.aiAssessment.recommendation === 'Approve' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
                        }`}>
                           <div className="flex items-center gap-1 font-bold mb-1">
                              <Bot size={12} /> AI Recommends: {req.aiAssessment.recommendation}
                           </div>
                           <p className="opacity-90">{req.aiAssessment.reason}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <p className="text-[10px] text-slate-400">{req.date}</p>
                        
                        {isAdmin && req.status === 'Pending' && (
                          <div className="flex gap-2 items-center">
                            {!req.aiAssessment && req.type === 'Leave' && (
                               <button 
                                 onClick={() => handleAnalyzeRequest(req)}
                                 disabled={isAnalyzing}
                                 className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium hover:bg-indigo-100 disabled:opacity-50"
                               >
                                 {isAnalyzing ? '...' : <><Wand2 size={12} /> AI</>}
                               </button>
                            )}
                            <button 
                              onClick={() => handleRequestAction(req.id, 'Approved')}
                              className="p-1 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200" title="Approve">
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => handleRequestAction(req.id, 'Rejected')}
                              className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200" title="Reject">
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: AI Policy Assistant */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-2 py-1 rounded">BETA</span>
                  HR Policy Assistant
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  {isAdmin 
                    ? "Verify policy details against knowledge base before approving requests."
                    : "Ask questions about company policies, benefits, or procedures."}
                </p>
              </div>

              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
                {answer ? (
                  <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="text-white" size={16} />
                      </div>
                      <div className="space-y-4">
                        <p className="text-slate-700 leading-relaxed text-sm">{answer}</p>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-500">
                          <strong>Source Context:</strong> Information derived from "General" and "Finance" policy documents.
                        </div>
                        <button onClick={() => setAnswer(null)} className="text-indigo-600 text-sm font-medium hover:underline">
                          Ask another question
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <FileQuestion size={48} className="mb-4" />
                    <p>Ask a question below to get started</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handlePolicyAsk} className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., What is the policy for remote work expense reimbursement?"
                    className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={18} />}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Employee Attendance View and other views unchanged ... */}
      {!isAdmin && activeView === 'attendance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
            {/* ... Same as original ... */}
            <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Calendar size={18} /> Summary</h3>
                <div className="space-y-4">
                   <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                      <span className="text-sm text-slate-600">Days Present</span>
                      <span className="font-bold text-slate-900 text-lg">22</span>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                      <span className="text-sm text-slate-600">Late Arrivals</span>
                      <span className="font-bold text-amber-600 text-lg">1</span>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                      <span className="text-sm text-slate-600">Absences</span>
                      <span className="font-bold text-red-600 text-lg">0</span>
                   </div>
                   <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                      <p className="text-xs text-indigo-800 mb-1 font-bold uppercase">Shift</p>
                      <p className="text-sm text-indigo-900">{currentShift?.name || 'General'} ({currentShift?.startTime} - {currentShift?.endTime})</p>
                   </div>
                </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-800">Attendance Log</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-600">
                   <thead className="bg-white border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Date</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold">Check In</th>
                        <th className="px-6 py-3 font-semibold">Check Out</th>
                        <th className="px-6 py-3 font-semibold">Hours</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {employeeAttendance.filter(a => a.employeeId === currentUser.id).map(record => (
                         <tr key={record.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">{record.date}</td>
                            <td className="px-6 py-4">
                               <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  record.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 
                                  record.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                               }`}>
                                  {record.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 font-mono">{record.checkIn}</td>
                            <td className="px-6 py-4 font-mono">{record.checkOut || '-'}</td>
                            <td className="px-6 py-4 font-bold">{record.hoursWorked}</td>
                         </tr>
                      ))}
                      {employeeAttendance.filter(a => a.employeeId === currentUser.id).length === 0 && (
                          <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No attendance records found</td></tr>
                      )}
                   </tbody>
                 </table>
               </div>
            </div>
        </div>
      )}

      {/* Salary View and others... */}
      {activeView === 'payroll' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
          {/* ... Payroll Card ... */}
           <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">Total Annual Compensation</p>
                        <h2 className="text-4xl font-bold text-slate-900 flex items-start gap-1">
                          <span className="text-lg text-slate-400 mt-2">{currentUser.currency}</span> 
                          {currentUser.salary.toLocaleString()}
                        </h2>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                        <DollarSign size={24} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Monthly Gross</p>
                        <p className="font-semibold text-slate-800">{(currentUser.salary / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Tax Est.</p>
                        <p className="font-semibold text-slate-800">22%</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Shift</p>
                        <p className="font-semibold text-slate-800">{currentShift?.name || 'Standard'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500 pt-4 border-t border-slate-100">
                    <CalendarDays size={16} /> Next Salary Review: <span className="text-slate-900 font-medium">March 15, 2024</span>
                  </div>
              </div>
            </div>

            {/* Advance Request Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} /> Request Advance Salary
                </h3>
                <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount ({currentUser.currency})</label>
                      <input 
                        type="number"
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. 5000"
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Repayment (Months)</label>
                        <select 
                          value={repaymentMonths}
                          onChange={(e) => setRepaymentMonths(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            {[1, 2, 3, 4, 5, 6, 9, 12].map(m => <option key={m} value={m}>{m} Months</option>)}
                        </select>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deduction / Month</label>
                         <div className="px-3 py-2 bg-slate-100 rounded-lg text-sm text-slate-600 font-mono">
                            {advanceAmount ? Math.round(Number(advanceAmount) / Number(repaymentMonths)).toLocaleString() : '0'}
                         </div>
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason</label>
                      <textarea
                        value={advanceReason}
                        onChange={(e) => setAdvanceReason(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                        placeholder="Reason for advance..."
                      />
                  </div>
                  <button 
                    onClick={handleSubmitAdvance}
                    disabled={!advanceAmount || !advanceReason}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Submit Request
                  </button>
                </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Monthly Pay Ledger / History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col h-fit">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Wallet size={18} /> {showPayrollHistory ? 'Payment History' : 'October 2023 Ledger'}
                 </h3>
                 {showPayrollHistory && (
                    <button onClick={() => setShowPayrollHistory(false)} className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                       <ArrowLeft size={14} /> Back
                    </button>
                 )}
              </div>
              
              {!showPayrollHistory ? (
                 <>
                   {latestPayroll ? (
                      <div className="space-y-4">
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-sm text-slate-600">Credited (Net Pay)</span>
                            <span className="font-bold text-slate-900">{latestPayroll.netPay.toLocaleString()} {currentUser.currency}</span>
                          </div>
                          <div className={`flex justify-between items-center p-3 rounded-lg border ${
                              latestPayroll.status === 'Processed' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
                          }`}>
                            <span className={`text-sm font-medium flex items-center gap-2 ${
                                latestPayroll.status === 'Processed' ? 'text-emerald-700' : 'text-slate-600'
                            }`}>
                                {latestPayroll.status === 'Processed' ? <Check size={14} /> : <Clock size={14} />} 
                                Paid Amount
                            </span>
                            <span className={`font-bold ${
                                latestPayroll.status === 'Processed' ? 'text-emerald-700' : 'text-slate-500'
                            }`}>
                                {latestPayroll.amountPaid.toLocaleString()} {currentUser.currency}
                            </span>
                          </div>
                          {latestPayroll.amountPaid < latestPayroll.netPay && (
                              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                                  <span className="text-sm text-amber-700 font-medium">Pending Balance</span>
                                  <span className="font-bold text-amber-700">
                                      {(latestPayroll.netPay - latestPayroll.amountPaid).toLocaleString()} {currentUser.currency}
                                  </span>
                              </div>
                          )}
                          <p className="text-xs text-slate-400 mt-2">Status: <span className="uppercase font-semibold">{latestPayroll.status}</span></p>
                      </div>
                  ) : (
                      <p className="text-slate-400 text-sm">No payroll records generated for current period.</p>
                  )}

                  <button 
                     onClick={() => setShowPayrollHistory(true)}
                     className="w-full mt-6 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 text-sm"
                  >
                      View Ledger History
                  </button>
                 </>
              ) : (
                 <div className="overflow-y-auto max-h-[300px]">
                    <div className="space-y-3">
                       {payrollHistory.map(record => (
                          <div key={record.id} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                             <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-800">{record.period}</span>
                                <span className="font-mono font-medium text-emerald-600">{record.netPay.toLocaleString()} {currentUser.currency}</span>
                             </div>
                             <div className="flex justify-between items-center text-xs text-slate-500">
                                <span>Paid: {record.paymentDate || 'Pending'}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                                   record.status === 'Processed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>{record.status}</span>
                             </div>
                          </div>
                       ))}
                       {payrollHistory.length === 0 && <p className="text-center text-slate-400 text-sm py-4">No history found.</p>}
                    </div>
                 </div>
              )}
            </div>

            {/* Advance Request History */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <History size={18} /> Advance History
               </h3>
               <div className="space-y-3">
                 {requests.filter(r => r.type === 'Advance Payment' && r.employeeName === currentUser.name).length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No advance requests found.</p>
                 ) : (
                    requests.filter(r => r.type === 'Advance Payment' && r.employeeName === currentUser.name).map(req => (
                      <div key={req.id} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                         <div className="flex justify-between items-start mb-1">
                            <div>
                               <p className="font-bold text-slate-800 text-sm">{currentUser.currency} {req.amount?.toLocaleString()}</p>
                               <p className="text-xs text-slate-500">{req.repaymentMonths} months repayment</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                               req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                               req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                               {req.status}
                            </span>
                         </div>
                         <p className="text-xs text-slate-500 line-clamp-1 mb-1">{req.description}</p>
                         <p className="text-[10px] text-slate-400 text-right">{req.date}</p>
                      </div>
                    ))
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Communication View */}
      {activeView === 'communication' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
           {/* Templates List */}
           <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <ClipboardList size={18} /> Templates
              </h3>
              <div className="space-y-2">
                 {/* Filter out Offer Letter (t4) and Promotion Letter (t5) for Employee view */}
                 {MOCK_LETTER_TEMPLATES.filter(t => !['t4', 't5'].includes(t.id)).map(template => (
                   <button 
                     key={template.id}
                     onClick={() => applyTemplate(template.id)}
                     className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${selectedTemplateId === template.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
                   >
                     <div className="font-medium">{template.title}</div>
                     <div className="text-xs opacity-70 truncate">{template.subject}</div>
                   </button>
                 ))}
                 <button 
                   onClick={() => { setSelectedTemplateId(''); setMsgSubject(''); setMsgBody(''); }}
                   className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${selectedTemplateId === '' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
                 >
                    <div className="font-medium">Custom Message</div>
                    <div className="text-xs opacity-70">Write a message from scratch</div>
                 </button>
              </div>
           </div>

           {/* Composer */}
           <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <PenTool size={18} /> Compose Request
              </h3>
              
              <div className="space-y-4 flex-1">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                    <input 
                      type="text" 
                      value={msgSubject}
                      onChange={(e) => setMsgSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="e.g. Inquiry about holiday schedule"
                    />
                 </div>
                 <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message Body</label>
                    <textarea 
                      value={msgBody}
                      onChange={(e) => setMsgBody(e.target.value)}
                      className="w-full flex-1 min-h-[200px] p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm"
                      placeholder="Type your message here..."
                    />
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                 {selectedTemplateId && (
                   <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">
                      <Printer size={16} /> Print / PDF
                   </button>
                 )}
                 <button 
                   onClick={handleSendMessage}
                   disabled={!msgSubject || !msgBody}
                   className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                 >
                    <Send size={16} /> Send to HR
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Admin Payroll Processing Modal */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-6 border-b border-slate-100">
                 <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard size={24} className="text-emerald-600" /> Process Monthly Payroll
                 </h2>
                 <p className="text-sm text-slate-500 mt-1">Review pending payments for Oct 2023.</p>
              </div>
              
              <div className="p-6 space-y-6">
                 {/* Summary Stats */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                       <span className="block text-2xl font-bold text-slate-900">{pendingPayrolls.length}</span>
                       <span className="text-xs text-slate-500 font-bold uppercase">Pending Employees</span>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                       <span className="block text-2xl font-bold text-emerald-700">${totalPendingAmount.toLocaleString()}</span>
                       <span className="text-xs text-emerald-600 font-bold uppercase">Total Net Pay</span>
                    </div>
                 </div>

                 {/* Employee List Preview */}
                 <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-lg">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 sticky top-0">
                          <tr>
                             <th className="px-4 py-2 font-medium text-slate-600">Employee</th>
                             <th className="px-4 py-2 font-medium text-slate-600 text-right">Net Amount</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {pendingPayrolls.map(p => (
                             <tr key={p.id}>
                                <td className="px-4 py-2 text-slate-700">{p.employeeName}</td>
                                <td className="px-4 py-2 text-right font-mono">${p.netPay.toLocaleString()}</td>
                             </tr>
                          ))}
                          {pendingPayrolls.length === 0 && (
                             <tr>
                                <td colSpan={2} className="px-4 py-8 text-center text-slate-400">
                                   All payrolls for this period are processed.
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                 <button 
                    onClick={() => setIsPayrollModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={handleRunPayroll}
                    disabled={pendingPayrolls.length === 0 || isProcessingPayroll}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                 >
                    {isProcessingPayroll ? (
                       <>
                          <Loader2 size={16} className="animate-spin" /> Processing...
                       </>
                    ) : (
                       <>
                          <Check size={16} /> Confirm & Pay
                       </>
                    )}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default HROps;