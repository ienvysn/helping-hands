import React, { useState, useEffect } from "react";
import { User, Bell } from "lucide-react";
import "../style/Profile.css";
import { useNavigate, Link } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Form fields
  const [displayName, setDisplayName] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("http://localhost:5000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setProfile(data.data);
        setEmail(data.data.user.email);

        if (data.data.user.userType === "volunteer") {
          setDisplayName(data.data.profile?.displayName || "");
          setAboutMe(data.data.profile?.aboutMe || "");
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/user/profile/volunteer",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            displayName,
            aboutMe,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setProfile({
          ...profile,
          profile: data.data,
        });
        setEditMode(false);
        alert("Profile updated successfully!");
      } else {
        setError(data.message);
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Server error");
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setDisplayName(profile.profile?.displayName || "");
      setAboutMe(profile.profile?.aboutMe || "");
    }
    setEditMode(false);
    setError("");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This cannot be undone!")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/auth/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        alert("Account deleted successfully");
        localStorage.clear();
        window.location.href = "/";
      } else {
        alert("Failed to delete account");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!profile) {
    return <div className="error">Failed to load profile</div>;
  }

  return (
    <div className="profileWrapper">
      <nav className="navbar">
        <div className="navLeft">
          <h1 className="navLogo">helpinghands</h1>
          <div className="navMenu">
            <Link to="/dashboard" className="navLink">
              <span className="navIcon">▦</span> Dashboard
            </Link>
            <a href="#" className="navLink">
              <span className="navIcon">✦</span> Opportunities
            </a>
            <a href="#" className="navLink">
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
            <span>{displayName || "User"}</span>
          </div>
        </div>
      </nav>

      <div className="profileContent">
        <div className="profileHeader">
          <h2 className="profileTitle">Profile</h2>
          <p className="profileSubtitle">
            Update your info, share what you care about, and manage your
            account.
          </p>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="profileCard">
          <div className="profileSection">
            <div className="avatarSection">
              <div className="avatarCircle">
                <User size={48} color="#666" />
                <div className="levelBadge">{profile.profile?.level || 1}</div>
              </div>
              <div className="avatarInfo">
                <h3 className="userName">{displayName || "Anonymous"}</h3>
                <p className="userStats">
                  Level {profile.profile?.level || 1} •{" "}
                  {profile.profile?.totalHours || 0} hours donated
                </p>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="formRow">
                <div className="formGroup">
                  <label className="profileLabel">Display name</label>
                  <input
                    type="text"
                    className="profileInput"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!editMode}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="formGroup">
                  <label className="profileLabel">Email</label>
                  <input
                    type="email"
                    className="profileInput"
                    value={email}
                    disabled
                    style={{
                      backgroundColor: "#f5f5f5",
                      cursor: "not-allowed",
                    }}
                  />
                  <small style={{ color: "#666", fontSize: "12px" }}>
                    Email cannot be changed
                  </small>
                </div>
              </div>

              <div className="formGroup fullWidth">
                <label className="profileLabel">About me</label>
                <textarea
                  className="profileTextarea"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  disabled={!editMode}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="buttonGroup">
                {!editMode ? (
                  <button
                    type="button"
                    className="saveBtn"
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button type="submit" className="saveBtn" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      className="cancelBtn"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="profileCard">
        <div className="accountSettings">
          <h3 className="sectionTitle">Account settings</h3>
          <div className="settingsRow">
            <div>
              <p className="settingsLabel">Change password</p>
              <p className="passwordDots">•••••••</p>
            </div>
            <button
              className="updatePasswordBtn"
              onClick={() => alert("Password update coming soon!")}
            >
              Update password
            </button>
          </div>
        </div>
      </div>

      <div className="dangerCard">
        <h3 className="dangerTitle">Danger zone</h3>
        <p className="dangerText">
          These actions are permanent and cannot be undone.
        </p>
        <div className="dangerButtons">
          <button className="deleteBtn" onClick={handleDeleteAccount}>
            Delete my account
          </button>

          <button
            className="logoutBtn"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;