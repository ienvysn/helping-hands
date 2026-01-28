import React, { useState } from "react";
import { X, Star } from "lucide-react";
import "../style/ReviewModal.css";

const ReviewModal = ({ isOpen, onClose, opportunity, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (comment.trim().length < 10) {
      setError("Comment must be at least 10 characters long");
      return;
    }

    if (comment.trim().length > 500) {
      setError("Comment must not exceed 500 characters");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          opportunityId: opportunity._id,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Review submitted successfully! Thank you for your feedback.");
        onSubmitSuccess();
        handleClose();
      } else {
        setError(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Submit review error:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
    setError("");
    onClose();
  };

  return (
    <div className="review-modal-overlay" onClick={handleClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        
        <div className="review-modal-header">
          <h2 className="review-modal-title">Leave a Review</h2>
          <button className="review-close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        
        <div className="review-modal-body">
          
          <div className="review-event-info">
            <h3>{opportunity.title}</h3>
            <p>
              {opportunity.organizationId?.organizationName || "Organization"}
            </p>
          </div>

         
          <form onSubmit={handleSubmit}>
            
            <div className="review-form-group">
              <label className="review-label">
                Rating <span className="required">*</span>
              </label>
              <div className="review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${
                      star <= (hoveredRating || rating) ? "active" : ""
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      size={32}
                      fill={
                        star <= (hoveredRating || rating)
                          ? "#fbbf24"
                          : "transparent"
                      }
                      color={
                        star <= (hoveredRating || rating) ? "#fbbf24" : "#d1d5db"
                      }
                    />
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {rating === 0 && "Select a rating"}
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>

        
            <div className="review-form-group">
              <label className="review-label">
                Your Review <span className="required">*</span>
              </label>
              <textarea
                className="review-textarea"
                placeholder="Share your experience with this volunteering opportunity..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={6}
                maxLength={500}
              />
              <p className="review-char-count">
                {comment.length}/500 characters
              </p>
            </div>

            
            {error && <div className="review-error-message">{error}</div>}

            <button
              type="submit"
              className="review-submit-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;