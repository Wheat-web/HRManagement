
import React, { useState } from 'react';
import { Building2, MapPin, Globe, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const CompanyRegistration: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Company Registration State
  const [companyData, setCompanyData] = useState({
    companyName: '',
    industry: 'Technology',
    branchCount: 1,
    location: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    taxId: ''
  });

  const handleRegisterCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
        setLoading(false);
        setIsSuccess(true);
        showToast(`Company "${companyData.companyName}" registered successfully!`, 'success');
    }, 2000);
  };

  const handleReset = () => {
      setCompanyData({
        companyName: '',
        industry: 'Technology',
        branchCount: 1,
        location: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        taxId: ''
      });
      setIsSuccess(false);
  };

  if (isSuccess) {
      return (
          <div className="max-w-2xl mx-auto py-12 px-6">
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Registration Complete</h2>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                      <span className="font-semibold text-slate-800">{companyData.companyName}</span> has been successfully registered on PeopleCore.
                      <br /><br />
                      An email has been sent to <span className="font-semibold text-indigo-600">{companyData.adminEmail}</span> with login credentials and further instructions to set up the workspace.
                  </p>
                  <button 
                    onClick={handleReset}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                  >
                      Register Another Organization
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
       <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Register New Organization</h1>
          <p className="text-slate-500 mt-2">Onboard a new company tenant, set up administrative access, and configure initial operational scale.</p>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                   <Building2 size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-800">Organization Details</h3>
                   <p className="text-sm text-slate-500">Enter the core information for the new entity.</p>
                </div>
             </div>
          </div>

          <form onSubmit={handleRegisterCompany} className="p-8 space-y-8">
             {/* Section 1: Company Info */}
             <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                   Entity Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                        <input 
                            type="text" 
                            required
                            value={companyData.companyName}
                            onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                        <select 
                            value={companyData.industry}
                            onChange={(e) => setCompanyData({...companyData, industry: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option>Technology</option>
                            <option>Healthcare</option>
                            <option>Finance</option>
                            <option>Retail</option>
                            <option>Manufacturing</option>
                            <option>Education</option>
                            <option>Logistics</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tax ID / Registration No.</label>
                        <input 
                            type="text" 
                            value={companyData.taxId}
                            onChange={(e) => setCompanyData({...companyData, taxId: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="XX-XXXXXXX"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Headquarters Location</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                required
                                value={companyData.location}
                                onChange={(e) => setCompanyData({...companyData, location: e.target.value})}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="New York, USA"
                            />
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        </div>
                    </div>
                </div>
             </div>

             {/* Section 2: Scale */}
             <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                   Operational Scale
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Initial Branch Count</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                min="1"
                                required
                                value={companyData.branchCount}
                                onChange={(e) => setCompanyData({...companyData, branchCount: parseInt(e.target.value) || 1})}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Includes Headquarters. Additional branches can be added later.</p>
                    </div>
                </div>
             </div>

             {/* Section 3: Admin User */}
             <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
                   Primary Administrator
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Admin Full Name</label>
                        <input 
                            type="text" 
                            required
                            value={companyData.adminName}
                            onChange={(e) => setCompanyData({...companyData, adminName: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Jane Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
                        <input 
                            type="email" 
                            required
                            value={companyData.adminEmail}
                            onChange={(e) => setCompanyData({...companyData, adminEmail: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="admin@company.com"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Admin Password</label>
                        <input 
                            type="password" 
                            required
                            value={companyData.adminPassword}
                            onChange={(e) => setCompanyData({...companyData, adminPassword: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Create a strong password for the root account"
                        />
                    </div>
                </div>
             </div>

             <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <span className="flex items-center gap-2">Create Organization <ArrowRight size={20} /></span>}
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default CompanyRegistration;
