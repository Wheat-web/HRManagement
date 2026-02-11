import React, { useState, useEffect } from "react";
import { Department, Branch } from "../types";
import { Plus, MapPin, MoreHorizontal, Globe, Edit2 } from "lucide-react";
import { getBranchCombo, BranchCombo } from "@/services/branchService";
import { useToast } from "../context/ToastContext";
import api from "@/services/api";

interface OrganizationManagementProps {
  initialDepartments: Department[];
  branches: Branch[];
  onAddDepartment?: (dept: Department) => void;
  selectedBranchId?: string;
}

const OrganizationManagement: React.FC<OrganizationManagementProps> = ({
  initialDepartments,
  branches,
  onAddDepartment,
  selectedBranchId = "all",
}) => {
  const { showToast } = useToast();
  const [departments, setDepartments] =
    useState<Department[]>(initialDepartments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [branchOptions, setBranchOptions] = useState<BranchCombo[]>([]);
  const itemsPerPage = 10;

  // Sync state with props
  // useEffect(() => {
  //   // Filter based on selected branch if needed, or show all
  //   if (selectedBranchId === "all") {
  //     setDepartments(initialDepartments);
  //   } else {
  //     setDepartments(
  //       initialDepartments.filter((d) => d.branchId === selectedBranchId),
  //     );
  //   }
  // }, [initialDepartments, selectedBranchId]);

  useEffect(() => {
    loadDepartments();
    loadBranches();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/Department");

      const mapped: Department[] = res.data.map((d: any) => ({
        id: d.id,
        name: d.name,
        manager: d.manager,
        headCount: d.headCount,
        location: d.location,
        branchId: d.branchId,
        isActive: d.isActive,
      }));

      console.log(mapped, "dtdh");

      setDepartments(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const data = await getBranchCombo();
      setBranchOptions(data);
    } catch (err) {
      console.error("Failed to load branches", err);
    }
  };

  // const handleCreate = () => {
  //   const newDept: Department = {
  //     id: `d${Date.now()}`,
  //     name: formData.name || "New Dept",
  //     manager: formData.manager || "Unassigned",
  //     location: formData.location || "Headquarters",
  //     branchId:
  //       formData.branchId ||
  //       (selectedBranchId !== "all" ? selectedBranchId : branches[0]?.id),
  //     headCount: 0,
  //     isActive: formData.isActive ?? true,
  //   };

  //   if (onAddDepartment) {
  //     onAddDepartment(newDept);
  //   } else {
  //     setDepartments([...departments, newDept]);
  //   }

  //   setIsModalOpen(false);
  //   setFormData({});
  //   showToast("Department created successfully", "success");
  // };

  const handleEdit = (dept: Department) => {
    console.log("Editing ID:", dept.id, typeof dept.id);
    setFormData({ ...dept });
    setEditingId(dept.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.manager?.trim()) {
      showToast("Department Name and Manager are required", "error");
      return;
    }

    try {
      const payload = {
        id: editingId ?? 0,
        name: formData.name.trim(),
        manager: formData.manager.trim(),
        headCount: formData.headCount ?? 0,
        location: formData.location ?? "",
        branchId: formData.branchId,
        isActive: formData.isActive ?? true,
      };

      if (isEditing && editingId !== null) {
        await api.put(`/Department/${editingId}`, payload);
        showToast("Department updated successfully", "success");
      } else {
        await api.post("/Department", payload);
        showToast("Department created successfully", "success");
      }

      await loadDepartments();
      setIsModalOpen(false);
      setFormData({});
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      showToast("Save failed", "error");
    }
  };

  const totalPages = Math.ceil(departments.length / itemsPerPage);

  const paginatedDepartments = departments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getBranchName = (id?: number) =>
    branchOptions.find((b) => b.id === id)?.name || "Unknown";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Department Structure
          </h1>
          <p className="text-slate-500">
            Manage departments and operational hierarchy for{" "}
            {selectedBranchId === "all" ? "all branches" : ""} .
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({});
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Add Department
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500">Loading departments...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Manager</th>
                  <th className="px-6 py-4">Headcount</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDepartments.map((dept) => (
                  <tr key={dept.id} className="group hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {dept.name}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs text-slate-600 font-bold">
                        {dept.manager.charAt(0)}
                      </div>
                      {dept.manager}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        {dept.headCount} Members
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Globe size={14} className="text-indigo-500" />
                        {getBranchName(dept.branchId)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          dept.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {dept.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500 flex items-center gap-1">
                      <MapPin size={14} /> {dept.location}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 transition hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && paginatedDepartments.length > 0 && (
              <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-slate-200 bg-slate-50 text-sm">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-1 rounded border text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                >
                  &lt;
                </button>

                <span className="text-slate-600">
                  {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 rounded border text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3>{isEditing ? "Edit Department" : "Add Department"}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Branch Assignment
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={formData.branchId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branchId: Number(e.target.value),
                      })
                    }
                  >
                    <option value="" disabled>
                      Select Branch
                    </option>

                    {branchOptions.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Active Status
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        isActive: !formData.isActive,
                      })
                    }
                    className={`relative w-12 h-6 rounded-full transition ${
                      formData.isActive ? "bg-indigo-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
                        formData.isActive ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Manager
                  </label>
                  <input
                    type="text"
                    value={formData.manager || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) =>
                      setFormData({ ...formData, manager: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Location (Specific)
                  </label>
                  <input
                    type="text"
                    value={formData.location || ""}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Floor 4, Building A"
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
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
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                {isEditing ? "Update Department" : "Create Department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagement;
