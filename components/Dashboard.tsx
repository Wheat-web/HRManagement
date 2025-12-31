
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import { Users, Clock, CheckCircle, AlertTriangle, TrendingUp, Calendar, FileText, Briefcase, User, Mail, MapPin, Activity, DollarSign, Building2, UserPlus, ArrowUpRight, ArrowRight } from 'lucide-react';
import { Role } from '../types';
import { MOCK_EMPLOYEES, MOCK_HR_REQUESTS, MOCK_DEPARTMENTS } from '../constants';

interface DashboardProps {
  role: Role;
}

const data = [
  { name: 'Mon', applicants: 4, interviews: 2 },
  { name: 'Tue', applicants: 7, interviews: 3 },
  { name: 'Wed', applicants: 5, interviews: 5 },
  { name: 'Thu', applicants: 12, interviews: 4 },
  { name: 'Fri', applicants: 9, interviews: 6 },
];

const complianceData = [
  { name: 'Auto-Approved', value: 45, color: '#4f46e5' },
  { name: 'Human Review', value: 30, color: '#06b6d4' },
  { name: 'Overridden', value: 5, color: '#f59e0b' },
];

const StatCard = ({ title, value, icon, change, color, subtext }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
        {React.cloneElement(icon, { size: 20, className: color.replace('bg-', 'text-') })}
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className="text-emerald-600 font-medium flex items-center gap-1">
        <TrendingUp size={14} /> {change}
      </span>
      {subtext && <span className="text-slate-400 ml-2">{subtext}</span>}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  // Employee View
  if (role === Role.EMPLOYEE) {
    const currentUser = MOCK_EMPLOYEES.find(e => e.id === 'e1') || MOCK_EMPLOYEES[0];
    const recentRequests = MOCK_HR_REQUESTS
      .filter(r => r.employeeName === currentUser.name)
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {currentUser.name.split(' ')[0]}</h1>
          <p className="text-slate-500">Here's your personal dashboard.</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Leave Balance" value="14 Days" change="Updated today" icon={<Clock />} color="bg-emerald-500" />
          <StatCard title="Payslips" value="Oct 2023" change="Available" icon={<FileText />} color="bg-indigo-500" />
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-lg text-white col-span-1 md:col-span-1">
            <h3 className="font-bold text-lg mb-2">Upcoming Review</h3>
            <p className="text-indigo-100 text-sm mb-4">Your annual performance review is scheduled for Nov 15th.</p>
            <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50">Prepare Self-Review</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Details */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User size={18} /> My Profile
             </h3>
             <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-500 mb-3">
                   {currentUser.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
                <p className="text-slate-500 text-sm">{currentUser.role}</p>
                <span className={`mt-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    currentUser.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                    {currentUser.status}
                </span>
             </div>
             
             <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-50">
                   <span className="text-slate-500 flex items-center gap-2"><Briefcase size={14} /> Department</span>
                   <span className="font-medium text-slate-700">{currentUser.department}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                   <span className="text-slate-500 flex items-center gap-2"><Mail size={14} /> Email</span>
                   <span className="font-medium text-slate-700 truncate max-w-[150px]">{currentUser.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                   <span className="text-slate-500 flex items-center gap-2"><MapPin size={14} /> Location</span>
                   <span className="font-medium text-slate-700">{currentUser.location}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-50">
                   <span className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> Joined</span>
                   <span className="font-medium text-slate-700">{currentUser.joinDate}</span>
                </div>
             </div>
          </div>

          {/* Activity History */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity size={18} /> Recent Activity History
             </h3>
             <div className="space-y-4">
                {recentRequests.length === 0 ? (
                   <p className="text-slate-400 text-center py-6">No recent activity.</p>
                ) : (
                   recentRequests.map(req => (
                      <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                         <div className="flex items-start gap-3">
                            <div className={`mt-1 p-2 rounded-lg ${
                               req.type === 'Leave' ? 'bg-blue-100 text-blue-600' :
                               req.type === 'Advance Payment' ? 'bg-amber-100 text-amber-600' :
                               'bg-purple-100 text-purple-600'
                            }`}>
                               {req.type === 'Leave' ? <Calendar size={16} /> : 
                                req.type === 'Advance Payment' ? <TrendingUp size={16} /> : 
                                <FileText size={16} />}
                            </div>
                            <div>
                               <p className="font-semibold text-slate-800 text-sm">{req.type} Request</p>
                               <p className="text-xs text-slate-500">{req.description}</p>
                               {req.amount && (
                                  <p className="text-xs font-mono font-medium text-slate-700 mt-1">Amount: {req.amount.toLocaleString()}</p>
                               )}
                            </div>
                         </div>
                         <div className="text-right">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-1 ${
                               req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                               req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                               'bg-amber-100 text-amber-700'
                            }`}>
                               {req.status}
                            </span>
                            <p className="text-xs text-slate-400">{req.date}</p>
                         </div>
                      </div>
                   ))
                )}
                <button className="w-full text-center text-sm text-indigo-600 font-medium hover:underline pt-2">
                   View All History
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  if (role === Role.COMPANY_ADMIN || role === Role.HR_ADMIN) {
    const totalEmployees = MOCK_EMPLOYEES.length;
    const activeEmployees = MOCK_EMPLOYEES.filter(e => e.status === 'Active').length;
    const onLeave = MOCK_EMPLOYEES.filter(e => e.status === 'On Leave').length;
    const pendingRequests = MOCK_HR_REQUESTS.filter(r => r.status === 'Pending').length;
    const totalPayroll = MOCK_EMPLOYEES.reduce((acc, curr) => acc + (curr.salary / 12), 0);
    
    // Departments Data for Chart
    const deptData = MOCK_DEPARTMENTS.map((d, i) => ({
        name: d.name,
        value: d.headCount,
        color: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][i % 5]
    }));

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
           <div>
             <h1 className="text-2xl font-bold text-slate-900">Executive Overview</h1>
             <p className="text-slate-500">Real-time HR operations, workforce metrics, and recruitment status.</p>
           </div>
           <div className="flex gap-2">
             <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
               <FileText size={16} /> Reports
             </button>
             <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2">
               <UserPlus size={16} /> Add Employee
             </button>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <StatCard 
             title="Total Workforce" 
             value={totalEmployees.toString()} 
             change={`${activeEmployees} Active`} 
             icon={<Users />} 
             color="bg-indigo-500" 
             subtext="Employees"
           />
           <StatCard 
             title="On Leave Today" 
             value={onLeave.toString()} 
             change="4 Returning" 
             icon={<Calendar />} 
             color="bg-amber-500" 
             subtext="vs 2 yesterday"
           />
           <StatCard 
             title="Pending Approvals" 
             value={pendingRequests.toString()} 
             change="Action Required" 
             icon={<Activity />} 
             color="bg-rose-500" 
             subtext="Requests"
           />
           <StatCard 
             title="Est. Monthly Payroll" 
             value={`$${(totalPayroll / 1000).toFixed(1)}k`} 
             change="+2.4%" 
             icon={<DollarSign />} 
             color="bg-emerald-500" 
             subtext="vs last month"
           />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
           {/* Dept Distribution */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                 <Building2 size={18} className="text-slate-400" /> Headcount by Dept
              </h3>
              <div className="flex-1 min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie 
                            data={deptData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value"
                          >
                              {deptData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="text-center">
                        <span className="block text-2xl font-bold text-slate-800">{totalEmployees}</span>
                        <span className="text-xs text-slate-500 uppercase font-bold">Total</span>
                     </div>
                  </div>
              </div>
           </div>

           {/* Recruitment Pipeline */}
           <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                   <Briefcase size={18} className="text-slate-400" /> Recruitment Pipeline
                </h3>
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">+12 Applicants this week</span>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="applicants" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                    <Area type="monotone" dataKey="interviews" stroke="#06b6d4" strokeWidth={2} fillOpacity={0} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Recent Pending Requests */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Activity size={18} className="text-slate-400" /> Pending HR Requests
                 </h3>
                 <button className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
                    View All <ArrowRight size={12} />
                 </button>
              </div>
              <div className="space-y-3">
                 {MOCK_HR_REQUESTS.filter(r => r.status === 'Pending').length === 0 ? (
                    <p className="text-slate-400 text-sm py-4">No pending requests.</p>
                 ) : (
                    MOCK_HR_REQUESTS.filter(r => r.status === 'Pending').slice(0, 4).map(req => (
                        <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
                            <div className="flex items-center gap-3">
                               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  req.type === 'Leave' ? 'bg-blue-100 text-blue-700' :
                                  req.type === 'Advance Payment' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                               }`}>
                                  {req.employeeName.charAt(0)}
                               </div>
                               <div>
                                  <p className="text-sm font-medium text-slate-900">{req.type}</p>
                                  <p className="text-xs text-slate-500">{req.employeeName} • {req.date}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               {req.amount && <span className="text-xs font-bold text-slate-600">${req.amount}</span>}
                               <button className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded hover:bg-slate-100">Review</button>
                            </div>
                        </div>
                    ))
                 )}
              </div>
           </div>

           {/* AI Governance */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
             <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <CheckCircle size={18} className="text-slate-400" /> AI Decision Governance
             </h3>
             <p className="text-xs text-slate-500 mb-6">Ratio of autonomous vs human decisions</p>
             <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complianceData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>
      </div>
    );
  }

  // Generic View (Recruiter / Manager)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operations Dashboard</h1>
          <p className="text-slate-500">Real-time metrics for {role}</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">Download Report</button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">New Requisition</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Jobs" value="12" change="+2" icon={<Briefcase />} color="bg-blue-500" />
        <StatCard title="Total Candidates" value="84" change="+14" icon={<Users />} color="bg-indigo-500" />
        <StatCard title="Interviews Today" value="5" change="On Track" icon={<Calendar />} color="bg-purple-500" />
        <StatCard title="Pending AI Review" value="8" change="-3" icon={<AlertTriangle />} color="bg-amber-500" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Pipeline Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-6">Recruitment Pipeline Activity</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="applicants" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                <Area type="monotone" dataKey="interviews" stroke="#06b6d4" strokeWidth={2} fillOpacity={0} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Compliance Stats */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-2">AI Decision Governance</h3>
          <p className="text-xs text-slate-500 mb-6">Ratio of autonomous vs human decisions</p>
          <div className="flex-1 w-full min-h-0">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={complianceData} layout="vertical" margin={{ left: 20 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                 <Tooltip cursor={{fill: 'transparent'}} />
                 <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                   {complianceData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;