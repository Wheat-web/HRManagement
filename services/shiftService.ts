import api from "./api";

export interface ShiftCombo {
  shiftId: number;
  shiftName: string;
}

export const getShiftCombo = async () => {
  const res = await api.get("/Shift/combo"); 
  return res.data;
};