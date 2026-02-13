import api from "./api";

export interface DepartmentCombo {
  id: number;
  name: string;
}

export const getDepartmentCombo = async (): Promise<DepartmentCombo[]> => {
  const res = await api.get("/Department/combo");
  return res.data;
};