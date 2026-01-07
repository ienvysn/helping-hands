import React from "react";
import { Bell, User, CheckCircle, Trophy, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Notification.css";

const Notification = () => {
  const navigate = useNavigate();

  return (
    <div className="notificationWrapper">
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
          <button className="notificationBtn active">
            <Bell size={20} />
          </button>
          <div className="userProfile" onClick={() => navigate("/profile")}>
            <User size={20} />
            <span>Brad Pitt</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="notificationContent">
        <h2 className="notificationTitle">Notifications</h2>

        <div className="notificationList">
          {/* Approved */}
          <div className="notificationCard">
            <div className="icon success">
              <CheckCircle size={20} />
            </div>
            <div className="notificationText">
              <h4>Event Approved</h4>
              <p>
                Your registration for <strong>“Park Clean-up & Tree Planting”</strong> has been approved.
                An email reminder has been sent.
              </p>
              <span className="time">1 hour ago</span>
            </div>
          </div>

          {/* Level Up */}
          <div className="notificationCard">
            <div className="icon trophy">
              <Trophy size={20} />
            </div>
            <div className="notificationText">
              <h4>Level Up!</h4>
              <p>
                Congratulations! You've reached <strong>Level 2</strong> and earned the
                <strong> “Community Helper”</strong> badge.
              </p>
              <span className="time">3 hours ago</span>
            </div>
          </div>

          {/* Reminder */}
          <div className="notificationCard">
            <div className="icon info">
              <Bell size={20} />
            </div>
            <div className="notificationText">
              <h4>Event Reminder</h4>
              <p>
                <strong>“River Cleaning Activity”</strong> is starting tomorrow at 9:00 AM.
                Don’t forget to check the requirements.
              </p>
              <span className="time">1 day ago</span>
            </div>
          </div>

          {/* Profile Incomplete */}
          <div className="notificationCard">
            <div className="icon warning">
              <AlertTriangle size={20} />
            </div>
            <div className="notificationText">
              <h4>Profile Incomplete</h4>
              <p>
                Please complete your profile information to unlock new features
                and get better recommendations.
              </p>
              <span className="time">2 days ago</span>
            </div>
          </div>

          {/* Welcome */}
          <div className="notificationCard">
            <div className="icon success">
              <CheckCircle size={20} />
            </div>
            <div className="notificationText">
              <h4>Welcome to HelpingHands!</h4>
              <p>
                Your account has been successfully created.
                Explore opportunities and start making a difference!
              </p>
              <span className="time">4 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;
