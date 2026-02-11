import api from "./api";

export interface BranchCombo {
  id: number;
  name: string;
}

export const getBranchCombo = async (): Promise<BranchCombo[]> => {
  const res = await api.get("/BranchCombo");
  return res.data;
};