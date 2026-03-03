import React, { useState, useEffect } from "react";
import { UserProfile, Role, Branch } from "../types";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  Mail,
  Building2,
  CheckCircle2,
  X,
  RefreshCw,
  PowerOff,
  Power,
} from "lucide-react";
import { getUserRoleCombo, UserRoleCombo } from "../services/roleService";
import { getBranchCombo, BranchCombo } from "../services/branchService";
import api from "@/services/api";
import { useToast } from "@/context/ToastContext";

// interface UserManagementProps {
//   users: UserProfile[];
//   branches: Branch[];
//   onAddUser: (user: UserProfile) => void;
//   onUpdateUser: (user: UserProfile) => void;
//   onDeleteUser: (userId: string) => void;
// }

const UserManagement = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRoleCombo[]>([]);
  const [branches, setBranches] = useState<BranchCombo[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleID: "",
    branchID: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const roleData = await getUserRoleCombo();
        setRoles(roleData);

        const branchData = await getBranchCombo();
        setBranches(branchData);

        await loadUsers();
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };

    loadData();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/User");

      const formattedUsers: UserProfile[] = res.data.map((u: any) => ({
        id: u.id,
        name: u.userName,
        email: u.email,
        password: u.passwordHash,
        role: u.roleName,
        roleID: u.roleID,
        branchId: u.branchID,
        isActive: u.isActive,
      }));

      setUsers(formattedUsers);
    } catch (error) {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const name = user.name?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const role = user.role?.toLowerCase() || "";

    return (
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      role.includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleOpenModal = (user?: UserProfile) => {
    if (user) {
      setEditingUser(user);

      setFormData({
        name: user.name,
        email: user.email,
        password: user.password || "",
        roleID: String(user.roleID),
        branchID: user.branchId ? String(user.branchId) : "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        roleID: "",
        branchID: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        email: formData.email,
        passwordHash: formData.password,
        userName: formData.name,
        roleID: Number(formData.roleID),
        branchID: formData.branchID ? Number(formData.branchID) : null,
      };

      if (editingUser) {
        await api.put(`/User/${editingUser.id}`, payload);
        showToast("User updated successfully", "success");
      } else {
        await api.post("/User", payload);
        showToast("User created successfully", "success");
      }

      await loadUsers();
      setIsModalOpen(false);
    } catch (error: any) {
      showToast(
        error?.response?.data?.message || "Something went wrong",
        "error",
      );
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    try {
      const newStatus = !user.isActive;
      await api.put(`/User/${user.id}/Status/${newStatus}`);
      showToast(
        `User ${newStatus ? "activated" : "deactivated"} successfully`,
        "success",
      );
      await loadUsers();
    } catch (error) {
      showToast("Failed to Update", "error");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      // onDeleteUser(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage system access and user roles</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadUsers}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm"
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            Add New User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">
              Total Users
            </span>
            <Users size={20} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">Admins</span>
            <Shield size={20} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {
              users.filter(
                (u) =>
                  u.role === Role.COMPANY_ADMIN || u.role === Role.HR_ADMIN,
              ).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">Managers</span>
            <Building2 size={20} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {users.filter((u) => u.role === Role.MANAGER).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">
              Employees
            </span>
            <Users size={20} className="text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {users.filter((u) => u.role === Role.EMPLOYEE).length}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search users by name, email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500">Loading users...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Password</th>
                  <th className="px-6 py-4">Branch</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {user.name}
                          </p>
                          <div className="flex items-center gap-1 text-slate-500 text-xs">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          user.role === Role.COMPANY_ADMIN
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : user.role === Role.HR_ADMIN
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : user.role === Role.MANAGER
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 text-xs font-mono">
                        {user.password}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.branchId ? (
                        <span className="text-slate-700">
                          {branches.find((b) => b.id === user.branchId)?.name ||
                            "Unknown Branch"}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">
                          All Branches
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
                          <CheckCircle2 size={14} />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600 font-medium text-xs">
                          <PowerOff size={14} />
                          Inactive
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isActive
                              ? "text-emerald-600 hover:bg-emerald-50"
                              : "text-amber-600 hover:bg-amber-50"
                          }`}
                        >
                          {user.isActive ? (
                            <PowerOff size={16} />
                          ) : (
                            <Power size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {!loading && paginatedUsers.length > 0 && (
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="text" // change to password if you want hidden
                  required={!editingUser} // required only when creating
                  value={formData.password || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.roleID}
                  onChange={(e) =>
                    setFormData({ ...formData, roleID: e.target.value })
                  }
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.roleID} value={role.roleID}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Branch Assignment
                </label>
                <select
                  value={formData.branchID}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      branchID: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="">All Branches (Global Access)</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty for global access (Admins only)
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm shadow-indigo-200"
                >
                  {editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
