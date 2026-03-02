import api from "./api";

export interface UserRoleCombo {
  roleID: number;
  roleName: string;
}

export const getUserRoleCombo = async () => {
  const res = await api.get("/RolePermission/combo"); 
  return res.data;
};