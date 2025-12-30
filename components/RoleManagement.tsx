
import React, { useState } from 'react';
import { MOCK_ROLE_DEFINITIONS, PERMISSIONS_LIST } from '../constants';
import { RoleDefinition } from '../types';
import { Shield, Users, Lock, Check, Plus, Trash2, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const RoleManagement: React.FC = () => {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<RoleDefinition[]>(MOCK_ROLE_DEFINITIONS);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition>(roles[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempRole, setTempRole] = useState<RoleDefinition | null>(null);

  // Group permissions by category
  const groupedPermissions = PERMISSIONS_LIST.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof PERMISSIONS_LIST>);

  const handleSelectRole = (role: RoleDefinition) => {
    setSelectedRole(role);
    setTempRole(null); // Clear temp edit state if any
    setIsEditing(false);
  };

  const handleAddNewRole = () => {
    const newRole: RoleDefinition = {
      id: `r_${Date.now()}`,
      name: 'New Role',
      description: 'Description of the new role',
      usersCount: 0,
      isSystem: false,
      permissions: []
    };
    setRoles([...roles, newRole]);
    setSelectedRole(newRole);
    setTempRole(newRole);
    setIsEditing(true);
  };

  const handleDeleteRole = (id: string) => {
    if (roles.find(r => r.id === id)?.isSystem) {
      showToast('Cannot delete system roles', 'error');
      return;
    }
    const updatedRoles = roles.filter(r => r.id !== id);
    setRoles(updatedRoles);
    setSelectedRole(updatedRoles[0]);
    showToast('Role deleted successfully', 'info');
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit
      if (!roles.find(r => r.id === selectedRole.id)) {
         // If it was a new role not saved, revert to first
         setSelectedRole(roles[0]);
      } else {
         setTempRole(null);
      }
      setIsEditing(false);
    } else {
      setTempRole({ ...selectedRole });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (tempRole) {
      setRoles(roles.map(r => r.id === tempRole.id ? tempRole : r));
      setSelectedRole(tempRole);
      setTempRole(null);
      setIsEditing(false);
      showToast('Role configuration saved', 'success');
    }
  };

  const togglePermission = (permId: string) => {
    if (!tempRole) return;
    const currentPerms = tempRole.permissions;
    if (currentPerms.includes('all')) {
       // If removing a permission from 'all', we need to explicitly list all others
       if (permId === 'all') {
          setTempRole({ ...tempRole, permissions: [] });
       } else {
          // Complex logic: 'all' usually means everything. If we uncheck one, we theoretically need to convert 'all' to list of all IDS minus this one.
          // For simplicity in this demo, let's just say Admin 'all' is locked.
          return; 
       }
    } else {
       if (currentPerms.includes(permId)) {
          setTempRole({ ...tempRole, permissions: currentPerms.filter(p => p !== permId) });
       } else {
          setTempRole({ ...tempRole, permissions: [...currentPerms, permId] });
       }
    }
  };

  const currentRoleState = isEditing && tempRole ? tempRole : selectedRole;
  const isSuperAdmin = currentRoleState.permissions.includes('all');

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Roles & Access Control</h1>
          <p className="text-slate-500">Manage permissions and define role-based access strategies.</p>
        </div>
        <button 
          onClick={handleAddNewRole}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Create Custom Role
        </button>
      </div>

      <div className="flex-1 min-h-0 flex gap-8">
        {/* Left Sidebar: Roles List */}
        <div className="w-1/4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
           <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-700">Available Roles</h3>
           </div>
           <div className="flex-1 overflow-y-auto">
              {roles.map(role => (
                 <div 
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${selectedRole.id === role.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
                 >
                    <div className="flex justify-between items-center mb-1">
                       <span className={`font-semibold ${selectedRole.id === role.id ? 'text-indigo-900' : 'text-slate-800'}`}>{role.name}</span>
                       {role.isSystem && <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">SYSTEM</span>}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                       <span className="flex items-center gap-1"><Users size={12} /> {role.usersCount} users</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Right Panel: Role Details */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
           {/* Detail Header */}
           <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50">
              <div className="flex-1">
                 {isEditing ? (
                    <div className="space-y-3 max-w-md">
                       <input 
                          value={tempRole?.name} 
                          onChange={(e) => setTempRole(prev => prev ? ({...prev, name: e.target.value}) : null)}
                          className="text-2xl font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Role Name"
                       />
                       <input 
                          value={tempRole?.description} 
                          onChange={(e) => setTempRole(prev => prev ? ({...prev, description: e.target.value}) : null)}
                          className="text-sm text-slate-600 bg-white border border-slate-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder="Description"
                       />
                    </div>
                 ) : (
                    <>
                       <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-2xl font-bold text-slate-900">{selectedRole.name}</h2>
                          {selectedRole.isSystem && (
                            <span title="System Role (Read-only)">
                              <Lock size={16} className="text-slate-400" />
                            </span>
                          )}
                       </div>
                       <p className="text-slate-500">{selectedRole.description}</p>
                    </>
                 )}
              </div>
              <div className="flex gap-2">
                 {isEditing ? (
                    <>
                       <button onClick={handleEditToggle} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium">Cancel</button>
                       <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium">
                          <Save size={16} /> Save Changes
                       </button>
                    </>
                 ) : (
                    <>
                       {!selectedRole.isSystem && (
                          <button onClick={() => handleDeleteRole(selectedRole.id)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors">
                             <Trash2 size={18} />
                          </button>
                       )}
                       <button onClick={handleEditToggle} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium shadow-sm">
                          Edit Permissions
                       </button>
                    </>
                 )}
              </div>
           </div>

           {/* Permissions Matrix */}
           <div className="flex-1 overflow-y-auto p-8">
              {isSuperAdmin ? (
                 <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 flex items-center gap-4 text-indigo-900">
                    <Shield size={32} className="text-indigo-600" />
                    <div>
                       <h3 className="font-bold text-lg">Administrator Access</h3>
                       <p className="text-sm opacity-80">This role has unrestricted access to all modules and settings.</p>
                    </div>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                       <div key={category} className="space-y-3">
                          <h4 className="font-bold text-slate-800 uppercase text-xs tracking-wider border-b border-slate-100 pb-2 mb-3">
                             {category}
                          </h4>
                          {perms.map(perm => (
                             <div key={perm.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <button 
                                   disabled={!isEditing}
                                   onClick={() => togglePermission(perm.id)}
                                   className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                      currentRoleState.permissions.includes(perm.id) 
                                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                                      : 'bg-white border-slate-300'
                                   } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                   {currentRoleState.permissions.includes(perm.id) && <Check size={12} strokeWidth={4} />}
                                </button>
                                <div>
                                   <p className={`text-sm font-medium ${currentRoleState.permissions.includes(perm.id) ? 'text-slate-900' : 'text-slate-500'}`}>
                                      {perm.label}
                                   </p>
                                </div>
                             </div>
                          ))}
                       </div>
                    ))}
                 </div>
              )}
              
              {!isSuperAdmin && currentRoleState.permissions.length === 0 && (
                 <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3 text-amber-800">
                    <AlertTriangle size={20} />
                    <p className="text-sm">This role currently has no specific permissions assigned.</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
