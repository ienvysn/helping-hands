import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Star, Bell, User, X, Plus, Eye, MoreVertical, Menu, HelpCircle, Edit, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import "../style/OrganizationDashboard.css";

const OrganizationDashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [organizationName, setOrganizationName] = useState('Organization');

  // Check authentication and user type
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token) {
      navigate('/login');
      return;
    }

    if (userType !== 'organization') {
      navigate('/dashboard');
    }

    // You can fetch organization details here
    // For now, using a placeholder
    setOrganizationName('Brad Pitt');
  }, [navigate]);

  const [formData, setFormData] = useState({
    eventTitle: '',
    date: '',
    time: '',
    location: '',
    volunteersNeeded: '',
    status: 'Upcoming',
    description: ''
  });

  const stats = [
    { label: 'Event Organized', value: '13', subtext: 'All time', icon: Calendar, color: '#3B82F6' },
    { label: 'Total Volunteers', value: '4', subtext: 'All time volunteers', icon: Users, color: '#10B981' },
    { label: 'Total Hours', value: '456', subtext: 'Hours till date', icon: Clock, color: '#F59E0B' },
    { label: 'Rating', value: '4.3', subtext: 'All time', icon: Star, color: '#EF4444' }
  ];

  const upcomingEvents = [
    { title: 'Food Distribution', date: 'Mon 22, 10:30-12:00', volunteers: '5/8', status: 'Upcoming', views: 134 },
    { title: 'Neighbourhood Cleanup', date: 'Mon 25, 09:00-13:00', volunteers: '4/6', status: 'Upcoming', views: 89 },
    { title: 'Senior Check-in Calls', date: 'Mon 26, 14:00-17:00', volunteers: '3/5', status: 'Upcoming', views: 67 },
    { title: 'Volunteer Orientation', date: 'Mon 31, 11:00-13:00', volunteers: '2/10', status: 'Upcoming', views: 156 }
  ];

  const recentActivity = [
    'User signed up for Neighborhood Cleanup Program',
    '12 volunteers signed up for Neighborhood Cleanup Program',
    'Updated: Food Pantry Distribution schedule changes',
    'System alert: System maintenance scheduled',
    'Reminder emails sent to 12 volunteers for Senior Check-in Calls',
    'Event cancelled: Neighborhood Cleanup (Moved to 26 March)',
    'Event Reached: 2000 lifetime volunteer hours by System'
  ];

  const reviews = [
    { 
      name: 'Food Pantry Distribution', 
      rating: '4.7', 
      count: '12 responses', 
      comment: 'Volunteering here has been on my bucket list for a while now and I must say, it has been an absolute delight. The team is welcoming, the cause is inspiring, and the impact is real. Highly recommended for anyone looking to make a difference!', 
      date: '2 days ago' 
    },
    { 
      name: 'Food Pantry Distribution', 
      rating: '4.7', 
      count: '12 responses', 
      comment: 'Volunteering here has been on my bucket list for a while now and I must say, it has been an absolute...', 
      date: '7 hours ago' 
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    console.log('Event Created:', formData);
    setShowModal(false);
    setFormData({
      eventTitle: '',
      date: '',
      time: '',
      location: '',
      volunteersNeeded: '',
      status: 'Upcoming',
      description: ''
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/login');
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
              <a href="#" className="view-all-link">View All</a>
            </div>
            <div className="filter-tabs">
              <button className="filter-tab active">All events</button>
              <button className="filter-tab">This month</button>
              <button className="filter-tab">Status</button>
              <button className="filter-tab">Volunteers</button>
            </div>
            <div className="events-list">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="event-item">
                  <div className="event-info">
                    <div className="event-title">{event.title}</div>
                    <div className="event-date">{event.date}</div>
                  </div>
                  <div className="event-actions">
                    <span className="event-badge">{event.status}</span>
                    <span className="event-volunteers">{event.volunteers}</span>
                    <span className="event-views">
                      {event.views}
                    </span>
                    <button className="icon-action-btn" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="icon-action-btn delete" title="Delete">
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
              <a href="#" className="view-all-link">View All Reviews</a>
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
                    <span className="review-rating">
                      ⭐ {review.rating}
                    </span>
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
              <a href="#" className="view-all-link">View All</a>
            </div>
            <div className="activity-list">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="activity-item">{activity}</div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="content-card">
            <h2 className="card-title">Quick actions</h2>
            <button onClick={() => setShowModal(true)} className="primary-btn">
              <Plus size={18} /> Create event
            </button>
            <button className="secondary-btn">
              Add volunteer
            </button>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowModal(false);
        }}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create New Event</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input
                  type="text"
                  name="eventTitle"
                  value={formData.eventTitle}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter event title"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Dec 23, 2025"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 10:00"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter location"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Volunteers Needed</label>
                <input
                  type="number"
                  name="volunteersNeeded"
                  value={formData.volunteersNeeded}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter five volunteers needed"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Enter event description..."
                  rows="4"
                />
              </div>
              <button onClick={handleSubmit} className="submit-btn">
                Create event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDashboard;