import React, { useEffect, useState } from "react";
import { User, Bell, Star, Lock } from "lucide-react";
import "../style/Dashboard.css";

const ProfileDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
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

  if (loading) return <div className="loading">Loading...</div>;
  if (!profile) return <div className="error">Failed to load dashboard</div>;

  const displayName = "Brad Pitt";
const email = "losemymind@gmail.com";

  const level = profile.profile?.level || 1;
  const totalHours = profile.profile?.totalHours || 0;
  const completed = profile.profile?.completed || 0;

  return (
    <div className="dashboardWrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navLeft">
          <h1 className="navLogo">helpinghands</h1>
          <div className="navMenu">
            <a className="navLink">
              <span className="navIcon">▦</span> Dashboard
            </a>
            <a className="navLink">
              <span className="navIcon">✦</span> Opportunities
            </a>
            <a className="navLink">
              <span className="navIcon">▥</span> My Events
            </a>
          </div>
        </div>

        <div className="navRight">
          <button className="notificationBtn">
            <Bell size={20} />
          </button>
          <div className="userProfile">
            <User size={20} />
            <span>{displayName}</span>
          </div>
        </div>
      </nav>

      {/* Profile Summary Card */}
      <div className="dashboardContent">
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

          <div className="progressSection">
            <div className="progressHeader">
              <span>Progress to Level 2</span>
              <span>{totalHours} / 10 hours</span>
            </div>
            <div className="progressBar">
              <div
                className="progressFill"
                style={{ width: `${Math.min(totalHours * 10, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Achievement Journey */}
        <div className="achievementCard">
          <h3 className="sectionTitle">Achievement Journey</h3>
          <p className="sectionSubtitle">
            Keep volunteering to unlock higher levels and earn recognition in the
            community!
          </p>

          <div className="achievementLevels">
            <div className="achievementItem active">
              <Star />
              <p>Level 1</p>
              <small>0–9h</small>
            </div>

            <div className="achievementItem">
              <Star />
              <p>Level 2</p>
              <small>9–15h</small>
            </div>

            <div className="achievementItem highlight">
              <Star />
              <p>Level 3</p>
              <small>15–25h</small>
            </div>

            <div className="achievementItem locked">
              <Star />
              <p>Level 4</p>
              <small>25–32h</small>
            </div>

            <div className="achievementItem locked">
              <Star />
              <p>Level 5</p>
              <small>32–40h</small>
            </div>

            <div className="achievementItem locked">
              <Lock />
              <p>Level 6</p>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="profileCard">
          <h3 className="sectionTitle">Upcoming Events</h3>
          <p className="emptyText">Upcoming Events will show up here</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
