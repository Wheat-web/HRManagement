
export enum Role {
  COMPANY_ADMIN = 'Company Admin',
  HR_ADMIN = 'HR Admin',
  RECRUITER = 'Recruiter',
  MANAGER = 'Hiring Manager',
  EMPLOYEE = 'Employee',
  CANDIDATE = 'Candidate'
}

export enum CandidateStage {
  NEW = 'New Applied',
  SCREENING = 'AI Screening',
  INTERVIEW = 'Interview',
  OFFER = 'Offer',
  REJECTED = 'Rejected'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  // companyName: string;
  // avatarUrl?: string;
  // branchId?: string; // If user is restricted to a branch
}

export interface Branch {
  id: string;
  name: string;
  location: string; // Physical address string
  currency: string;
  timezone: string;
  headCount: number; // Calculated field
  manager: string;
  isHeadquarters?: boolean;
  isActive: boolean;
}

export interface JobOpening {
  id: number;
  title: string;
  department: number;
  location: string;
  branchId?: string;
  type: 'Full-time' | 'Contract' | 'Part-time' | 'Internship';
  status: 'Open' | 'Closed' | 'Draft';
  postedDate: string;
  hiringManager?: string;
}

export interface Candidate {
  id: number;
  jobId?: string; // Link to specific job
  name: string;
  role: string; // Display role (usually matches job title)
  stage: CandidateStage;
  email: string;
  experience: number;
  resumeSummary: string;
  matchScore?: number; // 0-100
  aiReasoning?: string;
  skills: string[];
  flags?: string[];
  appliedDate: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: Role;
  action: string;
  details: string;
  aiInvolved: boolean;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface PolicyDocument {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  contentSnippet: string;
  fullContent?: string; // Added for detail view
  isActive:boolean;
}

export interface HROpsRequest {
  id: string;
  type: 'Leave' | 'Payroll' | 'Policy' | 'Onboarding' | 'Advance Payment';
  status: 'Pending' | 'Approved' | 'Resolved' | 'Rejected';
  description: string;
  date: string;
  employeeName: string;
  amount?: number;
  repaymentMonths?: number;
  aiAssessment?: {
    recommendation: 'Approve' | 'Reject';
    reason: string;
    confidenceScore: number;
  };
}

export interface Department {
  id: number;
  name: string;
  manager: string;
  headCount: number;
  location: string;
  branchId: number;
  isActive: boolean;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00"
  color: string;
}

export type PaymentFrequency = 'Annual' | 'Monthly' | 'Weekly' | 'Daily' | 'Hourly';

export interface EmployeeDocument {
  id: string;
  name: string;
  type: 'PDF' | 'Image' | 'Doc' | 'Other';
  uploadDate: string;
  size?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: 'Active' | 'On Leave' | 'Terminated' | 'Onboarding';
  joinDate: string;
  salary: number; // This is now the rate based on paymentFrequency
  paymentFrequency: PaymentFrequency; 
  currency: string;
  location: string;
  branchId: string; // Link to Branch
  shiftId: string; // Link to Shift
  
  // Expanded Fields
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  managerId?: string;
  
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode?: string;
  };

  documents?: EmployeeDocument[];
  customAttributes?: Record<string, string>; // Flexible fields
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  period: string; // e.g., "Oct 2023"
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;       // The total amount Credited/Due
  amountPaid: number;   // The amount actually Paid
  status: 'Processed' | 'Pending' | 'Hold' | 'Partial';
  paymentDate?: string;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: 'Annual' | 'Sick' | 'Unpaid' | 'Maternity';
  startDate: string;
  endDate: string;
  days: number;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface RecruitmentPlan {
  timeline: string;
  budgetEstimate: string;
  summary: string;
  hiringPhases: {
    phaseName: string;
    strategy: string;
    roles: { title: string; count: number; seniority: string }[];
  }[];
}

export interface CompensationChange {
  id: string;
  employeeId: string;
  date: string;
  type: 'Structure Change' | 'Bonus' | 'Overtime' | 'Correction';
  amount: number; // For bonus or OT total
  previousSalary?: number;
  newSalary?: number; // For structure change
  newFrequency?: PaymentFrequency;
  reason: string;
  approvedBy: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  period: string; // e.g. "Q3 2023"
  metrics: {
    tasksCompleted: number;
    attendance: number; // percentage
    qualityScore: number; // 0-10
  };
  aiScore: number; // 0-100
  aiAnalysis: string;
  managerScore: number; // 0-100
  managerFeedback: string;
  finalScore: number;
  status: 'Pending AI' | 'Draft' | 'Finalized';
}

export interface LetterTemplate {
  id: string;
  title: string;
  subject: string;
  bodyTemplate: string; // Contains placeholders like {{name}}, {{role}}
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM
  checkOut?: string; // HH:MM
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  hoursWorked?: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string; // 'admin' or employeeId
  recipientName: string;
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  type: 'General' | 'Template Request' | 'Letter';
}

export interface EmailIntegration {
  provider: 'Gmail' | 'Outlook' | 'SMTP';
  email: string;
  status: 'Connected' | 'Disconnected' | 'Error';
  lastSync: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  role: string;
  interviewerId: string;
  interviewerName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  type: 'Screening' | 'Technical' | 'System Design' | 'Cultural Fit' | 'Final';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  meetingLink?: string;
  notes?: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  isSystem: boolean; // Cannot delete system roles
  permissions: string[]; // List of permission IDs
}

export interface OnboardingTask {
  id: string;
  category: 'IT' | 'HR' | 'Training' | 'Team' | 'Admin';
  task: string;
  isCompleted: boolean;
}

export interface OnboardingPhase {
  id: string;
  name: string; // "Pre-boarding", "Day 1", "Week 1", "Month 1"
  tasks: OnboardingTask[];
}

export interface OnboardingPlan {
  employeeId: string;
  employeeName: string;
  role: string;
  phases: OnboardingPhase[];
  welcomeMessage: string;
}
