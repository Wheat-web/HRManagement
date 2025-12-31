
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import RecruitmentBoard from './components/RecruitmentBoard';
import CandidateModal from './components/CandidateModal';
import ResumeUpload from './components/ResumeUpload';
import HROps from './components/HROps';
import Compliance from './components/Compliance';
import RecruitmentPlanner from './components/RecruitmentPlanner';
import OrganizationManagement from './components/OrganizationManagement';
import Reports from './components/Reports';
import SalaryManagement from './components/SalaryManagement';
import PayrollManagement from './components/PayrollManagement';
import Productivity from './components/Productivity';
import ShiftManagement from './components/ShiftManagement';
import AttendanceManagement from './components/AttendanceManagement';
import MessageBox from './components/MessageBox';
import Settings from './components/Settings';
import InterviewSchedule from './components/InterviewSchedule';
import PolicyManagement from './components/PolicyManagement';
import RoleManagement from './components/RoleManagement';
import OnboardingHub from './components/OnboardingHub';
import { MOCK_CANDIDATES, MOCK_AUDIT_LOGS, MOCK_DEPARTMENTS, MOCK_EMPLOYEES, MOCK_MESSAGES, MOCK_PAYROLL, MOCK_JOBS } from './constants';
import { Candidate, Role, CandidateStage, AuditLog, Message, Employee, Department, PayrollRecord, JobOpening, UserProfile } from './types';
import { ToastProvider } from './context/ToastContext';

function App() {
  // Authentication State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const [currentView, setCurrentView] = useState('dashboard');
  
  // State for Recruitment
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [jobs, setJobs] = useState<JobOpening[]>(MOCK_JOBS);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // State for Employees & Departments (Lifted)
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);

  // State for Payroll
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(MOCK_PAYROLL);

  // State for Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  // State for Messaging
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  // Auth Handlers
  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setAuthView('login');
  };

  const handleUpdateCandidate = (updated: Candidate) => {
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (selectedCandidate?.id === updated.id) {
      setSelectedCandidate(updated);
    }
  };

  const handleAddCandidate = (newCandidate: Candidate) => {
    setCandidates(prev => [newCandidate, ...prev]);
    setIsUploadModalOpen(false);
    addAuditLog('Resume Upload', `Added new candidate: ${newCandidate.name}`, false);
  };

  const handleAddJob = (newJob: JobOpening) => {
    setJobs(prev => [newJob, ...prev]);
    addAuditLog('Job Creation', `Created new job opening: ${newJob.title}`, false);
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees(prev => [newEmployee, ...prev]);
    addAuditLog('Onboarding', `Created new employee record: ${newEmployee.name}`, false);
  };

  const handleAddDepartment = (newDept: Department) => {
    setDepartments(prev => [...prev, newDept]);
    addAuditLog('Org Management', `Created new department: ${newDept.name}`, false);
  };

  const handleProcessPayroll = (processedIds: string[]) => {
    const today = new Date().toISOString().split('T')[0];
    setPayrollRecords(prev => prev.map(record => 
      processedIds.includes(record.id) 
        ? { ...record, status: 'Processed', paymentDate: today, amountPaid: record.netPay } 
        : record
    ));
    addAuditLog('Payroll', `Processed payroll payments for ${processedIds.length} employees`, false);
  };

  const handleUpdatePayroll = (updatedRecord: PayrollRecord) => {
    setPayrollRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    addAuditLog('Payroll Edit', `Updated payroll amounts for ${updatedRecord.employeeName}`, false);
  };

  const handleGeneratePayroll = (period: string) => {
    // Check which employees already have a record for this period
    const existingIds = payrollRecords
      .filter(r => r.period === period)
      .map(r => r.employeeId);

    const eligibleEmployees = employees.filter(e => 
      (e.status === 'Active' || e.status === 'On Leave') && 
      !existingIds.includes(e.id)
    );

    if (eligibleEmployees.length === 0) return;

    const newRecords: PayrollRecord[] = eligibleEmployees.map(e => {
        // Calculate monthly base based on frequency
        let monthlyBase = 0;
        if (e.paymentFrequency === 'Hourly') {
            monthlyBase = Math.round(e.salary * 160); // Approx 160 hours/month
        } else if (e.paymentFrequency === 'Daily') {
            monthlyBase = Math.round(e.salary * 22); // Approx 22 days/month
        } else if (e.paymentFrequency === 'Weekly') {
            monthlyBase = Math.round(e.salary * 4.33); // Approx 4.33 weeks/month
        } else if (e.paymentFrequency === 'Monthly') {
            monthlyBase = e.salary;
        } else {
            // Annual
            monthlyBase = Math.round(e.salary / 12);
        }

        // Simple mock logic for deductions (e.g. 20% tax + benefits)
        const deductions = Math.round(monthlyBase * 0.22); 
        const bonus = 0; // Default bonus
        const netPay = monthlyBase + bonus - deductions;

        return {
            id: `pay_${period.replace(' ', '')}_${e.id}`,
            employeeId: e.id,
            employeeName: e.name,
            department: e.department,
            period: period,
            baseSalary: monthlyBase,
            bonus: bonus,
            deductions: deductions,
            netPay: netPay,
            amountPaid: 0,
            status: 'Pending'
        };
    });

    setPayrollRecords(prev => [...prev, ...newRecords]);
    addAuditLog('Payroll', `Generated ${newRecords.length} payroll records for ${period}`, true);
  };

  const addAuditLog = (action: string, details: string, isRisk: boolean) => {
    const newLog: AuditLog = {
      id: `l${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: user?.name || 'System',
      role: user?.role || Role.COMPANY_ADMIN,
      action,
      details,
      aiInvolved: true,
      riskLevel: isRisk ? 'Medium' : 'Low'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // Messaging Handlers
  const handleSendMessage = (newMessage: Message) => {
    setMessages(prev => [newMessage, ...prev]);
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard role={user!.role} />;
      case 'recruitment':
        return (
          <RecruitmentBoard 
            candidates={candidates} 
            jobs={jobs}
            onSelectCandidate={setSelectedCandidate}
            onUpdateStage={(c, stage) => {
              handleUpdateCandidate({ ...c, stage });
              addAuditLog('Stage Update', `Moved ${c.name} to ${stage}`, false);
            }}
            onUploadResume={() => setIsUploadModalOpen(true)}
            onAddJob={handleAddJob}
          />
        );
      case 'schedule':
        return <InterviewSchedule />;
      case 'hrops':
        return (
          <HROps 
            role={user!.role} 
            onSendMessage={handleSendMessage} 
            payrollRecords={payrollRecords}
            onProcessPayroll={handleProcessPayroll}
          />
        );
      case 'compliance':
        return <Compliance logs={auditLogs} />;
      case 'planner':
        return <RecruitmentPlanner />;
      case 'organization':
        return (
          <OrganizationManagement 
            initialDepartments={departments} 
            initialEmployees={employees}
            candidates={candidates} 
            onAddEmployee={handleAddEmployee}
            onAddDepartment={handleAddDepartment}
          />
        );
      case 'reports':
        return <Reports />;
      case 'salary':
        return <SalaryManagement />;
      case 'payroll':
        return (
          <PayrollManagement 
            employees={employees}
            payrollRecords={payrollRecords}
            onGeneratePayroll={handleGeneratePayroll}
            onProcessPayroll={handleProcessPayroll}
            onUpdatePayroll={handleUpdatePayroll}
          />
        );
      case 'productivity':
        return <Productivity />;
      case 'shifts':
        return <ShiftManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'messages':
        return (
          <MessageBox 
            role={user!.role} 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            onMarkAsRead={handleMarkAsRead} 
          />
        );
      case 'settings':
        return <Settings role={user!.role} />;
      case 'policies':
         return <PolicyManagement />;
      case 'roles':
         return <RoleManagement />;
      case 'onboarding':
         return <OnboardingHub candidates={candidates} employees={employees} onAddEmployee={handleAddEmployee} />;
      default:
        return <Dashboard role={user!.role} />;
    }
  };

  // Determine Unread Count for Badge
  const currentUserId = (user?.role === Role.HR_ADMIN || user?.role === Role.COMPANY_ADMIN) ? 'admin' : 'e1';
  const unreadMessagesCount = messages.filter(m => m.recipientId === currentUserId && !m.isRead).length;

  return (
    <ToastProvider>
      {/* Auth Screen Logic */}
      {!user ? (
        authView === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} />
        ) : (
          <Signup onSignup={handleLogin} onSwitchToLogin={() => setAuthView('login')} />
        )
      ) : (
        /* Authenticated App Logic */
        <Layout 
          user={user}
          onLogout={handleLogout}
          currentView={currentView}
          onNavigate={setCurrentView}
          unreadMessagesCount={unreadMessagesCount}
        >
          <div className="animate-in fade-in duration-300">
            {renderContent()}
          </div>

          {selectedCandidate && (
            <CandidateModal 
              candidate={selectedCandidate} 
              onClose={() => setSelectedCandidate(null)}
              onUpdate={handleUpdateCandidate}
              onAudit={addAuditLog}
            />
          )}

          {isUploadModalOpen && (
            <ResumeUpload 
              onClose={() => setIsUploadModalOpen(false)}
              onAddCandidate={handleAddCandidate}
              jobs={jobs}
            />
          )}
        </Layout>
      )}
    </ToastProvider>
  );
}

export default App;
