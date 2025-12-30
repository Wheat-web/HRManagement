
export enum Role {
  ADMIN = 'HR Admin',
  RECRUITER = 'Recruiter',
  MANAGER = 'Hiring Manager',
  EMPLOYEE = 'Employee'
}

export enum CandidateStage {
  NEW = 'New Applied',
  SCREENING = 'AI Screening',
  INTERVIEW = 'Interview',
  OFFER = 'Offer',
  REJECTED = 'Rejected'
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
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
  id: string;
  name: string;
  manager: string;
  headCount: number;
  location: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00"
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  joinDate: string;
  salary: number;
  currency: string;
  location: string;
  shiftId: string; // Link to Shift
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
  type: 'Increment' | 'Bonus' | 'Correction';
  amount: number; // For bonus
  previousSalary?: number;
  newSalary?: number; // For increment
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