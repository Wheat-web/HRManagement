
import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, X, PenTool, User, Briefcase, Paperclip } from 'lucide-react';
import { parseResume } from '../services/geminiService';
import { Candidate, CandidateStage, JobOpening } from '../types';

interface ResumeUploadProps {
  onClose: () => void;
  onAddCandidate: (c: Candidate) => void;
  jobs: JobOpening[];
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onClose, onAddCandidate, jobs }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  
  // Job Selection
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Partial<Candidate> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Form State
  const [manualData, setManualData] = useState({
    name: '',
    email: '',
    role: '',
    experience: '',
    skills: '',
    summary: ''
  });
  const [manualResumeFile, setManualResumeFile] = useState<File | null>(null);

  // --- Upload Handlers ---
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

  const handleManualFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setManualResumeFile(e.target.files[0]);
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

  // --- Submit Logic ---
  const handleConfirm = () => {
    let candidateData: Partial<Candidate> = {};

    if (activeTab === 'upload') {
      if (!parsedData) return;
      candidateData = parsedData;
    } else {
      // Manual Mode
      if (!manualData.name || !manualData.role) return;
      candidateData = {
        name: manualData.name,
        email: manualData.email,
        role: manualData.role,
        experience: Number(manualData.experience) || 0,
        skills: manualData.skills.split(',').map(s => s.trim()).filter(s => s),
        resumeSummary: manualData.summary
      };
    }
    
    const newCandidate: Candidate = {
      id: `c${Date.now()}`,
      jobId: selectedJobId || undefined,
      name: candidateData.name || "Unknown Candidate",
      role: candidateData.role || "Applicant",
      email: candidateData.email || "",
      experience: candidateData.experience || 0,
      skills: candidateData.skills || [],
      resumeSummary: candidateData.resumeSummary || (manualResumeFile ? `Resume attached: ${manualResumeFile.name}` : ""),
      stage: CandidateStage.NEW,
      appliedDate: new Date().toLocaleDateString(),
    };
    
    onAddCandidate(newCandidate);
  };

  const isFormValid = activeTab === 'upload' 
    ? (!!parsedData && !isParsing && !error) 
    : (!!manualData.name && !!manualData.role && !!manualData.email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Add Candidate</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'upload' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Upload size={16} /> Get from Resume
          </button>
          <button 
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'manual' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <PenTool size={16} /> Manual Entry
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'upload' ? (
            // Upload View
            <>
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
                          {/* Job Selection in Upload Mode */}
                          <div>
                             <label className="text-xs text-slate-500 block mb-1">Assign to Job Opening</label>
                             <select 
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                                className="w-full px-2 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500 text-sm bg-white"
                             >
                                <option value="">-- General Application --</option>
                                {jobs.filter(j => j.status === 'Open').map(job => (
                                   <option key={job.id} value={job.id}>{job.title}</option>
                                ))}
                             </select>
                          </div>

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
            </>
          ) : (
            // Manual View
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign to Job Opening</label>
                  <select 
                     value={selectedJobId}
                     onChange={(e) => setSelectedJobId(e.target.value)}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                     <option value="">-- General Application --</option>
                     {jobs.filter(j => j.status === 'Open').map(job => (
                        <option key={job.id} value={job.id}>{job.title} - {job.department}</option>
                     ))}
                  </select>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    value={manualData.name}
                    onChange={(e) => setManualData({...manualData, name: e.target.value})}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email <span className="text-red-500">*</span></label>
                    <input 
                      value={manualData.email}
                      onChange={(e) => setManualData({...manualData, email: e.target.value})}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Role <span className="text-red-500">*</span></label>
                    <input 
                      value={manualData.role}
                      onChange={(e) => setManualData({...manualData, role: e.target.value})}
                      placeholder="e.g. Product Manager"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Experience (Years)</label>
                    <input 
                      type="number"
                      value={manualData.experience}
                      onChange={(e) => setManualData({...manualData, experience: e.target.value})}
                      placeholder="e.g. 5"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Skills (Comma sep)</label>
                    <input 
                      value={manualData.skills}
                      onChange={(e) => setManualData({...manualData, skills: e.target.value})}
                      placeholder="e.g. React, Node.js, Agile"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
               </div>
               
               {/* Resume Attachment for Manual Mode */}
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Resume Attachment</label>
                  <div className="relative">
                     <input 
                        type="file" 
                        id="manualResume"
                        className="hidden" 
                        accept=".pdf,.doc,.docx"
                        onChange={handleManualFileChange}
                     />
                     <label 
                        htmlFor="manualResume"
                        className="flex items-center gap-2 w-full px-3 py-2 border border-slate-300 border-dashed rounded-lg text-sm text-slate-600 cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-colors"
                     >
                        <Paperclip size={16} /> 
                        {manualResumeFile ? manualResumeFile.name : "Attach resume file (PDF/DOCX)..."}
                     </label>
                     {manualResumeFile && (
                        <button 
                           onClick={(e) => { e.preventDefault(); setManualResumeFile(null); }}
                           className="absolute right-2 top-2 text-slate-400 hover:text-red-500"
                        >
                           <X size={16} />
                        </button>
                     )}
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Professional Summary</label>
                  <textarea 
                    value={manualData.summary}
                    onChange={(e) => setManualData({...manualData, summary: e.target.value})}
                    placeholder="Brief overview of candidate's background..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm h-20 resize-none"
                  />
               </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium">Cancel</button>
          <button 
            disabled={!isFormValid}
            onClick={handleConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
          >
            {activeTab === 'upload' ? 'Add to Pipeline' : 'Create Candidate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
