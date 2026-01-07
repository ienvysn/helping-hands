import React, { useState, useEffect } from "react";
import { User, Bell, Calendar, MapPin, Clock, Star } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import ReviewModal from "../components/ReviewModal";
import "../style/MyEvents.css";

const MyEvents = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("Volunteer");
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' or 'past'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUserProfile();
    fetchMyEvents();
    fetchMyReviews();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDisplayName(data.data.profile?.displayName || "Volunteer");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // You'll need to create this endpoint in your backend
      const res = await fetch("http://localhost:5000/api/signups/my-signups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/reviews/my-reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString;
  };

  const hasReviewed = (opportunityId) => {
    return reviews.some(
      (review) => review.opportunityId._id === opportunityId
    );
  };

  const handleLeaveReview = (event) => {
    setSelectedEvent(event.opportunityId);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    fetchMyReviews(); // Refresh reviews
    fetchMyEvents(); // Refresh events
  };

  const now = new Date();
  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.opportunityId?.eventDate);
    return eventDate >= now && event.status !== "cancelled";
  });

  const pastEvents = events.filter((event) => {
    const eventDate = new Date(event.opportunityId?.eventDate);
    return eventDate < now || event.status === "attended";
  });

  return (
    <div className="myevents-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navLeft">
          <h1 className="navLogo">helpinghands</h1>
          <div className="navMenu">
            <Link to="/dashboard" className="navLink">
              <span className="navIcon">▦</span> Dashboard
            </Link>
            <Link to="/opportunities" className="navLink">
              <span className="navIcon">✦</span> Opportunities
            </Link>
            <Link to="/my-events" className="navLink active">
              <span className="navIcon">▥</span> My Events
            </Link>
          </div>
        </div>

        <div className="navRight">
          <button className="notificationBtn">
            <Bell size={20} />
          </button>
          <div className="userProfile" onClick={() => navigate("/profile")}>
            <User size={20} />
            <span>{displayName}</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="myevents-content">
        <div className="myevents-header">
          <h1 className="myevents-title">My Events</h1>
          <p className="myevents-subtitle">
            View and manage your volunteering events
          </p>
        </div>

        {/* Tabs */}
        <div className="myevents-tabs">
          <button
            className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Events
            <span className="tab-count">{upcomingEvents.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past Events
            <span className="tab-count">{pastEvents.length}</span>
          </button>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="loading-state">Loading your events...</div>
        ) : (
          <div className="events-list">
            {activeTab === "upcoming" && (
              <>
                {upcomingEvents.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3>No upcoming events</h3>
                    <p>Sign up for opportunities to see them here!</p>
                    <button
                      className="browse-btn"
                      onClick={() => navigate("/opportunities")}
                    >
                      Browse Opportunities
                    </button>
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div key={event._id} className="event-card">
                      <div className="event-card-left">
                        <div className="event-date-badge">
                          <div className="date-day">
                            {new Date(
                              event.opportunityId?.eventDate
                            ).getDate()}
                          </div>
                          <div className="date-month">
                            {new Date(event.opportunityId?.eventDate)
                              .toLocaleString("default", { month: "short" })
                              .toUpperCase()}
                          </div>
                        </div>
                        <div className="event-details">
                          <h3 className="event-title">
                            {event.opportunityId?.title || "Event"}
                          </h3>
                          <p className="event-organization">
                            {event.opportunityId?.organizationId
                              ?.organizationName || "Organization"}
                          </p>
                          <div className="event-meta">
                            <span className="meta-item">
                              <Clock size={14} />
                              {formatTime(event.opportunityId?.startTime) ||
                                "Time TBA"}
                            </span>
                            <span className="meta-item">
                              <MapPin size={14} />
                              {event.opportunityId?.location || "Location TBA"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="event-card-right">
                        <span className={`status-badge ${event.status}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === "past" && (
              <>
                {pastEvents.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🕒</div>
                    <h3>No past events</h3>
                    <p>Your completed events will appear here</p>
                  </div>
                ) : (
                  pastEvents.map((event) => (
                    <div key={event._id} className="event-card past">
                      <div className="event-card-left">
                        <div className="event-date-badge completed">
                          <div className="date-day">
                            {new Date(
                              event.opportunityId?.eventDate
                            ).getDate()}
                          </div>
                          <div className="date-month">
                            {new Date(event.opportunityId?.eventDate)
                              .toLocaleString("default", { month: "short" })
                              .toUpperCase()}
                          </div>
                        </div>
                        <div className="event-details">
                          <h3 className="event-title">
                            {event.opportunityId?.title || "Event"}
                          </h3>
                          <p className="event-organization">
                            {event.opportunityId?.organizationId
                              ?.organizationName || "Organization"}
                          </p>
                          <div className="event-meta">
                            <span className="meta-item">
                              <Calendar size={14} />
                              {formatDate(event.opportunityId?.eventDate)}
                            </span>
                            {event.hoursAwarded > 0 && (
                              <span className="meta-item hours">
                                +{event.hoursAwarded} hours earned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="event-card-right">
                        {event.status === "attended" && 
                         new Date(event.opportunityId?.eventDate) < now && (
                          <>
                            {hasReviewed(event.opportunityId?._id) ? (
                              <button className="review-btn reviewed">
                                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                                Reviewed
                              </button>
                            ) : (
                              <button
                                className="review-btn"
                                onClick={() => handleLeaveReview(event)}
                              >
                                <Star size={16} />
                                Leave Review
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedEvent && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          opportunity={selectedEvent}
          onSubmitSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default MyEvents;