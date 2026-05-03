import axios from "@/lib/axios";

export const getCourses = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}) => {
  const res = await axios.get("/api/courses", { params });
  return res.data;
};

export const getCourseById = async (id: string) => {
  const res = await axios.get(`/api/courses/${id}`);
  return res.data;
};