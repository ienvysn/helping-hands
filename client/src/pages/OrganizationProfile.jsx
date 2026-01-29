import React, { useState, useEffect } from "react";
import { User, Bell } from "lucide-react";
import "../style/Profile.css";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const OrganizationProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    website: "",
    description: "",
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
        const orgData = data.data.profile || {};
        setFormData({
          name: orgData.organizationName || data.data.user?.name || "",
          phone: orgData.contactPhone || "",
          location: orgData.address || "",
          website: orgData.website || "",
          description: orgData.mission || "",
        });
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (error) {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setError("");
    setFormData({
      name: profile.profile?.organizationName || profile.user?.name || "",
      phone: profile.profile?.contactPhone || "",
      location: profile.profile?.address || "",
      website: profile.profile?.website || "",
      description: profile.profile?.mission || "",
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const payload = {
        organizationName: formData.name,
        mission: formData.description,
        contactPhone: formData.phone,
        website: formData.website,
        address: formData.location
      };
      const res = await fetch("http://localhost:5000/api/user/profile/organization", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev) => ({
          ...prev,
          user: { ...prev.user, name: formData.name },
          profile: data.data
        }));
        setEditMode(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      setError("Server error during save");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
        setPasswordMsg({ type: "error", text: "Password must be at least 6 characters" });
        return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ type: "success", text: "Password updated successfully" });
        setTimeout(() => {
            setChangingPassword(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setPasswordMsg({ type: "", text: "" });
        }, 2000);
      } else {
        setPasswordMsg({ type: "error", text: data.message || "Failed to update password" });
      }
    } catch (error) {
      setPasswordMsg({ type: "error", text: "Server error" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This action is permanent!")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        localStorage.clear();
        window.location.href = "/";
      }
    } catch (err) { alert("Error deleting account"); }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const currentDisplayName = profile?.user?.name || formData.name || "Organization";

  return (
    <div className="profileWrapper">
      <Navbar userType="organization" displayName={currentDisplayName} />

      <div className="profileContent">
        <div className="profileHeader">
          <h2 className="profileTitle">Organization Profile</h2>
          <p className="profileSubtitle">Update your organization info, mission statement, and contact details.</p>
        </div>

        {/* DETAILS CARD */}
        <div className="profileCard">
          <div className="profileSection">
            <div className="avatarSection">
              <div className="avatarCircle"><User size={48} color="#666" /></div>
              <div className="avatarInfo">
                <h3 className="userName">{currentDisplayName}</h3>
                <p className="userStats">Official Organization Account</p>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="formRow">
                <div className="formGroup">
                  <label className="profileLabel">Organization Name</label>
                  <input
                    type="text"
                    className="profileInput"
                    value={editMode ? formData.name : currentDisplayName}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
                <div className="formGroup">
                  <label className="profileLabel">Email (ReadOnly)</label>
                  <input
                    type="email"
                    className="profileInput disabled-input"
                    value={profile?.user?.email || ""}
                    disabled
                  />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label className="profileLabel">Phone Number</label>
                  <input
                    type="text"
                    className="profileInput"
                    value={editMode ? formData.phone : profile?.profile?.contactPhone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
                <div className="formGroup">
                  <label className="profileLabel">Location / Address</label>
                  <input
                    type="text"
                    className="profileInput"
                    value={editMode ? formData.location : profile?.profile?.address || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="formGroup fullWidth" style={{marginBottom: '1rem'}}>
                <label className="profileLabel">Website</label>
                <input
                  type="url"
                  className="profileInput"
                  value={editMode ? formData.website : profile?.profile?.website || ""}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={!editMode}
                />
              </div>

              <div className="formGroup fullWidth">
                <label className="profileLabel">About / Mission</label>
                <textarea
                  className="profileTextarea"
                  value={editMode ? formData.description : profile?.profile?.mission || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!editMode}
                  rows={4}
                />
              </div>

              <div className="buttonGroup">
                {!editMode ? (
                  <button type="button" className="saveBtn" onClick={handleEdit}>Edit Profile</button>
                ) : (
                  <>
                    <button type="submit" className="saveBtn" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" className="cancelBtn" onClick={handleCancel}>Cancel</button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ACCOUNT SETTINGS CARD */}
        <div className="profileCard">
          <div className="accountSettings">
            <h3 className="sectionTitle">Account settings</h3>
            <div className="settingsRow" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: changingPassword ? '0' : '0' }}>
              <div>
                <p className="settingsLabel">Change password</p>
                <p className="passwordDots">•••••••</p>
              </div>
              {!changingPassword ? (
                  <button
                  className="updatePasswordBtn"
                  onClick={() => setChangingPassword(true)}
                  >
                  Update password
                  </button>
              ) : (
                  <button
                  className="cancelBtn"
                  onClick={() => {
                      setChangingPassword(false);
                      setPasswordMsg({ type: "", text: "" });
                  }}
                  >
                  Cancel
                  </button>
              )}
            </div>

            {changingPassword && (
              <form onSubmit={handlePasswordSubmit} className="passwordForm" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                  {passwordMsg.text && (
                      <div style={{
                          padding: '10px',
                          marginBottom: '15px',
                          borderRadius: '4px',
                          backgroundColor: passwordMsg.type === 'error' ? '#ffebee' : '#e8f5e9',
                          color: passwordMsg.type === 'error' ? '#c62828' : '#2e7d32'
                      }}>
                          {passwordMsg.text}
                      </div>
                  )}
                  <div className="formGroup">
                    <label className="profileLabel">Current Password</label>
                    <input
                      type="password"
                      className="profileInput"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="formGroup">
                      <label className="profileLabel">New Password</label>
                      <input
                          type="password"
                          className="profileInput"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          required
                      />
                  </div>
                  <div className="formGroup">
                      <label className="profileLabel">Confirm New Password</label>
                      <input
                          type="password"
                          className="profileInput"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                      />
                  </div>
                  <button type="submit" className="saveBtn">Update Password</button>
              </form>
            )}
          </div>
        </div>

        {/* DANGER ZONE - ALIGNED BY profileContent */}
        <div className="dangerCard">
          <h3 className="dangerTitle">Danger zone</h3>
          <p className="dangerText">These actions are permanent and cannot be undone.</p>
          <div className="dangerButtons">
            <button className="deleteBtn" onClick={handleDeleteAccount}>Delete Account</button>
            <button className="logoutBtn" onClick={() => { localStorage.clear(); window.location.href = "/"; }}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationProfile;
