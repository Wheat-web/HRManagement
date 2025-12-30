import React, { useState } from 'react';
import { Candidate, CandidateStage } from '../types';
import { MoreHorizontal, Star, AlertCircle, CheckCircle2, Upload, Plus, UserPlus } from 'lucide-react';

interface RecruitmentBoardProps {
  candidates: Candidate[];
  onSelectCandidate: (c: Candidate) => void;
  onUpdateStage: (c: Candidate, stage: CandidateStage) => void;
  onUploadResume: () => void;
}

const STAGES = Object.values(CandidateStage);

const RecruitmentBoard: React.FC<RecruitmentBoardProps> = ({ candidates, onSelectCandidate, onUpdateStage, onUploadResume }) => {
  const [draggedCandidate, setDraggedCandidate] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    setDraggedCandidate(candidateId);
  };

  const handleDrop = (e: React.DragEvent, stage: CandidateStage) => {
    e.preventDefault();
    if (draggedCandidate) {
      const candidate = candidates.find(c => c.id === draggedCandidate);
      if (candidate && candidate.stage !== stage) {
        onUpdateStage(candidate, stage);
      }
    }
    setDraggedCandidate(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getMatchColor = (score?: number) => {
    if (!score) return 'bg-slate-100 text-slate-500';
    if (score >= 80) return 'bg-emerald-100 text-emerald-700';
    if (score >= 60) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center px-1">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Recruitment Pipeline</h2>
            <p className="text-sm text-slate-500">Manage candidates and AI screenings</p>
          </div>
          <button 
            onClick={onUploadResume}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors text-sm font-medium"
          >
            <UserPlus size={16} />
            Add Candidate
          </button>
      </div>
    
    <div className="flex-1 flex overflow-x-auto pb-4 gap-6">
      {STAGES.map((stage) => {
        const stageCandidates = candidates.filter(c => c.stage === stage);
        
        return (
          <div 
            key={stage} 
            className="flex-shrink-0 w-80 flex flex-col bg-slate-100 rounded-xl max-h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="p-4 flex justify-between items-center border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 text-sm">{stage}</span>
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">{stageCandidates.length}</span>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
              {stageCandidates.map((candidate) => (
                <div 
                  key={candidate.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, candidate.id)}
                  onClick={() => onSelectCandidate(candidate)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow group relative"
                >
                  {/* AI Badge for Screening Column */}
                  {stage === CandidateStage.SCREENING && (
                    <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> AI Analysis
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-800">{candidate.name}</h4>
                    {candidate.matchScore && (
                       <span className={`text-xs font-bold px-2 py-1 rounded-md ${getMatchColor(candidate.matchScore)}`}>
                         {candidate.matchScore}%
                       </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500 mb-3">{candidate.role}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                     <span>{candidate.experience}y exp</span>
                     <span>•</span>
                     <span>{candidate.skills.slice(0, 2).join(', ')}</span>
                  </div>

                  {candidate.aiReasoning && stage === CandidateStage.SCREENING && (
                    <div className="bg-indigo-50 p-2 rounded text-xs text-indigo-800 mb-3 border border-indigo-100 line-clamp-2">
                      {candidate.aiReasoning}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2 border-t border-slate-50 pt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-slate-400">Applied {candidate.appliedDate}</span>
                    {candidate.matchScore && candidate.matchScore < 60 && (
                      <AlertCircle size={14} className="text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
};

export default RecruitmentBoard;