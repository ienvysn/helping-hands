import React, { useState, useEffect } from "react";
import { User, Bell } from "lucide-react";
import "../style/Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    aboutMe: "",
  });

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
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (profile?.profile) {
      setFormData({
        displayName: profile.profile.displayName || "",
        aboutMe: profile.profile.aboutMe || "",
      });
    }
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!editMode) return;
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5000/api/user/profile/volunteer",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (data.success) {
        setProfile((prev) => ({
          ...prev,
          profile: data.data,
        }));
        setEditMode(false);
        alert("Profile updated successfully!");
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Server error during save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This cannot be undone!")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        alert("Account deleted successfully");
        localStorage.clear();
        window.location.href = "/";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!profile)
    return <div className="error">{error || "Failed to load profile"}</div>;

  const displayEmail = profile.user?.email || "";
  const displayParams = profile.profile || {};
  const currentDisplayName = displayParams.displayName || "Anonymous";

  return (
    <div className="profileWrapper">
      <nav className="navbar">
        <div className="navLeft">
          <h1 className="navLogo">helpinghands</h1>
          <div className="navMenu">
            <a href="#" className="navLink">
              <span className="navIcon">▦</span> Dashboard
            </a>
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

            <span>{currentDisplayName}</span>
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
                <div className="levelBadge">{displayParams.level || 1}</div>
              </div>
              <div className="avatarInfo">
                <h3 className="userName">{currentDisplayName}</h3>
                <p className="userStats">
                  Level {displayParams.level || 1} •{" "}
                  {displayParams.totalHours || 0} hours donated
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
                    value={editMode ? formData.displayName : currentDisplayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    disabled={!editMode}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="formGroup">
                  <label className="profileLabel">Email</label>
                  <input
                    type="email"
                    className="profileInput"
                    value={displayEmail}
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
                  value={
                    editMode ? formData.aboutMe : displayParams.aboutMe || ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, aboutMe: e.target.value })
                  }
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
              onClick={() => alert("Coming soon!")}
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
