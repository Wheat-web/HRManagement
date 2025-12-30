
import React, { useState, useEffect } from 'react';
import { Department, Employee, Candidate, CandidateStage } from '../types';
import { Building2, Users, Plus, MapPin, Mail, MoreHorizontal, User, Trash2, SlidersHorizontal, DownloadCloud } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface OrganizationManagementProps {
  initialDepartments: Department[];
  initialEmployees: Employee[];
  candidates?: Candidate[];
}

const OrganizationManagement: React.FC<OrganizationManagementProps> = ({ initialDepartments, initialEmployees, candidates = [] }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'departments' | 'employees'>('departments');
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  // Sync state with props
  useEffect(() => {
    setEmployees(initialEmployees);
  }, [initialEmployees]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  // Custom Attribute State for dynamic employee creation
  const [customFields, setCustomFields] = useState<{key: string, value: string}[]>([]);

  // Filter lists for the dropdown
  const onboardedEmployees = employees.filter(e => e.status === 'Onboarding');
  const availableCandidates = candidates.filter(c => c.stage === CandidateStage.OFFER);

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleCustomFieldChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...customFields];
    updated[index][field] = val;
    setCustomFields(updated);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleImportProfile = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
        setFormData({});
        return;
    }

    const [type, id] = val.split(':');

    if (type === 'candidate') {
        const c = availableCandidates.find(c => c.id === id);
        if (c) {
            setFormData({
                ...formData,
                name: c.name,
                email: c.email,
                role: c.role,
                status: 'Active',
                joinDate: new Date().toISOString().split('T')[0]
            });
            showToast(`Loaded details from candidate: ${c.name}`, 'info');
        }
    } else if (type === 'onboarding') {
        const emp = onboardedEmployees.find(e => e.id === id);
        if (emp) {
            setFormData({
                ...formData,
                name: emp.name,
                email: emp.email,
                role: emp.role,
                department: emp.department,
                status: 'Active', // Promoting to Active
                joinDate: emp.joinDate,
                salary: emp.salary,
                location: emp.location
            });
            showToast(`Loaded details from onboarding: ${emp.name}`, 'info');
        }
    }
  };

  const handleCreate = () => {
    if (activeTab === 'departments') {
      const newDept: Department = {
        id: `d${Date.now()}`,
        name: formData.name || 'New Dept',
        manager: formData.manager || 'Unassigned',
        location: formData.location || 'Headquarters',
        headCount: 0
      };
      setDepartments([...departments, newDept]);
    } else {
      // Process custom fields into a record object
      const attributes: Record<string, string> = {};
      customFields.forEach(f => {
        if(f.key) attributes[f.key] = f.value;
      });

      const newEmp: Employee = {
        id: `e${Date.now()}`,
        name: formData.name || 'New Employee',
        role: formData.role || 'Staff',
        department: formData.department || 'Unassigned',
        email: formData.email || 'email@company.com',
        status: formData.status || 'Active',
        joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
        salary: Number(formData.salary) || 50000,
        currency: formData.currency || 'USD',
        location: formData.location || 'Remote',
        shiftId: 'sh1', // Default to General Shift
        customAttributes: attributes
      };
      setEmployees([...employees, newEmp]);
    }
    setIsModalOpen(false);
    setFormData({});
    setCustomFields([]);
    showToast(activeTab === 'departments' ? 'Department created' : 'Employee created', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organization</h1>
          <p className="text-slate-500">Manage departments and workforce directory.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={16} /> 
          Add {activeTab === 'departments' ? 'Department' : 'Employee'}
        </button>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          <button 
            onClick={() => setActiveTab('departments')}
            className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'departments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Departments
          </button>
          <button 
            onClick={() => setActiveTab('employees')}
            className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'employees' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Employees
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'departments' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4">Headcount</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{dept.name}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                       <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs text-slate-600 font-bold">{dept.manager.charAt(0)}</div>
                       {dept.manager}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold">{dept.headCount} Members</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-1">
                      <MapPin size={14} /> {dept.location}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">{emp.name.charAt(0)}</div>
                         <div>
                            <p className="font-medium text-slate-900">{emp.name}</p>
                            <p className="text-xs text-slate-400">{emp.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{emp.role}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 
                        emp.status === 'On Leave' ? 'bg-amber-100 text-amber-700' : 
                        emp.status === 'Onboarding' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{emp.location}</td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Add {activeTab === 'departments' ? 'Department' : 'Employee'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
               {activeTab === 'departments' ? (
                 <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Manager</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => setFormData({...formData, manager: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-4">
                    {/* Source Selection for Employee */}
                    <div className="col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-2">
                       <label className="block text-xs font-bold text-indigo-800 uppercase mb-2 flex items-center gap-2">
                          <DownloadCloud size={14} /> Import Profile Data
                       </label>
                       <select 
                          className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-slate-700"
                          onChange={handleImportProfile}
                          defaultValue=""
                       >
                          <option value="">-- Manual Entry (Blank) --</option>
                          
                          {availableCandidates.length > 0 && (
                            <optgroup label="Recruitment Candidates (OnBoarded)">
                                {availableCandidates.map(c => (
                                    <option key={c.id} value={`candidate:${c.id}`}>{c.name} - {c.role}</option>
                                ))}
                            </optgroup>
                          )}
                          
                          {onboardedEmployees.length > 0 && (
                             <optgroup label="Onboarded Members (In Progress)">
                                {onboardedEmployees.map(e => (
                                   <option key={e.id} value={`onboarding:${e.id}`}>{e.name} - {e.role}</option>
                                ))}
                             </optgroup>
                          )}
                       </select>
                       <p className="text-[10px] text-indigo-600/70 mt-1">
                          Select a candidate or onboarding member to auto-fill details.
                       </p>
                    </div>

                    <div className="col-span-2">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Basic Information</h4>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name || ''}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        value={formData.email || ''}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                      <input 
                        type="text" 
                        value={formData.role || ''}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                      <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                      >
                         <option value="">Select Dept</option>
                         {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                      </select>
                    </div>

                    <div className="col-span-2 border-t border-slate-100 mt-2 pt-4">
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Employment Details</h4>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                      <select 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.status || 'Active'}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                         <option value="Active">Active</option>
                         <option value="Onboarding">Onboarding</option>
                         <option value="On Leave">On Leave</option>
                         <option value="Terminated">Terminated</option>
                      </select>
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-slate-700 mb-1">Join Date</label>
                       <input 
                          type="date"
                          value={formData.joinDate || ''}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-slate-700 mb-1">Annual Salary</label>
                       <input 
                          type="number"
                          value={formData.salary || ''}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onChange={(e) => setFormData({...formData, salary: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-slate-700 mb-1">Location</label>
                       <input 
                          type="text"
                          value={formData.location || ''}
                          placeholder="e.g. New York"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                       />
                    </div>

                    {/* Custom Attributes Section */}
                    <div className="col-span-2 border-t border-slate-100 mt-2 pt-4">
                       <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                             <SlidersHorizontal size={12} /> Custom Attributes
                          </h4>
                          <button onClick={handleAddCustomField} className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
                             <Plus size={10} /> Add Field
                          </button>
                       </div>
                       
                       {customFields.length === 0 && (
                          <p className="text-xs text-slate-400 italic">No custom fields added. Add fields to track specific data like 'T-Shirt Size', 'GitHub', etc.</p>
                       )}

                       <div className="space-y-2">
                          {customFields.map((field, idx) => (
                             <div key={idx} className="flex gap-2 items-center">
                                <input 
                                   placeholder="Property (e.g. T-Shirt Size)"
                                   value={field.key}
                                   onChange={(e) => handleCustomFieldChange(idx, 'key', e.target.value)}
                                   className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                                />
                                <input 
                                   placeholder="Value (e.g. Medium)"
                                   value={field.value}
                                   onChange={(e) => handleCustomFieldChange(idx, 'value', e.target.value)}
                                   className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                                />
                                <button onClick={() => handleRemoveCustomField(idx)} className="text-slate-400 hover:text-red-500">
                                   <Trash2 size={14} />
                                </button>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
               )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium">Cancel</button>
               <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagement;
