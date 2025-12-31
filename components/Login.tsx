
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, User, ChevronRight } from 'lucide-react';
import { UserProfile, Role } from '../types';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create mock user profile based on email or default to Admin
      let role = Role.HR_ADMIN;
      if (email.includes('recruit')) role = Role.RECRUITER;
      if (email.includes('manager')) role = Role.MANAGER;
      if (email.includes('emp')) role = Role.EMPLOYEE;
      if (email.includes('admin')) role = Role.COMPANY_ADMIN;

      const user: UserProfile = {
        id: 'u1',
        name: email.split('@')[0] || 'Demo User',
        email: email || 'demo@peoplecore.ai',
        role: role,
        companyName: 'PeopleCore Demo Corp',
        avatarUrl: undefined
      };
      
      onLogin(user);
      setLoading(false);
    }, 800);
  };

  const handleDemoClick = (email: string) => {
    setEmail(email);
    setPassword('password123'); // Auto-fill for convenience
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        
        {/* Left Side - Brand & Value Prop */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white relative flex-col justify-between p-12 lg:p-16 overflow-hidden">
           {/* Abstract Background Shapes */}
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500 blur-3xl opacity-20"></div>
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500 blur-3xl opacity-20"></div>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                    <ShieldCheck size={28} className="text-white" />
                 </div>
                 <span className="text-2xl font-bold tracking-tight">PeopleCore</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                 Future of Work,<br />
                 <span className="text-indigo-200">Simplified.</span>
              </h1>
              <p className="text-indigo-100 text-lg leading-relaxed max-w-sm">
                 The enterprise-grade operating system for modern HR teams. AI-driven recruitment, seamless compliance, and smart payroll.
              </p>
           </div>

           <div className="relative z-10 space-y-4 mt-12">
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-white/10 rounded-full"><CheckCircle2 size={20} className="text-emerald-400" /></div>
                 <span className="text-sm font-medium">SOC2 Type II Compliant</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-white/10 rounded-full"><CheckCircle2 size={20} className="text-emerald-400" /></div>
                 <span className="text-sm font-medium">Automated Candidate Screening</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-white/10 rounded-full"><CheckCircle2 size={20} className="text-emerald-400" /></div>
                 <span className="text-sm font-medium">Real-time Payroll Analytics</span>
              </div>
           </div>

           <div className="relative z-10 mt-12 text-xs text-indigo-300">
              © 2024 PeopleCore Inc. All rights reserved.
           </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-7/12 p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-white relative">
           <div className="max-w-md mx-auto w-full">
              <div className="mb-10">
                 <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
                 <p className="text-slate-500">Please enter your details to sign in.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Work Email</label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                       </div>
                       <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-11 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="name@company.com"
                          required
                       />
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-sm font-semibold text-slate-700">Password</label>
                       <button type="button" className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 hover:underline">Forgot password?</button>
                    </div>
                    <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                       </div>
                       <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-11 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                          placeholder="••••••••"
                          required
                       />
                    </div>
                 </div>

                 <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                 >
                    {loading ? (
                       <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                       <>Sign in <ArrowRight size={18} /></>
                    )}
                 </button>
              </form>

              <div className="mt-8 text-center">
                 <p className="text-slate-500 text-sm">
                    Don't have an account? 
                    <button onClick={onSwitchToSignup} className="ml-1 text-indigo-600 font-bold hover:text-indigo-700">Create free account</button>
                 </p>
              </div>
              
              {/* Quick Login Chips */}
              <div className="mt-12 pt-8 border-t border-slate-100">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Quick Demo Login</p>
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleDemoClick('admin@demo.com')} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-left group">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"><User size={14} /></div>
                       <div>
                          <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-800">Company Admin</p>
                          <p className="text-[10px] text-slate-400">Full Access</p>
                       </div>
                    </button>
                    <button onClick={() => handleDemoClick('recruit@demo.com')} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-purple-50 hover:border-purple-200 transition-all text-left group">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-600"><User size={14} /></div>
                       <div>
                          <p className="text-xs font-bold text-slate-700 group-hover:text-purple-800">Recruiter</p>
                          <p className="text-[10px] text-slate-400">Hiring Pipeline</p>
                       </div>
                    </button>
                    <button onClick={() => handleDemoClick('manager@demo.com')} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left group">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600"><User size={14} /></div>
                       <div>
                          <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">Manager</p>
                          <p className="text-[10px] text-slate-400">Team View</p>
                       </div>
                    </button>
                    <button onClick={() => handleDemoClick('emp@demo.com')} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all text-left group">
                       <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"><User size={14} /></div>
                       <div>
                          <p className="text-xs font-bold text-slate-700 group-hover:text-blue-800">Employee</p>
                          <p className="text-[10px] text-slate-400">Self Service</p>
                       </div>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
