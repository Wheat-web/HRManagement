import React, { useState, useEffect } from "react";
import { PERMISSION_TREE } from "../constants";
import { Permission, RoleDefinition } from "../types";
import PermissionTree from "./PermissionTree";
import { Plus, Trash2, Lock } from "lucide-react";
import api from "@/services/api";

const RoleManagement: React.FC = () => {
  // const [roles, setRoles] = useState<[]>([]);
  // const [selectedRole, setSelectedRole] = useState<"" | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  // const [tempRole, setTempRole] = useState<"" | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [tempRole, setTempRole] = useState<RoleDefinition | null>(null);

  const currentRole = isEditing && tempRole ? tempRole : selectedRole;

  useEffect(() => {
    loadPermissions();
    loadRoles();
  }, []);

  const loadPermissions = async () => {
    try {
      const res = await api.get("/RolePermission/Permission");
      setAllPermissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await api.get("/RolePermission/roles");

      const formattedRoles: RoleDefinition[] = res.data.map((r: any) => ({
        id: r.id?.toString() ?? r.roleId?.toString(),
        name: r.roleName ?? r.name ?? "",
        description: "",
        usersCount: 0,
        isSystem: false,
        permissions: [],
      }));

      setRoles(formattedRoles);

      if (formattedRoles.length > 0) {
        setSelectedRole(formattedRoles[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleCreateRole = () => {
    const newRole: RoleDefinition = {
      id: "",
      name: "",
      description: "",
      usersCount: 0,
      isSystem: false,
      permissions: [],
    };

    setTempRole(newRole);
    setIsEditing(true);
  };

  const handleDeleteRole = () => {
    if (!selectedRole || selectedRole.isSystem) return;

    const updated = roles.filter((r) => r.id !== selectedRole.id);
    setRoles(updated);
    setSelectedRole(updated[0]);
    setIsEditing(false);
    setTempRole(null);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setTempRole(null);
      setIsEditing(false);
    } else {
      setTempRole({ ...selectedRole });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!tempRole) return;

    try {
      const permissionIds = tempRole?.permissions
        .filter((p) => p !== "all")
        .map((code) => {
          const found = allPermissions.find((ap) => ap.code === code);
          return found ? { permissionID: found.id } : null;
        })
        .filter(Boolean);

      console.log(permissionIds, "pererfwerfwerfwerf");

      const payload = {
        name: tempRole.name,
        branchID: 1,
        permissions: permissionIds,
      };

      await api.post("/RolePermission", payload);

      loadRoles()
      setTempRole(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const setPermissions = (perms: string[]) => {
    if (!tempRole) return;
    setTempRole({ ...tempRole, permissions: perms });
  };

  const handleSelectRole = async (role: RoleDefinition) => {
    try {
      setSelectedRole(role);

      const res = await api.get(`/RolePermission/permission/${role.id}`);

      const permissionCodes = res.data.map((p: any) => p.code.toLowerCase());
      setSelectedRole({
        ...role,
        permissions: permissionCodes,
      });
    } catch (err) {
      console.error("Error loading role permissions:", err);
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* LEFT PANEL */}
      <div className="w-1/4 bg-white border rounded-lg p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-sm">Roles</h3>
          <button
            onClick={handleCreateRole}
            className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-2">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => handleSelectRole(role)}
              className={`p-3 cursor-pointer rounded flex justify-between items-center
                  ${selectedRole?.id === role.id ? "bg-indigo-50" : ""}
                `}
            >
              <span className="text-sm font-medium">{role.name}</span>
              {role?.isSystem && <Lock size={14} className="text-slate-400" />}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-white border rounded-lg p-6">
        <div className="flex justify-between mb-6">
          <div className="flex-1">
            {isEditing ? (
              <>
                <input
                  value={tempRole?.name}
                  onChange={(e) =>
                    setTempRole((prev) =>
                      prev ? { ...prev, name: e.target.value } : null,
                    )
                  }
                  className="text-xl font-bold border rounded px-2 py-1 w-full mb-2"
                />

                <textarea
                  value={tempRole?.description}
                  onChange={(e) =>
                    setTempRole((prev) =>
                      prev ? { ...prev, description: e.target.value } : null,
                    )
                  }
                  className="text-sm border rounded px-2 py-1 w-full"
                />
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {currentRole?.name}
                  {currentRole?.isSystem && (
                    <Lock size={16} className="text-slate-400" />
                  )}
                </h2>
                <p className="text-sm text-slate-500">
                  {currentRole?.description}
                </p>
              </>
            )}
          </div>

          <div className="flex gap-2 items-start">
            {isEditing ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="px-3 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-2 bg-indigo-600 text-white rounded"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                {!selectedRole?.isSystem && (
                  <button
                    onClick={handleDeleteRole}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <button
                  onClick={handleEditToggle}
                  className="px-3 py-2 border rounded text-sm"
                >
                  Edit Permissions
                </button>
              </>
            )}
          </div>
        </div>

        {/* PERMISSIONS */}
        {currentRole?.permissions?.includes("all") ? (
          <div className="p-6 bg-indigo-50 rounded">
            Full Administrator Access
          </div>
        ) : (
          <PermissionTree
            nodes={PERMISSION_TREE}
            selected={currentRole?.permissions ?? []}
            setSelected={setPermissions}
            isEditing={isEditing}
          />
        )}
      </div>
    </div>
  );
};

export default RoleManagement;
