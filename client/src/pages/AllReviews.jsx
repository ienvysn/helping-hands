import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, User, Star } from "lucide-react";
import "../style/AllReviews.css";

const AllReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [organizationName, setOrganizationName] = useState("Organization");

  useEffect(() => {
    fetchReviews();
    fetchOrganizationProfile();
  }, []);

  const fetchOrganizationProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data.profile) {
        setOrganizationName(data.data.profile.organizationName || "Organization");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      
      const profileRes = await fetch("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      
      if (!profileData.success || !profileData.data.profile) {
        console.error("Failed to get organization profile");
        setLoading(false);
        return;
      }

      const organizationId = profileData.data.profile._id;

      
      const reviewsRes = await fetch(
        `http://localhost:5000/api/reviews/organization/${organizationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const reviewsData = await reviewsRes.json();

      if (reviewsData.success) {
        setReviews(reviewsData.data || []);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="review-stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            fill={star <= rating ? "#fbbf24" : "none"}
            color={star <= rating ? "#fbbf24" : "#d1d5db"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="all-reviews-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navLeft">
          <h1 className="navLogo">helpinghands</h1>
          <div className="navMenu">
            <span className="navLink" onClick={() => navigate("/organization-dashboard")}>
              <span className="navIcon">▦</span> Dashboard
            </span>
            <span className="navLink">
              <span className="navIcon">✦</span> Opportunities
            </span>
            <span className="navLink">
              <span className="navIcon">▥</span> My Events
            </span>
          </div>
        </div>

        <div className="navRight">
          <button className="notificationBtn">
            <Bell size={20} />
          </button>
          <div className="userProfile" onClick={() => navigate("/profile")}>
            <User size={20} />
            <span className="user-name">{organizationName}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="all-reviews-container">
        {/* Back Button */}
        <button className="back-button" onClick={() => navigate("/organization-dashboard")}>
          <ArrowLeft size={20} />
        </button>

        {/* Page Title */}
        <h1 className="all-reviews-title">Reviews</h1>

        {/* Reviews List */}
        {loading ? (
          <div className="reviews-loading">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet</p>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review._id} className="review-card">
                <div className="review-card-header">
                  <h3 className="review-organization-name">
                    {review.opportunityId?.organizationId?.organizationName || 
                     organizationName}
                  </h3>
                  <p className="review-event-title">
                    {review.opportunityId?.title || "Event"}
                  </p>
                </div>

                <div className="review-rating-section">
                  {renderStars(review.rating)}
                </div>

                <p className="review-comment-text">{review.comment}</p>

                <p className="review-date-text">
                  Reviewed on {formatDate(review.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReviews;