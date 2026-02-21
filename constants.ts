import { PermissionNode, Candidate, Role, AuditLog, PolicyDocument, HROpsRequest, Department, Employee, PayrollRecord, LeaveRecord, CompensationChange, PerformanceReview, LetterTemplate, Shift, AttendanceRecord, Message, Interview, RoleDefinition, JobOpening, Branch } from "./types";

export const MOCK_BRANCHES: Branch[] = [
  // { id: 'b1', name: 'HQ - New York', location: 'New York, USA', currency: 'USD', timezone: 'EST', headCount: 45, manager: 'Michael Scott', isHeadquarters: true },
  // { id: 'b2', name: 'Midwest Hub', location: 'Chicago, IL', currency: 'USD', timezone: 'CST', headCount: 22, manager: 'Dwight S.' },
  // { id: 'b3', name: 'West Coast', location: 'San Francisco, CA', currency: 'USD', timezone: 'PST', headCount: 12, manager: 'David Chen' },
  // { id: 'b4', name: 'Remote Global', location: 'Remote', currency: 'USD', timezone: 'UTC', headCount: 15, manager: 'Sarah Connor' },
];

export const MOCK_SHIFTS: Shift[] = [
  { id: 'sh1', name: 'General Shift', startTime: '09:00', endTime: '18:00', color: 'bg-blue-100 text-blue-800' },
  { id: 'sh2', name: 'Morning Shift', startTime: '06:00', endTime: '15:00', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'sh3', name: 'Night Shift', startTime: '22:00', endTime: '07:00', color: 'bg-purple-100 text-purple-800' },
];

export const MOCK_JOBS: JobOpening[] = [
  // { id: 'j1', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'New York (Hybrid)', branchId: 'b1', type: 'Full-time', status: 'Open', postedDate: '2023-10-01' },
  // { id: 'j2', title: 'Product Manager', department: 'Product', location: 'Remote', branchId: 'b4', type: 'Full-time', status: 'Open', postedDate: '2023-10-05' },
  // { id: 'j3', title: 'UX Designer', department: 'Product', location: 'Remote', branchId: 'b4', type: 'Contract', status: 'Open', postedDate: '2023-10-10' },
  // { id: 'j4', title: 'Data Scientist', department: 'Data', location: 'Chicago', branchId: 'b2', type: 'Full-time', status: 'Draft', postedDate: '2023-10-28' },
];

export const MOCK_CANDIDATES: Candidate[] = [
  // {
  //   id: 'c1',
  //   jobId: 'j1',
  //   name: 'Alice Johnson',
  //   role: 'Senior Frontend Engineer',
  //   stage: CandidateStage.NEW,
  //   email: 'alice.j@example.com',
  //   experience: 6,
  //   resumeSummary: 'Experienced React developer with 6 years in fintech. Expert in TypeScript, Redux, and D3.js. Previously led a team of 4 at TechCorp.',
  //   skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
  //   appliedDate: '2023-10-25',
  // },
  // {
  //   id: 'c2',
  //   jobId: 'j1',
  //   name: 'Bob Smith',
  //   role: 'Senior Frontend Engineer',
  //   stage: CandidateStage.SCREENING,
  //   email: 'bob.s@example.com',
  //   experience: 3,
  //   resumeSummary: 'Frontend developer focused on Vue.js and Angular. Some React exposure. Strong UI/UX background.',
  //   skills: ['Vue.js', 'CSS', 'Figma'],
  //   matchScore: 65,
  //   aiReasoning: 'Candidate has strong UI skills but lacks deep React/TypeScript experience required for the Senior role.',
  //   appliedDate: '2023-10-24',
  // },
  // {
  //   id: 'c3',
  //   jobId: 'j2',
  //   name: 'Charlie Davis',
  //   role: 'Product Manager',
  //   stage: CandidateStage.INTERVIEW,
  //   email: 'charlie.d@example.com',
  //   experience: 8,
  //   resumeSummary: 'Product veteran with B2B SaaS experience. Strong Agile background.',
  //   skills: ['Agile', 'JIRA', 'SQL', 'Strategy'],
  //   matchScore: 92,
  //   aiReasoning: 'Excellent fit. Deep B2B SaaS experience aligns perfectly with current roadmap.',
  //   appliedDate: '2023-10-20',
  // },
  // {
  //   id: 'c4',
  //   jobId: 'j3',
  //   name: 'Diana Prince',
  //   role: 'UX Designer',
  //   stage: CandidateStage.OFFER,
  //   email: 'diana.p@example.com',
  //   experience: 5,
  //   resumeSummary: 'Award-winning UX designer. Portfolio includes major e-commerce redesigns.',
  //   skills: ['Figma', 'Prototyping', 'User Research'],
  //   matchScore: 95,
  //   appliedDate: '2023-10-15',
  // }
];

export const MOCK_POLICIES: PolicyDocument[] = [
  // { 
  //   id: 'p1', 
  //   title: 'Remote Work Policy', 
  //   category: 'General', 
  //   lastUpdated: '2023-09-01', 
  //   contentSnippet: 'Employees may work remotely up to 3 days a week. Core hours must be maintained from 10 AM to 4 PM.',
  //   fullContent: 'Employees are permitted to work remotely up to 3 days per week (Tuesday, Wednesday, and Thursday are recommended in-office days). \n\nCore hours of 10 AM to 4 PM your local time must be maintained regardless of location. \n\nEmployees must ensure they have a stable internet connection and a quiet workspace. VPN usage is mandatory for accessing internal systems.'
  // },
  // { 
  //   id: 'p2', 
  //   title: 'Expense Reimbursement', 
  //   category: 'Finance', 
  //   lastUpdated: '2023-08-15', 
  //   contentSnippet: 'All travel expenses must be submitted within 30 days. Receipts are required for amounts over $25.',
  //   fullContent: '1. All business-related expenses must be pre-approved by your manager.\n2. Claims must be submitted via the HR Portal within 30 days of the expense date.\n3. Receipts are mandatory for any single expense exceeding $25.\n4. Meal allowance is capped at $50/day during travel.'
  // },
  // { 
  //   id: 'p3', 
  //   title: 'Code of Conduct', 
  //   category: 'Legal', 
  //   lastUpdated: '2023-01-10', 
  //   contentSnippet: 'We expect all employees to treat others with respect. Harassment of any kind is strictly prohibited.',
  //   fullContent: 'Our company is committed to providing a safe, inclusive, and respectful workplace. \n\n- Discrimination or harassment based on race, color, religion, gender, or orientation is strictly prohibited and grounds for immediate termination.\n- Conflicts of interest must be disclosed to HR immediately.\n- Company assets must be used for business purposes only.'
  // },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'l1', timestamp: '2023-10-27 10:30 AM', user: 'AI Agent', role: Role.COMPANY_ADMIN, action: 'Score Calculation', details: 'Calculated score for Bob Smith: 65/100', aiInvolved: true, riskLevel: 'Low' },
  { id: 'l2', timestamp: '2023-10-27 11:15 AM', user: 'Sarah (Recruiter)', role: Role.RECRUITER, action: 'Stage Change', details: 'Moved Charlie Davis to Interview', aiInvolved: false, riskLevel: 'Low' },
  { id: 'l3', timestamp: '2023-10-27 02:45 PM', user: 'Mike (Manager)', role: Role.MANAGER, action: 'Override AI Reject', details: 'Manually approved candidate flagged as low match', aiInvolved: true, riskLevel: 'Medium' },
];

export const MOCK_HR_REQUESTS: HROpsRequest[] = [
  { id: 'r1', type: 'Leave', status: 'Approved', description: 'Sick leave for Oct 24', date: 'Oct 23', employeeName: 'Jane Doe' },
  { id: 'r2', type: 'Payroll', status: 'Pending', description: 'Tax code discrepancy inquiry', date: 'Oct 26', employeeName: 'John Smith' },
  { id: 'r3', type: 'Leave', status: 'Pending', description: 'Annual Leave Dec 20-30', date: 'Oct 27', employeeName: 'Alice Johnson' },
  { id: 'r4', type: 'Onboarding', status: 'Pending', description: 'Laptop Provisioning for New Hire', date: 'Oct 28', employeeName: 'System' },
  { id: 'r5', type: 'Advance Payment', status: 'Pending', description: 'Emergency medical expense', date: 'Oct 28', employeeName: 'Jane Doe', amount: 2000, repaymentMonths: 3 },
];

export const MOCK_DEPARTMENTS: Department[] = [
  // { id: 'd1', name: 'Engineering', manager: 'David Chen', headCount: 24, location: 'New York', branchId: 'b1' },
  // { id: 'd2', name: 'Product', manager: 'Sarah Connor', headCount: 8, location: 'New York', branchId: 'b1' },
  // { id: 'd3', name: 'HR & Ops', manager: 'Michael Scott', headCount: 4, location: 'Remote', branchId: 'b4' },
  // { id: 'd4', name: 'Sales', manager: 'Dwight S.', headCount: 15, location: 'Chicago', branchId: 'b2' },
  // { id: 'd5', name: 'Marketing', manager: 'Jim Halpert', headCount: 10, location: 'Scranton', branchId: 'b1' },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { 
    id: 'e1', name: 'Jane Doe', role: 'Software Engineer', department: 'Engineering', email: 'jane@example.com', status: 'Active', joinDate: '2022-03-15', salary: 120000, paymentFrequency: 'Annual', currency: 'USD', location: 'New York', branchId: 'b1', shiftId: 'sh1', customAttributes: { 'T-Shirt Size': 'M', 'Work Laptop': 'MacBook Pro 16' },
    phone: '+1 (555) 123-4567',
    address: '123 Tech Avenue, Brooklyn, NY 11201',
    dob: '1992-05-14',
    gender: 'Female',
    employmentType: 'Full-time',
    emergencyContact: { name: 'John Doe', relation: 'Spouse', phone: '+1 (555) 987-6543' },
    bankDetails: { bankName: 'Chase Bank', accountName: 'Jane Doe', accountNumber: '****5678', swiftCode: 'CHASUS33' },
    documents: [
      { id: 'doc1', name: 'Employment Contract.pdf', type: 'PDF', uploadDate: '2022-03-10', size: '2.4 MB' },
      { id: 'doc2', name: 'ID Proof.jpg', type: 'Image', uploadDate: '2022-03-12', size: '1.1 MB' }
    ]
  },
  { 
    id: 'e2', name: 'John Smith', role: 'Sales Rep', department: 'Sales', email: 'john@example.com', status: 'Active', joinDate: '2021-06-01', salary: 45, paymentFrequency: 'Hourly', currency: 'USD', location: 'Chicago', branchId: 'b2', shiftId: 'sh1', customAttributes: { 'T-Shirt Size': 'L' },
    phone: '+1 (555) 222-3333',
    employmentType: 'Contract',
    documents: []
  },
  { id: 'e3', name: 'Emily Blunt', role: 'HR Manager', department: 'HR & Ops', email: 'emily@example.com', status: 'On Leave', joinDate: '2020-01-10', salary: 95000, paymentFrequency: 'Annual', currency: 'USD', location: 'Remote', branchId: 'b4', shiftId: 'sh2', employmentType: 'Full-time' },
  { id: 'e4', name: 'Chris Evans', role: 'Product Owner', department: 'Product', email: 'chris@example.com', status: 'Active', joinDate: '2023-02-20', salary: 135000, paymentFrequency: 'Annual', currency: 'USD', location: 'New York', branchId: 'b1', shiftId: 'sh1', employmentType: 'Full-time' },
  { id: 'e5', name: 'Michael Scott', role: 'Regional Manager', department: 'Sales', email: 'michael@example.com', status: 'Active', joinDate: '2010-04-15', salary: 110000, paymentFrequency: 'Annual', currency: 'USD', location: 'Scranton', branchId: 'b1', shiftId: 'sh1', employmentType: 'Full-time' },
  { id: 'e6', name: 'Pam Beesly', role: 'Office Administrator', department: 'HR & Ops', email: 'pam@example.com', status: 'Active', joinDate: '2012-09-01', salary: 25, paymentFrequency: 'Hourly', currency: 'USD', location: 'Scranton', branchId: 'b1', shiftId: 'sh2', employmentType: 'Full-time' },
  { id: 'e7', name: 'Jim Halpert', role: 'Marketing Manager', department: 'Marketing', email: 'jim@example.com', status: 'Active', joinDate: '2011-05-20', salary: 8750, paymentFrequency: 'Monthly', currency: 'USD', location: 'Scranton', branchId: 'b1', shiftId: 'sh1', employmentType: 'Full-time' },
  { id: 'e8', name: 'Stanley Hudson', role: 'Sales Rep', department: 'Sales', email: 'stanley@example.com', status: 'Terminated', joinDate: '2005-02-14', salary: 1800, paymentFrequency: 'Weekly', currency: 'USD', location: 'Chicago', branchId: 'b2', shiftId: 'sh3', employmentType: 'Full-time' },
];

export const MOCK_PAYROLL: PayrollRecord[] = [
  { id: 'pay1', employeeId: 'e1', employeeName: 'Jane Doe', department: 'Engineering', period: 'Oct 2023', baseSalary: 10000, bonus: 0, deductions: 2500, netPay: 7500, amountPaid: 7500, status: 'Processed', paymentDate: '2023-10-31' },
  { id: 'pay2', employeeId: 'e2', employeeName: 'John Smith', department: 'Sales', period: 'Oct 2023', baseSalary: 7083, bonus: 1500, deductions: 1800, netPay: 6783, amountPaid: 6783, status: 'Processed', paymentDate: '2023-10-31' },
  { id: 'pay3', employeeId: 'e3', employeeName: 'Emily Blunt', department: 'HR & Ops', period: 'Oct 2023', baseSalary: 7916, bonus: 0, deductions: 2000, netPay: 5916, amountPaid: 0, status: 'Hold' },
  { id: 'pay4', employeeId: 'e4', employeeName: 'Chris Evans', department: 'Product', period: 'Oct 2023', baseSalary: 11250, bonus: 500, deductions: 3000, netPay: 8750, amountPaid: 4000, status: 'Partial' }, // Partial payment
  { id: 'pay5', employeeId: 'e1', employeeName: 'Jane Doe', department: 'Engineering', period: 'Sep 2023', baseSalary: 10000, bonus: 2000, deductions: 2500, netPay: 9500, amountPaid: 9500, status: 'Processed', paymentDate: '2023-09-30' },
  { id: 'pay6', employeeId: 'e2', employeeName: 'John Smith', department: 'Sales', period: 'Sep 2023', baseSalary: 7083, bonus: 1000, deductions: 1800, netPay: 6283, amountPaid: 6283, status: 'Processed', paymentDate: '2023-09-30' },
];

export const MOCK_LEAVES: LeaveRecord[] = [
  { id: 'lv1', employeeId: 'e3', employeeName: 'Emily Blunt', department: 'HR & Ops', leaveType: 'Maternity', startDate: '2023-10-01', endDate: '2024-01-01', days: 90, status: 'Approved' },
  { id: 'lv2', employeeId: 'e1', employeeName: 'Jane Doe', department: 'Engineering', leaveType: 'Sick', startDate: '2023-10-24', endDate: '2023-10-24', days: 1, status: 'Approved' },
  { id: 'lv3', employeeId: 'e4', employeeName: 'Chris Evans', department: 'Product', leaveType: 'Annual', startDate: '2023-12-20', endDate: '2023-12-30', days: 10, status: 'Pending' },
  { id: 'lv4', employeeId: 'e2', employeeName: 'John Smith', department: 'Sales', leaveType: 'Sick', startDate: '2023-09-15', endDate: '2023-09-16', days: 2, status: 'Approved' },
  { id: 'lv5', employeeId: 'e8', employeeName: 'Stanley Hudson', department: 'Sales', leaveType: 'Annual', startDate: '2023-08-01', endDate: '2023-08-14', days: 14, status: 'Approved' },
];

export const MOCK_COMPENSATION_CHANGES: CompensationChange[] = [
  { id: 'cc1', employeeId: 'e1', date: '2023-01-15', type: 'Structure Change', amount: 0, previousSalary: 110000, newSalary: 120000, newFrequency: 'Annual', reason: 'Annual Performance Review', approvedBy: 'David Chen' },
  { id: 'cc2', employeeId: 'e1', date: '2023-06-30', type: 'Bonus', amount: 5000, reason: 'Project Completion Bonus', approvedBy: 'David Chen' },
  { id: 'cc3', employeeId: 'e2', date: '2023-03-01', type: 'Structure Change', amount: 0, previousSalary: 42, newSalary: 45, newFrequency: 'Hourly', reason: 'Market Adjustment', approvedBy: 'Dwight S.' },
];

export const MOCK_PERFORMANCE_REVIEWS: PerformanceReview[] = [
  { 
    id: 'pr1', 
    employeeId: 'e1', 
    employeeName: 'Jane Doe', 
    role: 'Software Engineer', 
    department: 'Engineering',
    period: 'Q3 2023',
    metrics: { tasksCompleted: 42, attendance: 98, qualityScore: 9.2 },
    aiScore: 92,
    aiAnalysis: 'Jane has shown exceptional velocity this quarter. Code quality remains high with minimal bugs reported post-merge. Attendance is perfect.',
    managerScore: 94,
    managerFeedback: 'Great leadership on the migration project.',
    finalScore: 93,
    status: 'Finalized'
  },
  { 
    id: 'pr2', 
    employeeId: 'e2', 
    employeeName: 'John Smith', 
    role: 'Sales Rep', 
    department: 'Sales',
    period: 'Q3 2023',
    metrics: { tasksCompleted: 15, attendance: 90, qualityScore: 7.5 },
    aiScore: 78,
    aiAnalysis: 'John met 80% of sales quota. Attendance is satisfactory but consistency in follow-ups needs improvement based on CRM logs.',
    managerScore: 80,
    managerFeedback: 'Needs to focus on closing high-value deals.',
    finalScore: 80,
    status: 'Draft'
  },
  { 
    id: 'pr3', 
    employeeId: 'e4', 
    employeeName: 'Chris Evans', 
    role: 'Product Owner', 
    department: 'Product',
    period: 'Q3 2023',
    metrics: { tasksCompleted: 28, attendance: 95, qualityScore: 8.8 },
    aiScore: 0,
    aiAnalysis: '',
    managerScore: 0,
    managerFeedback: '',
    finalScore: 0,
    status: 'Pending AI'
  }
];

export const MOCK_LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: 't1',
    title: 'Employment Verification',
    subject: 'Employment Verification - {{name}}',
    bodyTemplate: 'To Whom It May Concern,\n\nThis letter confirms that {{name}} is currently employed at PeopleCore as a {{role}} since {{joinDate}}. They are in good standing.\n\nPlease contact HR for further verification.\n\nSincerely,\nHR Department'
  },
  {
    id: 't2',
    title: 'Salary Certificate',
    subject: 'Salary Certificate Request',
    bodyTemplate: 'To Whom It May Concern,\n\nWe certify that {{name}} holds the position of {{role}} with an annual base salary of {{currency}} {{salary}}.\n\nThis certificate is issued upon the employee\'s request.\n\nBest regards,\nPayroll Team'
  },
  {
    id: 't3',
    title: 'Visa Support Letter',
    subject: 'Visa Support Request - {{name}}',
    bodyTemplate: 'Dear Consulate Officer,\n\nWe confirm that {{name}} acts as {{role}} at our company and plans to travel for business/leisure. They will return to resume their duties on [Date].\n\nWe appreciate your assistance.\n\nSincerely,\nHR Manager'
  },
  {
    id: 't4',
    title: 'Job Offer Letter',
    subject: 'Job Offer - {{role}} at PeopleCore',
    bodyTemplate: 'Dear {{name}},\n\nWe are pleased to offer you the position of {{role}} at PeopleCore. Your start date is [Start Date].\n\nYour annual starting salary will be {{currency}} {{salary}}. We look forward to having you on the team!\n\nSincerely,\nHiring Manager'
  },
  {
    id: 't5',
    title: 'Promotion Letter',
    subject: 'Congratulations on your Promotion!',
    bodyTemplate: 'Dear {{name}},\n\nWe are thrilled to announce your promotion to {{role}}, effective immediately.\n\nYour new annual salary will be {{currency}} {{salary}}. Thank you for your hard work and dedication.\n\nBest,\nHR Team'
  }
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att1', employeeId: 'e1', employeeName: 'Jane Doe', date: '2023-10-27', checkIn: '08:55', checkOut: '17:30', status: 'Present', hoursWorked: 8.5 },
  { id: 'att2', employeeId: 'e2', employeeName: 'John Smith', date: '2023-10-27', checkIn: '09:15', checkOut: '17:00', status: 'Late', hoursWorked: 7.75 },
  { id: 'att3', employeeId: 'e1', employeeName: 'Jane Doe', date: '2023-10-26', checkIn: '09:00', checkOut: '18:00', status: 'Present', hoursWorked: 9 },
  { id: 'att4', employeeId: 'e2', employeeName: 'John Smith', date: '2023-10-26', checkIn: '09:05', checkOut: '17:15', status: 'Present', hoursWorked: 8.1 },
  { id: 'att5', employeeId: 'e4', employeeName: 'Chris Evans', date: '2023-10-27', checkIn: '00:00', status: 'Absent', hoursWorked: 0 },
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'e1', senderName: 'Jane Doe', recipientId: 'admin', recipientName: 'HR Admin', subject: 'Inquiry about holiday schedule', body: 'Hi HR, could you please confirm if Dec 24th is a half-day?', date: '2023-10-27', isRead: false, type: 'General' },
  { id: 'm2', senderId: 'e2', senderName: 'John Smith', recipientId: 'admin', recipientName: 'HR Admin', subject: 'Visa Support Request - John Smith', body: 'Please see attached request for my upcoming travel.', date: '2023-10-26', isRead: true, type: 'Template Request' },
  { id: 'm3', senderId: 'admin', senderName: 'HR Admin', recipientId: 'e1', recipientName: 'Jane Doe', subject: 'RE: Inquiry about holiday schedule', body: 'Hi Jane,\n\nYes, Dec 24th is a half-day closing at 1 PM.\n\nBest,\nHR', date: '2023-10-27', isRead: true, type: 'General' },
];

const TODAY = new Date().toISOString().split('T')[0];
export const MOCK_INTERVIEWS: Interview[] = [
  // { id: 'i1', candidateId: 'c3', candidateName: 'Charlie Davis', role: 'Product Manager', interviewerId: 'e4', interviewerName: 'Chris Evans', date: TODAY, time: '14:00', duration: 60, type: 'Cultural Fit', status: 'Scheduled', meetingLink: 'https://meet.google.com/abc-defg-hij' },
  // { id: 'i2', candidateId: 'c2', candidateName: 'Bob Smith', role: 'Senior Frontend Engineer', interviewerId: 'e1', interviewerName: 'Jane Doe', date: TODAY, time: '10:00', duration: 45, type: 'Technical', status: 'Completed', meetingLink: 'https://meet.google.com/xyz-uvw-rst' },
  // { id: 'i3', candidateId: 'c4', candidateName: 'Diana Prince', role: 'UX Designer', interviewerId: 'e1', interviewerName: 'Jane Doe', date: '2023-10-30', time: '11:00', duration: 60, type: 'Technical', status: 'Scheduled', meetingLink: 'https://meet.google.com/qwe-rty-uio' },
];

const standardActions = (module: string) => [
  { id: `${module}.view`, label: "View" },
  { id: `${module}.create`, label: "Create" },
  { id: `${module}.edit`, label: "Edit" },
  { id: `${module}.delete`, label: "Delete" },
  { id: `${module}.export`, label: "Export" }
];

export const PERMISSION_TREE: PermissionNode[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    children: [
      { id: "dashboard.view", label: "View" }
    ]
  },
  {
    id: "recruitment",
    label: "Recruitment",
    children: standardActions("recruitment")
  },
  {
    id: "interviews",
    label: "Interviews",
    children: standardActions("interviews")
  },
  {
    id: "onboarding",
    label: "Onboarding Hub",
    children: standardActions("onboarding")
  },
  {
    id: "payroll",
    label: "Payroll",
    children: standardActions("payroll")
  },
  {
    id: "salary",
    label: "Salary Management",
    children: standardActions("salary")
  },
  {
    id: "productivity",
    label: "Productivity",
    children: standardActions("productivity")
  },
  {
    id: "branch",
    label: "Branch Management",
    children: standardActions("branch")
  },
  {
    id: "employees",
    label: "Employee Directory",
    children: standardActions("employees")
  },
  {
    id: "shift",
    label: "Shift Management",
    children: standardActions("shift")
  },
  {
    id: "attendance",
    label: "Attendance",
    children: standardActions("attendance")
  },
  {
    id: "mail",
    label: "Official Mail",
    children: standardActions("mail")
  },
  {
    id: "planner",
    label: "Recruitment Planner",
    children: standardActions("planner")
  },
  {
    id: "department",
    label: "Department",
    children: standardActions("department")
  },
  {
    id: "roles",
    label: "Roles & Permissions",
    children: [
      { id: "roles.view", label: "View" },
      { id: "roles.manage", label: "Manage Users & Roles" }
    ]
  },
  {
    id: "reports",
    label: "Reports",
    children: [
      { id: "reports.view", label: "View" },
      { id: "reports.export", label: "Export" }
    ]
  },
  {
    id: "hr_operations",
    label: "HR Operations",
    children: standardActions("hr_operations")
  },
  {
    id: "compliance",
    label: "Compliance & Audit",
    children: standardActions("compliance")
  },
  {
    id: "policies",
    label: "Policies",
    children: standardActions("policies")
  },
  {
    id: "settings",
    label: "Settings",
    children: standardActions("settings")
  },
];

export const MOCK_ROLE_DEFINITIONS: RoleDefinition[] = [
  { 
    id: 'r_admin', 
    name: 'HR Admin', 
    description: 'Full system access to all modules and settings.', 
    usersCount: 2, 
    isSystem: true,
    permissions: ['all'] 
  },
  { 
    id: 'r_recruiter', 
    name: 'Recruiter', 
    description: 'Can manage candidates, schedule interviews, and view job requisitions.', 
    usersCount: 3, 
    isSystem: true,
    permissions: ['view_candidates', 'edit_candidates', 'schedule_interviews', 'view_jobs'] 
  },
  { 
    id: 'r_manager', 
    name: 'Hiring Manager', 
    description: 'Can view candidates, conduct interviews, and manage team performance.', 
    usersCount: 8, 
    isSystem: true,
    permissions: ['view_candidates', 'conduct_interviews', 'view_team_performance', 'approve_leaves'] 
  },
  { 
    id: 'r_employee', 
    name: 'Employee', 
    description: 'Standard access to personal dashboard, leaves, and payroll.', 
    usersCount: 45, 
    isSystem: true,
    permissions: ['view_self', 'request_leave', 'view_payslips'] 
  },
  {
    id: 'r_intern',
    name: 'Intern',
    description: 'Limited access for temporary staff.',
    usersCount: 5,
    isSystem: false,
    permissions: ['view_self']
  }
];