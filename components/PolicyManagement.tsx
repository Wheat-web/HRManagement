import React, { useState, useEffect } from "react";
import { MOCK_POLICIES } from "../constants";
import { PolicyDocument } from "../types";
import {
  FileText,
  Plus,
  Search,
  ChevronRight,
  Edit3,
  Clock,
  Tag,
  X,
} from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";

const PolicyManagement: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDocument | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  // Form State
  const [formData, setFormData] = useState<Partial<PolicyDocument>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    const res = await api.get("/Policy");

    console.log(res);

    const mappedPolicies: PolicyDocument[] = res.data.map((p: any) => ({
      id: p.policyID.toString(),
      title: p.policyTitle,
      category: p.category || "General",
      contentSnippet: p.summarySnippet,
      fullContent: p.fullContent,
      lastUpdated: new Date().toISOString().split("T")[0],
      isActive: p.isActive,
    }));

    setPolicies(mappedPolicies);
  };

  const filteredPolicies = policies.filter(
    (p) =>
      (p.title ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddNew = () => {
    setFormData({
      title: "",
      category: "General",
      contentSnippet: "",
      fullContent: "",
      isActive:true
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (policy: PolicyDocument) => {
    setFormData(policy);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title?.trim() || !formData.contentSnippet?.trim()) return;

    try {
      if (isEditing && formData.id) {
        // UPDATE policy
        const payload = {
          policyTitle: formData.title,
          category: formData.category || "General",
          summarySnippet: formData.contentSnippet,
          fullContent: formData.fullContent || formData.contentSnippet,
          lastUpdated: new Date().toISOString().split("T")[0],
          isActive: formData.isActive,
        };

        console.log(payload, "payloaaaaaaad");
        console.log(formData.id);

        await api.put(`/policy/${formData.id}`, payload);

        // setPolicies((prev) =>
        //   prev.map((p) =>
        //     p.id === formData.id
        //       ? {
        //           ...p,
        //           policyTitle: formData.title!,
        //           category: formData.category || "General",
        //           contentSnippet: formData.contentSnippet!,
        //           fullContent: formData.fullContent || formData.contentSnippet!,
        //           lastUpdated: new Date().toISOString().split("T")[0],
        //         }
        //       : p,
        //   ),
        // );

        if (selectedPolicy?.id === formData.id) {
          setSelectedPolicy(payload);
        }

        loadPolicies();
        showToast("Policy updated successfully", "success");
      } else {
        // CREATE policy
        const payload = {
          policyTitle: formData.title,
          category: formData.category || "General",
          summarySnippet: formData.contentSnippet,
          fullContent: formData.fullContent || formData.contentSnippet,
          lastUpdated: new Date().toISOString().split("T")[0],
          isActive: formData.isActive,
        };

        const res = await api.post("/policy", payload);

        console.log(res, "ressssssssssssssssssssssssssssssss");

        // if backend returns created policy
        // setPolicies((prev) => [...prev, res.data]);
        loadPolicies();

        showToast("Policy added successfully", "success");
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Save failed", "error");
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Policy Management
          </h1>
          <p className="text-slate-500">
            Manage and version control HR policies and handbooks.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> New Policy
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* List Column */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredPolicies.map((policy) => (
              <div
                key={policy.id}
                onClick={() => setSelectedPolicy(policy)}
                className={`p-4 rounded-lg cursor-pointer border transition-all ${
                  !policy.isActive ? "opacity-60" : ""
                } ${
                  selectedPolicy?.id === policy.id
                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3
                    className={`font-semibold text-sm ${
                      selectedPolicy?.id === policy.id
                        ? "text-indigo-900"
                        : "text-slate-800"
                    }`}
                  >
                    {policy.title}
                  </h3>

                  {/* Category + Status Badge */}
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                      {policy.category}
                    </span>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        policy.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {policy.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                  {policy.contentSnippet}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Clock size={10} /> Updated {policy.lastUpdated}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Column */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {selectedPolicy ? (
            <>
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                      {selectedPolicy.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> Last updated{" "}
                      {selectedPolicy.lastUpdated}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedPolicy.title}
                  </h2>
                </div>
                <button
                  onClick={() => handleEdit(selectedPolicy)}
                  className="text-slate-500 hover:text-indigo-600 p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                >
                  <Edit3 size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {selectedPolicy.fullContent || selectedPolicy.contentSnippet}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>Select a policy to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {isEditing ? "Edit Policy" : "Create New Policy"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Policy Title
                </label>
                <input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Remote Work Guidelines"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option>General</option>
                  <option>Finance</option>
                  <option>Legal</option>
                  <option>IT & Security</option>
                  <option>HR</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Status
                </label>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: true })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                      formData.isActive
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-white text-slate-500 border-slate-300"
                    }`}
                  >
                    Active
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isActive: false })
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                      !formData.isActive
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-white text-slate-500 border-slate-300"
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Summary Snippet
                </label>
                <textarea
                  value={formData.contentSnippet}
                  onChange={(e) =>
                    setFormData({ ...formData, contentSnippet: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-20 resize-none text-sm"
                  placeholder="Brief summary shown in list view..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Full Content
                </label>
                <textarea
                  value={formData.fullContent || formData.contentSnippet}
                  onChange={(e) =>
                    setFormData({ ...formData, fullContent: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 h-64 resize-none text-sm font-mono"
                  placeholder="Full policy text..."
                />
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
                disabled={!formData.title}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
              >
                Save Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyManagement;
