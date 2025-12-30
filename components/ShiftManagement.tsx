import React, { useState } from 'react';
import { MOCK_EMPLOYEES, MOCK_SHIFTS } from '../constants';
import { Employee, Shift } from '../types';
import { Clock, Users, Search, ChevronRight, Edit2, CheckCircle2, Plus, X, Trash2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ShiftManagement: React.FC = () => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShift, setNewShift] = useState<Partial<Shift>>({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    color: 'bg-blue-100 text-blue-800'
  });

  const getShift = (id: string) => shifts.find(s => s.id === id);

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShiftChange = (empId: string, shiftId: string) => {
    setEmployees(employees.map(e => e.id === empId ? { ...e, shiftId } : e));
    showToast('Employee shift updated', 'success');
  };

  const handleAddShift = () => {
    if (!newShift.name || !newShift.startTime || !newShift.endTime) return;
    
    const shiftToAdd: Shift = {
      id: `sh_${Date.now()}`,
      name: newShift.name!,
      startTime: newShift.startTime!,
      endTime: newShift.endTime!,
      color: newShift.color || 'bg-blue-100 text-blue-800'
    };

    setShifts([...shifts, shiftToAdd]);
    setIsModalOpen(false);
    setNewShift({ name: '', startTime: '09:00', endTime: '18:00', color: 'bg-blue-100 text-blue-800' });
    showToast('New shift created successfully', 'success');
  };

  const handleDeleteShift = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const assignedCount = employees.filter(e => e.shiftId === id).length;
    if (assignedCount > 0) {
      showToast(`Cannot delete shift. It is currently assigned to ${assignedCount} employees.`, 'warning');
      return;
    }
    setShifts(shifts.filter(s => s.id !== id));
    if (activeShift?.id === id) setActiveShift(null);
    showToast('Shift deleted successfully', 'info');
  };

  const colorOptions = [
    { label: 'Blue', value: 'bg-blue-100 text-blue-800', bg: 'bg-blue-100' },
    { label: 'Emerald', value: 'bg-emerald-100 text-emerald-800', bg: 'bg-emerald-100' },
    { label: 'Purple', value: 'bg-purple-100 text-purple-800', bg: 'bg-purple-100' },
    { label: 'Amber', value: 'bg-amber-100 text-amber-800', bg: 'bg-amber-100' },
    { label: 'Rose', value: 'bg-rose-100 text-rose-800', bg: 'bg-rose-100' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Shift & Timing Management</h1>
           <p className="text-slate-500">Manage employee rosters and shift assignments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Shift List (Left Panel) */}
        <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider">Available Shifts</h3>
            {shifts.map(shift => (
                <div 
                   key={shift.id} 
                   onClick={() => setActiveShift(shift)}
                   className={`p-4 rounded-xl border cursor-pointer transition-all group relative ${
                       activeShift?.id === shift.id 
                       ? `border-indigo-500 ring-1 ring-indigo-500 bg-white` 
                       : 'border-slate-200 bg-white hover:border-indigo-300'
                   }`}
                >
                   <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-slate-800">{shift.name}</span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${shift.color}`}>
                           Active
                       </span>
                   </div>
                   <div className="flex items-center text-sm text-slate-500 gap-2">
                       <Clock size={14} />
                       {shift.startTime} - {shift.endTime}
                   </div>
                   <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                       <span>Members</span>
                       <span className="font-bold text-slate-700">{employees.filter(e => e.shiftId === shift.id).length}</span>
                   </div>
                   
                   <button 
                    onClick={(e) => handleDeleteShift(e, shift.id)}
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
            ))}
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
            >
                <Plus size={16} /> Add New Shift
            </button>
        </div>

        {/* Employee Roster (Right Panel) */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="relative w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input 
                      type="text" 
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   />
                </div>
                <div className="text-sm text-slate-500">
                    Showing <span className="font-bold text-slate-900">{filteredEmployees.length}</span> employees
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-white sticky top-0 z-10 border-b border-slate-100 shadow-sm">
                        <tr>
                            <th className="px-6 py-3 font-semibold text-slate-700">Employee</th>
                            <th className="px-6 py-3 font-semibold text-slate-700">Role</th>
                            <th className="px-6 py-3 font-semibold text-slate-700">Current Shift</th>
                            <th className="px-6 py-3 font-semibold text-slate-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredEmployees.map(emp => {
                            const currentShift = getShift(emp.shiftId);
                            return (
                                <tr key={emp.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{emp.name}</p>
                                                <p className="text-xs text-slate-400">{emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{emp.role}</td>
                                    <td className="px-6 py-4">
                                        {currentShift ? (
                                            <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium ${currentShift.color}`}>
                                                <Clock size={12} />
                                                {currentShift.name} ({currentShift.startTime} - {currentShift.endTime})
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 italic">Not Assigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="group relative inline-block text-left">
                                            <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center justify-end gap-1 ml-auto">
                                              Change <ChevronRight size={12} />
                                            </button>
                                            <div className="hidden group-hover:block absolute right-0 mt-0 w-48 bg-white rounded-md shadow-lg border border-slate-100 z-50">
                                                <div className="py-1">
                                                    {shifts.map(s => (
                                                        <button 
                                                            key={s.id}
                                                            onClick={() => handleShiftChange(emp.id, s.id)}
                                                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                        >
                                                            {s.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Add Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-slate-800">Add New Shift</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Shift Name</label>
                    <input 
                       value={newShift.name}
                       onChange={(e) => setNewShift({...newShift, name: e.target.value})}
                       placeholder="e.g. Afternoon Shift"
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                      <input 
                         type="time"
                         value={newShift.startTime}
                         onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
                      <input 
                         type="time"
                         value={newShift.endTime}
                         onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Color Label</label>
                    <div className="flex gap-3">
                       {colorOptions.map((opt) => (
                          <button
                            key={opt.label}
                            onClick={() => setNewShift({...newShift, color: opt.value})}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${opt.bg} ${newShift.color === opt.value ? 'border-slate-600 scale-110' : 'border-transparent'}`}
                            title={opt.label}
                          >
                             {newShift.color === opt.value && <CheckCircle2 size={16} className="text-slate-700" />}
                          </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium">Cancel</button>
                 <button 
                    onClick={handleAddShift}
                    disabled={!newShift.name || !newShift.startTime || !newShift.endTime}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                 >
                    Create Shift
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;