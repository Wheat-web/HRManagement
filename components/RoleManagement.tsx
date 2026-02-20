import React, { useState } from "react";
import { MOCK_ROLE_DEFINITIONS, PERMISSION_TREE } from "../constants";
import { RoleDefinition } from "../types";
import PermissionTree from "./PermissionTree";
import { Plus, Trash2, Lock } from "lucide-react";

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<RoleDefinition[]>(MOCK_ROLE_DEFINITIONS);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition>(roles[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [tempRole, setTempRole] = useState<RoleDefinition | null>(null);

  const currentRole = isEditing && tempRole ? tempRole : selectedRole;

  // =============================
  // CREATE ROLE
  // =============================
  const handleCreateRole = () => {
    const newRole: RoleDefinition = {
      id: `role_${Date.now()}`,
      name: "New Role",
      description: "Role description",
      usersCount: 0,
      isSystem: false,
      permissions: []
    };

    setRoles([...roles, newRole]);
    setSelectedRole(newRole);
    setTempRole(newRole);
    setIsEditing(true);
  };

  // =============================
  // DELETE ROLE
  // =============================
  const handleDeleteRole = () => {
    if (selectedRole.isSystem) return;

    const updated = roles.filter(r => r.id !== selectedRole.id);
    setRoles(updated);
    setSelectedRole(updated[0]);
    setIsEditing(false);
    setTempRole(null);
  };

  // =============================
  // EDIT TOGGLE
  // =============================
  const handleEditToggle = () => {
    if (isEditing) {
      setTempRole(null);
      setIsEditing(false);
    } else {
      setTempRole({ ...selectedRole });
      setIsEditing(true);
    }
  };

  // =============================
  // SAVE
  // =============================
  const handleSave = () => {
    if (!tempRole) return;

    const updated = roles.map(r =>
      r.id === tempRole.id ? tempRole : r
    );

    setRoles(updated);
    setSelectedRole(tempRole);
    setTempRole(null);
    setIsEditing(false);
  };

  // =============================
  // UPDATE PERMISSIONS
  // =============================
  const setPermissions = (perms: string[]) => {
    if (!tempRole) return;
    setTempRole({ ...tempRole, permissions: perms });
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
          {roles.map(role => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`p-3 cursor-pointer rounded flex justify-between items-center
                ${selectedRole.id === role.id ? "bg-indigo-50" : ""}
              `}
            >
              <span className="text-sm font-medium">{role.name}</span>
              {role.isSystem && <Lock size={14} className="text-slate-400" />}
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
                    setTempRole(prev =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  className="text-xl font-bold border rounded px-2 py-1 w-full mb-2"
                />

                <textarea
                  value={tempRole?.description}
                  onChange={(e) =>
                    setTempRole(prev =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  className="text-sm border rounded px-2 py-1 w-full"
                />
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {currentRole.name}
                  {currentRole.isSystem && (
                    <Lock size={16} className="text-slate-400" />
                  )}
                </h2>
                <p className="text-sm text-slate-500">
                  {currentRole.description}
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
                {!selectedRole.isSystem && (
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
        {currentRole.permissions.includes("all") ? (
          <div className="p-6 bg-indigo-50 rounded">
            Full Administrator Access
          </div>
        ) : (
          <PermissionTree
            nodes={PERMISSION_TREE}
            selected={currentRole.permissions}
            setSelected={setPermissions}
            isEditing={isEditing}
          />
        )}
      </div>
    </div>
  );
};

export default RoleManagement;