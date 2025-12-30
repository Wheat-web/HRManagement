import React, { useState } from 'react';
import { MOCK_PERFORMANCE_REVIEWS } from '../constants';
import { PerformanceReview } from '../types';
import { Bot, CheckCircle, Clock, AlertTriangle, TrendingUp, UserCheck, Star } from 'lucide-react';
import { evaluatePerformance } from '../services/geminiService';

const Productivity: React.FC = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>(MOCK_PERFORMANCE_REVIEWS);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [managerScoreInput, setManagerScoreInput] = useState<number>(0);
  const [managerFeedbackInput, setManagerFeedbackInput] = useState('');

  const handleSelectReview = (review: PerformanceReview) => {
    setSelectedReview(review);
    setManagerScoreInput(review.managerScore);
    setManagerFeedbackInput(review.managerFeedback);
  };

  const runAiEvaluation = async () => {
    if (!selectedReview) return;
    setLoadingAi(true);
    try {
      const result = await evaluatePerformance(selectedReview.role, selectedReview.metrics);
      const updatedReview = {
         ...selectedReview,
         aiScore: result.score,
         aiAnalysis: result.analysis,
         status: 'Draft' as const
      };
      setReviews(reviews.map(r => r.id === updatedReview.id ? updatedReview : r));
      setSelectedReview(updatedReview);
    } catch (e) {
      alert("AI Evaluation failed.");
    } finally {
      setLoadingAi(false);
    }
  };

  const finalizeReview = () => {
    if (!selectedReview) return;
    const finalScore = Math.round((selectedReview.aiScore + managerScoreInput) / 2);
    const updatedReview = {
      ...selectedReview,
      managerScore: managerScoreInput,
      managerFeedback: managerFeedbackInput,
      finalScore,
      status: 'Finalized' as const
    };
    setReviews(reviews.map(r => r.id === updatedReview.id ? updatedReview : r));
    setSelectedReview(updatedReview);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Productivity & Performance</h1>
        <p className="text-slate-500">AI-assisted performance reviews with human oversight.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review List */}
        <div className="lg:col-span-1 space-y-4">
           {reviews.map(review => (
             <div 
               key={review.id}
               onClick={() => handleSelectReview(review)}
               className={`bg-white p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedReview?.id === review.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'}`}
             >
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <h3 className="font-bold text-slate-800">{review.employeeName}</h3>
                   <p className="text-xs text-slate-500">{review.role}</p>
                 </div>
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    review.status === 'Finalized' ? 'bg-emerald-100 text-emerald-700' : 
                    review.status === 'Draft' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                 }`}>
                   {review.status}
                 </span>
               </div>
               
               {review.status === 'Finalized' ? (
                 <div className="flex items-center gap-2 mt-2">
                    <div className="text-2xl font-bold text-emerald-600">{review.finalScore}</div>
                    <span className="text-xs text-slate-400">Final Score</span>
                 </div>
               ) : (
                 <div className="flex gap-2 mt-3">
                    <div className="bg-slate-50 px-2 py-1 rounded border border-slate-100 text-xs text-slate-500 flex items-center gap-1">
                       <Bot size={12} /> {review.aiScore > 0 ? review.aiScore : '-'}
                    </div>
                    <div className="bg-slate-50 px-2 py-1 rounded border border-slate-100 text-xs text-slate-500 flex items-center gap-1">
                       <UserCheck size={12} /> {review.managerScore > 0 ? review.managerScore : '-'}
                    </div>
                 </div>
               )}
             </div>
           ))}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
           {!selectedReview ? (
              <div className="h-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                 Select an employee to start review
              </div>
           ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Performance Review: {selectedReview.period}</h2>
                    <p className="text-slate-500 text-sm">Reviewing {selectedReview.employeeName} ({selectedReview.role})</p>
                 </div>
                 
                 <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Metrics Section */}
                    <div>
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Raw Metrics</h3>
                       <div className="space-y-4">
                          <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                             <span className="text-sm text-slate-600">Tasks Completed</span>
                             <span className="font-bold text-slate-900">{selectedReview.metrics.tasksCompleted}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                             <span className="text-sm text-slate-600">Attendance</span>
                             <span className="font-bold text-slate-900">{selectedReview.metrics.attendance}%</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                             <span className="text-sm text-slate-600">Quality Score</span>
                             <span className="font-bold text-slate-900">{selectedReview.metrics.qualityScore}/10</span>
                          </div>
                       </div>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                       <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                             <Bot size={16} /> AI Analysis
                          </h3>
                          {selectedReview.aiScore > 0 && (
                             <span className="text-xl font-bold text-indigo-700">{selectedReview.aiScore}/100</span>
                          )}
                       </div>
                       
                       {selectedReview.aiAnalysis ? (
                          <p className="text-sm text-indigo-800 leading-relaxed mb-4">
                             {selectedReview.aiAnalysis}
                          </p>
                       ) : (
                          <div className="text-center py-6 text-indigo-300 text-sm">
                             AI analysis pending...
                          </div>
                       )}

                       <button 
                         onClick={runAiEvaluation}
                         disabled={loadingAi || selectedReview.status === 'Finalized'}
                         className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                       >
                         {loadingAi ? 'Analyzing...' : selectedReview.aiScore > 0 ? 'Re-run Analysis' : 'Run AI Analysis'}
                       </button>
                    </div>

                    {/* Manager Input Section */}
                    <div className="md:col-span-2 border-t border-slate-100 pt-6">
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <UserCheck size={16} /> Manager Evaluation
                       </h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-slate-700 mb-2">Feedback & Notes</label>
                             <textarea 
                                disabled={selectedReview.status === 'Finalized'}
                                value={managerFeedbackInput}
                                onChange={(e) => setManagerFeedbackInput(e.target.value)}
                                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                                placeholder="Enter your qualitative feedback here..."
                             />
                          </div>
                          <div>
                             <label className="block text-sm font-medium text-slate-700 mb-2">Manager Score (0-100)</label>
                             <div className="flex items-center gap-4">
                                <input 
                                   disabled={selectedReview.status === 'Finalized'}
                                   type="number"
                                   min="0" max="100"
                                   value={managerScoreInput}
                                   onChange={(e) => setManagerScoreInput(Number(e.target.value))}
                                   className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center font-bold text-lg"
                                />
                             </div>
                             <p className="text-xs text-slate-500 mt-2">
                               Final score will be an average of AI and Manager scores.
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {selectedReview.status !== 'Finalized' && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                       <button 
                          onClick={finalizeReview}
                          disabled={!selectedReview.aiScore || !managerScoreInput}
                          className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                       >
                          <CheckCircle size={16} /> Finalize Review
                       </button>
                    </div>
                 )}
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Productivity;
