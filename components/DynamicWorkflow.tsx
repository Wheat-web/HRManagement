import React, { useState, useEffect } from 'react';
import { OnboardingWorkflow, WorkflowStep, WorkflowAction, OnboardingRole } from '../types';
import { MOCK_WORKFLOWS } from '../constants';
import { CheckCircle, Circle, Lock, Upload, FileText, CheckSquare, Play, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface DynamicWorkflowProps {
  employeeId: string;
  currentUserRole: string; // e.g. 'HR Admin', 'Hiring Manager', 'Employee'
}

const DynamicWorkflow: React.FC<DynamicWorkflowProps> = ({ employeeId, currentUserRole }) => {
  const { showToast } = useToast();
  const [workflow, setWorkflow] = useState<OnboardingWorkflow | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const wf = MOCK_WORKFLOWS[employeeId];
    if (wf) {
      setWorkflow(JSON.parse(JSON.stringify(wf))); // Deep copy for local state
    } else {
      setWorkflow(null);
    }
  }, [employeeId]);

  const mapAppRoleToOnboardingRole = (appRole: string): OnboardingRole[] => {
    switch (appRole) {
      case 'HR Admin':
      case 'Company Admin':
        return ['HR', 'Manager', 'IT']; // Admins can do anything for demo
      case 'Hiring Manager':
        return ['Manager'];
      case 'Employee':
      case 'Candidate':
        return ['Candidate'];
      default:
        return [];
    }
  };

  const userRoles = mapAppRoleToOnboardingRole(currentUserRole);

  const handleAction = async (stepId: string, actionId: string, type: string) => {
    if (!workflow) return;
    setLoadingAction(actionId);

    // Simulate API call
    setTimeout(() => {
      const newWf = JSON.parse(JSON.stringify(workflow));
      const stepIndex = newWf.steps.findIndex((s: WorkflowStep) => s.id === stepId);
      const actionIndex = newWf.steps[stepIndex].actions.findIndex((a: WorkflowAction) => a.id === actionId);
      
      newWf.steps[stepIndex].actions[actionIndex].status = 'completed';

      // Check if all actions in step are completed
      const allCompleted = newWf.steps[stepIndex].actions.every((a: WorkflowAction) => a.status === 'completed');
      if (allCompleted) {
        newWf.steps[stepIndex].status = 'completed';
        
        // Unlock dependent steps
        newWf.steps.forEach((s: WorkflowStep) => {
          if (s.status === 'locked' && s.dependsOn) {
            const dependenciesMet = s.dependsOn.every((depId: string) => {
              const depStep = newWf.steps.find((ds: WorkflowStep) => ds.id === depId);
              return depStep?.status === 'completed';
            });
            if (dependenciesMet) {
              s.status = 'active';
            }
          }
        });
      }

      setWorkflow(newWf);
      setLoadingAction(null);
      showToast(`Action completed successfully`, 'success');
    }, 1000);
  };

  const renderActionIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Upload size={16} />;
      case 'form': return <FileText size={16} />;
      case 'acknowledge': return <CheckSquare size={16} />;
      case 'api_call': return <Play size={16} />;
      default: return <Circle size={16} />;
    }
  };

  if (!workflow) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500">
        <p>No onboarding plan configured for this employee.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      <div className="p-6 border-b border-slate-200 bg-white">
        <h2 className="text-xl font-bold text-slate-900">{workflow.title}</h2>
        <p className="text-sm text-slate-500 mt-1">Status: <span className="capitalize font-medium text-indigo-600">{workflow.status.replace('_', ' ')}</span></p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {workflow.steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`border rounded-xl overflow-hidden shadow-sm transition-all ${
              step.status === 'locked' ? 'bg-slate-50 border-slate-200 opacity-70' : 
              step.status === 'completed' ? 'bg-white border-emerald-200' : 
              'bg-white border-indigo-200 ring-1 ring-indigo-100'
            }`}
          >
            <div className="p-4 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  step.status === 'locked' ? 'bg-slate-200 text-slate-500' :
                  'bg-indigo-100 text-indigo-700'
                }`}>
                  {step.status === 'completed' ? <CheckCircle size={18} /> : 
                   step.status === 'locked' ? <Lock size={16} /> : 
                   index + 1}
                </div>
                <div>
                  <h3 className={`font-bold ${step.status === 'locked' ? 'text-slate-500' : 'text-slate-800'}`}>{step.title}</h3>
                  <p className="text-sm text-slate-500">{step.description}</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wider ${
                step.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                step.status === 'locked' ? 'bg-slate-100 text-slate-500' :
                'bg-indigo-50 text-indigo-600'
              }`}>
                {step.status}
              </span>
            </div>

            <div className="p-4 space-y-3">
              {step.actions.map(action => {
                const canExecute = userRoles.includes(action.requiredRole) && step.status === 'active' && action.status !== 'completed';
                
                return (
                  <div key={action.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                    action.status === 'completed' ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${
                        action.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {action.status === 'completed' ? <CheckCircle size={16} /> : renderActionIcon(action.type)}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${action.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                          {action.label}
                        </p>
                        <p className="text-xs text-slate-400">Assigned to: {action.requiredRole}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleAction(step.id, action.id, action.type)}
                      disabled={!canExecute || loadingAction === action.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        action.status === 'completed' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                        canExecute ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200' :
                        'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                      }`}
                    >
                      {loadingAction === action.id ? <Loader2 size={16} className="animate-spin" /> : null}
                      {action.status === 'completed' ? 'Completed' : 'Execute'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicWorkflow;
