import React, { useState, useEffect } from "react";
import { addProductReview, getProductReviews } from "../../api/api";

const ProductReviews = ({ productId, reviews }) => {
  // const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  // ✅ جلب التعليقات عند التحميل
  // useEffect(() => {
  //   fetchReviews();
  // }, [productId]);

  // const fetchReviews = async () => {
  //   try {
  //     const res = await getProductReviews(productId);
  //     console.log("✅ Reviews Data:", res);

  //     // ✅ معالجة البيانات حسب هيكل API
  //     const reviewsData = res.data || res || [];
  //     setReviews(Array.isArray(reviewsData) ? reviewsData : []);
  //   } catch (err) {
  //     console.error("❌ Error fetching reviews:", err);
  //     setReviews([]); // ✅ تجنب الأخطاء بتعيين مصفوفة فارغة
  //   }
  // };

  // ✅ إضافة تقييم جديد
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("Please write a review.");
      return;
    }

    try {
      setLoading(true);
      const res = await addProductReview(productId, comment, rating);
      console.log("✅ Review added successfully:", res);

      // ✅ تنظيف الحقول بعد النجاح
      setComment("");
      setRating(5);

      // ✅ إعادة تحميل التقييمات
      // await fetchReviews();
    } catch (err) {
      console.error("❌ Error adding review:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-56">
      <h6 className="mb-24">Customer Reviews</h6>

      {/* ✅ عرض التقييمات */}
      {reviews && reviews.length > 0 ? (
        reviews.map((rev, index) => (
          <div
            key={rev.id || index}
            className="d-flex align-items-start gap-24 pb-44 border-bottom border-gray-100 mb-44"
          >
            {/* ✅ صورة المستخدم */}
            <img
              src={
                rev.user?.image ||
                rev.user?.avatar ||
                "/assets/images/thumbs/comment-img1.png"
              }
              alt={rev.user?.name || "User"}
              className="w-52 h-52 object-fit-cover rounded-circle flex-shrink-0"
              onError={(e) => {
                e.target.src = "/assets/images/thumbs/comment-img1.png";
              }}
            />
            <div className="flex-grow-1">
              <div className="flex-between align-items-start gap-8">
                <div>
                  {/* ✅ اسم المستخدم والتقييم */}
                  <h6 className="mb-12 text-md fw-semibold">
                    {rev.user || "Anonymous User"}
                  </h6>
                  <div className="flex-align gap-8">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-15 fw-medium ${
                          i < (rev.rating || 0)
                            ? "text-warning-600"
                            : "text-gray-400"
                        } d-flex`}
                      >
                        <i className="ph-fill ph-star" />
                      </span>
                    ))}
                    <span className="text-xs text-gray-600 ms-8">
                      ({rev.rating || 0}/5)
                    </span>
                  </div>
                </div>
                {/* ✅ تاريخ التقييم */}
                <span className="text-gray-600 text-xs">
                  {rev.created_at
                    ? new Date(rev.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Recently"}
                </span>
              </div>
              {/* ✅ نص التقييم */}
              <p className="text-gray-700 mt-16 mb-0">{rev.comment}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="alert alert-info">
          <p className="mb-0 text-gray-600">
            📝 No reviews yet. Be the first to review this product!
          </p>
        </div>
      )}

      {/* ✅ نموذج إضافة تقييم */}
      <div className="mt-56">
        <h6 className="mb-24">Write a Review</h6>
        <form onSubmit={handleSubmit}>
          <div className="mb-32">
            <label className="text-neutral-600 mb-8">Your Rating</label>
            <div className="flex-align gap-8">
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  onClick={() => setRating(num)}
                  className={`cursor-pointer text-20 ${
                    rating >= num ? "text-warning-600" : "text-gray-400"
                  }`}
                >
                  <i className="ph-fill ph-star" />
                </span>
              ))}
            </div>
          </div>

          <div className="mb-32">
            <label htmlFor="desc" className="text-neutral-600 mb-8">
              Review Content
            </label>
            <textarea
              className="common-input rounded-8"
              id="desc"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-main rounded-pill mt-48"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductReviews;
