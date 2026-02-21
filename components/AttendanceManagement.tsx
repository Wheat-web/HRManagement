import React, { useState } from "react";
import { MOCK_ATTENDANCE, MOCK_EMPLOYEES } from "../constants";
import { AttendanceRecord, Employee } from "../types";
import {
  Upload,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  FileDown,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "../context/ToastContext";

const AttendanceManagement: React.FC = () => {
  const { showToast } = useToast();
  const [attendanceData, setAttendanceData] =
    useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [isUploading, setIsUploading] = useState(false);

  // Mock CSV Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      // Simulate processing delay
      setTimeout(() => {
        // Mock parsing logic: Create dummy records for employees not in the list for today
        const newRecords: AttendanceRecord[] = MOCK_EMPLOYEES.map(
          (emp, index) => ({
            id: `new_att_${Date.now()}_${index}`,
            employeeId: emp.id,
            employeeName: emp.name,
            date: selectedDate,
            checkIn: "09:00",
            checkOut: "17:00",
            status: Math.random() > 0.8 ? "Late" : "Present",
            hoursWorked: 8,
          }),
        );

        // Merge with existing (filtering out duplicates for this simulation)
        setAttendanceData((prev) => [...newRecords, ...prev]);
        setIsUploading(false);
        showToast("Attendance CSV processed successfully", "success");
      }, 1500);
    }
  };

  const filteredAttendance = attendanceData.filter(
    (record) =>
      record.date === selectedDate &&
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Attendance Management
          </h1>
          <p className="text-slate-500">
            Track daily attendance, upload biometrics logs, and manage
            exceptions.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            // onClick={loadBranches}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium">
            <FileDown size={16} /> Download Report
          </button>
          <label className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium cursor-pointer transition-colors">
            <Upload size={16} />
            {isUploading ? "Processing..." : "Upload CSV"}
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="text-slate-400" size={16} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
                <th className="px-6 py-4">Hours</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Clock size={32} className="opacity-50" />
                      <p>
                        No records found for this date. Upload CSV to populate.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {record.employeeName}
                    </td>
                    <td className="px-6 py-4">{record.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === "Present"
                            ? "bg-emerald-100 text-emerald-700"
                            : record.status === "Late"
                              ? "bg-amber-100 text-amber-700"
                              : record.status === "Absent"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {record.status === "Present" && (
                          <CheckCircle size={12} />
                        )}
                        {record.status === "Absent" && <XCircle size={12} />}
                        {record.status === "Late" && (
                          <AlertTriangle size={12} />
                        )}
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{record.checkIn}</td>
                    <td className="px-6 py-4 font-mono">
                      {record.checkOut || "--:--"}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {record.hoursWorked ? `${record.hoursWorked} hrs` : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
