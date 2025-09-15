import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://video-proctoring.onrender.com/api", 
});

export const saveLog = (candidateId, event) =>
  API.post("/logs", { candidateId, event });

export const fetchLogs = (candidateId) =>
  API.get(`/logs/${candidateId}`);

export const uploadVideo = (formData) =>
  API.post("/videos/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });


export const processFrame = (candidateId, image) =>
  axios.post(
    import.meta.env.VITE_PROCESS_URL || "http://127.0.0.1:8080/process-frame",
    { candidateId, image }
  );
 
export default API;
