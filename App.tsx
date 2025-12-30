
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import RecruitmentBoard from './components/RecruitmentBoard';
import CandidateModal from './components/CandidateModal';
import ResumeUpload from './components/ResumeUpload';
import HROps from './components/HROps';
import Compliance from './components/Compliance';
import RecruitmentPlanner from './components/RecruitmentPlanner';
import OrganizationManagement from './components/OrganizationManagement';
import Reports from './components/Reports';
import SalaryManagement from './components/SalaryManagement';
import Productivity from './components/Productivity';
import ShiftManagement from './components/ShiftManagement';
import AttendanceManagement from './components/AttendanceManagement';
import MessageBox from './components/MessageBox';
import Settings from './components/Settings';
import InterviewSchedule from './components/InterviewSchedule';
import PolicyManagement from './components/PolicyManagement';
import RoleManagement from './components/RoleManagement';
import OnboardingHub from './components/OnboardingHub';
import { MOCK_CANDIDATES, MOCK_AUDIT_LOGS, MOCK_DEPARTMENTS, MOCK_EMPLOYEES, MOCK_MESSAGES } from './constants';
import { Candidate, Role, CandidateStage, AuditLog, Message, Employee } from './types';
import { ToastProvider } from './context/ToastContext';

function App() {
  const [currentRole, setCurrentRole] = useState<Role>(Role.ADMIN);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // State for Recruitment
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // State for Employees (Lifted)
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);

  // State for Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  // State for Messaging
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  // Reset view when role changes
  useEffect(() => {
    if (currentRole === Role.EMPLOYEE) {
      setCurrentView('dashboard');
    }
  }, [currentRole]);

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

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees(prev => [newEmployee, ...prev]);
    addAuditLog('Onboarding', `Created new employee record: ${newEmployee.name}`, false);
  };

  const addAuditLog = (action: string, details: string, isRisk: boolean) => {
    const newLog: AuditLog = {
      id: `l${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Current User', // In real app, from auth context
      role: currentRole,
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

  // Determine Unread Count for Badge
  const currentUserId = currentRole === Role.ADMIN ? 'admin' : 'e1';
  const unreadMessagesCount = messages.filter(m => m.recipientId === currentUserId && !m.isRead).length;

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard role={currentRole} />;
      case 'recruitment':
        return (
          <RecruitmentBoard 
            candidates={candidates} 
            onSelectCandidate={setSelectedCandidate}
            onUpdateStage={(c, stage) => {
              handleUpdateCandidate({ ...c, stage });
              addAuditLog('Stage Update', `Moved ${c.name} to ${stage}`, false);
            }}
            onUploadResume={() => setIsUploadModalOpen(true)}
          />
        );
      case 'schedule':
        return <InterviewSchedule />;
      case 'hrops':
        return <HROps role={currentRole} onSendMessage={handleSendMessage} />;
      case 'compliance':
        return <Compliance logs={auditLogs} />;
      case 'planner':
        return <RecruitmentPlanner />;
      case 'organization':
        return (
          <OrganizationManagement 
            initialDepartments={MOCK_DEPARTMENTS} 
            initialEmployees={employees}
            candidates={candidates} 
          />
        );
      case 'reports':
        return <Reports />;
      case 'salary':
        return <SalaryManagement />;
      case 'productivity':
        return <Productivity />;
      case 'shifts':
        return <ShiftManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'messages':
        return (
          <MessageBox 
            role={currentRole} 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            onMarkAsRead={handleMarkAsRead} 
          />
        );
      case 'settings':
        return <Settings role={currentRole} />;
      case 'policies':
         return <PolicyManagement />;
      case 'roles':
         return <RoleManagement />;
      case 'onboarding':
         return <OnboardingHub candidates={candidates} employees={employees} onAddEmployee={handleAddEmployee} />;
      default:
        return <Dashboard role={currentRole} />;
    }
  };

  return (
    <ToastProvider>
      <Layout 
        currentRole={currentRole} 
        onRoleChange={setCurrentRole}
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
          />
        )}
      </Layout>
    </ToastProvider>
  );
}

export default App;
