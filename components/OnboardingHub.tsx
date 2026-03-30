import React, { useState, useEffect } from "react";
import {
  Employee,
  OnboardingPlan,
  OnboardingTask,
  Candidate,
  CandidateStage,
} from "../types";
import { generateOnboardingPlan } from "../services/geminiService";
import {
  UserPlus,
  Sparkles,
  CheckCircle,
  Circle,
  Mail,
  Send,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
  X,
  Plus,
  UserCheck,
  Briefcase,
  Laptop,
  Activity,
  FileText,
  Shield,
  Trash2,
  ListTodo,
  Zap,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import {
  CandidateCombo,
  getOfferedCandidateCombo,
} from "@/services/candidateService";
import api from "@/services/api";
import { getEmployeeCombo, EmployeeCombo } from "@/services/employeeService";
import { jwtDecode } from "jwt-decode";
import DynamicWorkflow from "./DynamicWorkflow";
import { MOCK_EMPLOYEES } from "@/constants";

interface OnboardingHubProps {
  candidates?: Candidate[];
  employees?: Employee[];
  onAddEmployee?: (emp: Employee) => void;
  currentUserRole: string;
}

const OnboardingHub: React.FC<OnboardingHubProps> = ({
  // candidates = [],
  // employees = [],
  onAddEmployee,
}) => {
  const { showToast } = useToast();

  // State
  // const [newHires, setNewHires] = useState<Employee[]>(
  //   employees.filter((e) => e.status === "Onboarding").length > 0
  //     ? employees.filter((e) => e.status === "Onboarding")
  //     : MOCK_EMPLOYEES.filter((e) =>
  //         ["Active", "Onboarding"].includes(e.status),
  //       ).slice(0, 4),
  // );

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<
    "checklist" | "workflow" | "hr_actions"
  >("workflow");
  const [checklists, setChecklists] = useState<
    Record<
      string,
      {
        id: string;
        phase: string;
        text: string;
        completed: boolean;
        role: string;
      }[]
    >
  >({});
  const [newTaskText, setNewTaskText] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("Pre-boarding");
  const [selectedRole, setSelectedRole] = useState("HR");

  const PHASES = ["Pre-boarding", "Week 1", "Week 2", "Month 1"];
  const ROLES = ["HR", "Manager", "IT", "Candidate"];

  // Manual Entry State
  // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // const [entryMode, setEntryMode] = useState<'candidate' | 'manual'>('candidate');
  // const [manualEntry, setManualEntry] = useState({ name: '', role: '', department: '' });
  // const [linkedId, setLinkedId] = useState('');
  // const [buddyId, setBuddyId] = useState('');
  // const [createEmployeeRecord, setCreateEmployeeRecord] = useState(true);

  // Filter candidates who are in Offer stage
  // const offeredCandidates = candidates.filter(c => c.stage === CandidateStage.OFFER);

  // const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
  //   null,
  // );

  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refinement, setRefinement] = useState("");
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>(
    {},
  );

  // Manual Entry State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<"candidate" | "manual">(
    "candidate",
  );
  const [manualEntry, setManualEntry] = useState({
    name: "",
    role: "",
    department: "",
  });
  const [linkedId, setLinkedId] = useState("");
  const [buddyId, setBuddyId] = useState("");
  const [createEmployeeRecord, setCreateEmployeeRecord] = useState(true);
  const [offeredCandidates, setOfferedCandidates] = useState<CandidateCombo[]>(
    [],
  );
  const [employees, setEmployees] = useState<EmployeeCombo[]>([]);
  const [onboardingList, setOnboardingList] = useState<any[]>([]);

  const [newHires, setNewHires] = useState<Employee[]>(
    // Initialize with a few mock employees who are in onboarding status if no props passed or empty
    employees.filter((e) => e.status === "Onboarding").length > 0
      ? employees.filter((e) => e.status === "Onboarding")
      : MOCK_EMPLOYEES.filter((e) =>
          ["Active", "Onboarding"].includes(e.status),
        ).slice(0, 4),
  );

  useEffect(() => {
    loadCandidates();
    loadEmployeeCombo();
    loadOnBoarding();
  }, []);

  const loadCandidates = async () => {
    try {
      const data = await getOfferedCandidateCombo();
      setOfferedCandidates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEmployeeCombo = async () => {
    try {
      const data = await getEmployeeCombo();
      console.log(data, "data..............");

      setEmployees(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const decoded: any = jwtDecode(token);
    return decoded.id;
  };

  const loadOnBoarding = async () => {
    try {
      const res = await api.get("/OnBoarding");
      console.log("Onboarding List:", res.data);
      setOnboardingList(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Filter candidates who are in Offer stage
  //   const offeredCandidates = candidates.filter(
  //     (c) => c.stage === CandidateStage.OFFER,
  //   );

  const createOnboarding = async (payload: any) => {
    return await api.post("/OnBoarding", payload);
  };

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
        selectedEmployee.department,
      );
      setPlan(generatedPlan);
      // Auto expand first phase
      if (generatedPlan.phases.length > 0) {
        setExpandedPhases({ [generatedPlan.phases[0].id]: true });
      }
      showToast("Onboarding plan generated successfully", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to generate plan", "error");
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
        plan,
      );
      setPlan(updatedPlan);
      setRefinement("");
      showToast("Plan updated based on your feedback", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to update plan", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const id = e.target.value;
    setLinkedId(id);
    setManualEntry({ name: "", role: "", department: "" });

    if (!id) return;

    try {
      const res = await api.get(`/OnBoarding/candidate/${id}`);
      const candidate = res.data;

      if (!candidate) return;

      setManualEntry({
        name: candidate.fullName || "",
        role: candidate.jobTitle || "",
        department: candidate.targetRole || "",
      });
    } catch (err) {
      console.error(err);

      setManualEntry({ name: "", role: "", department: "" });
    }
  };

  const handleAddEntry = async () => {
    if (!manualEntry.name || !manualEntry.role) return;
    const userId = getUserIdFromToken();

    try {
      const payload = {
        CandidateID: linkedId || null,
        EmployeeID: null,
        FullName: manualEntry.name,
        JobTitle: manualEntry.role,
        DepartmentID: null,
        OnboardingBuddyID: buddyId || null,
        CreateEmployeeRecord: createEmployeeRecord,
        OnboardingStatus: "Pending",
        HireDate: new Date().toISOString(),
        CreatedBy: userId || 1,
        BranchID: 1,
      };
      await api.post("/OnBoarding", payload);
      showToast("Onboarding created successfully", "success");
      loadOnBoarding();
      setIsAddModalOpen(false);
      setManualEntry({ name: "", role: "", department: "" });
      setLinkedId("");
      setBuddyId("");
      setEntryMode("candidate");
    } catch (error) {
      console.error(error);
      showToast("Failed to create onboarding", "error");
    }
  };

  const toggleTask = (phaseIndex: number, taskIndex: number) => {
    if (!plan) return;
    const newPhases = [...plan.phases];
    newPhases[phaseIndex].tasks[taskIndex].isCompleted =
      !newPhases[phaseIndex].tasks[taskIndex].isCompleted;
    setPlan({ ...plan, phases: newPhases });
  };

  const togglePhase = (id: string) => {
    setExpandedPhases((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "IT":
        return "bg-blue-100 text-blue-700";
      case "HR":
        return "bg-purple-100 text-purple-700";
      case "Training":
        return "bg-emerald-100 text-emerald-700";
      case "Team":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  //  const handleSelectEmployee = (emp: Employee) => {
  //   setSelectedEmployee(emp);
  //   setNewTaskText('');
  // };

  const handleAddChecklistItem = () => {
    if (!selectedEmployee || !newTaskText.trim()) return;

    const newTask = {
      id: `task_${Date.now()}`,
      phase: selectedPhase,
      role: selectedRole,
      text: newTaskText.trim(),
      completed: false,
    };

    setChecklists((prev) => ({
      ...prev,
      [selectedEmployee.id]: [...(prev[selectedEmployee.id] || []), newTask],
    }));

    setNewTaskText("");
    showToast("Task added to checklist", "success");
  };

  const toggleChecklistItem = (taskId: string) => {
    if (!selectedEmployee) return;

    setChecklists((prev) => ({
      ...prev,
      [selectedEmployee.id]: prev[selectedEmployee.id].map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    }));
  };

  const deleteChecklistItem = (taskId: string) => {
    if (!selectedEmployee) return;

    setChecklists((prev) => ({
      ...prev,
      [selectedEmployee.id]: prev[selectedEmployee.id].filter(
        (task) => task.id !== taskId,
      ),
    }));
    showToast("Task removed", "success");
  };

  const handleLoadToPlan = () => {
    if (!selectedEmployee) return;
    const employeeTasks = checklists[selectedEmployee.id] || [];
    if (employeeTasks.length === 0) {
      showToast("Please add tasks to the checklist first", "error");
      return;
    }
  };

  // const newWorkflow = {
  //   id: `wf_${Date.now()}`,
  //   employeeId: selectedEmployee.id,
  //   templateId: "custom_checklist",
  //   title: `Custom Onboarding: ${selectedEmployee.name}`,
  //   status: "in_progress" as const,
  //   currentStepId: `step_${PHASES[0]}`,
  //   steps: PHASES.map((phase, index) => {
  //     const phaseTasks = employeeTasks.filter((t) => t.phase === phase);
  //     return {
  //       id: `step_${phase.replace(/\s+/g, "_")}`,
  //       title: phase,
  //       description: `Tasks for ${phase}`,
  //       status: index === 0 ? ("active" as const) : ("locked" as const),
  //       dependsOn:
  //         index > 0
  //           ? [`step_${PHASES[index - 1].replace(/\s+/g, "_")}`]
  //           : undefined,
  //       actions: phaseTasks.map((task, tIdx) => ({
  //         id: `action_${phase.replace(/\s+/g, "_")}_${tIdx}`,
  //         label: task.text,
  //         type: "acknowledge" as const,
  //         requiredRole: (task.role || "HR") as any,
  //         status: task.completed
  //           ? ("completed" as const)
  //           : ("pending" as const),
  //       })),
  //     };
  //   }).filter((step) => step.actions.length > 0), // Only include phases with tasks
  // };

  // Update the mock workflows directly
  //   import('../mockWorkflows').then(({ MOCK_WORKFLOWS }) => {
  //     MOCK_WORKFLOWS[selectedEmployee.id] = newWorkflow;
  //     setActiveTab('workflow');
  //     showToast('Checklist loaded to Onboarding Plan', 'success');
  //   });
  // };

  // const handleSourceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const id = e.target.value;
  //   setLinkedId(id);

  //   if (!id) {
  //       setManualEntry({ name: '', role: '', department: '' });
  //       return;
  //   }

  //   if (entryMode === 'candidate') {
  //       const candidate = offeredCandidates.find(c => c.id === id);
  //       if (candidate) {
  //           setManualEntry({
  //               name: candidate.name,
  //               role: candidate.role,
  //               department: manualEntry.department || 'Engineering' // Default or guess
  //           });
  //       }
  //   }
  // };

  // const handleAddEntry = () => {
  //   if (!manualEntry.name || !manualEntry.role) return;

  //   // Create new
  //   const newEmp = createNewEmployeeObj();

  //   // If "Create Employee Record" is checked and function is provided
  //   if (createEmployeeRecord && onAddEmployee) {
  //       onAddEmployee(newEmp);
  //   }

  //   setNewHires(prev => [newEmp, ...prev]);
  //   setIsAddModalOpen(false);

  //   // Reset Form
  //   setManualEntry({ name: '', role: '', department: '' });
  //   setLinkedId('');
  //   setBuddyId('');
  //   setEntryMode('candidate');

  //   handleSelectEmployee(newEmp); // Auto-select
  //   showToast('New hire created and added to onboarding', 'success');
  // };

  const createNewEmployeeObj = (): Employee => ({
    id: `e_new_${Date.now()}`,
    name: manualEntry.name,
    role: manualEntry.role,
    department: manualEntry.department || "General",
    email: "",
    status: "Onboarding",
    joinDate: new Date().toISOString().split("T")[0],
    salary: 0,
    paymentFrequency: "Annual",
    currency: "USD",
    location: "Remote",
    shiftId: "sh1",
    branchId: "b1", // Default assignment
    customAttributes: buddyId
      ? {
          "Onboarding Buddy":
            employees.find((e) => e.id === buddyId)?.name || "",
        }
      : undefined,
  });

  return (
    <div className="h-full flex gap-6">
      {/* Left Panel: New Hires List */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <UserPlus size={18} /> Onboarding List
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Select an employee to manage onboarding.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {newHires.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No active onboarding found.
            </div>
          ) : (
            newHires.map((emp) => (
              <div
                key={emp.id}
                onClick={() => handleSelectEmployee(emp)}
                className={`p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${selectedEmployee?.id === emp.id ? "bg-indigo-50 border-l-4 border-l-indigo-600" : "border-l-4 border-l-transparent"}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{emp.name}</h3>
                    <p className="text-xs text-slate-500">{emp.role}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {emp.department}
                    </p>
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
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-4">
              <button
                onClick={() => setActiveTab("workflow")}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "workflow"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Activity size={16} /> Onboarding Plan
              </button>
              <button
                onClick={() => setActiveTab("checklist")}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "checklist"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <ListTodo size={16} /> Create Checklist
              </button>
              <button
                onClick={() => setActiveTab("hr_actions")}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "hr_actions"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Zap size={16} /> HR Actions
              </button>
            </div>

            {activeTab === "workflow" ? (
              <DynamicWorkflow
                employeeId={selectedEmployee.id}
                // currentUserRole={currentUserRole}
              />
            ) : activeTab === "checklist" ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Onboarding Checklist: {selectedEmployee.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      Create and manage a custom checklist for this new hire.
                    </p>
                  </div>
                  <button
                    onClick={handleLoadToPlan}
                    disabled={
                      !checklists[selectedEmployee.id] ||
                      checklists[selectedEmployee.id].length === 0
                    }
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Activity size={16} /> Load to Plan
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="flex gap-2 mb-6">
                    <select
                      value={selectedPhase}
                      onChange={(e) => setSelectedPhase(e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                    >
                      {PHASES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Add a new task (e.g. 'Set up email account')..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddChecklistItem()
                      }
                    />
                    <button
                      onClick={handleAddChecklistItem}
                      disabled={!newTaskText.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Plus size={16} /> Add Task
                    </button>
                  </div>

                  {!checklists[selectedEmployee.id] ||
                  checklists[selectedEmployee.id].length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                      <ListTodo size={48} className="mx-auto mb-4 opacity-20" />
                      <p>
                        No checklist items yet. Add tasks above to create a
                        custom onboarding checklist.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {PHASES.map((phase) => {
                        const phaseTasks = checklists[
                          selectedEmployee.id
                        ].filter((t) => t.phase === phase);
                        if (phaseTasks.length === 0) return null;

                        return (
                          <div key={phase} className="space-y-3">
                            <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">
                              {phase}
                            </h3>
                            <div className="space-y-2">
                              {phaseTasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 transition-all group"
                                >
                                  <button
                                    onClick={() => toggleChecklistItem(task.id)}
                                    className={`mt-0.5 ${task.completed ? "text-emerald-500" : "text-slate-300 group-hover:text-indigo-400"}`}
                                  >
                                    {task.completed ? (
                                      <CheckCircle
                                        size={20}
                                        className="fill-emerald-50"
                                      />
                                    ) : (
                                      <Circle size={20} />
                                    )}
                                  </button>
                                  <div className="flex-1 flex items-center justify-between">
                                    <p
                                      className={`text-sm font-medium ${task.completed ? "text-slate-400 line-through" : "text-slate-700"}`}
                                    >
                                      {task.text}
                                    </p>
                                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                                      {task.role || "HR"}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => deleteChecklistItem(task.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                <div className="p-6 border-b border-slate-200 bg-white">
                  <h2 className="text-xl font-bold text-slate-900">
                    HR Actions: {selectedEmployee.name}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Quick actions and standard procedures for professional HR
                    management.
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <FileText size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800">
                          Send Offer Letter
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 flex-1">
                        Generate and send the official offer letter via email
                        with DocuSign integration.
                      </p>
                      <button
                        onClick={() =>
                          showToast(
                            `Offer letter sent to ${selectedEmployee.email}`,
                            "success",
                          )
                        }
                        className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Send size={16} /> Send Offer
                      </button>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                          <Mail size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800">
                          Welcome Email
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 flex-1">
                        Send a warm welcome email with first-day instructions
                        and company handbook.
                      </p>
                      <button
                        onClick={() =>
                          showToast(
                            `Welcome email sent to ${selectedEmployee.email}`,
                            "success",
                          )
                        }
                        className="w-full py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Send size={16} /> Send Welcome
                      </button>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                          <Shield size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800">
                          Background Check
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 flex-1">
                        Initiate a comprehensive background check via Checkr
                        integration.
                      </p>
                      <button
                        onClick={() =>
                          showToast(
                            `Background check initiated for ${selectedEmployee.name}`,
                            "success",
                          )
                        }
                        className="w-full py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Activity size={16} /> Initiate Check
                      </button>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Laptop size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800">
                          IT Provisioning
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 flex-1">
                        Create a ticket for the IT department to prepare laptop
                        and accounts.
                      </p>
                      <button
                        onClick={() =>
                          showToast(`IT provisioning ticket created`, "success")
                        }
                        className="w-full py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={16} /> Create IT Ticket
                      </button>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                          <FileText size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800">
                          Request Signatures
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 flex-1">
                        Send standard HR forms (W-4, I-9, Direct Deposit) for
                        e-signature.
                      </p>
                      <button
                        onClick={() =>
                          showToast(
                            `Signature request sent to ${selectedEmployee.email}`,
                            "success",
                          )
                        }
                        className="w-full py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Send size={16} /> Request Signatures
                      </button>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                          <UserPlus size={20} />
                        </div>
                        <h3 className="font-bold text-slate-800">
                          Assign Buddy
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500 mb-4 flex-1">
                        Assign an onboarding buddy or mentor to help the new
                        hire acclimate.
                      </p>
                      <button
                        onClick={() =>
                          showToast(
                            `Buddy assignment workflow initiated`,
                            "success",
                          )
                        }
                        className="w-full py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <UserPlus size={16} /> Assign Buddy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Add to Onboarding</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => {
                  setEntryMode("candidate");
                  setLinkedId("");
                  setManualEntry({ name: "", role: "", department: "" });
                }}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${entryMode === "candidate" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Briefcase size={16} /> Recruitment
              </button>
              <button
                onClick={() => {
                  setEntryMode("manual");
                  setLinkedId("");
                  setManualEntry({ name: "", role: "", department: "" });
                }}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${entryMode === "manual" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <Plus size={16} /> Manual
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Selection Logic */}
              {entryMode === "candidate" && (
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
                    {offeredCandidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.role}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createEmployeeRecord}
                      onChange={(e) =>
                        setCreateEmployeeRecord(e.target.checked)
                      }
                      className="rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />
                    Create Employee Record (Add to Directory)
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Full Name
                </label>
                <input
                  value={manualEntry.name}
                  onChange={(e) =>
                    setManualEntry({ ...manualEntry, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. Michael Chen"
                  readOnly={!!linkedId && entryMode !== "manual"}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Role / Job Title
                </label>
                <input
                  value={manualEntry.role}
                  onChange={(e) =>
                    setManualEntry({ ...manualEntry, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. Senior Data Analyst"
                  readOnly={!!linkedId && entryMode !== "manual"}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Department
                </label>
                <input
                  value={manualEntry.department}
                  onChange={(e) =>
                    setManualEntry({
                      ...manualEntry,
                      department: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. Engineering"
                />
              </div>

              {/* Buddy Selection */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Assign Onboarding Buddy
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  onChange={(e) => setBuddyId(e.target.value)}
                  value={buddyId}
                >
                  <option value="">-- No Buddy Assigned --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                disabled={!manualEntry.name || !manualEntry.role}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
              >
                {entryMode === "candidate"
                  ? "Hire & Onboard"
                  : "Start Onboarding"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingHub;
