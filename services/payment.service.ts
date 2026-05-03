import axios from "@/lib/axios";

export const createCheckoutSession = async (courseId: string) => {
  const res = await axios.post("/api/checkout", { courseId });
  return res.data;
};