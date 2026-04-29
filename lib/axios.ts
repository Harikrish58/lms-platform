import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
});

axiosInstance.interceptors.request.use((consfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      consfig.headers.Authorization = `Bearer ${token}`;
    }
  }
  return consfig;
});

export default axiosInstance;
