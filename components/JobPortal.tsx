
import React, { useState } from 'react';
import { JobOpening, Candidate, UserProfile, CandidateStage } from '../types';
import { Briefcase, MapPin, Search, CheckCircle2, Clock, Upload, ArrowRight, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface JobPortalProps {
  jobs: JobOpening[];
  currentUser: UserProfile;
  applications: Candidate[];
  onApply: (jobId: string, candidateData: Partial<Candidate>) => void;
}

const JobPortal: React.FC<JobPortalProps> = ({ jobs, currentUser, applications, onApply }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStep, setApplicationStep] = useState(1); // 1: Review, 2: Resume, 3: Done

  // Form data for application
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [experience, setExperience] = useState('3');
  const [skills, setSkills] = useState('React, TypeScript, Tailwind');

  const openJobs = jobs.filter(j => j.status === 'Open');
  const filteredJobs = openJobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getApplicationStatus = (jobId: string) => {
    const app = applications.find(a => a.jobId === jobId && a.email === currentUser.email);
    return app ? app.stage : null;
  };

  const handleApplyClick = (job: JobOpening) => {
    setSelectedJob(job);
    setApplicationStep(1);
    setIsApplying(true);
  };

  const submitApplication = () => {
    if (!selectedJob) return;

    onApply(selectedJob.id, {
        name: currentUser.name,
        email: currentUser.email,
        experience: parseInt(experience) || 0,
        skills: skills.split(',').map(s => s.trim()),
        resumeSummary: resumeFile ? `Resume attached: ${resumeFile.name}` : 'Manual Application via Portal',
    });

    setApplicationStep(3);
    showToast('Application submitted successfully', 'success');
    
    // Close modal after delay
    setTimeout(() => {
        setIsApplying(false);
        setSelectedJob(null);
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
       {/* Header */}
       <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10">
             <h1 className="text-3xl font-bold mb-2">Find your next role at PeopleCore</h1>
             <p className="text-indigo-100 max-w-xl">
                Browse open positions, manage your applications, and join a team that values innovation and growth.
             </p>
             
             <div className="mt-8 relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search for jobs by title or department..."
                   className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-lg"
                />
             </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10"></div>
          <div className="absolute bottom-0 right-20 -mb-20 w-40 h-40 rounded-full bg-white opacity-10"></div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job List */}
          <div className="lg:col-span-2 space-y-6">
             <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase size={20} className="text-indigo-600" /> Open Positions
             </h2>
             
             <div className="grid gap-4">
                {filteredJobs.length === 0 ? (
                   <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
                      No jobs found matching your criteria.
                   </div>
                ) : (
                   filteredJobs.map(job => {
                      const status = getApplicationStatus(job.id);
                      return (
                         <div key={job.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start">
                               <div>
                                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                  <p className="text-slate-500 text-sm mb-4">{job.department}</p>
                                  <div className="flex items-center gap-4 text-sm text-slate-600">
                                     <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><MapPin size={14} /> {job.location}</span>
                                     <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><Clock size={14} /> {job.type}</span>
                                  </div>
                               </div>
                               {status ? (
                                  <div className="flex flex-col items-end">
                                     <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-sm">
                                        <CheckCircle2 size={16} /> Applied
                                     </span>
                                     <span className="text-xs text-slate-400 mt-2">Stage: {status}</span>
                                  </div>
                               ) : (
                                  <button 
                                     onClick={() => handleApplyClick(job)}
                                     className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                                  >
                                     Apply Now
                                  </button>
                               )}
                            </div>
                         </div>
                      );
                   })
                )}
             </div>
          </div>

          {/* Sidebar: My Applications */}
          <div className="lg:col-span-1">
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                   <h3 className="font-bold text-slate-800">My Applications</h3>
                </div>
                <div className="p-4 space-y-4">
                   {applications.filter(a => a.email === currentUser.email).length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">You haven't applied to any jobs yet.</p>
                   ) : (
                      applications.filter(a => a.email === currentUser.email).map(app => {
                         const job = jobs.find(j => j.id === app.jobId);
                         return (
                            <div key={app.id} className="pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                               <p className="font-medium text-slate-900 text-sm">{job?.title || app.role}</p>
                               <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs text-slate-500">{app.appliedDate}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                     app.stage === 'Rejected' ? 'bg-red-100 text-red-700' :
                                     app.stage === 'Offer' ? 'bg-emerald-100 text-emerald-700' :
                                     'bg-blue-100 text-blue-700'
                                  }`}>
                                     {app.stage}
                                  </span>
                               </div>
                            </div>
                         );
                      })
                   )}
                </div>
             </div>
          </div>
       </div>

       {/* Application Modal */}
       {isApplying && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
             <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                   <div>
                      <h2 className="text-xl font-bold text-slate-900">Apply for {selectedJob.title}</h2>
                      <p className="text-sm text-slate-500">{selectedJob.department} • {selectedJob.location}</p>
                   </div>
                   <button onClick={() => setIsApplying(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                   {applicationStep === 1 && (
                      <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input disabled value={currentUser.name} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input disabled value={currentUser.email} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                            <input 
                               type="number" 
                               value={experience} 
                               onChange={(e) => setExperience(e.target.value)}
                               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                            />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Top Skills (Comma Separated)</label>
                            <textarea 
                               value={skills} 
                               onChange={(e) => setSkills(e.target.value)}
                               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none h-20" 
                            />
                         </div>
                         
                         <div className="pt-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Resume</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
                               <Upload size={24} className="mx-auto text-indigo-500 mb-2" />
                               {resumeFile ? (
                                  <p className="text-sm font-medium text-emerald-600">{resumeFile.name}</p>
                               ) : (
                                  <p className="text-sm text-slate-500">Drag & drop or click to upload PDF</p>
                               )}
                            </div>
                         </div>
                      </div>
                   )}

                   {applicationStep === 3 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95">
                         <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} />
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 mb-2">Application Sent!</h3>
                         <p className="text-slate-500">Your application for {selectedJob.title} has been submitted to the HR team. Good luck!</p>
                      </div>
                   )}
                </div>

                {applicationStep === 1 && (
                   <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                      <button onClick={() => setIsApplying(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium">Cancel</button>
                      <button onClick={submitApplication} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2">
                         Submit Application <ArrowRight size={16} />
                      </button>
                   </div>
                )}
             </div>
          </div>
       )}
    </div>
  );
};

export default JobPortal;
