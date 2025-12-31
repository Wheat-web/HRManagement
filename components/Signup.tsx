
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, User, Building, Shield, ChevronLeft } from 'lucide-react';
import { UserProfile, Role } from '../types';

interface SignupProps {
  onSignup: (user: UserProfile) => void;
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    role: Role.COMPANY_ADMIN
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const user: UserProfile = {
        id: `u${Date.now()}`,
        name: formData.fullName,
        email: formData.email,
        role: formData.role,
        companyName: formData.companyName,
        avatarUrl: undefined
      };
      
      onSignup(user);
      setLoading(false);
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
               <h1 className="text-4xl font-bold text-white mb-4">Start your<br/>journey.</h1>
               <p className="text-slate-400">Join thousands of companies using TalentFlow AI to optimize their workforce.</p>
            </div>

            <div className="relative z-10 mt-auto">
               <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                  <p className="text-indigo-100 italic mb-4">"TalentFlow has completely transformed how we manage our hiring pipeline. The AI features are a game changer."</p>
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
         <div className="w-full md:w-7/12 p-8 md:p-16 bg-white flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
               <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
                  <p className="text-slate-500">Get started with your free 14-day trial.</p>
               </div>

               <form onSubmit={handleSignup} className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                      <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                               <User className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                               type="text" 
                               required
                               value={formData.fullName}
                               onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                               className="block w-full pl-10 pr-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                               placeholder="Jane Doe"
                            />
                         </div>
                      </div>
                      <div>
                         <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                               <Building className="h-4 w-4 text-slate-400" />
                            </div>
                            <input 
                               type="text" 
                               required
                               value={formData.companyName}
                               onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                               className="block w-full pl-10 pr-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                               placeholder="Acme Inc."
                            />
                         </div>
                      </div>
                  </div>

                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-2">Work Email</label>
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Mail className="h-4 w-4 text-slate-400" />
                        </div>
                        <input 
                           type="email" 
                           required
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                           className="block w-full pl-10 pr-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                           placeholder="name@company.com"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                        <input 
                           type="password" 
                           required
                           value={formData.password}
                           onChange={(e) => setFormData({...formData, password: e.target.value})}
                           className="block w-full pl-10 pr-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                           placeholder="Create a password"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-2">I am a...</label>
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Shield className="h-4 w-4 text-slate-400" />
                        </div>
                        <select 
                           value={formData.role}
                           onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                           className="block w-full pl-10 pr-3 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                        >
                           {Object.values(Role).map(role => (
                              <option key={role} value={role}>{role}</option>
                           ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                           <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                        </div>
                     </div>
                  </div>

                  <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full h-11 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                     {loading ? 'Creating account...' : <>Create Account <ArrowRight size={18} /></>}
                  </button>
               </form>

               <div className="mt-8 text-center border-t border-slate-100 pt-6">
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
