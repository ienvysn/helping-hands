import React, { useState, useEffect } from "react";
import { Bell, User, CheckCircle, Trophy, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Notification.css";

const Notification = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setNotifications(data.data.notifications);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, isRead) => {
    if (isRead) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === id ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "hours_confirmed":
      case "signup_accepted":
      case "signup_confirmation":
        return <CheckCircle size={20} className="icon success" />;
      case "level_up":
        return <Trophy size={20} className="icon trophy" />;
      case "new_signup":
        return <User size={20} className="icon info" />;
      case "attendance_not_confirmed":
      case "signup_rejected":
        return <AlertTriangle size={20} className="icon warning" />;
      default:
        return <Bell size={20} className="icon info" />;
    }
  };

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
            <span>Profile</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="notificationContent">
        <h2 className="notificationTitle">Notifications</h2>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="empty">No notifications yet</div>
        ) : (
          <div className="notificationList">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`notificationCard ${notif.isRead ? "read" : "unread"}`}
                onClick={() => markAsRead(notif._id, notif.isRead)}
                style={{
                  opacity: notif.isRead ? 0.7 : 1,
                  cursor: notif.isRead ? "default" : "pointer",
                }}
              >
                <div className="iconWrapper">{getIcon(notif.notificationType)}</div>
                <div className="notificationText">
                  <h4>{notif.title}</h4>
                  <p>{notif.message}</p>
                  <span className="time">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {!notif.isRead && <div className="unreadDot"></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
