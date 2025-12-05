import React, { useState } from "react";
import "../style/LandingPage.css";

function LandingPage() {
  const [userType, setUserType] = useState("volunteer");

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="navbar-container">
          <h1 className="logo">helpinghands</h1>
        </div>
      </nav>

      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), url(${process.env.PUBLIC_URL}/images/landingimage.jpg)`,
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">Make a Difference, Together.</h1>
            <p className="hero-subtitle">
              helpinghands connect passionate volunteers with impactful
              organizations.
              <br />
              Find your next opportunity to give back and be part of something
              bigger.
            </p>

            <div className="hero-tabs">
              <button
                className={`hero-tab ${
                  userType === "volunteer" ? "active" : ""
                }`}
                onClick={() => setUserType("volunteer")}
              >
                Volunteer
              </button>
              <button
                className={`hero-tab ${
                  userType === "organization" ? "active" : ""
                }`}
                onClick={() => setUserType("organization")}
              >
                Organization
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="cards-section">
        <div className="cards-container">
          <div className="card">
            <div className="card-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#1e4d8b" />
                <path
                  d="M12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6Z"
                  fill="white"
                />
                <path
                  d="M12 11C9.33 11 7 12.67 7 15V16H17V15C17 12.67 14.67 11 12 11Z"
                  fill="white"
                />
              </svg>
            </div>
            <h2 className="card-title">
              I'm a {userType === "volunteer" ? "Volunteer" : "Organization"}
            </h2>
            <p className="card-description">
              {userType === "volunteer"
                ? "Discover local events and track your impact in the community."
                : "Post opportunities and connect with passionate volunteers."}
            </p>
            <button className="card-btn">
              Create {userType === "volunteer" ? "Volunteer" : "Organization"}{" "}
              Account
            </button>
          </div>

          <div className="card">
            <div className="card-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#1e4d8b" />
                <path
                  d="M12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6Z"
                  fill="white"
                />
                <path
                  d="M12 11C9.33 11 7 12.67 7 15V16H17V15C17 12.67 14.67 11 12 11Z"
                  fill="white"
                />
              </svg>
            </div>
            <h2 className="card-title">
              Already a{" "}
              {userType === "volunteer" ? "Volunteer" : "Organization"}?
            </h2>
            <p className="card-description">
              Sign in to your existing {userType} account
            </p>
            <button className="card-btn">Sign In</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
