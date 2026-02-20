import React, { useState, useEffect } from "react";
import { Interview } from "../types";
import {
  Calendar,
  Clock,
  Video,
  User,
  Plus,
  X,
  Check,
  Search,
  Filter,
  Edit2,
  MoreHorizontal,
  Link as LinkIcon,
} from "lucide-react";
import api from "@/services/api";
import { getEmployeeCombo, EmployeeCombo } from "@/services/employeeService";
import { CandidateCombo, getCandidateCombo } from "@/services/candidateService";
import { useToast } from "@/context/ToastContext";

const InterviewSchedule: React.FC = () => {
  const { showToast } = useToast();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filter, setFilter] = useState<"All" | "Scheduled" | "Completed">(
    "All",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState<EmployeeCombo[]>([]);
  const [candidates, setCandidates] = useState<CandidateCombo[]>([]);
  const [editingInterviewId, setEditingInterviewId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    loadEmployees();
    loadCandidates();
    loadInterviews();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await getEmployeeCombo();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to load employees", err);
    }
  };

  const loadCandidates = async () => {
    try {
      const data = await getCandidateCombo();
      console.log(data, "em[ploererer");

      setCandidates(data);
    } catch (err) {
      console.error("Failed to load candidates", err);
    }
  };

  const loadInterviews = async () => {
    try {
      const res = await api.get("/InterviewSchedule");
      setInterviews(res.data);
    } catch (err) {
      console.error("Failed to load interviews", err);
    }
  };

  // New Interview Form State
  const [newInterview, setNewInterview] = useState<Partial<Interview>>({
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    duration: 45,
    type: "Technical",
    status: "Scheduled",
  });

  const selectedCandidate = candidates.find(
    (c) => c.candidateId === newInterview.candidateId,
  );

  const selectedEmployee = employees.find(
    (e) => e.empID === newInterview.interviewerId,
  );

  const handleCreate = async () => {
    if (!newInterview.candidateId || !newInterview.interviewerId) return;

    try {
      let meetingLink = newInterview.meetingLink;

      // 🔹 Generate Zoom link if selected
      if (newInterview.meetingProvider === "Zoom") {
        const zoomRes = await api.post("/Zoom/create-meeting", {
          date: newInterview.date,
          time: newInterview.time,
          duration: newInterview.duration,
        });

        meetingLink = zoomRes.data.joinUrl;
      }

      const payload = {
        ...newInterview,
        meetingLink,
        candidateName: selectedCandidate?.fullName,
        role: selectedCandidate?.targetRole,
        interviewerName: selectedEmployee?.name,
        branchID: 1,
      };

      if (editingInterviewId) {
        // ✅ UPDATE
        await api.put(`/InterviewSchedule/${editingInterviewId}`, payload);
        showToast("Interview updated successfully", "success");
      } else {
        // ✅ CREATE
        await api.post("/InterviewSchedule", payload);
        showToast("Interview scheduled successfully", "success");
      }

      await loadInterviews();

      setIsModalOpen(false);
      setEditingInterviewId(null);

      // 🔹 Reset form
      setNewInterview({
        date: new Date().toISOString().split("T")[0],
        time: "10:00",
        duration: 45,
        type: "Technical",
        status: "Scheduled",
        meetingProvider: "Zoom",
      });
    } catch (err) {
      console.error(err);
      showToast("Error saving interview", "error");
    }
  };

  const updateInterviewStatus = async (
    interviewId: number,
    status: "Scheduled" | "Completed" | "Cancelled",
  ) => {
    try {
      await api.put(`/InterviewSchedule/${interviewId}/status/${status}`);

      setInterviews((prev) =>
        prev.map((i) => (i.id === interviewId ? { ...i, status } : i)),
      );

      showToast("Status updated successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-emerald-100 text-emerald-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const filteredInterviews = interviews
    .filter((i) => filter === "All" || i.status === filter)
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
    );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Interview Schedule
          </h1>
          <p className="text-slate-500">
            Manage upcoming technical and cultural interviews.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingInterviewId(null);
            setNewInterview({
              date: new Date().toISOString().split("T")[0],
              time: "10:00",
              duration: 45,
              type: "Technical",
              status: "Scheduled",
              meetingProvider: "Zoom",
            });
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Schedule Interview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
        {/* Calendar/Filter Sidebar */}
        <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className="font-bold text-slate-800 mb-4">Filters</h3>
          <div className="space-y-2 mb-6">
            {["All", "Scheduled", "Completed", "Cancelled"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2">
              <Calendar size={18} /> Today
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {new Date().getDate()}
            </div>
            <div className="text-slate-500 text-sm">
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                weekday: "long",
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Interviews</span>
                <span className="font-bold text-slate-900">
                  {
                    interviews.filter(
                      (i) => i.date === new Date().toISOString().split("T")[0],
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interview List */}
        <div className="lg:col-span-3 space-y-4 overflow-y-auto pb-6">
          {filteredInterviews.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
              <Calendar size={48} className="mb-4 opacity-50" />
              <p>No interviews found matching your filters.</p>
            </div>
          ) : (
            filteredInterviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  {/* Time & Date */}
                  <div className="flex items-center gap-4 min-w-[180px]">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                      <span className="text-xs font-bold uppercase">
                        {new Date(interview.date).toLocaleDateString("en-US", {
                          month: "short",
                        })}
                      </span>
                      <span className="text-xl font-bold">
                        {new Date(interview.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Clock size={16} className="text-slate-400" />{" "}
                        {interview.time}
                      </div>
                      <div className="text-xs text-slate-500">
                        {interview.duration} mins
                      </div>
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-lg">
                      {interview.candidateName}
                    </h4>
                    <p className="text-sm text-slate-500 mb-1">
                      {interview.role}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                        {interview.type}
                      </span>
                      <span>with {interview.interviewerName}</span>
                    </div>
                  </div>

                  {/* Action Area */}
                  <div className="flex items-center gap-3">
                    {interview.status === "Scheduled" && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <Video size={16} /> Join
                      </a>
                    )}
                    <select
                      value={interview.status}
                      onChange={(e) =>
                        updateInterviewStatus(
                          interview.id,
                          e.target.value as
                            | "Scheduled"
                            | "Completed"
                            | "Cancelled",
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase border outline-none cursor-pointer ${getStatusColor(interview.status)}`}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => {
                        setNewInterview({
                          ...interview,
                          date: interview.date
                            ? new Date(interview.date)
                                .toISOString()
                                .split("T")[0]
                            : "",
                        });

                        setEditingInterviewId(interview.id);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-slate-50"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {editingInterviewId ? "Edit Interview" : "Schedule Interview"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Candidate
                </label>
                <select
                  value={newInterview.candidateId}
                  onChange={(e) =>
                    setNewInterview({
                      ...newInterview,
                      candidateId: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Candidate</option>
                  {candidates.map((c) => (
                    <option key={c.candidateId} value={c.candidateId}>
                      {c.fullName} - {c.targetRole}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Interviewer
                </label>
                <select
                  value={newInterview.interviewerId}
                  onChange={(e) =>
                    setNewInterview({
                      ...newInterview,
                      interviewerId: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Interviewer</option>
                  {employees.map((e) => (
                    <option key={e.empID} value={e.empID}>
                      {e.name} - {e.role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Meeting Provider
                </label>

                <select
                  value={newInterview.meetingProvider}
                  onChange={(e) =>
                    setNewInterview({
                      ...newInterview,
                      meetingProvider: e.target.value as any,
                      meetingLink: "", // reset link on change
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="Zoom">Zoom</option>
                  <option value="GoogleMeet">Google Meet</option>
                </select>
              </div>
              {newInterview.meetingProvider === "GoogleMeet" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Google Meet Link
                  </label>
                  <input
                    type="text"
                    placeholder="Paste Google Meet link"
                    value={newInterview.meetingLink || ""}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        meetingLink: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newInterview.date}
                    onChange={(e) =>
                      setNewInterview({ ...newInterview, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newInterview.time}
                    onChange={(e) =>
                      setNewInterview({ ...newInterview, time: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Type
                  </label>
                  <select
                    value={newInterview.type}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        type: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option>Technical</option>
                    <option>Cultural Fit</option>
                    <option>Screening</option>
                    <option>System Design</option>
                    <option>Final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    step="15"
                    value={newInterview.duration}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        duration: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={
                  !newInterview.candidateId || !newInterview.interviewerId
                }
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSchedule;
