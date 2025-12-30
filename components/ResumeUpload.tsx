import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, X } from 'lucide-react';
import { parseResume } from '../services/geminiService';
import { Candidate, CandidateStage } from '../types';

interface ResumeUploadProps {
  onClose: () => void;
  onAddCandidate: (c: Candidate) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onClose, onAddCandidate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Partial<Candidate> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (uploadedFile: File) => {
    setIsParsing(true);
    setParsedData(null);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        const data = await parseResume(base64String, uploadedFile.type);
        setParsedData(data);
      } catch (err: any) {
        console.error("Error parsing file", err);
        setError(err.message || "Failed to parse resume. Please ensure the file is a valid PDF, DOCX, or TXT document and try again.");
      } finally {
        setIsParsing(false);
      }
    };
    
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
      setIsParsing(false);
    };

    try {
      reader.readAsDataURL(uploadedFile);
    } catch (e) {
       setError("Could not read file data.");
       setIsParsing(false);
    }
  };

  const handleConfirm = () => {
    if (!parsedData) return;
    
    const newCandidate: Candidate = {
      id: `c${Date.now()}`,
      name: parsedData.name || "Unknown Candidate",
      role: parsedData.role || "Applicant",
      email: parsedData.email || "",
      experience: parsedData.experience || 0,
      skills: parsedData.skills || [],
      resumeSummary: parsedData.resumeSummary || "",
      stage: CandidateStage.NEW,
      appliedDate: new Date().toLocaleDateString(),
    };
    
    onAddCandidate(newCandidate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Upload Resume</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="p-6">
          {!file ? (
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt,.doc,.docx" />
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={24} />
              </div>
              <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT (Max 5MB)</p>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText className="text-indigo-600" size={24} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={() => { setFile(null); setParsedData(null); setError(null); }} className="text-slate-400 hover:text-red-500">
                    <X size={16} />
                  </button>
               </div>

               {isParsing && (
                 <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-3">
                   <Loader2 size={32} className="animate-spin text-indigo-600" />
                   <p className="text-sm">AI Agent is analyzing the resume...</p>
                 </div>
               )}

               {error && (
                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                       <p className="font-bold">Analysis Failed</p>
                       <p>{error}</p>
                    </div>
                 </div>
               )}

               {parsedData && (
                 <div className="bg-white border border-emerald-100 rounded-lg p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold mb-3 text-sm">
                      <Check size={16} /> Analysis Complete
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="text-xs text-slate-500 block">Candidate Name</label>
                        <input 
                           value={parsedData.name || ''} 
                           onChange={(e) => setParsedData({...parsedData, name: e.target.value})}
                           className="w-full border-b border-slate-200 py-1 focus:outline-none focus:border-indigo-500 bg-transparent font-medium" 
                        />
                      </div>
                      <div>
                         <label className="text-xs text-slate-500 block">Role</label>
                         <input 
                           value={parsedData.role || ''} 
                           onChange={(e) => setParsedData({...parsedData, role: e.target.value})}
                           className="w-full border-b border-slate-200 py-1 focus:outline-none focus:border-indigo-500 bg-transparent" 
                         />
                      </div>
                      <div>
                         <label className="text-xs text-slate-500 block">Skills Detected</label>
                         <div className="flex flex-wrap gap-1 mt-1">
                           {parsedData.skills?.map((skill, i) => (
                             <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{skill}</span>
                           ))}
                         </div>
                      </div>
                      <div>
                         <label className="text-xs text-slate-500 block">Summary</label>
                         <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2 rounded">{parsedData.resumeSummary}</p>
                      </div>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium">Cancel</button>
          <button 
            disabled={!parsedData || isParsing || !!error}
            onClick={handleConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
          >
            Add to Pipeline
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;