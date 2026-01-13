
import React, { useState, useEffect } from 'react';
import { Department, Branch } from '../types';
import { Plus, MapPin, MoreHorizontal, Globe } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface OrganizationManagementProps {
  initialDepartments: Department[];
  branches: Branch[];
  onAddDepartment?: (dept: Department) => void;
  selectedBranchId?: string;
}

const OrganizationManagement: React.FC<OrganizationManagementProps> = ({ 
  initialDepartments, 
  branches,
  onAddDepartment,
  selectedBranchId = 'all'
}) => {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);

  // Sync state with props
  useEffect(() => {
    // Filter based on selected branch if needed, or show all
    if (selectedBranchId === 'all') {
        setDepartments(initialDepartments);
    } else {
        setDepartments(initialDepartments.filter(d => d.branchId === selectedBranchId));
    }
  }, [initialDepartments, selectedBranchId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleCreate = () => {
      const newDept: Department = {
        id: `d${Date.now()}`,
        name: formData.name || 'New Dept',
        manager: formData.manager || 'Unassigned',
        location: formData.location || 'Headquarters',
        branchId: formData.branchId || (selectedBranchId !== 'all' ? selectedBranchId : branches[0]?.id),
        headCount: 0
      };
      
      if (onAddDepartment) {
        onAddDepartment(newDept);
      } else {
        setDepartments([...departments, newDept]);
      }
    
    setIsModalOpen(false);
    setFormData({});
    showToast('Department created successfully', 'success');
  };

  const getBranchName = (id?: string) => branches.find(b => b.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organization Structure</h1>
          <p className="text-slate-500">Manage departments and operational hierarchy for {selectedBranchId === 'all' ? 'all branches' : getBranchName(selectedBranchId)}.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={16} /> 
          Add Department
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4">Headcount</th>
                  <th className="px-6 py-4">Branch</th>
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
                    <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <Globe size={14} className="text-indigo-500" />
                            {getBranchName(dept.branchId)}
                        </span>
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Add Department</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <div className="p-6 space-y-4">
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
                        <label className="block text-sm font-medium text-slate-700 mb-1">Branch Assignment</label>
                        <select 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                            defaultValue={selectedBranchId !== 'all' ? selectedBranchId : ''}
                        >
                            <option value="" disabled>Select Branch</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
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
                      <label className="block text-sm font-medium text-slate-700 mb-1">Location (Specific)</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. Floor 4, Building A"
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                 </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium">Cancel</button>
               <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Create Department</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagement;
