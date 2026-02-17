import api from "@/services/api";

export const getCandidates = async () => {
  const res = await api.get("/Candidate");

  console.log(res,"ressssssssssssssssssssssssssssssss");
  
  return res.data;
};

export const getCandidatesByJob = async (jobId: number) => {
  const res = await api.get(`/Candidate/job/${jobId}`);
  return res.data;
};

export const createCandidate = async (data: any) => {
  const res = await api.post("/Candidate", data);
  return res.data;
};

export const updateCandidateStage = async (
  id: number,
  stageId: number
) => {

    console.log(id,stageId);
    
  const res = await api.put(`/Candidate/${id}/stage/${stageId}`);

  console.log(res,"resssssss");
  
  return res.data;
};

export const updateCandidate = async (id: number, data: any) => {
  const res = await api.put(`/Candidate/${id}`, data);
  return res.data;
};
