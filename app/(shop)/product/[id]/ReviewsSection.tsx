"use client";

import { useState } from "react";
import { Star, Send, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import Link from "next/link";
// import { useSession } from "next-auth/react";
import { useSupabaseSession } from "@/lib/supabase/hooks/use-supabase-session";
// 💡 افزودن ReviewInsert. فرض می‌کنیم این تایپ از database.types.ts استخراج شده است.
import type {
  EnhancedProduct,
  ReviewWithProfile,
  ReviewInsert,
  ReviewsSectionProps,
} from "@/types";
import { supabase } from "@/lib/supabase/client";

const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  // comment را اختیاری می‌کنیم مگر اینکه حداقل 10 کاراکتر باشد.
  title: z.string().optional(),
  comment: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: "Comment must be at least 10 characters long if provided.",
    }),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

// interface ReviewsSectionProps {
//   product: EnhancedProduct;
//   onReviewSubmitted: () => void;
// }

export default function ReviewsSection({
  product,
  onReviewSubmitted,
}: ReviewsSectionProps) {
  // const { data: session, status } = useSession();
  const { user, loading } = useSupabaseSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // فرض: user_id از سشن به درستی دریافت شده است
  const currentUserId = user?.id;

  const reviews = product.reviews as ReviewWithProfile[];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "", title: "" },
  });

  const selectedRating = watch("rating");

  const onSubmit = async (data: ReviewFormData) => {
    if (!user || !currentUserId) {
      // ⚠️ هشدار: در محیط‌های تولیدی از یک Modal یا Toast برای پیام‌ها استفاده کنید
      alert("Please log in to submit a review");
      return;
    }

    setIsSubmitting(true);
    try {
      // ✅ رفع خطای product_id:
      // product.id از نوع (number | null) است، اما ReviewInsert به (number) نیاز دارد.
      // چون کامپوننت برای یک محصول نمایش داده شده، فرض می‌کنیم ID آن non-null است.
      const reviewData: ReviewInsert = {
        product_id: product.id!, // ⬅️ استفاده از '!' برای Non-null Assertion
        user_id: currentUserId, // 💡 اضافه کردن user_id
        rating: data.rating,
        title: data.title || null,
        comment: data.comment || null,
        is_published: true,
      };

      const { error } = await supabase.from("reviews").insert(reviewData);

      if (error) throw error;

      reset();
      setValue("rating", 0);
      onReviewSubmitted();
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = status === "loading";

  return (
    <div className="mt-16 border-t pt-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-eco-dark dark:text-eco-light mb-8">
        Customer Reviews ({reviews.length})
      </h2>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* فرم ارسال نظر */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-eco-darkest rounded-2xl shadow-lg p-6 border">
            <h3 className="font-bold text-lg mb-4 dark:text-eco-light">
              Write a Review
            </h3>

            {isLoading ? (
              <p className="text-center text-gray-500 py-8">Loading...</p>
            ) : user ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* ستاره‌ها */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-eco-light">
                    Your Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setValue("rating", star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= selectedRating
                              ? "fill-eco-accent text-eco-accent"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {errors.rating && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.rating.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-eco-light">
                    Review Title
                  </label>
                  <input
                    {...register("title")}
                    placeholder="e.g. Great product!"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green dark:bg-gray-800 dark:text-eco-light"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-eco-light">
                    Your Review
                  </label>
                  <textarea
                    {...register("comment")}
                    rows={4}
                    placeholder="Share your experience..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green dark:bg-gray-800 resize-none dark:text-eco-light"
                  />
                  {errors.comment && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.comment.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || selectedRating === 0}
                  className="w-full bg-eco-green text-white py-3 rounded-lg font-semibold hover:bg-eco-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                  <Send className="w-5 h-5" />
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Please log in to write a review
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 bg-eco-green text-white px-6 py-3 rounded-lg font-medium hover:bg-eco-dark transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  Login to Review
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* لیست نظرات */}
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-12 text-lg">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-eco-darkest p-6 rounded-xl shadow-md border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-eco-dark dark:text-eco-light">
                      {review.profiles?.name || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {review.created_at
                        ? format(new Date(review.created_at), "MMM d, yyyy")
                        : "—"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? "fill-eco-accent text-eco-accent"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.title && (
                  <p className="font-medium mb-2">{review.title}</p>
                )}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {review.comment || "No comment"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
