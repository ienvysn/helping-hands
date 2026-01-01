import React, { useEffect, useState } from "react";
import { User, Bell, Star, Lock, Calendar, Clock, MapPin } from "lucide-react";
import "../style/VolunteerDashboard.css";
import { useNavigate, Link } from 'react-router-dom';

const ProfileDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const userType = user?.userType;

    if (!token) {
      navigate('/login');
      return;
    }

    // If logged in as organization, redirect to organization dashboard
    if (userType === 'organization') {
      navigate('/organization-dashboard');
      return;
    }

    fetchDashboardData();
    fetchUpcomingEvents();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/events/upcoming", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setEvents(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setEventsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    return { day, month };
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!profile) return <div className="error">Failed to load dashboard</div>;

  const displayName = profile.profile?.displayName || "Volunteer";
  const email = profile.user?.email || "";

  const level = profile.profile?.level || 1;
  const totalHours = profile.profile?.totalHours || 0;
  const completed = profile.profile?.completed || 0;

  const getNextLevelHours = (currentLevel) => {
    if (currentLevel === 1) return 10;
    if (currentLevel === 2) return 25;
    if (currentLevel === 3) return 50;
    if (currentLevel === 4) return 100;
    if (currentLevel === 5) return 200;
    return 200;
  };

  const getProgressPercentage = (currentLevel, hours) => {
    if (currentLevel === 1) return Math.min((hours / 10) * 100, 100);
    if (currentLevel === 2) return Math.min(((hours - 10) / 15) * 100, 100);
    if (currentLevel === 3) return Math.min(((hours - 25) / 25) * 100, 100);
    if (currentLevel === 4) return Math.min(((hours - 50) / 50) * 100, 100);
    if (currentLevel === 5) return Math.min(((hours - 100) / 100) * 100, 100);
    return 100;
  };

  const getRemainingHours = (currentLevel, hours) => {
    if (currentLevel === 1) return Math.max(10 - hours, 0);
    if (currentLevel === 2) return Math.max(25 - hours, 0);
    if (currentLevel === 3) return Math.max(50 - hours, 0);
    if (currentLevel === 4) return Math.max(100 - hours, 0);
    if (currentLevel === 5) return Math.max(200 - hours, 0);
    return 0;
  };

  const nextLevelHours = getNextLevelHours(level);
  const progressPercentage = getProgressPercentage(level, totalHours);
  const remainingHours = getRemainingHours(level, totalHours);

  return (
    <div className="dashboardWrapper">
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
            <Link to="/my-events" className="navLink">
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
            <span>{displayName}</span>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboardContent">
        {/* Profile Summary Card */}
        <div className="summaryCard">
          <div className="summaryLeft">
            <div className="avatarCircle large">
              <User size={48} color="#666" />
              <div className="levelBadge">{level}</div>
            </div>

            <div>
              <h3 className="userName">{displayName}</h3>
              <p className="userEmail">{email}</p>
            </div>
          </div>

          <div className="summaryStats">
            <div className="statBox levelStat">
              <p>Level</p>
              <h4>{level}</h4>
            </div>
            <div className="statBox hoursStat">
              <p>Total Hours</p>
              <h4>{totalHours}</h4>
            </div>
            <div className="statBox completedStat">
              <p>Completed</p>
              <h4>{completed}</h4>
            </div>
          </div>

          {/* Progress Section */}
          <div className="progressSection">
            <div className="progressHeader">
              <span>Progress to Level {level + 1}</span>
              <span>{totalHours} / {nextLevelHours} hours</span>
            </div>
            <div className="progressBar">
              <div
                className="progressFill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="progressSubtext">
              {remainingHours > 0
                ? `${remainingHours} more hours to reach Level ${level + 1}!`
                : `You've reached Level ${level}! Keep going!`
              }
            </p>
          </div>
        </div>

        {/* Achievement Journey */}
        <div className="achievementCard">
          <h3 className="sectionTitle">Achievement Journey</h3>
          <p className="sectionSubtitle">
            Keep volunteering to unlock higher levels and earn recognition in the community!
          </p>

          <div className="achievementLevels">
            <div className={`achievementItem ${level >= 1 ? 'active' : 'locked'}`}>
              <Star />
              <p>Level 1</p>
              <small>0–9h</small>
            </div>

            <div className={`achievementItem ${level >= 2 ? 'active' : 'locked'}`}>
              <Star />
              <p>Level 2</p>
              <small>10–24h</small>
            </div>

            <div className={`achievementItem ${level >= 3 ? 'active' : 'locked'} ${level === 3 ? 'highlight' : ''}`}>
              <Star />
              <p>Level 3</p>
              <small>25–49h</small>
            </div>

            <div className={`achievementItem ${level >= 4 ? 'active' : 'locked'}`}>
              <Star />
              <p>Level 4</p>
              <small>50–99h</small>
            </div>

            <div className={`achievementItem ${level >= 5 ? 'active' : 'locked'}`}>
              <Star />
              <p>Level 5</p>
              <small>100–199h</small>
            </div>

            <div className={`achievementItem ${level >= 6 ? 'active' : 'locked'}`}>
              {level >= 6 ? <Star /> : <Lock />}
              <p>Level 6</p>
              <small>200h+</small>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="profileCard">
          <h3 className="sectionTitle">Upcoming Events</h3>

          {eventsLoading ? (
            <div className="eventsLoading">Loading events...</div>
          ) : events.length > 0 ? (
            <div className="eventsList">
              {events.map((event) => {
                const { day, month } = formatDate(event.date || event.startDate);
                return (
                  <div key={event._id || event.id} className="eventCard">
                    <div className="eventDate">
                      <div className="eventDay">{day}</div>
                      <div className="eventMonth">{month}</div>
                    </div>
                    <div className="eventDetails">
                      <h4 className="eventTitle">{event.title || event.name}</h4>
                      <p className="eventInfo">
                        <MapPin size={14} />
                        <span>{event.location || "Location TBA"}</span>
                      </p>
                      <p className="eventTime">
                        <Clock size={14} />
                        <span>{formatTime(event.date || event.startDate)}</span>
                        {event.endDate && ` - ${formatTime(event.endDate)}`}
                      </p>
                    </div>
                    <button
                      className="eventViewBtn"
                      onClick={() => navigate(`/event/${event._id || event.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="emptyState">
              <div className="emptyIcon">📅</div>
              <p className="emptyText">No upcoming events</p>
              <p className="emptySubtext">
                Check the Opportunities page to join new volunteer events and make a difference!
              </p>
              <button
                className="browseBtn"
                onClick={() => navigate('/opportunities')}
              >
                Browse Opportunities
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;