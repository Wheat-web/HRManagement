
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User, Building, Shield, ChevronLeft, KeyRound, Check, Loader2, UserPlus, Briefcase } from 'lucide-react';
import { UserProfile, Role } from '../types';
import { useToast } from '../context/ToastContext';

interface SignupProps {
  onSignup: (user: UserProfile) => void;
  onSwitchToLogin: () => void;
}

type SignupMode = 'register_org' | 'add_user';

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin }) => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<SignupMode>('register_org');
  const [loading, setLoading] = useState(false);

  // Register Org State
  const [orgData, setOrgData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: ''
  });

  // Add User State
  const [userData, setUserData] = useState({
    adminEmail: '',
    adminPassword: '',
    newUserName: '',
    newUserEmail: '',
    newUserPassword: '',
    newUserRole: Role.EMPLOYEE // Default
  });

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOtp = () => {
    if (!userData.adminEmail || !userData.adminPassword) {
        showToast("Admin credentials are required to authorize this action.", 'error');
        return;
    }
    if (!userData.newUserEmail) {
        showToast("Please enter the new user's email.", 'error');
        return;
    }

    setSendingOtp(true);
    // Simulate API delay and Auth check
    setTimeout(() => {
        setSendingOtp(false);
        setOtpSent(true);
        showToast(`Verification code sent to ${userData.newUserEmail}. (Hint: 123456)`, 'success');
    }, 1500);
  };

  const handleRegisterOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const user: UserProfile = {
        id: `u${Date.now()}`,
        name: orgData.fullName,
        email: orgData.email,
        role: Role.COMPANY_ADMIN,
        companyName: orgData.companyName,
        avatarUrl: undefined
      };
      
      onSignup(user);
      setLoading(false);
      showToast("Organization registered successfully!", 'success');
    }, 1500);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
        showToast("Please enter the verification code.", 'error');
        return;
    }
    if (otp !== '123456') {
        showToast("Invalid verification code.", 'error');
        return;
    }

    setLoading(true);
    
    setTimeout(() => {
      // In a real app, this would create the user in the backend. 
      // For this demo, we log them in as the new user to show it worked.
      const user: UserProfile = {
        id: `u${Date.now()}`,
        name: userData.newUserName,
        email: userData.newUserEmail,
        role: userData.newUserRole,
        companyName: 'PeopleCore Demo Corp', // Mock linked company
        avatarUrl: undefined
      };
      
      onSignup(user);
      setLoading(false);
      showToast(`${userData.newUserRole} account created successfully!`, 'success');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
         
         {/* Left Side (Visuals) */}
         <div className="hidden md:flex md:w-5/12 bg-slate-900 relative flex-col justify-between p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-slate-900 opacity-90"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
            
            <div className="relative z-10">
               <button onClick={onSwitchToLogin} className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors mb-8 text-sm font-medium">
                  <ChevronLeft size={16} /> Back to Login
               </button>
               <h1 className="text-4xl font-bold text-white mb-4">
                  {mode === 'register_org' ? "Build your\ndream team." : "Grow your\nworkforce."}
               </h1>
               <p className="text-slate-400">
                  {mode === 'register_org' 
                    ? "Join thousands of companies using PeopleCore to optimize their HR operations."
                    : "Securely add new members to your organization with role-based access control."}
               </p>
            </div>

            <div className="relative z-10 mt-auto">
               <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                  <p className="text-indigo-100 italic mb-4">"The most intuitive platform for scaling teams securely."</p>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">JD</div>
                     <div>
                        <p className="text-white font-bold text-sm">John Doe</p>
                        <p className="text-slate-400 text-xs">VP of HR, TechCorp</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Side (Form) */}
         <div className="w-full md:w-7/12 p-8 md:p-12 bg-white flex flex-col">
            <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
               
               {/* Mode Tabs */}
               <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
                  <button 
                    onClick={() => setMode('register_org')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'register_org' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     <Building size={16} /> New Company
                  </button>
                  <button 
                    onClick={() => setMode('add_user')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'add_user' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     <UserPlus size={16} /> Add Team Member
                  </button>
               </div>

               <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                     {mode === 'register_org' ? "Register Organization" : "Create User Account"}
                  </h2>
                  <p className="text-slate-500 text-sm">
                     {mode === 'register_org' 
                        ? "Create a new workspace for your company." 
                        : "Authorize as Admin to add a new user."}
                  </p>
               </div>

               {mode === 'register_org' ? (
                  /* REGISTER ORG FORM */
                  <form onSubmit={handleRegisterOrg} className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                           <input 
                              type="text" 
                              required
                              value={orgData.fullName}
                              onChange={(e) => setOrgData({...orgData, fullName: e.target.value})}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="John Doe"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company Name</label>
                           <input 
                              type="text" 
                              required
                              value={orgData.companyName}
                              onChange={(e) => setOrgData({...orgData, companyName: e.target.value})}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="Acme Inc."
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Work Email</label>
                        <input 
                           type="email" 
                           required
                           value={orgData.email}
                           onChange={(e) => setOrgData({...orgData, email: e.target.value})}
                           className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                           placeholder="admin@company.com"
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                        <input 
                           type="password" 
                           required
                           value={orgData.password}
                           onChange={(e) => setOrgData({...orgData, password: e.target.value})}
                           className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                           placeholder="Create password"
                        />
                     </div>

                     <div className="pt-2">
                        <button 
                           type="submit" 
                           disabled={loading}
                           className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                           {loading ? <Loader2 className="animate-spin" size={18} /> : <>Create Workspace <ArrowRight size={18} /></>}
                        </button>
                     </div>
                  </form>
               ) : (
                  /* ADD USER FORM */
                  <form onSubmit={handleAddUser} className="space-y-5">
                     
                     {/* Admin Auth Section */}
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                           <KeyRound size={14} /> Admin Authorization
                        </h3>
                        <div className="space-y-3">
                           <input 
                              type="email" 
                              required
                              value={userData.adminEmail}
                              onChange={(e) => setUserData({...userData, adminEmail: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                              placeholder="Admin Email"
                           />
                           <input 
                              type="password" 
                              required
                              value={userData.adminPassword}
                              onChange={(e) => setUserData({...userData, adminPassword: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                              placeholder="Admin Password"
                           />
                        </div>
                     </div>

                     {/* New User Details */}
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New User Name</label>
                           <input 
                              type="text" 
                              required
                              value={userData.newUserName}
                              onChange={(e) => setUserData({...userData, newUserName: e.target.value})}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="Jane Doe"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign Role</label>
                           <select 
                              value={userData.newUserRole}
                              onChange={(e) => setUserData({...userData, newUserRole: e.target.value as Role})}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                           >
                              {Object.values(Role).filter(r => r !== Role.COMPANY_ADMIN).map(role => (
                                 <option key={role} value={role}>{role}</option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New User Email</label>
                           <input 
                              type="email" 
                              required
                              value={userData.newUserEmail}
                              onChange={(e) => setUserData({...userData, newUserEmail: e.target.value})}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="user@company.com"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Create Password</label>
                           <input 
                              type="password" 
                              required
                              value={userData.newUserPassword}
                              onChange={(e) => setUserData({...userData, newUserPassword: e.target.value})}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="••••••••"
                           />
                        </div>
                     </div>

                     {/* OTP Verification */}
                     <div className="flex gap-2 items-end">
                        <div className="flex-1">
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Verification Code</label>
                           <div className="relative">
                              <input 
                                 type="text" 
                                 value={otp} 
                                 onChange={(e) => setOtp(e.target.value)}
                                 disabled={!otpSent}
                                 className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                                 placeholder={otpSent ? "123456" : "Wait for OTP"}
                              />
                              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           </div>
                        </div>
                        <button 
                           type="button"
                           onClick={handleSendOtp}
                           disabled={sendingOtp || otpSent || !userData.newUserEmail}
                           className="h-[42px] px-4 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 disabled:opacity-50 whitespace-nowrap"
                        >
                           {sendingOtp ? <Loader2 className="animate-spin" size={14} /> : otpSent ? "Sent" : "Send OTP"}
                        </button>
                     </div>

                     <button 
                        type="submit" 
                        disabled={loading || !otpSent}
                        className="w-full h-11 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {loading ? (
                           <>
                               <Loader2 className="animate-spin" size={18} /> Creating...
                           </>
                        ) : (
                           <>Create User Account <UserPlus size={18} /></>
                        )}
                     </button>
                  </form>
               )}

               <div className="mt-auto pt-6 text-center border-t border-slate-100 mt-6">
                  <p className="text-slate-500 text-sm">
                     Already have an account? 
                     <button onClick={onSwitchToLogin} className="ml-1 text-indigo-600 font-bold hover:text-indigo-700">Sign in</button>
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Signup;
