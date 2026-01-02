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
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "../style/OrganizationDashboard.css";

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [organizationName, setOrganizationName] = useState("Organization");

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

    setOrganizationName("Brad Pitt");

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

    fetchOpportunities();
  }, [navigate]);

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

  const reviews = [
    {
      name: "Food Pantry Distribution",
      rating: "4.7",
      count: "12 responses",
      comment:
        "Volunteering here has been on my bucket list for a while now and I must say, it has been an absolute delight. The team is welcoming, the cause is inspiring, and the impact is real. Highly recommended for anyone looking to make a difference!",
      date: "2 days ago",
    },
    {
      name: "Food Pantry Distribution",
      rating: "4.7",
      count: "12 responses",
      comment:
        "Volunteering here has been on my bucket list for a while now and I must say, it has been an absolute...",
      date: "7 hours ago",
    },
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

  return (
    <div className="dashboard-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="logo">helpinghands</h1>
          <div className="nav-links">
            <Link to="/organization-dashboard" className="nav-link">
              <span className="nav-icon">▦</span> Dashboard
            </Link>
            <Link to="/opportunities" className="nav-link">
              <span className="nav-icon">✦</span> Opportunities
            </Link>
            <Link to="/my-events" className="nav-link">
              <span className="nav-icon">▥</span> My Events
            </Link>
          </div>
        </div>
        <div className="nav-right">
          <button className="icon-btn">
            <Bell size={20} />
          </button>
          <div className="user-profile" onClick={handleLogout}>
            <User size={20} />
            <span className="user-name">{organizationName}</span>
          </div>
        </div>
      </nav>

      {/* Stats Cards */}
      <div className="stats-container">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-subtext">{stat.subtext}</div>
            </div>
            <HelpCircle size={14} className="stat-info-icon" color="#9CA3AF" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Column */}
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
                    <button className="icon-action-btn" title="Edit">
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
              <a href="#" className="view-all-link">
                View All Reviews
              </a>
            </div>
            <div className="filter-tabs">
              <button className="filter-tab active">All reviews</button>
              <button className="filter-tab">This month</button>
              <button className="filter-tab">Orientation</button>
            </div>
            <div className="reviews-list">
              {reviews.map((review, idx) => (
                <div key={idx} className="review-item">
                  <div className="review-header">
                    <span className="review-name">{review.name}</span>
                    <span className="review-rating">⭐ {review.rating}</span>
                    <span className="review-count">• {review.count}</span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <span className="review-date">{review.date}</span>
                </div>
              ))}
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
            <h2 className="card-title">Quick actions</h2>
            <button onClick={() => setShowModal(true)} className="primary-btn">
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
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create New Opportunity</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
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
                  <small className="form-hint">
                    Leave blank for unlimited capacity
                  </small>
                </div>
              </div>

              <button onClick={handleSubmit} className="submit-btn">
                Create Opportunity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDashboard;
