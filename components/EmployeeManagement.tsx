import React, { useState, useEffect, useRef } from "react";
import {
  Employee,
  Candidate,
  CandidateStage,
  PaymentFrequency,
  Branch,
  Department,
  EmployeeDocument,
} from "../types";
import {
  Users,
  Plus,
  MapPin,
  MoreHorizontal,
  DownloadCloud,
  SlidersHorizontal,
  Trash2,
  Search,
  Filter,
  Eye,
  Edit2,
  FileText,
  Upload,
  Calendar,
  Mail,
  Phone,
  DollarSign,
  Briefcase,
  CreditCard,
  X,
  Save,
  User,
  CheckCircle,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import api from "@/services/api";

interface EmployeeManagementProps {
  // initialEmployees: Employee[];
  branches: Branch[];
  departments: Department[];
  candidates?: Candidate[];
  onAddEmployee?: (emp: Employee) => void;
  selectedBranchId?: string;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({
  // initialEmployees,
  branches,
  departments,
  candidates = [],
  onAddEmployee,
  selectedBranchId = "all",
}) => {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Edit/Add Form State
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [activeTab, setActiveTab] = useState<
    "identity" | "work" | "finance" | "documents"
  >("identity");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDept]);
  
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/employee");

      const mapped = res.data.map((e: any) => ({
        empID: e.empID,
        name: e.name,
        email: e.email,
        phone: e.phone,
        dob: e.dob?.split("T")[0],
        gender: e.gender,
        address: e.address,

        role: e.role,
        department: e.department,
        branchId: e.branchId,
        employmentType: e.employmentType,
        joinDate: e.joinDate?.split("T")[0],
        status: e.status,
        location: e.location,

        salary: e.salary,
        paymentFrequency: e.paymentFrequency,
        currency: e.currency,
      }));

      setEmployees(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sync state with props
  // useEffect(() => {
  //   if (selectedBranchId === "all") {
  //     setEmployees(initialEmployees);
  //   } else {
  //     setEmployees(
  //       initialEmployees.filter((e) => e.branchId === selectedBranchId),
  //     );
  //   }
  // }, [initialEmployees, selectedBranchId]);

  // Filtered Display List

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === "All" || e.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getBranchName = (id?: string) =>
    branches.find((b) => b.id === id)?.name || "Unknown";

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      dob: null,
      gender: "",
      address: "",

      role: "",
      department: "",
      branchId: "",
      employmentType: "",
      joinDate: null,
      status: "Active",
      location: "",

      salary: 0,
      paymentFrequency: "Annual",
      currency: "USD",

      emergencyContact: {
        name: "",
        relation: "",
        phone: "",
      },

      bankDetails: {
        bankName: "",
        swiftCode: "",
        accountName: "",
        accountNumber: "",
      },

      documents: [],
    });

    setActiveTab("identity");
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setFormData({ ...emp });
    setActiveTab("identity");
    setIsEditModalOpen(true);
  };

  const handleOpenView = (emp: Employee) => {
    setSelectedEmployee(emp);
    setActiveTab("identity");
    setIsViewModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.email?.trim()) {
      showToast("Name and Email Required");
      return;
    }
    try {
      if (formData.id || formData.empID) {
        await api.put(`/Employee/${formData.empID}`, formData);

        setEmployees((prev) =>
          prev.map((e) =>
            e.empID === formData.empID ? { ...e, ...formData } : e,
          ),
        );

        showToast("Employee updated successfully", "success");
      } else {
        const payload = {
          ...formData,
          dob: formData.dob || null,
          joinDate: formData.joinDate || null,
          documents: (formData.documents || []).map((d) => ({
            name: d.name,
            type: d.type,
            uploadDate: new Date(d.uploadDate),
            content: null,
          })),
        };
        await api.post("/Employee", payload);

        await loadEmployees();

        showToast("Employee added successfully", "success");
      }

      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Save failed", "error");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc: EmployeeDocument = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.type.includes("pdf") ? "PDF" : "Image", // Simple check
        uploadDate: new Date().toISOString().split("T")[0],
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      };

      setFormData((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), newDoc],
      }));
      showToast(`${file.name} attached`, "success");
    }
  };

  const removeDocument = (docId: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((d) => d.id !== docId),
    }));
  };

  const renderFormContent = () => {
    switch (activeTab) {
      case "identity":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Phone
                </label>
                <input
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="+1 (555) ..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, dob: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Address
              </label>
              <textarea
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none h-20"
              />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-sm font-bold text-slate-800 mb-3">
                Emergency Contact
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <input
                  placeholder="Contact Name"
                  value={formData.emergencyContact?.name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact!,
                        name: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  placeholder="Relation"
                  value={formData.emergencyContact?.relation || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact!,
                        relation: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  placeholder="Phone"
                  value={formData.emergencyContact?.phone || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact!,
                        phone: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        );
      case "work":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Role / Job Title *
                </label>
                <input
                  value={formData.role || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Employment Type
                </label>
                <select
                  value={formData.employmentType || "Full-time"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employmentType: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Intern</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Department
                </label>
                <select
                  value={formData.department || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Branch
                </label>
                <select
                  value={formData.branchId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, branchId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Join Date
                </label>
                <input
                  type="date"
                  value={formData.joinDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, joinDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Status
                </label>
                <select
                  value={formData.status || "Active"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Active</option>
                  <option>Onboarding</option>
                  <option>On Leave</option>
                  <option>Terminated</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Work Location (Detail)
              </label>
              <input
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Remote / Floor 4"
              />
            </div>
          </div>
        );
      case "finance":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Salary Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.salary || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salary: Number(e.target.value),
                      })
                    }
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Frequency
                </label>
                <select
                  value={formData.paymentFrequency || "Annual"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentFrequency: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Annual</option>
                  <option>Monthly</option>
                  <option>Weekly</option>
                  <option>Hourly</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <CreditCard size={16} /> Bank Details
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <input
                  placeholder="Bank Name"
                  value={formData.bankDetails?.bankName || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: {
                        ...formData.bankDetails!,
                        bankName: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  placeholder="Swift / IFSC Code"
                  value={formData.bankDetails?.swiftCode || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: {
                        ...formData.bankDetails!,
                        swiftCode: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Account Name"
                  value={formData.bankDetails?.accountName || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: {
                        ...formData.bankDetails!,
                        accountName: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  placeholder="Account Number"
                  value={formData.bankDetails?.accountNumber || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: {
                        ...formData.bankDetails!,
                        accountNumber: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        );
      case "documents":
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto text-indigo-500 mb-2" size={32} />
              <p className="text-sm font-medium text-slate-700">
                Click to upload documents
              </p>
              <p className="text-xs text-slate-400">PDF, JPG, PNG (Max 5MB)</p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="space-y-2">
              {(formData.documents || []).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-50 text-red-600 rounded flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {doc.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {doc.uploadDate} • {doc.size}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {(formData.documents || []).length === 0 && (
                <p className="text-center text-slate-400 text-xs py-4">
                  No documents uploaded yet.
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderViewContent = () => {
    if (!selectedEmployee) return null;
    const emp = selectedEmployee;

    switch (activeTab) {
      case "identity":
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Phone
                </p>
                <p className="text-slate-800 font-medium">{emp.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Email
                </p>
                <p className="text-slate-800 font-medium">{emp.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Date of Birth
                </p>
                <p className="text-slate-800 font-medium">{emp.dob || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Gender
                </p>
                <p className="text-slate-800 font-medium">
                  {emp.gender || "-"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Address
                </p>
                <p className="text-slate-800 font-medium">
                  {emp.address || "-"}
                </p>
              </div>
            </div>

            {emp.emergencyContact && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                  Emergency Contact
                </h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-800">
                      {emp.emergencyContact.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {emp.emergencyContact.relation}
                    </p>
                  </div>
                  <p className="text-sm font-mono text-slate-700">
                    {emp.emergencyContact.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      case "work":
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Department
                </p>
                <span className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm font-medium mt-1">
                  {emp.department}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Job Role
                </p>
                <p className="text-slate-800 font-medium">{emp.role}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Employment Type
                </p>
                <p className="text-slate-800 font-medium">
                  {emp.employmentType || "Full-time"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Join Date
                </p>
                <p className="text-slate-800 font-medium">{emp.joinDate}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Location
                </p>
                <p className="text-slate-800 font-medium flex items-center gap-1">
                  <MapPin size={14} className="text-slate-400" /> {emp.location}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Branch
                </p>
                <p className="text-slate-800 font-medium">
                  {getBranchName(emp.branchId)}
                </p>
              </div>
            </div>
          </div>
        );
      case "finance":
        return (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl">
              <p className="text-emerald-800 font-medium mb-1">
                Total Compensation
              </p>
              <h2 className="text-3xl font-bold text-emerald-900">
                {emp.currency} {emp.salary.toLocaleString()}{" "}
                <span className="text-sm font-normal opacity-70">
                  / {emp.paymentFrequency}
                </span>
              </h2>
            </div>

            {emp.bankDetails ? (
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CreditCard size={16} /> Bank Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Bank Name</p>
                    <p className="font-medium text-slate-900">
                      {emp.bankDetails.bankName}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Account Name</p>
                    <p className="font-medium text-slate-900">
                      {emp.bankDetails.accountName}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Account Number</p>
                    <p className="font-mono text-slate-900">
                      ****{emp.bankDetails.accountNumber.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Swift Code</p>
                    <p className="font-mono text-slate-900">
                      {emp.bankDetails.swiftCode || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic">
                No bank details added.
              </p>
            )}
          </div>
        );
      case "documents":
        return (
          <div className="space-y-4 animate-in fade-in">
            {(emp.documents || []).length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">
                  No documents attached to this profile.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {emp.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {doc.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {doc.type} • {doc.size} • {doc.uploadDate}
                        </p>
                      </div>
                    </div>
                    <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                      <DownloadCloud size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Employee Directory
          </h1>
          <p className="text-slate-500">
            Manage workforce profiles, documents, and compliance data.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role & Dept</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Loading employees...
                  </td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No employees found.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-xs text-slate-500">
                            {emp.employmentType || "Full-time"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{emp.role}</p>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 mt-1">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 flex items-center gap-1">
                        <Mail size={12} /> {emp.email}
                      </p>
                      <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                        <Phone size={12} /> {emp.phone || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          emp.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : emp.status === "On Leave"
                              ? "bg-amber-100 text-amber-700"
                              : emp.status === "Onboarding"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                        }`}
                      >
                        {emp.status === "Active" && <CheckCircle size={10} />}
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenView(emp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!loading && filteredEmployees.length > 0 && (
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
      </div>

      {/* Add / Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">
                {formData.id ? "Edit Employee" : "Add New Employee"}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              {["identity", "work", "finance", "documents"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? "border-indigo-600 text-indigo-600 bg-indigo-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {renderFormContent()}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {isViewModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Profile Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-2xl font-bold border-2 border-slate-800">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedEmployee.name}</h2>
                  <p className="text-indigo-200 text-sm">
                    {selectedEmployee.role}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                      {selectedEmployee.department}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold ${selectedEmployee.status === "Active" ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"}`}
                    >
                      {selectedEmployee.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-400 hover:text-white bg-white/10 p-1.5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              {["identity", "work", "finance", "documents"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? "border-indigo-600 text-indigo-600 bg-indigo-50/50" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {renderViewContent()}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(selectedEmployee);
                }}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium flex items-center gap-2"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
