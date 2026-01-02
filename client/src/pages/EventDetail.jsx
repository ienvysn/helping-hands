import React, { useEffect, useState } from "react";
import { User, Bell, ArrowLeft, Calendar, MapPin, Clock, Users } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../style/EventDetail.css";

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [displayName, setDisplayName] = useState("Volunteer");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchOpportunityDetails();
    fetchUserProfile();
  }, [id]);

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

  const fetchOpportunityDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/opportunities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      console.log("Opportunity data:", data);

      if (data.success) {
        setOpportunity(data.data);
      } else {
        setError(data.message || "Failed to load opportunity details");
      }
    } catch (err) {
      console.error("Error fetching opportunity:", err);
      setError("Failed to load opportunity details");
    } finally {
      setLoading(false);
    }
  };

  const getMapUrl = (location) => {
    if (!location) return null;
    // Using Google Maps search embed (no API key required for basic embedding)
    const encodedLocation = encodeURIComponent(location);
    return `https://maps.google.com/maps?q=${encodedLocation}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    if (timeString && typeof timeString === 'string' && timeString.includes(':')) {
      return timeString;
    }
    return "";
  };

  const formatTimeRange = () => {
    const start = formatTime(opportunity.startTime);
    const end = formatTime(opportunity.endTime);

    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return start;
    } else if (opportunity.eventDate) {
      const date = new Date(opportunity.eventDate);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    return "";
  };

  const handleSignUp = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/signups`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          opportunityId: id
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Successfully signed up for this event!");
        fetchOpportunityDetails();
      } else {
        alert(data.message || "Failed to sign up");
      }
    } catch (err) {
      console.error("Error signing up:", err);
      alert("Failed to sign up for this event");
    }
  };

  if (loading) {
    return (
      <div className="dashboardWrapper">
        <nav className="navbar">
          <div className="navLeft">
            <h1 className="navLogo">helpinghands</h1>
          </div>
        </nav>
        <div className="loadingContainer">Loading event details...</div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="dashboardWrapper">
        <nav className="navbar">
          <div className="navLeft">
            <h1 className="navLogo">helpinghands</h1>
          </div>
        </nav>
        <div className="errorContainer">{error || "Event not found"}</div>
      </div>
    );
  }

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

      {/* Event Detail Content */}
      <div className="eventDetailContent">
        <div className="eventDetailInner">
          {/* Back Button */}
          <button className="backButton" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Event detail</span>
          </button>
        </div>

        {/* Hero Image */}
        <div className="eventHeroImage">
          <img
            src={opportunity.imageUrl || "/images/parkcleanup.png"}
            alt={opportunity.title}
          />
        </div>

        <div className="eventDetailInner">
          {/* Event Header */}
          <div className="eventHeader">
            <h1 className="eventTitle">{opportunity.title}</h1>
            <p className="eventOrganizer">by {opportunity.organizationId?.organizationName || "Organization"}</p>

            <div className="eventMetaInfo">
              <div className="metaItem">
                <Calendar size={16} />
                <span>{formatDate(opportunity.eventDate)}</span>
              </div>
              <div className="metaItem">
                <Clock size={16} />
                <span>{formatTimeRange()}</span>
              </div>
              <div className="metaItem">
                <MapPin size={16} />
                <span>{opportunity.location || "Location TBA"}</span>
              </div>
              <div className="metaItem">
                <Users size={16} />
                <span>{opportunity.durationHours || 3} volunteer hours</span>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="eventSection">
            <h2 className="sectionTitle">Location</h2>
            <div className="locationMap">
              {opportunity.location ? (
                <iframe
                  width="100%"
                  height="200"
                  style={{ border: 0, borderRadius: '8px' }}
                  loading="lazy"
                  src={getMapUrl(opportunity.location)}
                  title="Event Location"
                ></iframe>
              ) : (
                <img
                  src={opportunity.mapImageUrl || opportunity.imageUrl || "/images/parkcleanup.png"}
                  alt="Location map"
                />
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="eventSection">
            <h2 className="sectionTitle">Description</h2>
            <p className="eventDescription">
              {opportunity.description || "No description available."}
            </p>
          </div>

          {/* Tasks & Requirements Section */}
          <div className="eventSection">
            <h2 className="sectionTitle">Tasks & requirements</h2>
            <ul className="requirementsList">
              {opportunity.tasks ? (
                opportunity.tasks.split('\n').filter(task => task.trim()).map((task, index) => (
                  <li key={index}>{task.trim()}</li>
                ))
              ) : opportunity.requirements ? (
                opportunity.requirements.split('\n').filter(req => req.trim()).map((req, index) => (
                  <li key={index}>{req.trim()}</li>
                ))
              ) : (
                <>
                  <li>Comfortable standing and light lifting (up to 20 lbs)</li>
                  <li>Wear closed-toe shoes and clothes you don't mind getting dirty</li>
                  <li>Check in 10 minutes early at the welcome table</li>
                  <li>Families welcome; volunteers under 16 must be accompanied by an adult</li>
                </>
              )}
            </ul>
          </div>

          {/* Sign Up Button */}
          <button className="signUpButton" onClick={handleSignUp}>
            Sign up for this event
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;