"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { Star, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ReviewModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal = ({
  courseId,
  isOpen,
  onClose,
}: ReviewModalProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      return await axios.post(`/api/courses/${courseId}/reviews`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-reviews", courseId] });
      toast.success("Thank you for your feedback!");
      onClose();
    },
    onError: () => toast.error("Failed to post review"),
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-900">
            Rate your experience
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={32}
              className={`cursor-pointer transition-all ${star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>

        <textarea
          className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 text-sm outline-none focus:border-indigo-600"
          rows={4}
          placeholder="What did you like about this course?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          disabled={mutation.isPending || comment.length < 5}
          onClick={() => mutation.mutate({ rating, comment })}
          className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {mutation.isPending ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </div>
  );
};
