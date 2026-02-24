import api from "./api";

export interface JobOpeningCombo {
  id: number;
  title: string;
}

export const getJobOpeningCombo = async () => {
  const res = await api.get("/JobOpening/combo"); 
  return res.data;
};
