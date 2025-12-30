import React, { useState } from 'react';
import { generateRecruitmentPlan } from '../services/geminiService';
import { RecruitmentPlan } from '../types';
import { Bot, CalendarRange, DollarSign, Target, Loader2, PlusCircle, Check, ArrowRight, RefreshCw, Send, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const RecruitmentPlanner: React.FC = () => {
  const { showToast } = useToast();
  const [goal, setGoal] = useState('');
  const [refinement, setRefinement] = useState('');
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

  const handleRefine = async () => {
    if (!plan || !refinement.trim()) return;
    setIsLoading(true);
    try {
      // Pass current plan and refinement instructions
      const result = await generateRecruitmentPlan(goal, plan, refinement);
      setPlan(result);
      setRefinement(''); // Clear refinement input
      showToast('Plan updated successfully', 'success');
    } catch (e) {
      console.error(e);
      showToast("Failed to refine plan. Please try again.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setGoal('');
    setRefinement('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Input Section */}
      <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Recruitment Planner</h1>
           <p className="text-slate-500">Describe your hiring goals and let our AI Agent build a strategy for you.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
           {plan ? (
             <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   <label className="block text-sm font-bold text-slate-700">Refine Plan</label>
                   <button onClick={handleReset} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                      <RefreshCw size={12} /> Start Over
                   </button>
                </div>
                
                <div className="flex-1 mb-4 overflow-y-auto">
                   <p className="text-sm text-slate-600 mb-2">Current Goal:</p>
                   <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-800 italic mb-6 border border-slate-100">
                      "{goal}"
                   </div>

                   <label className="block text-sm font-bold text-slate-700 mb-2">Instructions</label>
                   <textarea 
                     value={refinement}
                     onChange={(e) => setRefinement(e.target.value)}
                     className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-slate-700 text-sm"
                     placeholder="e.g., Make the timeline more aggressive (2 months), or add a Senior Designer role."
                     disabled={isLoading}
                   />
                </div>

                <button 
                   onClick={handleRefine}
                   disabled={isLoading || !refinement.trim()}
                   className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                   {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                   {isLoading ? 'Thinking...' : 'Update Plan'}
                </button>
             </div>
           ) : (
             <>
               <label className="block text-sm font-bold text-slate-700 mb-2">What is your hiring goal?</label>
               <textarea 
                 value={goal}
                 onChange={(e) => setGoal(e.target.value)}
                 className="w-full h-48 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-slate-700"
                 placeholder="e.g., We need to scale our engineering team by 5 people and hire 2 product managers by Q4 to support the mobile app launch."
               />
               <div className="mt-auto">
                 <button 
                   onClick={handleGenerate}
                   disabled={isLoading || !goal.trim()}
                   className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md transition-all"
                 >
                   {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Bot size={20} />}
                   {isLoading ? 'Generating Strategy...' : 'Generate Plan'}
                 </button>
               </div>
             </>
           )}
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-2 h-full flex flex-col">
        {!plan ? (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-12">
              <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 ${isLoading ? 'animate-pulse' : ''}`}>
                 {isLoading ? <Loader2 className="animate-spin text-indigo-500" size={40} /> : <Target className="text-indigo-400" size={40} />}
              </div>
              <h3 className="font-semibold text-slate-600 text-lg mb-2">{isLoading ? 'AI Agent is working...' : 'No plan generated yet'}</h3>
              <p className="text-sm max-w-xs text-center">
                {isLoading 
                  ? 'Analyzing your goal, estimating budgets, and defining hiring phases.' 
                  : 'Enter your hiring goals on the left to get a comprehensive strategy.'}
              </p>
           </div>
        ) : (
           <div className="flex-1 overflow-y-auto space-y-6 animate-in fade-in slide-in-from-right-4 pr-2">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                 <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold">Strategic Roadmap</h2>
                    <div className="flex gap-2">
                       <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <CalendarRange size={14} /> {plan.timeline}
                       </span>
                       <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <DollarSign size={14} /> {plan.budgetEstimate}
                       </span>
                    </div>
                 </div>
                 <p className="text-indigo-100 text-sm leading-relaxed max-w-3xl">
                    {plan.summary}
                 </p>
              </div>

              {/* Timeline */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {plan.hiringPhases.map((phase, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-indigo-500 group-hover:bg-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-white font-bold transition-transform group-hover:scale-110">
                           {idx + 1}
                        </div>
                        
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                           <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-slate-800 text-lg">{phase.phaseName}</h3>
                           </div>
                           <div className="mb-4">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Strategy</p>
                              <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">{phase.strategy}</p>
                           </div>
                           
                           <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Roles Required</p>
                              <div className="space-y-2">
                                 {phase.roles.map((role, rIdx) => (
                                    <div key={rIdx} className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                       <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                                          <span className="font-medium text-slate-700">{role.title}</span>
                                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">{role.seniority}</span>
                                       </div>
                                       <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">x{role.count}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                    </div>
                  ))}
              </div>
              
              <div className="text-center pt-8 pb-4">
                 <button className="text-indigo-600 font-medium hover:underline text-sm flex items-center justify-center gap-1 mx-auto">
                    Export to PDF <ArrowRight size={14} />
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default RecruitmentPlanner;