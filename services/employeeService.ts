import api from "./api";

export interface EmployeeCombo {
  id: number;
  name: string;
  role: string;
}

export const getEmployeeCombo = async (): Promise<EmployeeCombo[]> => {
  const res = await api.get("/Employee/combo");
  return res.data;
};