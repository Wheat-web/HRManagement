import React, { useEffect, useMemo, useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { AttendanceRecord } from "@/types";
import api from "@/services/api";

const AttendanceManagement: React.FC = () => {
  const { showToast } = useToast();

  /* ================= DATE DEFAULT ================= */
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

const formatYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDDMMYYYY = (date: Date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};
  const convertDecimalToHHMM = (decimal?: number) => {
    if (!decimal && decimal !== 0) return "--";
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  /* ================= STATE ================= */
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState(formatYYYYMMDD(firstDay));
  const [toDate, setToDate] = useState(formatYYYYMMDD(today));

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  /* ===== MODAL STATE ===== */
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeRecords, setEmployeeRecords] = useState<AttendanceRecord[]>([]);

  /* ================= LOAD SUMMARY ================= */
  const loadAttendance = async () => {
    try {
      setLoading(true);

      const res = await api.get("/Attendance", {
        params: {
          fromDate,
          toDate,
          branchId: 1,
        },
      });

      setAttendanceData(res.data || []);
      setCurrentPage(1);
    } catch {
      showToast("Failed to load attendance", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [fromDate, toDate]);

  /* ================= SEARCH ================= */
  const filteredAttendance = useMemo(() => {
    return attendanceData.filter((record) =>
      record.employeeName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [attendanceData, searchTerm]);

  const totalPages = Math.ceil(filteredAttendance.length / rowsPerPage);

  const paginatedAttendance = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredAttendance.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAttendance, currentPage]);

  /* ================= LOAD EMPLOYEE DETAILS ================= */
  const openEmployeeModal = async (employeeId: number, name: string) => {
    try {
      setShowModal(true);
      setModalLoading(true);
      setSelectedEmployee(name);

      const res = await api.get(`/Attendance/employee/${employeeId}`, {
        params: { fromDate, toDate },
      });

      setEmployeeRecords(res.data || []);
    } catch {
      showToast("Failed to load employee details", "error");
    } finally {
      setModalLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteRecord = async (id: number) => {
    if (!window.confirm("Delete this attendance record?")) return;

    try {
      await api.delete(`/Attendance/${id}`);
      showToast("Deleted successfully", "success");
      loadAttendance();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance Management</h1>

      {/* FILTER */}
      <div className="flex gap-3 bg-white p-4 rounded-xl border items-center">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2 text-gray-400" size={16} />
          <input
            className="pl-8 border rounded-lg px-3 py-2 w-full"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* SUMMARY TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left">Employee</th>
              <th>Total Hours</th>
              <th className="text-right pr-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center p-10">
                  Loading...
                </td>
              </tr>
            ) : paginatedAttendance.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-10">
                  No records found
                </td>
              </tr>
            ) : (
              paginatedAttendance.map((r) => (
                <tr key={r.id} className="border-t hover:bg-slate-50">
                  <td
                    onClick={() =>
                      openEmployeeModal(r.employeeId, r.employeeName)
                    }
                    className="p-4 text-indigo-600 font-medium cursor-pointer hover:underline"
                  >
                    {r.employeeName}
                  </td>

                  <td>
                    {convertDecimalToHHMM(r.totalHoursDecimal)}
                  </td>

                  <td className="text-right pr-4 flex justify-end gap-3">
                    <button>
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => deleteRecord(r.id)}
                      className="text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[95%] max-w-5xl rounded-xl shadow-xl">

            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-bold text-lg">
                {selectedEmployee} - Attendance Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {modalLoading ? (
                <p className="text-center py-6">Loading details...</p>
              ) : employeeRecords.length === 0 ? (
                <p className="text-center py-6">No records found</p>
              ) : (
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border text-left">Date</th>
                      <th className="p-2 border text-left">Check In</th>
                      <th className="p-2 border text-left">Check Out</th>
                      <th className="p-2 border text-left">Status</th>
                      <th className="p-2 border text-left">Hours</th>
                      <th className="p-2 border text-left">Remark</th>
                    </tr>
                  </thead>

                  <tbody>
                    {employeeRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50">
                        <td className="p-2 border">
                          {formatDDMMYYYY(new Date(rec.attendanceDate))}
                        </td>
                        <td className="p-2 border">
                          {rec.checkIn || "--"}
                        </td>
                        <td className="p-2 border">
                          {rec.checkOut || "--"}
                        </td>
                        <td className="p-2 border">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              rec.status === "Present"
                                ? "bg-green-100 text-green-700"
                                : rec.status === "Absent"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="p-2 border">
                          {rec.hoursWorked ?? 0}
                        </td>
                        <td className="p-2 border">
                          {rec.remark || "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;