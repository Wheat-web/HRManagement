import React, { useState } from 'react';
import { Candidate, CandidateStage } from '../types';
import { X, Bot, Check, ThumbsDown, AlertTriangle, Calendar, Mail, Briefcase, FileText } from 'lucide-react';
import { analyzeCandidate } from '../services/geminiService';

interface CandidateModalProps {
  candidate: Candidate;
  onClose: () => void;
  onUpdate: (updated: Candidate) => void;
  onAudit: (action: string, details: string, isRisk: boolean) => void;
}

const CandidateModal: React.FC<CandidateModalProps> = ({ candidate, onClose, onUpdate, onAudit }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<{ matchScore?: number, reasoning?: string, flags?: string[] } | null>(null);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // In a real app, you'd fetch the job description from the candidate's applied job ID
      const jobDesc = "Senior Frontend Engineer with React, TypeScript, and modern state management experience. Needs 5+ years experience and ability to lead small teams.";
      const result = await analyzeCandidate(candidate, jobDesc);
      
      setAnalysisData(result);
      
      onUpdate({
        ...candidate,
        matchScore: result.matchScore,
        aiReasoning: result.reasoning,
        flags: result.flags
      });

      onAudit('AI Analysis', `Performed match analysis for ${candidate.name}`, false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAction = (action: 'approve' | 'reject') => {
    const isOverride = (action === 'approve' && (candidate.matchScore || 0) < 60) || 
                       (action === 'reject' && (candidate.matchScore || 0) > 80);
    
    const newStage = action === 'approve' ? CandidateStage.INTERVIEW : CandidateStage.REJECTED;
    
    onUpdate({ ...candidate, stage: newStage });
    onAudit(
      action === 'approve' ? 'Move to Interview' : 'Reject Candidate', 
      `${isOverride ? 'OVERRIDE: ' : ''}Moved ${candidate.name} to ${newStage}`, 
      isOverride
    );
    onClose();
  };

  const displayScore = analysisData?.matchScore || candidate.matchScore;
  const displayReasoning = analysisData?.reasoning || candidate.aiReasoning;
  const displayFlags = analysisData?.flags || candidate.flags;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex justify-between items-start bg-slate-50">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xl font-bold">
              {candidate.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{candidate.name}</h2>
              <p className="text-slate-500 flex items-center gap-2">
                <Briefcase size={14} /> {candidate.role}
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-indigo-600 font-medium">{candidate.stage}</span>
              </p>
              <div className="flex gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Mail size={14} /> {candidate.email}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Applied {candidate.appliedDate}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          
          {/* Left Column: Details */}
          <div className="md:w-3/5 p-6 border-r border-slate-100 space-y-6">
            <section>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Professional Summary</h3>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                {candidate.resumeSummary}
              </p>
            </section>

            <section>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
            
            <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Experience</h3>
                <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-semibold">{candidate.experience} years</span> total relevant experience.
                </div>
            </section>
          </div>

          {/* Right Column: AI Analysis */}
          <div className="md:w-2/5 bg-slate-50/50 p-6">
            <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-5 mb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <Bot size={20} className="text-indigo-600" />
                  AI Assessment
                </div>
                {displayScore && (
                  <div className={`text-2xl font-bold ${displayScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {displayScore}/100
                  </div>
                )}
              </div>

              {!displayReasoning ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm mb-4">No analysis generated yet.</p>
                  <button 
                    onClick={handleAIAnalysis}
                    disabled={isAnalyzing}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <span className="animate-pulse">Analyzing...</span>
                    ) : (
                      <>Generate Analysis</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-slate-600 leading-relaxed">
                    {displayReasoning}
                  </div>
                  
                  {displayFlags && displayFlags.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <p className="text-amber-800 text-xs font-bold mb-2 flex items-center gap-1">
                        <AlertTriangle size={12} /> RISK FLAGS
                      </p>
                      <ul className="list-disc list-inside text-xs text-amber-700 space-y-1">
                        {displayFlags.map((flag, idx) => <li key={idx}>{flag}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <button 
                      onClick={() => handleAction('approve')}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Check size={16} /> Advance
                    </button>
                    <button 
                      onClick={() => handleAction('reject')}
                      className="flex-1 py-2 bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <ThumbsDown size={16} /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center">
                 <p className="text-xs text-slate-400 mb-2">Powered by Gemini 3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;
