import api from "./api";

export const getUsers = async () => {
  const res = await api.get("/User");
  return res.data;
};