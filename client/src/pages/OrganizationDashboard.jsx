import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Clock,
  Star,
  Bell,
  User,
  X,
  Plus,
  Eye,
  MoreVertical,
  Menu,
  HelpCircle,
  Edit,
  Trash2,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Check,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "../style/OrganizationDashboard.css";

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [organizationName, setOrganizationName] = useState("Organization");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // View state: 'dashboard' | 'attendance' | 'markAttendance'
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  // Attendance data
  const [signups, setSignups] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [attendance, setAttendance] = useState({});
  const [loadingSignups, setLoadingSignups] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Check authentication and user type
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const userType = user?.userType;

    if (!token) {
      navigate("/login");
      return;
    }

    if (userType !== "organization") {
      navigate("/dashboard");
    }

    setOrganizationName("profile" in user ? user.profile.name : "Organization");

    // Fetch opportunities from backend
    const fetchOpportunities = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/opportunities/my/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setOpportunities(data.data.opportunities);
        } else {
          console.error("Failed to fetch opportunities:", data.message);
        }
      } catch (error) {
        console.error("Error fetching opportunities:", error);
      }
    };
    const fetchReviews = async () => {
  try {
    setLoadingReviews(true);
    const token = localStorage.getItem("token");
    
    // First get organization profile to get organization ID
    const profileRes = await fetch("http://localhost:5000/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileData = await profileRes.json();
    
    if (!profileData.success || !profileData.data.profile) {
      console.error("Failed to get organization profile");
      setLoadingReviews(false);
      return;
    }

    const organizationId = profileData.data.profile._id;

    // Fetch reviews for this organization
    const reviewsRes = await fetch(
      `http://localhost:5000/api/reviews/organization/${organizationId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const reviewsData = await reviewsRes.json();

    if (reviewsData.success) {
      // Get only the most recent 2 reviews for dashboard display
      setReviews(reviewsData.data.slice(0, 2) || []);
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
  } finally {
    setLoadingReviews(false);
  }
};


    fetchOpportunities();
    fetchReviews();
  }, [navigate]);
  const formatReviewDate = (dateString) => {
  const now = new Date();
  const reviewDate = new Date(dateString);
  const diffTime = Math.abs(now - reviewDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  
  if (diffDays === 0) {
    if (diffHours === 0) {
      return "Just now";
    }
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return reviewDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    durationHours: "",
    opportunityType: "on-site",
    cause: "Other",
    location: "",
    tasks: "",
    requirements: "",
    maxVolunteers: "",
  });

  const [opportunities, setOpportunities] = useState([]);

  const stats = [
    { label: "Event Organized", value: "13", icon: Calendar, color: "#3B82F6" },
    { label: "Total Volunteers", value: "4", icon: Users, color: "#10B981" },
    { label: "Total Hours", value: "456", icon: Clock, color: "#F59E0B" },
    { label: "Rating", value: "4.3", icon: Star, color: "#EF4444" },
  ];

  const recentActivity = [
    "User signed up for Neighborhood Cleanup Program",
    "12 volunteers signed up for Neighborhood Cleanup Program",
    "Updated: Food Pantry Distribution schedule changes",
    "System alert: System maintenance scheduled",
    "Reminder emails sent to 12 volunteers for Senior Check-in Calls",
    "Event cancelled: Neighborhood Cleanup (Moved to 26 March)",
    "Event Reached: 2000 lifetime volunteer hours by System",
  ];

  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.eventDate) {
      alert("Please fill in all required fields (marked with *)");
      return;
    }

    if (formData.opportunityType === "on-site" && !formData.location) {
      alert("Location is required for on-site opportunities");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const opportunityData = {
        title: formData.title,
        description: formData.description,
        eventDate: formData.eventDate,
        startTime: formData.startTime || "",
        endTime: formData.endTime || "",
        durationHours: formData.durationHours
          ? parseFloat(formData.durationHours)
          : 0,
        opportunityType: formData.opportunityType,
        cause: formData.cause,
        location: formData.location || "",
        tasks: formData.tasks || "",
        requirements: formData.requirements || "",
        maxVolunteers: formData.maxVolunteers
          ? parseInt(formData.maxVolunteers)
          : null,
      };

      // If editing, send PUT to update
      if (isEditing && editingId) {
        const res = await fetch(`http://localhost:5000/api/opportunities/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(opportunityData),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setOpportunities((prev) =>
            prev.map((op) => (op._id === editingId ? data.data : op))
          );
          alert("Opportunity updated successfully!");
          setShowModal(false);
          setIsEditing(false);
          setEditingId(null);
          setFormData({
            title: "",
            description: "",
            eventDate: "",
            startTime: "",
            endTime: "",
            durationHours: "",
            opportunityType: "on-site",
            cause: "Other",
            location: "",
            tasks: "",
            requirements: "",
            maxVolunteers: "",
          });
        } else {
          if (data.errors && Array.isArray(data.errors)) {
            const errorMessages = data.errors
              .map((err) => `• ${err.field}: ${err.message}`)
              .join("\n");
            alert(`Validation Failed:\n${errorMessages}`);
          } else {
            alert(data.message || "Failed to update opportunity");
          }
        }

        return;
      }

      // Create new opportunity
      const res = await fetch("http://localhost:5000/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(opportunityData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Opportunity created successfully!");
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          eventDate: "",
          startTime: "",
          endTime: "",
          durationHours: "",
          opportunityType: "on-site",
          cause: "Other",
          location: "",
          tasks: "",
          requirements: "",
          maxVolunteers: "",
        });
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors
            .map((err) => `• ${err.field}: ${err.message}`)
            .join("\n");
          alert(`Validation Failed:\n${errorMessages}`);
        } else {
          alert(data.message || "Failed to create opportunity");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  // DELETE functionality
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this opportunity?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/opportunities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOpportunities((prev) => prev.filter((op) => op._id !== id));
        alert("Opportunity deleted successfully!");
      } else {
        alert(data.message || "Failed to delete opportunity");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Server error while deleting opportunity.");
    }
  };

// Open edit modal and prefill form
const handleOpenEdit = (event) => {
  setIsEditing(true);
  setEditingId(event._id);
  setFormData({
    title: event.title || "",
    description: event.description || "",
    eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split("T")[0] : "",
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    durationHours: event.durationHours || "",
    opportunityType: event.opportunityType || "on-site",
    cause: event.cause || "Other",
    location: event.location || "",
    tasks: event.tasks || "",
    requirements: event.requirements || "",
    maxVolunteers: event.maxVolunteers || "",
  });
  setShowModal(true);
};

  // ATTENDANCE FUNCTIONS
  const handleViewAttendance = async (opportunity) => {
    setSelectedOpportunity(opportunity);
    setCurrentView("attendance");
    setActiveTab("pending");
    await fetchSignups(opportunity._id);
  };

  const fetchSignups = async (opportunityId) => {
    setLoadingSignups(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/opportunities/${opportunityId}/signups`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setSignups(data.data);
      }
    } catch (error) {
      console.error("Error fetching signups:", error);
    } finally {
      setLoadingSignups(false);
    }
  };

  const handleAccept = async (volunteerId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/opportunities/${selectedOpportunity._id}/signups/confirmOne`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ volunteerId }),
        }
      );

      if (res.ok) {
        await fetchSignups(selectedOpportunity._id);
        alert("Volunteer accepted successfully!");
      }
    } catch (error) {
      console.error("Error accepting volunteer:", error);
    }
  };

  const handleDecline = async (volunteerId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/opportunities/${selectedOpportunity._id}/signups/rejectOne`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ volunteerId }),
        }
      );

      if (res.ok) {
        await fetchSignups(selectedOpportunity._id);
        alert("Volunteer declined successfully!");
      }
    } catch (error) {
      console.error("Error declining volunteer:", error);
    }
  };

  const handleOpenMarkAttendance = () => {
    const confirmedSignups = signups.filter((s) => s.status === "confirmed");

    // Initialize attendance state
    const initialAttendance = {};
    confirmedSignups.forEach((signup) => {
      initialAttendance[signup._id] = false;
    });
    setAttendance(initialAttendance);

    setCurrentView("markAttendance");
  };

  const toggleAttendance = (signupId) => {
    setAttendance((prev) => ({
      ...prev,
      [signupId]: !prev[signupId],
    }));
  };

  const handleSubmitAttendance = async () => {
    const attendanceArray = Object.entries(attendance).map(
      ([signupId, attended]) => ({
        signupId,
        attended,
      })
    );

    if (attendanceArray.every((a) => !a.attended)) {
      alert("Please mark at least one volunteer as attended");
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to submit attendance? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/opportunities/${selectedOpportunity._id}/attendance`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ attendance: attendanceArray }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        alert(
          `Attendance marked successfully!\nAttended: ${data.data.confirmed}\nNo-shows: ${data.data.noShows}`
        );
        setCurrentView("attendance");
        await fetchSignups(selectedOpportunity._id);
      } else {
        console.error('Attendance API returned error:', data);
        alert(data.message || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("Server error. Please try again.");
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedOpportunity(null);
    setSignups([]);
    setAttendance({});
  };

  // Filter signups by tab
  const getFilteredSignups = () => {
    switch (activeTab) {
      case "pending":
        return signups.filter((s) => s.status === "pending");
      case "accepted":
        return signups.filter((s) => s.status === "confirmed");
      case "declined":
        return signups.filter((s) => s.status === "rejected");
      default:
        return signups.filter((s) => s.status === "pending");
    }
  };

  // Get stats for attendance view
  const getAttendanceStats = () => {
    const pendingCount = signups.filter((s) => s.status === "pending").length;
    const confirmedCount = signups.filter((s) => s.status === "confirmed").length;
    const spotsRemaining = selectedOpportunity?.maxVolunteers
      ? selectedOpportunity.maxVolunteers - confirmedCount
      : "∞";

    return { pendingCount, confirmedCount, spotsRemaining };
  };

  // Get stats for mark attendance view
  const getMarkAttendanceStats = () => {
    const confirmedSignups = signups.filter((s) => s.status === "confirmed");
    const attendedCount = Object.values(attendance).filter((a) => a).length;
    const noShowCount = confirmedSignups.length - attendedCount;

    return { total: confirmedSignups.length, attendedCount, noShowCount };
  };

  // RENDER DASHBOARD VIEW
  if (currentView === "dashboard") {
    return (
      <div className="dashboard-wrapper">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navLeft">
            <h1 className="navLogo">helpinghands</h1>
            <div className="navMenu">
              <Link to="/organization-dashboard" className="navLink">
                <span className="navIcon">▦</span> Dashboard
              </Link>

            </div>
          </div>
          <div className="navRight">
            <button className="notificationBtn">
              <Bell size={20} />
            </button>
            <div className="userProfile" onClick={() => navigate('/organization-profile')}>
              <User size={20} />
              <span className="user-name">{organizationName}</span>
            </div>
          </div>
        </nav>

        {/* Stats */}
        <div className="stats-container">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-icon" style={{ color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-subtext">View stats</div>
              </div>
              <HelpCircle size={16} className="stat-info-icon" />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="left-column">
            {/* Upcoming Events */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Upcoming Events</h2>
                <a href="#" className="view-all-link">
                  View All
                </a>
              </div>
              <div className="filter-tabs">
                <button className="filter-tab active">All events</button>
                <button className="filter-tab">This month</button>
                <button className="filter-tab">Status</button>
                <button className="filter-tab">Volunteers</button>
              </div>
              <div className="events-list">
                {opportunities.map((event) => (
                  <div key={event._id} className="event-item">
                    <div className="event-info">
                      <div className="event-title">{event.title}</div>
                      <div className="event-date">
                        {new Date(event.eventDate).toLocaleDateString()} {event.startTime}-{event.endTime}
                      </div>
                    </div>
                    <div className="event-actions">
                      <span className="event-badge">{event.isActive ? "Active" : "Inactive"}</span>
                      <span className="event-volunteers">{event.volunteers || "0"} / {event.maxVolunteers || "∞"}</span>
                      <span className="event-views">0</span>
                      <button
                        className="icon-action-btn"
                        title="View Attendance"
                        onClick={() => handleViewAttendance(event)}
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button
                        className="icon-action-btn"
                        title="Edit"
                        onClick={() => handleOpenEdit(event)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="icon-action-btn delete"
                        title="Delete"
                        onClick={() => handleDelete(event._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Reviews</h2>
                <Link to="/all-reviews" className="view-all-link">
                  View All Reviews
                </Link>
              </div>
              <div className="filter-tabs">
                <button className="filter-tab active">All reviews</button>
                <button className="filter-tab">This month</button>
                <button className="filter-tab">Orientation</button>
              </div>
              <div className="reviews-list">
                {loadingReviews ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                    Loading reviews...
                  </div>
                ) : reviews.length === 0? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                    No reviews yet
                   </div> 
                ) : (
                  reviews.map((review, idx) => (
                    <div key={review._id || idx} className="review-item">
                      <div className="review-header">
                        <span className="review-name">
                          {review.opportunityId?.title || "Event"}
                        </span>
                        <span className="review-rating">
                          ⭐ {review.rating || 0}
                        </span>
                        <span className="review-count">
                          • by {review.volunteerId?.displayName || "Volunteer"}
                        </span>
                    </div>
                    <p className="review-comment">
                      {review.comment.length > 150
                         ? review.comment.substring(0, 150) + "..."
                         : review.comment}
                    </p>
                    <span className="review-date">
                        {formatReviewDate(review.createdAt)}
                    </span>
                  </div>
                ))
              )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Recent Activity */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Recent activity</h2>
                <a href="#" className="view-all-link">
                  View All
                </a>
              </div>
              <div className="activity-list">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="activity-item">
                    {activity}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Quick actions</h2>
              </div>
              <button onClick={() => { setIsEditing(false); setEditingId(null); setFormData({ title: "", description: "", eventDate: "", startTime: "", endTime: "", durationHours: "", opportunityType: "on-site", cause: "Other", location: "", tasks: "", requirements: "", maxVolunteers: "" }); setShowModal(true); }} className="primary-btn">
                <Plus size={18} /> Create event
              </button>
              <button className="secondary-btn">Add volunteer</button>
            </div>
          </div>
        </div>

        {/* Create Event Modal */}
        {showModal && (
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
                setIsEditing(false);
                setEditingId(null);
              }
            }}
          >
            <div className="modal">
              <div className="modal-header">
                <h2 className="modal-title">{isEditing ? "Edit Opportunity" : "Create New Opportunity"}</h2>
                <button onClick={() => { setShowModal(false); setIsEditing(false); setEditingId(null); }} className="close-btn">
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {/* Basic Information Section */}
                <div className="form-section">
                  <h3 className="section-title">Basic Information</h3>

                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter opportunity title"
                      maxLength={200}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="Describe the opportunity and its impact..."
                      rows="4"
                      maxLength={2000}
                      required
                    />
                  </div>
                </div>

                {/* Event Details Section */}
                <div className="form-section">
                  <h3 className="section-title">Event Details</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Event Date *</label>
                      <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        className="form-input"
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Start Time</label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">End Time</label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (hours)</label>
                    <input
                      type="number"
                      name="durationHours"
                      value={formData.durationHours}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="e.g., 3"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>

                {/* Type & Category Section */}
                <div className="form-section">
                  <h3 className="section-title">Type & Category</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Opportunity Type *</label>
                      <select
                        name="opportunityType"
                        value={formData.opportunityType}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      >
                        <option value="on-site">On-site</option>
                        <option value="remote">Remote/Virtual</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Cause *</label>
                      <select
                        name="cause"
                        value={formData.cause}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      >
                        <option value="Animals">Animals</option>
                        <option value="Education">Education</option>
                        <option value="Environment">Environment</option>
                        <option value="Health">Health</option>
                        <option value="Community">Community</option>
                        <option value="Arts & Culture">Arts & Culture</option>
                        <option value="Social Services">Social Services</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {formData.opportunityType === "on-site" && (
                    <div className="form-group">
                      <label className="form-label">Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter full address"
                        required={formData.opportunityType === "on-site"}
                      />
                    </div>
                  )}
                </div>

                {/* Additional Details Section */}
                <div className="form-section">
                  <h3 className="section-title">Additional Details</h3>

                  <div className="form-group">
                    <label className="form-label">Tasks & Responsibilities</label>
                    <textarea
                      name="tasks"
                      value={formData.tasks}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="What will volunteers do? (e.g., Collect trash, sort recyclables...)"
                      rows="3"
                      maxLength={1000}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Requirements</label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="Skills needed, age restrictions, what to bring..."
                      rows="3"
                      maxLength={1000}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Max Volunteers</label>
                    <input
                      type="number"
                      name="maxVolunteers"
                      value={formData.maxVolunteers}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Leave empty for unlimited"
                      min="1"
                    />

                  </div>
                </div>

                <button onClick={handleSubmit} className="submit-btn">
                  {isEditing ? "Save Changes" : "Create Opportunity"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // RENDER ATTENDANCE VIEW
  if (currentView === "attendance") {
    const { pendingCount, confirmedCount, spotsRemaining } = getAttendanceStats();

    return (
      <div className="dashboard-wrapper">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navLeft">
            <h1 className="navLogo">helpinghands</h1>
            <div className="navMenu">
              <Link to="/organization-dashboard" className="navLink">
                <span className="navIcon">▦</span> Dashboard
              </Link>
              <Link to="/opportunities" className="navLink">
                <span className="navIcon">✦</span> Opportunities
              </Link>
              <Link to="#" className="navLink">
                <span className="navIcon">▥</span> My Events
              </Link>
            </div>
          </div>
          <div className="navRight">
            <button className="notificationBtn">
              <Bell size={20} />
            </button>
            <div className="userProfile" onClick={() => navigate('/profile')}>
              <User size={20} />
              <span className="user-name">{organizationName}</span>
            </div>
          </div>
        </nav>

        <div className="attendance-container">
          {/* Back Button */}
          <div className="attendance-header">
            <button className="back-button" onClick={handleBackToDashboard}>
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
          </div>

          {/* Event Details Card */}
          <div className="event-detail-card">
            <div className="event-detail-header">
              <div className="event-detail-left">
                <h1 className="event-detail-title">{selectedOpportunity?.title}</h1>
                <span
                  className={`event-status-badge ${
                    selectedOpportunity?.isActive ? "active" : "inactive"
                  }`}
                >
                  {selectedOpportunity?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <p className="event-detail-description">{selectedOpportunity?.description}</p>

            <div className="event-detail-info">
              <div className="event-info-item">
                <Calendar size={16} />
                <span>
                  {new Date(selectedOpportunity?.eventDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="event-info-item">
                <Clock size={16} />
                <span>
                  {selectedOpportunity?.startTime || "9:00 AM"} -{" "}
                  {selectedOpportunity?.endTime || "1:00 PM"}
                </span>
              </div>
              <div className="event-info-item">
                <MapPin size={16} />
                <span>{selectedOpportunity?.location || "Location not specified"}</span>
              </div>
              <div className="event-info-item">
                <Users size={16} />
                <span>
                  {confirmedCount}/{selectedOpportunity?.maxVolunteers || "∞"} volunteers
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="attendance-stats">
            <div className="attendance-stat-card pending">
              <div className="stat-label">Pending Applications</div>
              <div className="stat-value">{pendingCount}</div>
            </div>
            <div className="attendance-stat-card accepted">
              <div className="stat-label">Accepted Volunteers</div>
              <div className="stat-value">{confirmedCount}</div>
            </div>
            <div className="attendance-stat-card remaining">
              <div className="stat-label">Spots Remaining</div>
              <div className="stat-value">{spotsRemaining}</div>
            </div>
          </div>

          {/* Volunteer Applications */}
          <div className="content-card">
            <div className="applications-header">
              <h2 className="card-title">Volunteer Applications</h2>
              <button className="mark-attendance-btn" onClick={handleOpenMarkAttendance}>
                <Check size={18} />
                Mark Attendance
              </button>
            </div>

            {/* Tabs */}
            <div className="filter-tabs">
              <button
                className={`filter-tab ${activeTab === "pending" ? "active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending ({pendingCount})
              </button>
              <button
                className={`filter-tab ${activeTab === "accepted" ? "active" : ""}`}
                onClick={() => setActiveTab("accepted")}
              >
                Accepted ({confirmedCount})
              </button>
              <button
                className={`filter-tab ${activeTab === "declined" ? "active" : ""}`}
                onClick={() => setActiveTab("declined")}
              >
                Declined ({signups.filter((s) => s.status === "rejected").length})
              </button>
            </div>

            {/* Applications List */}
            <div className="applications-list">
              {loadingSignups ? (
                <div className="no-applications">Loading...</div>
              ) : getFilteredSignups().length === 0 ? (
                <div className="no-applications">No {activeTab} applications yet</div>
              ) : (
                getFilteredSignups().map((signup) => (
                  <div key={signup._id} className="application-item">
                    <div className="application-avatar">
                      {signup.volunteerId?.displayName?.charAt(0) || "V"}
                    </div>
                    <div className="application-info">
                      <div className="application-name">
                        {signup.volunteerId?.displayName || "Unknown Volunteer"}
                      </div>
                      <div className="application-email">
                        {signup.volunteerId?.userId?.email || "No email"}
                      </div>
                      <div className="application-meta">
                        Applied:{" "}
                        {new Date(signup.signedUpAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="application-stats">
                      <div className="application-stat">
                        <span className="stat-label-small">Level</span>
                        <span className="stat-value-small">
                          {signup.volunteerId?.level || "1"}
                        </span>
                      </div>
                      <div className="application-stat">
                        <span className="stat-label-small">Total Hours</span>
                        <span className="stat-value-small">
                          {signup.volunteerId?.totalHours || "0"}h
                        </span>
                      </div>
                    </div>
                    {activeTab === "pending" && (
                      <div className="application-actions">
                        <button
                          className="decline-btn"
                          onClick={() =>
                            handleDecline(signup.volunteerId?._id || signup.volunteerId)
                          }
                        >
                          <X size={16} />
                          Decline
                        </button>
                        <button
                          className="accept-btn"
                          onClick={() =>
                            handleAccept(signup.volunteerId?._id || signup.volunteerId)
                          }
                        >
                          <Check size={16} />
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER MARK ATTENDANCE VIEW
  if (currentView === "markAttendance") {
    const { total, attendedCount, noShowCount } = getMarkAttendanceStats();
    const confirmedSignups = signups.filter((s) => s.status === "confirmed");

    return (
      <div className="dashboard-wrapper">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navLeft">
            <h1 className="navLogo">helpinghands</h1>
            <div className="navMenu">
              <Link to="/organization-dashboard" className="navLink">
                <span className="navIcon">▦</span> Dashboard
              </Link>
              <Link to="/opportunities" className="navLink">
                <span className="navIcon">✦</span> Opportunities
              </Link>
              <Link to="#" className="navLink">
                <span className="navIcon">▥</span> My Events
              </Link>
            </div>
          </div>
          <div className="navRight">
            <button className="notificationBtn">
              <Bell size={20} />
            </button>
            <div className="userProfile" onClick={() => navigate('/profile')}>
              <User size={20} />
              <span className="user-name">{organizationName}</span>
            </div>
          </div>
        </nav>

        <div className="attendance-container">
          {/* Back Button */}
          <div className="attendance-header">
            <button
              className="back-button"
              onClick={() => setCurrentView("attendance")}
            >
              <ArrowLeft size={20} />
              <span>Back to Applications</span>
            </button>
          </div>

          {/* Event Title */}
          <div className="mark-attendance-header">
            <h1 className="page-title">Mark Attendance</h1>
            <h2 className="event-subtitle">{selectedOpportunity?.title}</h2>
          </div>

          {/* Summary Stats */}
          <div className="attendance-summary">
            <div className="summary-stat">
              <span className="summary-label">Total </span>
              <span className="summary-value">{total}</span>
            </div>
            <div className="summary-stat">
              <span className="summary-label">Present</span>
              <span className="summary-value Present">{attendedCount}</span>
            </div>
            <div className="summary-stat">
              <span className="summary-label">Absent</span>
              <span className="summary-value Absent">{noShowCount}</span>
            </div>
          </div>

          {/* Attendance List */}
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">Confirmed Volunteers</h2>
              <button
                className="submit-attendance-btn"
                onClick={handleSubmitAttendance}
              >
                Submit Attendance
              </button>
            </div>

            <div className="attendance-checklist">
              {confirmedSignups.length === 0 ? (
                <div className="no-applications">
                  No confirmed volunteers to mark attendance
                </div>
              ) : (
                confirmedSignups.map((signup) => (
                  <div
                    key={signup._id}
                    className={`attendance-check-item ${
                      attendance[signup._id] ? "checked" : ""
                    }`}
                    onClick={() => toggleAttendance(signup._id)}
                  >
                    <div className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={attendance[signup._id] || false}
                        onChange={() => toggleAttendance(signup._id)}
                        className="attendance-checkbox"
                      />
                    </div>
                    <div className="application-avatar">
                      {signup.volunteerId?.displayName?.charAt(0) || "V"}
                    </div>
                    <div className="attendance-check-info">
                      <div className="volunteer-name-large">
                        {signup.volunteerId?.displayName || "Unknown Volunteer"}
                      </div>
                      <div className="volunteer-email">
                        {signup.volunteerId?.userId?.email || "No email"}
                      </div>
                    </div>
                    <div className="attendance-check-stats">
                      <span className="stat-badge">
                        Level {signup.volunteerId?.level || 1}
                      </span>
                      <span className="stat-badge">
                        {signup.volunteerId?.totalHours || 0}h total
                      </span>
                    </div>
                    <div className="attendance-status">
                      {attendance[signup._id] ? (
                        <span className="status-badge present">
                          <Check size={14} />
                          Present
                        </span>
                      ) : (
                        <span className="status-badge absent">
                          <X size={14} />
                          Absent
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OrganizationDashboard;
