import React, { useState } from 'react';
import { generateRecruitmentPlan } from '../services/geminiService';
import { RecruitmentPlan } from '../types';
import { Bot, CalendarRange, DollarSign, Target, Loader2, PlusCircle, Check, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const RecruitmentPlanner: React.FC = () => {
  const { showToast } = useToast();
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<RecruitmentPlan | null>(null);

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setIsLoading(true);
    try {
      const result = await generateRecruitmentPlan(goal);
      setPlan(result);
      showToast('Recruitment Plan generated successfully', 'success');
    } catch (e) {
      console.error(e);
      showToast("Failed to generate plan. Please try again.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Input Section */}
      <div className="lg:col-span-1 space-y-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Recruitment Planner</h1>
           <p className="text-slate-500">Describe your hiring goals and let our AI Agent build a strategy for you.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <label className="block text-sm font-bold text-slate-700 mb-2">What is your hiring goal?</label>
           <textarea 
             value={goal}
             onChange={(e) => setGoal(e.target.value)}
             className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-slate-700"
             placeholder="e.g., We need to scale our engineering team by 5 people and hire 2 product managers by Q4 to support the mobile app launch."
           />
           <button 
             onClick={handleGenerate}
             disabled={isLoading || !goal.trim()}
             className="mt-4 w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
             {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Bot size={18} />}
             Generate Plan
           </button>
        </div>
        
        {plan && (
           <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="font-bold text-indigo-900 mb-2">Plan Summary</h3>
              <p className="text-sm text-indigo-800 leading-relaxed mb-4">{plan.summary}</p>
              <div className="flex gap-4 text-xs font-semibold text-indigo-700">
                 <span className="flex items-center gap-1"><CalendarRange size={14} /> {plan.timeline}</span>
                 <span className="flex items-center gap-1"><DollarSign size={14} /> {plan.budgetEstimate}</span>
              </div>
           </div>
        )}
      </div>

      {/* Results Section */}
      <div className="lg:col-span-2">
        {!plan ? (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-12">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                 <Target className="text-indigo-400" size={32} />
              </div>
              <h3 className="font-semibold text-slate-600">No plan generated yet</h3>
              <p className="text-sm">Enter a goal on the left to get started.</p>
           </div>
        ) : (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Strategic Roadmap</h2>
                <button className="text-sm text-indigo-600 font-medium hover:underline">Export to PDF</button>
              </div>

              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {plan.hiringPhases.map((phase, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-indigo-500 group-hover:bg-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-white font-bold">
                           {idx + 1}
                        </div>
                        
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-slate-800">{phase.phaseName}</h3>
                           </div>
                           <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded italic">Strategy: {phase.strategy}</p>
                           
                           <div className="space-y-2">
                              {phase.roles.map((role, rIdx) => (
                                <div key={rIdx} className="flex justify-between items-center text-sm border-b border-slate-50 last:border-0 pb-1 last:pb-0">
                                   <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                                      <span className="font-medium text-slate-700">{role.title}</span>
                                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{role.seniority}</span>
                                   </div>
                                   <span className="font-bold text-slate-800">x{role.count}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                    </div>
                  ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default RecruitmentPlanner;