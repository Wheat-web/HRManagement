import { createContext, useContext } from "react";
import { Role } from "../types";
import { UserProfile } from "../types";

interface PermissionContextType {
  permissions: string[];
  user: UserProfile | null;
}

export const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  user: null,
});

export const usePermission = () => {
  const { permissions, user } = useContext(PermissionContext);

  const hasPermission = (code: string) => {
    // 🔥 Super Admin override
    if (
      user?.role === Role.COMPANY_ADMIN ||
      user?.role === Role.HR_ADMIN
    ) {
      return true;
    }

    return permissions.includes(code);
  };

  return { hasPermission };
};