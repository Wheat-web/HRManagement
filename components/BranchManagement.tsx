import React, { useState, useEffect } from "react";
import { Branch, Employee } from "../types";
import {
  Building2,
  MapPin,
  Users,
  DollarSign,
  Globe,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  X,
  Save,
  Settings,
  ShieldCheck,
  Check,
  RefreshCw,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import api from "@/services/api";

interface BranchManagementProps {
  //   branches: Branch[];
  //   employees: Employee[];
  onAddBranch: (branch: Branch) => void;
  onUpdateBranch: (branch: Branch) => void;
  onDeleteBranch: (id: string) => void;
}

const BranchManagement: React.FC<BranchManagementProps> = ({
  //   branches,
  //   employees,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Default Settings State (In real app, this would come from a global config)
  const [defaultSettings, setDefaultSettings] = useState({
    currency: "USD",
    timezone: "UTC",
    language: "English",
    fiscalYearStart: "January",
  });

  // Form State
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: "",
    location: "",
    currency: "USD",
    timezone: "UTC",
    manager: "",
    isHeadquarters: false,
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get("/Branch");
      setBranches(res.data);
    } catch (err) {
      showToast("Failed to load Branches", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = Array.isArray(branches)
    ? branches.filter(
        (b) =>
          b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.location?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      location: "",
      currency: defaultSettings.currency,
      timezone: defaultSettings.timezone,
      manager: "",
      isHeadquarters: false,
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setFormData(branch);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  //   const handleDelete = (id: string) => {
  //     const branch = branches.find((b) => b.id === id);
  //     if (branch?.isHeadquarters) {
  //       showToast(
  //         "Cannot delete Headquarters. Please assign a new HQ first.",
  //         "error",
  //       );
  //       return;
  //     }
  //     // Check if branch has employees
  //     const count = employees.filter((e) => e.branchId === id).length;
  //     if (count > 0) {
  //       showToast(
  //         `Cannot delete branch with ${count} active employees.`,
  //         "error",
  //       );
  //       return;
  //     }
  //     onDeleteBranch(id);
  //     showToast("Branch deleted successfully", "info");
  //   };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.location?.trim()) {
      showToast("Name and Location are required", "warning");
      return;
    }

    try {
      if (formData.isHeadquarters) {
        const existingHQ = branches.find(
          (b) => b.isHeadquarters && b.id !== formData.id,
        );
        if (existingHQ) {
          await api.put(`/Branch/${existingHQ.id}`, {
            ...existingHQ,
            isHeadquarters: false,
          });

          setBranches((prev) =>
            prev.map((b) =>
              b.id === existingHQ.id ? { ...b, isHeadquarters: false } : b,
            ),
          );
        }
      }

      if (formData.id) {
        // ✅ UPDATE
        await api.put(`/Branch/${formData.id}`, formData);

        setBranches((prev) =>
          prev.map((b) => (b.id === formData.id ? { ...b, ...formData } : b)),
        );

        showToast("Branch updated successfully", "success");
      } else {
        // ✅ CREATE
        const payload = {
          name: formData.name,
          location: formData.location,
          currency: formData.currency || "USD",
          timezone: formData.timezone || "UTC",
          manager: formData.manager || "Unassigned",
          isHeadquarters: formData.isHeadquarters ?? false,
          isActive: true,
        };

        const res = await api.post("/Branch", payload);

        if (res?.data) {
          setBranches((prev) => [...prev, res.data]);
        } else {
          await loadBranches(); // fallback
        }

        showToast("Branch added successfully", "success");
      }
      loadBranches();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Save failed", "error");
    }
  };

  const handleSaveDefaults = () => {
    // In a real app, save to backend
    setIsSettingsModalOpen(false);
    showToast("Default branch settings saved", "success");
  };

  const getBranchStats = (branchId: string) => {
    const branchEmployees = employees.filter((e) => e.branchId === branchId);
    const totalPayroll = branchEmployees.reduce(
      (sum, e) => sum + e.salary / (e.paymentFrequency === "Annual" ? 12 : 1),
      0,
    );
    return {
      count: branchEmployees.length,
      payroll: totalPayroll,
    };
  };

  const totalHeadCount = branches.reduce(
    (sum, b) => sum + (b.headCount || 0),
    0,
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Branch Management
          </h1>
          <p className="text-slate-500">
            Configure company locations, regional hubs, and offices.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadBranches}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm"
          >
            <Settings size={16} /> Defaults
          </button>
          <button
            onClick={handleOpenAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Branch
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            Total Locations
          </p>
          <h3 className="text-3xl font-bold text-slate-900">
            {branches.length}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            Global Headcount
          </p>
          <h3 className="text-3xl font-bold text-slate-900">
            {totalHeadCount}
          </h3>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            Operating Currencies
          </p>
          <div className="flex gap-2">
            {Array.from(new Set(branches.map((b) => b.currency))).map((c) => (
              <span
                key={c}
                className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search branches..."
              className="w-full pl-4 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500">Loading Branches...</p>
              </div>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="text-center text-slate-400 py-20">
              No branches found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBranches.map((branch) => {
                const stats = getBranchStats(branch.id);
                return (
                  <div
                    key={branch.id}
                    className={`bg-white border rounded-xl p-5 hover:shadow-md transition-shadow relative group ${branch.isHeadquarters ? "border-indigo-200 ring-1 ring-indigo-100" : "border-slate-200"}`}
                  >
                    {branch.isHeadquarters && (
                      <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg border-b border-l border-indigo-200">
                        HEADQUARTERS
                      </div>
                    )}

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 pt-4">
                      <button
                        onClick={() => handleEdit(branch)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg hover:border-indigo-200"
                      >
                        <Edit2 size={14} />
                      </button>
                      {/* <button
                      onClick={() => handleDelete(branch.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg hover:border-red-200"
                    >
                      <Trash2 size={14} />
                    </button> */}
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${branch.isHeadquarters ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"}`}
                      >
                        {branch.isHeadquarters ? (
                          <ShieldCheck size={20} />
                        ) : (
                          <Building2 size={20} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {branch.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin size={10} /> {branch.location}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                        <span className="text-slate-500 flex items-center gap-2">
                          <Users size={14} /> Headcount
                        </span>
                        <span className="font-medium text-slate-900">
                          {branch.headCount}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                        <span className="text-slate-500 flex items-center gap-2">
                          <DollarSign size={14} /> Currency
                        </span>
                        <span className="font-medium text-slate-900">
                          {branch.currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                        <span className="text-slate-500 flex items-center gap-2">
                          <Globe size={14} /> Timezone
                        </span>
                        <span className="font-medium text-slate-900">
                          {branch.timezone}
                        </span>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">
                          Branch Manager
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {branch.manager.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {branch.manager}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {isEditing ? "Edit Branch" : "Add New Branch"}
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
                  Branch Name
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. London HQ"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Location
                </label>
                <input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. 123 Baker St, London"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST (New York)</option>
                    <option value="PST">PST (Los Angeles)</option>
                    <option value="GMT">GMT (London)</option>
                    <option value="IST">IST (India)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Manager
                </label>
                <input
                  value={formData.manager}
                  onChange={(e) =>
                    setFormData({ ...formData, manager: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. Sarah Smith"
                />
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center ${formData.isHeadquarters ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-400"}`}
                  >
                    {formData.isHeadquarters && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={formData.isHeadquarters || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isHeadquarters: e.target.checked,
                      })
                    }
                  />
                  <div className="text-sm">
                    <span className="font-bold text-slate-700 block">
                      Set as Headquarters
                    </span>
                    <span className="text-xs text-slate-500">
                      This will replace the current HQ.
                    </span>
                  </div>
                </label>
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
              >
                <Save size={16} /> Save Branch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Default Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Settings size={18} /> Default Branch Configuration
              </h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 mb-4 bg-blue-50 p-3 rounded-lg text-blue-700">
                These settings will be pre-selected when creating a new branch.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Default Currency
                  </label>
                  <select
                    value={defaultSettings.currency}
                    onChange={(e) =>
                      setDefaultSettings({
                        ...defaultSettings,
                        currency: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Default Timezone
                  </label>
                  <select
                    value={defaultSettings.timezone}
                    onChange={(e) =>
                      setDefaultSettings({
                        ...defaultSettings,
                        timezone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST (New York)</option>
                    <option value="PST">PST (Los Angeles)</option>
                    <option value="GMT">GMT (London)</option>
                    <option value="IST">IST (India)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Default Language
                </label>
                <select
                  value={defaultSettings.language}
                  onChange={(e) =>
                    setDefaultSettings({
                      ...defaultSettings,
                      language: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Fiscal Year Start
                </label>
                <select
                  value={defaultSettings.fiscalYearStart}
                  onChange={(e) =>
                    setDefaultSettings({
                      ...defaultSettings,
                      fiscalYearStart: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option>January</option>
                  <option>April</option>
                  <option>July</option>
                  <option>October</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDefaults}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm font-medium flex items-center gap-2"
              >
                <Save size={16} /> Save Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
