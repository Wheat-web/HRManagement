import React, { useState, useEffect } from "react";
import { Candidate, CandidateStage, JobOpening } from "../types";
import {
  deleteCandidate,
  getCandidates,
  getCandidatesByJob,
  updateCandidateStage,
} from "@/services/candidateService";
import {
  MoreHorizontal,
  Star,
  AlertCircle,
  CheckCircle2,
  Upload,
  Plus,
  UserPlus,
  Briefcase,
  Filter,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import { ToastProvider, useToast } from "../context/ToastContext";
import api from "@/services/api";
import {
  DepartmentCombo,
  getDepartmentCombo,
} from "@/services/departmentService";

interface RecruitmentBoardProps {
  //   candidates: Candidate[];
  //   jobs: JobOpening[];
  onSelectCandidate: (c: Candidate) => void;
  //   onUpdateStage: (c: Candidate, stage: CandidateStage) => void;
  onUploadResume: () => void;
  reloadTrigger: boolean;
  //   onAddJob: (job: JobOpening) => void;
}

const STAGES = Object.values(CandidateStage);

const RecruitmentBoard: React.FC<RecruitmentBoardProps> = ({
  // candidates,
  //   jobs,
  onSelectCandidate,
  // onUpdateStage,
  onUploadResume,
  reloadTrigger,
  //   onAddJob,
}) => {
  const { showToast } = useToast();
  const [draggedCandidate, setDraggedCandidate] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | "all">("all");
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [jobs, setJobs] = useState<[]>([]);
  const [departments, setDepartments] = useState<DepartmentCombo[]>([]);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    loadJobs();
    loadDepartments();
    loadCandidates();
  }, []);

  useEffect(() => {
    if (selectedJobId === "all") {
      loadCandidates();
    } else {
      loadCandidatesByJob(selectedJobId);
    }
  }, [selectedJobId, reloadTrigger]);

  const loadCandidatesByJob = async (jobId: number) => {
    try {
      const data = await getCandidatesByJob(jobId);

      const mapped = data.map((c: any) => ({
        id: c.candidateId,
        jobId: c.jobOpeningId,

        name: c.fullName,
        role: c.targetRole || "N/A",
        email: c.email,
        experience: c.experienceYears || 0,
        resumeSummary: c.professionalSummary || "",
        skills: c.skills ? c.skills.split(",") : [],
        stage: mapStageIdToEnum(c.stageId),
        appliedDate: new Date(c.createdAt).toLocaleDateString(),
        matchScore: c.matchScore,
        aiReasoning: c.aiReasoning,
      }));

      setCandidates(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  const loadJobs = async () => {
    try {
      const data = await getJobOpenings();
      setJobs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await getDepartmentCombo();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments", error);
    }
  };

  const loadCandidates = async () => {
    try {
      const data = await getCandidates();

      const mapped = data.map((c: any) => ({
        id: c.candidateId,
        name: c.fullName,
        role: c.targetRole || "N/A",
        experience: c.experienceYears || 0,
        skills: c.skills ? c.skills.split(",") : [],
        stage: mapStageIdToEnum(c.stageId),
        jobId: c.jobOpeningId,
        appliedDate: new Date(c.createdAt).toLocaleDateString(),
      }));

      setCandidates(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  const mapStageIdToEnum = (stageId: number): CandidateStage => {
    switch (stageId) {
      case 1:
        return CandidateStage.NEW;
      case 2:
        return CandidateStage.SCREENING;
      case 3:
        return CandidateStage.INTERVIEW;
      case 4:
        return CandidateStage.OFFER;
      case 5:
        return CandidateStage.REJECTED;
      default:
        return CandidateStage.NEW;
    }
  };

  const mapEnumToStageId = (stage: CandidateStage): number => {
    switch (stage) {
      case CandidateStage.NEW:
        return 1;
      case CandidateStage.SCREENING:
        return 2;
      case CandidateStage.INTERVIEW:
        return 3;
      case CandidateStage.OFFER:
        return 4;
      case CandidateStage.REJECTED:
        return 5;
      default:
        return 1;
    }
  };

  const handleUpdateStage = async (
    candidate: Candidate,
    newStage: CandidateStage,
  ) => {
    try {
      const stageId = mapEnumToStageId(newStage);
      await updateCandidateStage(candidate.id, stageId);

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidate.id ? { ...c, stage: newStage } : c,
        ),
      );

      showToast("Stage updated successfully", "success");
    } catch (err) {
      showToast("Failed to update stage", "error");
    }
  };

  const [newJob, setNewJob] = useState<Partial<JobOpening>>({
    title: "",
    department: 0,
    location: "Remote",
    type: "Full-time",
    status: "Open",
  });

  const filteredCandidates =
    selectedJobId === "all"
      ? candidates
      : candidates.filter((c) => c.jobId === selectedJobId);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  const getJobOpenings = async () => {
    const res = await api.get("/JobOpening");
    return res.data;
  };

  const createJobOpening = async (job: any) => {
    const res = await api.post("/JobOpening", job);
    return res.data;
  };

  const updateJobOpening = async (id: number, job: any) => {
    const res = await api.put(`/JobOpening/${id}`, job);
    return res.data;
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCandidate(id);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      showToast("Candidate deleted successfully", "success");
    } catch (error) {}
  };

  const handleCreateJob = async () => {
    if (!newJob.title) {
      showToast("Job title is required", "warning");
      return;
    }

    try {
      if (editingJobId) {
        await updateJobOpening(editingJobId, {
          title: newJob.title,
          departmentID: newJob.department,
          location: newJob.location,
          branchId: 1,
          type: newJob.type,
          status: newJob.status ?? "Open",
          hiringManager: "Admin",
        });

        showToast("Job updated successfully", "success");
      } else {
        await createJobOpening({
          title: newJob.title,
          departmentID: newJob.department,
          location: newJob.location,
          branchId: 1,
          type: newJob.type,
          status: "Open",
          hiringManager: "Admin",
        });

        showToast("Job created successfully", "success");
      }

      await loadJobs();

      setEditingJobId(null);
      setIsAddJobModalOpen(false);

      setNewJob({
        title: "",
        department: 0,
        location: "Remote",
        type: "Full-time",
      });
    } catch (err) {
      console.error(err);
      showToast("Operation failed", "error");
    }
  };

  const handleOpenEdit = (job: any) => {
    setEditingJobId(job.id);

    setNewJob({
      title: job.title,
      department: job.departmentID,
      location: job.location,
      type: job.type,
      status: job.status,
    });

    setIsAddJobModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, candidateId: number) => {
    setDraggedCandidate(candidateId);
  };

  const handleDrop = (e: React.DragEvent, stage: CandidateStage) => {
    e.preventDefault();
    if (draggedCandidate) {
      const candidate = candidates.find((c) => c.id === draggedCandidate);
      if (candidate && candidate.stage !== stage) {
        handleUpdateStage(candidate, stage);
      }
    }
    setDraggedCandidate(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getMatchColor = (score?: number) => {
    if (!score) return "bg-slate-100 text-slate-500";
    if (score >= 80) return "bg-emerald-100 text-emerald-700";
    if (score >= 60) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  // const handleDelete = (id: number) => {
  //   setCandidates((prev) => prev.filter((c) => c.id !== id));
  // };

  return (
    <div className="h-full flex gap-6">
      {/* Sidebar: Job Openings List */}
      <div className="w-64 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Briefcase size={16} /> Job Openings
          </h3>
          <button
            onClick={() => {
              setIsAddJobModalOpen(true);
              setEditingJobId(null);
              setNewJob({
                title: "",
                department: 0,
                location: "Remote",
                type: "Full-time",
              });
            }}
            className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"
            title="Add Job"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            onClick={() => setSelectedJobId("all")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center transition-colors ${
              selectedJobId === "all"
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            All Jobs
            <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-xs">
              {candidates.length}
            </span>
          </button>

          {jobs.map((job) => {
            const count = candidates.filter((c) => c.jobId === job.id).length;
            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`w-full cursor-pointer text-left px-3 py-2 rounded-lg text-sm transition-colors group ${
                  selectedJobId === job.id
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    : "text-slate-600 hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium truncate pr-2">{job.title}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(job);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      <Edit2 size={14} />
                    </button>

                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs ${
                        selectedJobId === job.id
                          ? "bg-indigo-200 text-indigo-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                </div>

                <div className="text-xs opacity-70 flex justify-between">
                  <span>
                    {departments.find((d) => d.id === job.departmentID)?.name ||
                      "N/A"}
                  </span>
                  <span
                    className={`${job.status === "Open" ? "text-emerald-600" : "text-slate-400"}`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="mb-4 flex justify-between items-center px-1">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {selectedJobId === "all"
                ? "All Active Pipelines"
                : selectedJob?.title}
              {selectedJobId !== "all" && (
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                  {selectedJob?.location} • {selectedJob?.type}
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500">
              {filteredCandidates.length} active candidates in pipeline
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium">
              <Filter size={16} /> Filter
            </button>
            <button
              onClick={onUploadResume}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors text-sm font-medium"
            >
              <UserPlus size={16} />
              Add Candidate
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-x-auto pb-4 gap-6">
          {STAGES.map((stage) => {
            const stageCandidates = filteredCandidates.filter(
              (c) => c.stage === stage,
            );

            return (
              <div
                key={stage}
                className="flex-shrink-0 w-80 flex flex-col bg-slate-100 rounded-xl max-h-full border border-slate-200/60"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className="p-4 flex justify-between items-center border-b border-slate-200 bg-slate-100 rounded-t-xl sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                      {stage}
                    </span>
                    <span className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {stageCandidates.length}
                    </span>
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
                      className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all hover:border-indigo-300 group relative"
                    >
                      {/* AI Badge for Screening Column */}
                      {stage === CandidateStage.SCREENING && (
                        <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
                          <Star size={10} fill="currentColor" /> AI Analysis
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800">
                          {candidate.name}
                        </h4>
                        {candidate.matchScore && (
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-md ${getMatchColor(candidate.matchScore)}`}
                          >
                            {candidate.matchScore}%
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(candidate.id);
                          }}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 mb-3 font-medium">
                        {candidate.role}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                        <span className="bg-slate-50 px-1.5 py-0.5 rounded">
                          {candidate.experience}y exp
                        </span>
                        <span className="bg-slate-50 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                          {candidate.skills.slice(0, 2).join(", ")}
                        </span>
                      </div>

                      {candidate.aiReasoning &&
                        stage === CandidateStage.SCREENING && (
                          <div className="bg-indigo-50 p-2 rounded text-xs text-indigo-800 mb-3 border border-indigo-100 line-clamp-2 italic">
                            "{candidate.aiReasoning}"
                          </div>
                        )}

                      <div className="flex justify-between items-center mt-2 border-t border-slate-50 pt-2">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {candidate.appliedDate}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal
                            size={14}
                            className="text-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Job Modal */}
      {isAddJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {editingJobId ? "Edit Job Opening" : "Create New Job Opening"}
              </h3>

              <button
                onClick={() => setIsAddJobModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Job Title
                </label>
                <input
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. Senior Backend Engineer"
                  value={newJob.title}
                  onChange={(e) =>
                    setNewJob({ ...newJob, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Department
                </label>

                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  value={newJob.department}
                  onChange={(e) =>
                    setNewJob({ ...newJob, department: Number(e.target.value) })
                  }
                >
                  <option value="">Select Department</option>

                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Location
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="e.g. Remote"
                    value={newJob.location}
                    onChange={(e) =>
                      setNewJob({ ...newJob, location: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                    value={newJob.type}
                    onChange={(e) =>
                      setNewJob({ ...newJob, type: e.target.value as any })
                    }
                  >
                    <option>Full-time</option>
                    <option>Contract</option>
                    <option>Part-time</option>
                    <option>Internship</option>
                  </select>
                </div>
                {editingJobId && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Status
                    </label>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNewJob({ ...newJob, status: "Open" })}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          newJob.status === "Open"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                            : "bg-white text-slate-500 border-slate-300"
                        }`}
                      >
                        Open
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setNewJob({ ...newJob, status: "Closed" })
                        }
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          newJob.status === "Closed"
                            ? "bg-red-100 text-red-700 border-red-300"
                            : "bg-white text-slate-500 border-slate-300"
                        }`}
                      >
                        Closed
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsAddJobModalOpen(false);
                  setEditingJobId(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                {editingJobId ? "Update Job" : "Create Job"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentBoard;
