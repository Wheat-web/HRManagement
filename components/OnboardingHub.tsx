
import React, { useState } from 'react';
import { MOCK_EMPLOYEES } from '../constants';
import { Employee, OnboardingPlan, OnboardingTask, Candidate, CandidateStage } from '../types';
import { generateOnboardingPlan } from '../services/geminiService';
import { UserPlus, Sparkles, CheckCircle, Circle, Mail, Send, ChevronDown, ChevronRight, Loader2, RefreshCw, X, Plus, UserCheck, Briefcase } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface OnboardingHubProps {
  candidates?: Candidate[];
  employees?: Employee[];
  onAddEmployee?: (emp: Employee) => void;
}

const OnboardingHub: React.FC<OnboardingHubProps> = ({ candidates = [], employees = [], onAddEmployee }) => {
  const { showToast } = useToast();
  
  // State
  const [newHires, setNewHires] = useState<Employee[]>(
    // Initialize with a few mock employees who are in onboarding status if no props passed or empty
    employees.filter(e => e.status === 'Onboarding').length > 0 
      ? employees.filter(e => e.status === 'Onboarding') 
      : MOCK_EMPLOYEES.filter(e => ['Active', 'Onboarding'].includes(e.status)).slice(0, 4)
  );
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refinement, setRefinement] = useState('');
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});

  // Manual Entry State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<'candidate' | 'manual'>('candidate');
  const [manualEntry, setManualEntry] = useState({ name: '', role: '', department: '' });
  const [linkedId, setLinkedId] = useState('');
  const [buddyId, setBuddyId] = useState('');
  const [createEmployeeRecord, setCreateEmployeeRecord] = useState(true);

  // Filter candidates who are in Offer stage
  const offeredCandidates = candidates.filter(c => c.stage === CandidateStage.OFFER);

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setPlan(null); // Reset plan when switching
    setExpandedPhases({});
  };

  const handleGeneratePlan = async () => {
    if (!selectedEmployee) return;
    setIsLoading(true);
    try {
      const generatedPlan = await generateOnboardingPlan(
        selectedEmployee.name, 
        selectedEmployee.role, 
        selectedEmployee.department
      );
      setPlan(generatedPlan);
      // Auto expand first phase
      if (generatedPlan.phases.length > 0) {
        setExpandedPhases({ [generatedPlan.phases[0].id]: true });
      }
      showToast('Onboarding plan generated successfully', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate plan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefinePlan = async () => {
    if (!selectedEmployee || !plan || !refinement) return;
    setIsLoading(true);
    try {
      const updatedPlan = await generateOnboardingPlan(
        selectedEmployee.name,
        selectedEmployee.role,
        selectedEmployee.department,
        refinement,
        plan
      );
      setPlan(updatedPlan);
      setRefinement('');
      showToast('Plan updated based on your feedback', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to update plan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setLinkedId(id);
    
    if (!id) {
        setManualEntry({ name: '', role: '', department: '' });
        return;
    }

    if (entryMode === 'candidate') {
        const candidate = offeredCandidates.find(c => c.id === id);
        if (candidate) {
            setManualEntry({
                name: candidate.name,
                role: candidate.role,
                department: manualEntry.department || 'Engineering' // Default or guess
            });
        }
    }
  };

  const handleAddEntry = () => {
    if (!manualEntry.name || !manualEntry.role) return;
    
    // Create new
    const newEmp = createNewEmployeeObj();
    
    // If "Create Employee Record" is checked and function is provided
    if (createEmployeeRecord && onAddEmployee) {
        onAddEmployee(newEmp);
    }

    setNewHires(prev => [newEmp, ...prev]);
    setIsAddModalOpen(false);
    
    // Reset Form
    setManualEntry({ name: '', role: '', department: '' });
    setLinkedId('');
    setBuddyId('');
    setEntryMode('candidate');
    
    handleSelectEmployee(newEmp); // Auto-select
    showToast('New hire created and added to onboarding', 'success');
  };

  const createNewEmployeeObj = (): Employee => ({
    id: `e_new_${Date.now()}`,
    name: manualEntry.name,
    role: manualEntry.role,
    department: manualEntry.department || 'General',
    email: '', 
    status: 'Onboarding',
    joinDate: new Date().toISOString().split('T')[0],
    salary: 0, 
    currency: 'USD', 
    location: 'Remote', 
    shiftId: 'sh1',
    customAttributes: buddyId ? { 'Onboarding Buddy': employees.find(e => e.id === buddyId)?.name || '' } : undefined
  });

  const toggleTask = (phaseIndex: number, taskIndex: number) => {
    if (!plan) return;
    const newPhases = [...plan.phases];
    newPhases[phaseIndex].tasks[taskIndex].isCompleted = !newPhases[phaseIndex].tasks[taskIndex].isCompleted;
    setPlan({ ...plan, phases: newPhases });
  };

  const togglePhase = (id: string) => {
    setExpandedPhases(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'IT': return 'bg-blue-100 text-blue-700';
      case 'HR': return 'bg-purple-100 text-purple-700';
      case 'Training': return 'bg-emerald-100 text-emerald-700';
      case 'Team': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Left Panel: New Hires List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <UserPlus size={18} /> Onboarding List
          </h2>
          <p className="text-xs text-slate-500 mt-1">Select an employee to manage onboarding.</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {newHires.length === 0 ? (
             <div className="p-8 text-center text-slate-400 text-sm">
                No active onboarding found.
             </div>
          ) : (
             newHires.map(emp => (
                <div 
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${selectedEmployee?.id === emp.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{emp.name}</h3>
                      <p className="text-xs text-slate-500">{emp.role}</p>
                      <p className="text-xs text-slate-400 mt-1">{emp.department}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {emp.name.charAt(0)}
                    </div>
                  </div>
                </div>
             ))
          )}
        </div>
        <div className="p-4 border-t border-slate-100">
           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
           >
             <Plus size={16} /> Add to Onboarding
           </button>
        </div>
      </div>

      {/* Right Panel: Onboarding Plan */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {!selectedEmployee ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <Sparkles size={48} className="mb-4 opacity-20" />
            <p>Select a new hire to start their onboarding journey.</p>
          </div>
        ) : !plan ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
             <div className="max-w-md space-y-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                   <Sparkles size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Generate Onboarding Plan</h3>
                   <p className="text-slate-500 text-sm">
                      Use AI to create a tailored 30-60-90 day plan, task checklist, and welcome email for 
                      <span className="font-semibold text-slate-800"> {selectedEmployee.name}</span> based on their role as 
                      <span className="font-semibold text-slate-800"> {selectedEmployee.role}</span>.
                   </p>
                </div>
                <button 
                  onClick={handleGeneratePlan}
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all"
                >
                   {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                   {isLoading ? 'Generating Plan...' : 'Generate Plan with AI'}
                </button>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
             {/* Plan Header */}
             <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div>
                   <h2 className="text-xl font-bold text-slate-900">Onboarding: {plan.employeeName}</h2>
                   <p className="text-sm text-slate-500">{plan.role} • {plan.phases.reduce((acc, p) => acc + p.tasks.length, 0)} Tasks</p>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50" title="Regenerate">
                      <RefreshCw size={18} />
                   </button>
                   <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                      <Mail size={16} /> Send Welcome Email
                   </button>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Welcome Email Preview */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                   <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Mail size={12} /> Draft Welcome Email
                   </h3>
                   <div className="bg-white p-3 rounded border border-indigo-100 text-sm text-slate-600 italic leading-relaxed">
                      "{plan.welcomeMessage}"
                   </div>
                </div>

                {/* Phases Accordion */}
                <div className="space-y-4">
                   {plan.phases.map((phase, pIdx) => {
                      const isExpanded = expandedPhases[phase.id];
                      const completedCount = phase.tasks.filter(t => t.isCompleted).length;
                      const totalCount = phase.tasks.length;
                      const progress = Math.round((completedCount / totalCount) * 100) || 0;

                      return (
                         <div key={phase.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <button 
                               onClick={() => togglePhase(phase.id)}
                               className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
                            >
                               <div className="flex items-center gap-3">
                                  {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                                  <h3 className="font-bold text-slate-800">{phase.name}</h3>
                                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{completedCount}/{totalCount}</span>
                               </div>
                               <div className="flex items-center gap-3">
                                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                  </div>
                                  <span className="text-xs font-medium text-slate-600 w-8 text-right">{progress}%</span>
                               </div>
                            </button>
                            
                            {isExpanded && (
                               <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2 animate-in slide-in-from-top-1 duration-200">
                                  {phase.tasks.map((task, tIdx) => (
                                     <div 
                                        key={task.id} 
                                        onClick={() => toggleTask(pIdx, tIdx)}
                                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all group"
                                     >
                                        <div className={`mt-0.5 ${task.isCompleted ? 'text-emerald-500' : 'text-slate-300 group-hover:text-indigo-400'}`}>
                                           {task.isCompleted ? <CheckCircle size={20} className="fill-emerald-50" /> : <Circle size={20} />}
                                        </div>
                                        <div className="flex-1">
                                           <p className={`text-sm font-medium ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                              {task.task}
                                           </p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getCategoryColor(task.category)}`}>
                                           {task.category}
                                        </span>
                                     </div>
                                  ))}
                               </div>
                            )}
                         </div>
                      );
                   })}
                </div>
             </div>

             {/* Refinement Chat */}
             <div className="p-4 border-t border-slate-200 bg-white">
                <div className="relative">
                   <input 
                      type="text" 
                      value={refinement}
                      onChange={(e) => setRefinement(e.target.value)}
                      placeholder="Ask AI to refine (e.g. 'Add a task for security training in Week 1')..."
                      className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                      disabled={isLoading}
                      onKeyDown={(e) => e.key === 'Enter' && handleRefinePlan()}
                   />
                   <button 
                      onClick={handleRefinePlan}
                      disabled={!refinement || isLoading}
                      className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                   >
                      {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-slate-800">Add to Onboarding</h3>
                 <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              
              {/* Tab Switcher */}
              <div className="flex border-b border-slate-200">
                 <button 
                    onClick={() => { setEntryMode('candidate'); setLinkedId(''); setManualEntry({ name: '', role: '', department: '' }); }}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${entryMode === 'candidate' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                    <Briefcase size={16} /> Recruitment
                 </button>
                 <button 
                    onClick={() => { setEntryMode('manual'); setLinkedId(''); setManualEntry({ name: '', role: '', department: '' }); }}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${entryMode === 'manual' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                    <Plus size={16} /> Manual
                 </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                 {/* Selection Logic */}
                 {entryMode === 'candidate' && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                           <UserCheck size={14} /> Select Offered Candidate
                        </label>
                        <select 
                           className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm mb-2"
                           onChange={handleSourceSelect}
                           value={linkedId}
                        >
                           <option value="">-- Select Candidate --</option>
                           {offeredCandidates.map(c => (
                              <option key={c.id} value={c.id}>{c.name} - {c.role}</option>
                           ))}
                        </select>
                        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                           <input 
                              type="checkbox" 
                              checked={createEmployeeRecord}
                              onChange={(e) => setCreateEmployeeRecord(e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                           />
                           Create Employee Record (Add to Directory)
                        </label>
                    </div>
                 )}

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                    <input 
                       value={manualEntry.name}
                       onChange={(e) => setManualEntry({...manualEntry, name: e.target.value})}
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                       placeholder="e.g. Michael Chen"
                       readOnly={!!linkedId && entryMode !== 'manual'}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role / Job Title</label>
                    <input 
                       value={manualEntry.role}
                       onChange={(e) => setManualEntry({...manualEntry, role: e.target.value})}
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                       placeholder="e.g. Senior Data Analyst"
                       readOnly={!!linkedId && entryMode !== 'manual'}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                    <input 
                       value={manualEntry.department}
                       onChange={(e) => setManualEntry({...manualEntry, department: e.target.value})}
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                       placeholder="e.g. Engineering"
                    />
                 </div>

                 {/* Buddy Selection */}
                 <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign Onboarding Buddy</label>
                    <select 
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                       onChange={(e) => setBuddyId(e.target.value)}
                       value={buddyId}
                    >
                       <option value="">-- No Buddy Assigned --</option>
                       {employees.map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                       ))}
                    </select>
                 </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                 <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium">Cancel</button>
                 <button 
                    onClick={handleAddEntry}
                    disabled={!manualEntry.name || !manualEntry.role}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                 >
                    {entryMode === 'candidate' ? 'Hire & Onboard' : 'Start Onboarding'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingHub;
