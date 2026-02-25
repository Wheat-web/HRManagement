import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import RecruitmentBoard from "./components/RecruitmentBoard";
import CandidateModal from "./components/CandidateModal";
import ResumeUpload from "./components/ResumeUpload";
import HROps from "./components/HROps";
import Compliance from "./components/Compliance";
import RecruitmentPlanner from "./components/RecruitmentPlanner";
import OrganizationManagement from "./components/OrganizationManagement";
import EmployeeManagement from "./components/EmployeeManagement";
import Reports from "./components/Reports";
import SalaryManagement from "./components/SalaryManagement";
import PayrollManagement from "./components/PayrollManagement";
import Productivity from "./components/Productivity";
import ShiftManagement from "./components/ShiftManagement";
import AttendanceManagement from "./components/AttendanceManagement";
import MessageBox from "./components/MessageBox";
import Settings from "./components/Settings";
import InterviewSchedule from "./components/InterviewSchedule";
import PolicyManagement from "./components/PolicyManagement";
import RoleManagement from "./components/RoleManagement";
import OnboardingHub from "./components/OnboardingHub";
import JobPortal from "./components/JobPortal";
import BranchManagement from "./components/BranchManagement";
import CompanyRegistration from "./components/CompanyRegistration";
import {
  MOCK_CANDIDATES,
  MOCK_AUDIT_LOGS,
  MOCK_DEPARTMENTS,
  MOCK_EMPLOYEES,
  MOCK_MESSAGES,
  MOCK_PAYROLL,
  MOCK_JOBS,
  MOCK_BRANCHES,
} from "./constants";
import {
  Candidate,
  Role,
  CandidateStage,
  AuditLog,
  Message,
  Employee,
  Department,
  PayrollRecord,
  JobOpening,
  UserProfile,
  Branch,
} from "./types";
import { ToastProvider } from "./context/ToastContext";
import { PermissionContext } from "./context/PermissionContext";
import api from "./services/api";
import { jwtDecode } from "jwt-decode";

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  const [currentView, setCurrentView] = useState("dashboard");
  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");

  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [jobs, setJobs] = useState<JobOpening[]>(MOCK_JOBS);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [departments, setDepartments] =
    useState<Department[]>(MOCK_DEPARTMENTS);

  const [payrollRecords, setPayrollRecords] =
    useState<PayrollRecord[]>(MOCK_PAYROLL);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      const decoded: any = jwtDecode(token);

      const loggedUser = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
      };

      setUser(loggedUser);

      const load = async () => {
        const res = await api.get(`/RolePermission/user/${decoded.id}`);

        const codes = res.data.map((p: any) => `${p.module}.${p.action}`);

        setPermissions(codes);
      };

      load();
    }
  }, []);

  const handleLogin = async (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    const res = await api.get(`/RolePermission/user/${loggedInUser.id}`);
    const codes = res.data.map((p: any) => `${p.module}.${p.action}`);
    setPermissions(codes);
    setCurrentView("dashboard");
  };
  const [reloadCandidatesFlag, setReloadCandidatesFlag] = useState(false);

  const triggerReloadCandidates = () => {
    setReloadCandidatesFlag((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiry");

    setUser(null);
    setAuthView("login");
  };

  const handleUpdateCandidate = (updated: Candidate) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
    if (selectedCandidate?.id === updated.id) {
      setSelectedCandidate(updated);
    }
  };

  const handleAddCandidate = (newCandidate: Candidate) => {
    setCandidates((prev) => [newCandidate, ...prev]);
    setIsUploadModalOpen(false);
    addAuditLog(
      "Resume Upload",
      `Added new candidate: ${newCandidate.name}`,
      false,
    );
  };

  const handleApplyJob = (jobId: string, candidateData: Partial<Candidate>) => {
    const newCandidate: Candidate = {
      id: candidateData.id,
      jobId: jobId,
      name: candidateData.name || "Unknown",
      email: candidateData.email || "unknown@email.com",
      role: candidateData.role || "Applicant",
      stage: CandidateStage.NEW,
      experience: candidateData.experience || 0,
      skills: candidateData.skills || [],
      resumeSummary: candidateData.resumeSummary || "Applied via Job Portal",
      appliedDate: new Date().toISOString().split("T")[0],
    };
    setCandidates((prev) => [newCandidate, ...prev]);
    addAuditLog(
      "Job Application",
      `${newCandidate.name} applied for Job ID: ${jobId}`,
      false,
    );
  };

  const handleAddJob = (newJob: JobOpening) => {
    setJobs((prev) => [newJob, ...prev]);
    addAuditLog(
      "Job Creation",
      `Created new job opening: ${newJob.title}`,
      false,
    );
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees((prev) => [newEmployee, ...prev]);
    addAuditLog(
      "Onboarding",
      `Created new employee record: ${newEmployee.name}`,
      false,
    );
  };

  const handleAddDepartment = (newDept: Department) => {
    setDepartments((prev) => [...prev, newDept]);
    addAuditLog(
      "Org Management",
      `Created new department: ${newDept.name}`,
      false,
    );
  };

  const handleAddBranch = (newBranch: Branch) => {
    setBranches((prev) => [...prev, newBranch]);
    addAuditLog(
      "Branch Management",
      `Opened new branch: ${newBranch.name}`,
      false,
    );
  };

  const handleUpdateBranch = (updated: Branch) => {
    setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    addAuditLog(
      "Branch Management",
      `Updated branch details: ${updated.name}`,
      false,
    );
  };

  const handleDeleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
    addAuditLog("Branch Management", `Deleted branch ID: ${id}`, true);
  };

  const handleProcessPayroll = (processedIds: string[]) => {
    const today = new Date().toISOString().split("T")[0];
    setPayrollRecords((prev) =>
      prev.map((record) =>
        processedIds.includes(record.id)
          ? {
              ...record,
              status: "Processed",
              paymentDate: today,
              amountPaid: record.netPay,
            }
          : record,
      ),
    );
    addAuditLog(
      "Payroll",
      `Processed payroll payments for ${processedIds.length} employees`,
      false,
    );
  };

  const handleUpdatePayroll = (updatedRecord: PayrollRecord) => {
    setPayrollRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)),
    );
    addAuditLog(
      "Payroll Edit",
      `Updated payroll amounts for ${updatedRecord.employeeName}`,
      false,
    );
  };

  const handleGeneratePayroll = (period: string) => {
    // Check which employees already have a record for this period
    const existingIds = payrollRecords
      .filter((r) => r.period === period)
      .map((r) => r.employeeId);

    // Filter employees based on current branch context before generating payroll
    const contextEmployees =
      selectedBranchId === "all"
        ? employees
        : employees.filter((e) => e.branchId === selectedBranchId);

    const eligibleEmployees = contextEmployees.filter(
      (e) =>
        (e.status === "Active" || e.status === "On Leave") &&
        !existingIds.includes(e.id),
    );

    if (eligibleEmployees.length === 0) return;

    const newRecords: PayrollRecord[] = eligibleEmployees.map((e) => {
      let monthlyBase = 0;
      if (e.paymentFrequency === "Hourly")
        monthlyBase = Math.round(e.salary * 160);
      else if (e.paymentFrequency === "Daily")
        monthlyBase = Math.round(e.salary * 22);
      else if (e.paymentFrequency === "Weekly")
        monthlyBase = Math.round(e.salary * 4.33);
      else if (e.paymentFrequency === "Monthly") monthlyBase = e.salary;
      else monthlyBase = Math.round(e.salary / 12);

      const deductions = Math.round(monthlyBase * 0.22);
      const bonus = 0;
      const netPay = monthlyBase + bonus - deductions;

      return {
        id: `pay_${period.replace(" ", "")}_${e.id}`,
        employeeId: e.id,
        employeeName: e.name,
        department: e.department,
        period: period,
        baseSalary: monthlyBase,
        bonus: bonus,
        deductions: deductions,
        netPay: netPay,
        amountPaid: 0,
        status: "Pending",
      };
    });

    setPayrollRecords((prev) => [...prev, ...newRecords]);
    addAuditLog(
      "Payroll",
      `Generated ${newRecords.length} payroll records for ${period} (${selectedBranchId === "all" ? "All Branches" : "Current Branch"})`,
      true,
    );
  };

  const addAuditLog = (action: string, details: string, isRisk: boolean) => {
    const newLog: AuditLog = {
      id: `l${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: user?.name || "System",
      role: user?.role || Role.COMPANY_ADMIN,
      action,
      details,
      aiInvolved: true,
      riskLevel: isRisk ? "Medium" : "Low",
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleSendMessage = (newMessage: Message) => {
    setMessages((prev) => [newMessage, ...prev]);
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m)),
    );
  };

  // --- Filtering based on Branch Context ---
  // If selectedBranchId is 'all', show everything. Else filter.

  const visibleEmployees =
    selectedBranchId === "all"
      ? employees
      : employees.filter((e) => e.branchId === selectedBranchId);

  const visibleJobs =
    selectedBranchId === "all"
      ? jobs
      : jobs.filter((j) => j.branchId === selectedBranchId);

  // Candidates don't have direct branchId usually, but are linked to jobs which have branchId
  // We need to filter candidates whose jobId belongs to a job in the selected branch
  const visibleCandidates =
    selectedBranchId === "all"
      ? candidates
      : candidates.filter((c) => {
          if (!c.jobId) return true; // General app
          const job = jobs.find((j) => j.id === c.jobId);
          return job?.branchId === selectedBranchId;
        });

  const visibleDepartments =
    selectedBranchId === "all"
      ? departments
      : departments.filter((d) => d.branchId === selectedBranchId);

  // Filter payroll records by filtered employees
  const visiblePayroll = payrollRecords.filter((p) =>
    visibleEmployees.some((e) => e.id === p.employeeId),
  );

  const canAccess = (code: string) => {
    if (user?.role === Role.COMPANY_ADMIN || user?.role === Role.HR_ADMIN)
      return true;

    return permissions.includes(code);
  };

  
  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard role={user!.role} />; // Dashboard needs update to accept filtered stats props if we want deeper integration, but keeping simple for now
      case "branches":
        return (
          <BranchManagement
            branches={branches}
            employees={employees}
            onAddBranch={handleAddBranch}
            onUpdateBranch={handleUpdateBranch}
            onDeleteBranch={handleDeleteBranch}
          />
        );
      case "jobs":
        return (
          <JobPortal
            jobs={visibleJobs}
            currentUser={user!}
            applications={candidates}
            onApply={handleApplyJob}
          />
        );
      case "applications":
        return (
          <JobPortal
            jobs={visibleJobs}
            currentUser={user!}
            applications={candidates}
            onApply={handleApplyJob}
          />
        );
      case "recruitment":
        return (
          <RecruitmentBoard
            candidates={visibleCandidates}
            jobs={visibleJobs}
            reloadTrigger={reloadCandidatesFlag}
            onSelectCandidate={setSelectedCandidate}
            onUpdateStage={(c, stage) => {
              handleUpdateCandidate({ ...c, stage });
              addAuditLog("Stage Update", `Moved ${c.name} to ${stage}`, false);
            }}
            onUploadResume={() => setIsUploadModalOpen(true)}
            onAddJob={handleAddJob}
          />
        );
      case "schedule":
        return <InterviewSchedule />;
      case "hrops":
        return (
          <HROps
            role={user!.role}
            onSendMessage={handleSendMessage}
            payrollRecords={visiblePayroll}
            onProcessPayroll={handleProcessPayroll}
          />
        );
      case "compliance":
        return <Compliance logs={auditLogs} />;
      case "planner":
        return <RecruitmentPlanner />;
      case "department":
        return (
          <OrganizationManagement
            initialDepartments={visibleDepartments}
            branches={branches}
            selectedBranchId={selectedBranchId}
            onAddDepartment={handleAddDepartment}
          />
        );
      case "employees":
        return (
          <EmployeeManagement
            initialEmployees={visibleEmployees}
            branches={branches}
            departments={visibleDepartments}
            candidates={visibleCandidates}
            onAddEmployee={handleAddEmployee}
            selectedBranchId={selectedBranchId}
          />
        );
      case "reports":
        return <Reports />;
      case "salary":
        return <SalaryManagement />;
      case "payroll":
        return (
          <PayrollManagement
            employees={visibleEmployees}
            payrollRecords={visiblePayroll}
            onGeneratePayroll={handleGeneratePayroll}
            onProcessPayroll={handleProcessPayroll}
            onUpdatePayroll={handleUpdatePayroll}
          />
        );
      case "productivity":
        return <Productivity />;
      case "shifts":
        return <ShiftManagement />;
      case "attendance":
        return <AttendanceManagement />;
      case "messages":
        return (
          <MessageBox
            role={user!.role}
            messages={messages}
            onSendMessage={handleSendMessage}
            onMarkAsRead={handleMarkAsRead}
          />
        );
      case "settings":
        return <Settings role={user!.role} />;
      case "policies":
        return <PolicyManagement />;
      case "roles":
        return <RoleManagement />;
      case "onboarding":
        return (
          <OnboardingHub
            candidates={visibleCandidates}
            employees={visibleEmployees}
            onAddEmployee={handleAddEmployee}
          />
        );
      case "register_org":
        return <CompanyRegistration />;
      default:
        return <Dashboard role={user!.role} />;
    }
  };

  const currentUserId =
    user?.role === Role.HR_ADMIN || user?.role === Role.COMPANY_ADMIN
      ? "admin"
      : "e1";
  const unreadMessagesCount = messages.filter(
    (m) => m.recipientId === currentUserId && !m.isRead,
  ).length;

  return (
    <ToastProvider>
      {!user ? (
        authView === "login" ? (
          <Login
            onLogin={handleLogin}
            onSwitchToSignup={() => setAuthView("signup")}
          />
        ) : (
          <Signup
            onSignup={handleLogin}
            onSwitchToLogin={() => setAuthView("login")}
          />
        )
      ) : (
        <PermissionContext.Provider value={{ permissions, user }}>
          <Layout
            user={user}
            branches={branches}
            selectedBranchId={selectedBranchId}
            onSelectBranch={
              user.role === Role.COMPANY_ADMIN || user.role === Role.HR_ADMIN
                ? setSelectedBranchId
                : undefined
            }
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
                onCandidateCreated={() => {
                  triggerReloadCandidates();
                }}
                jobs={jobs}
              />
            )}
          </Layout>
        </PermissionContext.Provider>
      )}
    </ToastProvider>
  );
}

export default App;
