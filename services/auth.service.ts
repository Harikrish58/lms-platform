import axios from "@/lib/axios";

export const registerUser = async (data: {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}) => {
  const response = await axios.post("/api/register", data);
  return response.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await axios.post("/api/login", data);
  return response.data;
};


