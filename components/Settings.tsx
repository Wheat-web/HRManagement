
import React, { useState } from 'react';
import { Role } from '../types';
import { User, Bell, Lock, Building, CreditCard, Users, Save, Check, Download } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface SettingsProps {
  role: Role;
}

const Settings: React.FC<SettingsProps> = ({ role }) => {
  const { showToast } = useToast();
  const isAdmin = role === Role.COMPANY_ADMIN || role === Role.HR_ADMIN;
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Mock Form State
  const [profile, setProfile] = useState({
    name: 'Jane Doe',
    email: isAdmin ? 'admin@peoplecore.ai' : 'jane.doe@example.com',
    role: role,
    bio: 'Experienced professional with a focus on HR operations and team management.'
  });

  const [notifications, setNotifications] = useState<any>({
    emailAlerts: true,
    smsAlerts: false,
    appAlerts: true,
    weeklyDigest: true
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Settings saved successfully', 'success');
    }, 1000);
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Lock size={18} /> },
  ];

  if (isAdmin) {
    tabs.push(
      { id: 'company', label: 'Company', icon: <Building size={18} /> },
      { id: 'team', label: 'Team Members', icon: <Users size={18} /> },
      { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> }
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500">
                   {profile.name.charAt(0)}
                </div>
                <div>
                   <button className="text-sm text-indigo-600 font-medium hover:underline">Change Avatar</button>
                   <p className="text-xs text-slate-400">JPG, GIF or PNG. 1MB Max.</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                   <input 
                      value={profile.name} 
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                   <input 
                      value={profile.email} 
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                   />
                </div>
                <div className="col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                   <textarea 
                      value={profile.bio} 
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                   />
                </div>
             </div>
          </div>
        );
      case 'notifications':
        return (
           <div className="space-y-6 animate-in fade-in">
              <h3 className="font-bold text-slate-800 text-lg mb-4">Alert Preferences</h3>
              <div className="space-y-4">
                 {[
                    { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive daily summaries and urgent updates via email.' },
                    { key: 'smsAlerts', label: 'SMS Notifications', desc: 'Get text messages for critical security alerts.' },
                    { key: 'appAlerts', label: 'In-App Notifications', desc: 'Show badges and popups within the dashboard.' },
                    { key: 'weeklyDigest', label: 'Weekly Performance Digest', desc: 'A summary of your team\'s activity sent every Monday.' }
                 ].map((item: any) => (
                    <div key={item.key} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                       <div>
                          <p className="font-bold text-slate-700">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.desc}</p>
                       </div>
                       <button 
                          onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key as keyof typeof notifications]})}
                          className={`w-12 h-6 rounded-full transition-colors relative ${notifications[item.key as keyof typeof notifications] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                       >
                          <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : ''}`}></span>
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        );
      case 'company':
         return (
            <div className="space-y-6 animate-in fade-in">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                     <input defaultValue="PeopleCore Inc." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID / EIN</label>
                     <input defaultValue="XX-XXXXXXX" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                     <select className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>Eastern Time (US & Canada)</option>
                        <option>Pacific Time (US & Canada)</option>
                        <option>UTC</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Primary Currency</label>
                     <select className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                     </select>
                  </div>
               </div>
               
               <div className="pt-6 border-t border-slate-100">
                   <h3 className="font-bold text-slate-800 mb-4">Branding</h3>
                   <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xs text-slate-400">
                          Logo
                       </div>
                       <button className="text-sm font-medium text-indigo-600 hover:underline">Upload Logo</button>
                   </div>
               </div>
            </div>
         );
      case 'team':
        return (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                  <div>
                      <h3 className="font-bold text-slate-800">Team Management</h3>
                      <p className="text-sm text-slate-500">Manage access and roles for the HR platform.</p>
                  </div>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Invite Member</button>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                              <th className="px-6 py-3 font-semibold">User</th>
                              <th className="px-6 py-3 font-semibold">Role</th>
                              <th className="px-6 py-3 font-semibold">Status</th>
                              <th className="px-6 py-3 font-semibold text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {[
                              { name: 'Jane Doe', email: 'jane@company.com', role: 'Admin', status: 'Active' },
                              { name: 'John Smith', email: 'john@company.com', role: 'Recruiter', status: 'Active' },
                              { name: 'Sarah Connor', email: 'sarah@company.com', role: 'Hiring Manager', status: 'Invited' },
                          ].map((user, i) => (
                              <tr key={i}>
                                  <td className="px-6 py-4">
                                      <div className="font-medium text-slate-900">{user.name}</div>
                                      <div className="text-xs text-slate-400">{user.email}</div>
                                  </td>
                                  <td className="px-6 py-4">{user.role}</td>
                                  <td className="px-6 py-4">
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{user.status}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right text-indigo-600 cursor-pointer hover:underline">Edit</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
        );
      case 'billing':
        return (
           <div className="space-y-6 animate-in fade-in">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <p className="text-indigo-100 text-sm font-medium mb-1">Current Plan</p>
                          <h3 className="text-3xl font-bold">Enterprise</h3>
                      </div>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Active</span>
                  </div>
                  <div className="grid grid-cols-3 gap-6 border-t border-white/20 pt-4">
                      <div>
                          <p className="text-indigo-200 text-xs uppercase font-bold">Billing Cycle</p>
                          <p className="font-medium">Monthly</p>
                      </div>
                      <div>
                          <p className="text-indigo-200 text-xs uppercase font-bold">Next Invoice</p>
                          <p className="font-medium">Nov 01, 2023</p>
                      </div>
                      <div>
                          <p className="text-indigo-200 text-xs uppercase font-bold">Amount</p>
                          <p className="font-medium">$299.00</p>
                      </div>
                  </div>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">Invoice History</h3>
                      <button className="text-sm text-indigo-600 font-medium hover:underline">Download All</button>
                  </div>
                  <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-white border-b border-slate-100">
                           <tr>
                              <th className="px-6 py-3 font-semibold">Invoice ID</th>
                              <th className="px-6 py-3 font-semibold">Date</th>
                              <th className="px-6 py-3 font-semibold">Amount</th>
                              <th className="px-6 py-3 font-semibold">Status</th>
                              <th className="px-6 py-3 font-semibold text-right"></th>
                           </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                          {[
                              { id: 'INV-001', date: 'Oct 01, 2023', amount: '$299.00', status: 'Paid' },
                              { id: 'INV-002', date: 'Sep 01, 2023', amount: '$299.00', status: 'Paid' },
                              { id: 'INV-003', date: 'Aug 01, 2023', amount: '$299.00', status: 'Paid' },
                          ].map((inv, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                  <td className="px-6 py-4 font-mono">{inv.id}</td>
                                  <td className="px-6 py-4">{inv.date}</td>
                                  <td className="px-6 py-4 font-medium text-slate-900">{inv.amount}</td>
                                  <td className="px-6 py-4"><span className="text-emerald-600 font-bold flex items-center gap-1"><Check size={14} /> {inv.status}</span></td>
                                  <td className="px-6 py-4 text-right"><Download size={16} className="ml-auto text-slate-400 hover:text-slate-600 cursor-pointer" /></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
           </div>
        );
      case 'security':
          return (
             <div className="space-y-6 animate-in fade-in">
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">Change Password</h3>
                    <div className="grid grid-cols-1 gap-4 max-w-md">
                        <input type="password" placeholder="Current Password" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                        <input type="password" placeholder="New Password" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                        <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 w-fit">Update Password</button>
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg">
                    <div>
                        <p className="font-bold text-slate-800">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                    </div>
                    <button className="text-indigo-600 font-bold text-sm hover:underline">Enable 2FA</button>
                 </div>
             </div>
          );
      default:
        return <div className="text-slate-400 p-8 text-center flex flex-col items-center">
             <Building size={48} className="mb-4 opacity-20" />
             <p>Settings module for <span className="font-bold">{activeTab}</span> coming soon.</p>
        </div>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
       <div className="flex justify-between items-center mb-6">
         <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500">Manage your profile, preferences, and company configuration.</p>
         </div>
         <button 
           onClick={handleSave}
           disabled={isSaving}
           className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-all"
         >
            {isSaving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
         </button>
       </div>

       <div className="flex flex-col md:flex-row gap-8 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-2">
             {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                     activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                   {tab.icon}
                   {tab.label}
                </button>
             ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto">
             {renderContent()}
          </div>
       </div>
    </div>
  );
};

export default Settings;
