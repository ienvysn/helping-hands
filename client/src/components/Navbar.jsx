import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { User, Bell, Menu, X } from "lucide-react";
import "../style/Navbar.css";

const Navbar = ({ userType, displayName }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper to check active state
  const isActive = (path) => location.pathname === path;

  // Volunteer Navigation Links
  const volunteerLinks = [
    { name: "Dashboard", path: "/dashboard", icon: "▦" },
    { name: "Opportunities", path: "/opportunities", icon: "✦" },
    { name: "My Events", path: "/my-events", icon: "▥" },
  ];

  // Organization Navigation Links
  const organizationLinks = [
    { name: "Dashboard", path: "/organization-dashboard", icon: "▦" },
  ];

  const links = userType === "organization" ? organizationLinks : volunteerLinks;

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo & Hamburger */}
        <div className="nav-header">
          <h1 className="navLogo">helpinghands</h1>
          <button
            className="hamburger-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X size={24} color="white" />
            ) : (
              <Menu size={24} color="white" />
            )}
          </button>
        </div>

        {/* Nav Links & User Profile - Collapsible on Mobile */}
        <div className={`nav-content ${isMenuOpen ? "open" : ""}`}>
          <div className="navMenu">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navLink ${isActive(link.path) ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="navIcon">{link.icon}</span> {link.name}
              </Link>
            ))}
          </div>

          <div className="navRight">
            <button
              className="notificationBtn"
              onClick={() => {
                navigate("/notifications");
                setIsMenuOpen(false);
              }}
            >
              <Bell size={20} />
              <span className="mobile-only">Notifications</span>
            </button>
            <div
              className="userProfile"
              onClick={() => {
                if (userType === 'organization') {
                    navigate("/organization-profile");
                } else {
                    navigate("/profile");
                }
                setIsMenuOpen(false);
              }}
            >
              <User size={20} />
              <span className="user-name">{displayName}</span>
              {/* <span className="mobile-only">Profile</span> */}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
