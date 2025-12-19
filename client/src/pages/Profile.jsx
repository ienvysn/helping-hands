import React, { useState, useEffect } from "react";
import { User, Bell } from "lucide-react";
import "../style/Profile.css";

const Profile = () => {
    // --- State Initialization ---
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [location, setLocation] = useState("");
    const [preferredCauses, setPreferredCauses] = useState("");
    const [aboutMe, setAboutMe] = useState("");
    const [emailReminders, setEmailReminders] = useState(true);
    const [levelUpdates, setLevelUpdates] = useState(true);
    
    // ADDED: State for volunteer statistics (Level and Hours)
    const [totalHours, setTotalHours] = useState(0);
    const [level, setLevel] = useState(1); 

    // --- Data Fetch (GET) ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Authentication token not found. Redirecting...");
            // Optionally redirect user here: window.location.href = "/login";
            return; 
        }

        fetch("http://localhost:5000/api/user/profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                // 🛑 FIXED: Added Authorization token for GET request 🛑
                Authorization: `Bearer ${token}`, 
            },
        })
        .then((res) => {
            if (!res.ok) {
                // Throw error if unauthorized (401) or not found (404)
                throw new Error(`Failed to fetch profile: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            // Handle nested response structure from server
            const userData = data.data?.user || {};
            const profileData = data.data?.profile || {};
            
            // Populate all state variables with fetched data
            const email = userData.email || "";
            setDisplayName(profileData.displayName || email.split('@')[0] || "User");
            setEmail(email);
            setLocation(profileData.location || "");
            setPreferredCauses(profileData.preferredCauses || "");
            setAboutMe(profileData.aboutMe || "");
            setEmailReminders(profileData.emailReminders ?? true);
            setLevelUpdates(profileData.levelUpdates ?? true);
            
            // ADDED: Set volunteer stats state
            setTotalHours(profileData.totalHours || 0); 
            setLevel(profileData.level || 1);          
        })
        .catch((err) => {
            console.error("Error fetching profile:", err);
            // Alert user that data couldn't be loaded
            alert(`Failed to load profile data. Error: ${err.message}. Check the console.`);
        });
    }, []); // Empty dependency array means it runs only once on mount


    // --- Save changes to backend (PUT) ---
    const handleSave = async (e) => {
        e.preventDefault();
        
        // CRUCIAL: Get the JWT token from local storage (Already correct here)
        const token = localStorage.getItem("token"); 

        try {
            const res = await fetch("http://localhost:5000/api/user/profile", {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, 
                },
                body: JSON.stringify({
                    displayName,
                    email,
                    location,
                    preferredCauses,
                    aboutMe,
                    emailReminders,
                    levelUpdates,
                }),
            });
            
            if (res.ok) {
                alert("Changes saved successfully!");
                // Optionally refetch data here to update the stats if they were affected, 
                // but profile fields are already updated via state.
            } else {
                const errorData = await res.json();
                console.error("Save failed:", errorData);
                alert(`Error saving changes: ${errorData.message || 'Unauthorized or server error'}`);
            }
        } catch (err) {
            console.error(err);
            alert("Error saving changes: Network or server connection failed.");
        }
    };

  const handleCancel = () => {
    setDisplayName("Brad Pitt");
    setEmail("f1moviecameo@example.com");
    setLocation("San Francisco, CA");
    setPreferredCauses("Environment, Youth & Education");
    setAboutMe("I love hands-on projects that bring neighbors together...");
  };

  const handleUpdatePassword = async () => {
    alert("Password update functionality (connect to backend)");
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/auth/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          alert("Account deleted successfully!");
          window.location.href = "/";
        } else {
          const data = await res.json();
          console.log("Error:", data);
          alert("Failed to delete account");
        }
      } catch (err) {
        console.error(err);
        alert("Error deleting account");
      }
    }
  };

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
            <span>{displayName}</span>
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

        <div className="profileCard">
          <div className="profileSection">
            <div className="avatarSection">
              <div className="avatarCircle">
                <User size={48} color="#666" />
                <div className="levelBadge">1</div>
              </div>
              <div className="avatarInfo">
                <h3 className="userName">{displayName}</h3>
                <p className="userStats">Level 1 • 0 hours donated</p>
                <a href="#" className="changeAvatarLink">
                  Change avatar
                </a>
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
                  />
                </div>
                <div className="formGroup">
                  <label className="profileLabel">Email</label>
                  <input
                    type="email"
                    className="profileInput"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="formRow">
                <div className="formGroup">
                  <label className="profileLabel">Location</label>
                  <input
                    type="text"
                    className="profileInput"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div className="formGroup">
                  <label className="profileLabel">Preferred causes</label>
                  <input
                    type="text"
                    className="profileInput"
                    value={preferredCauses}
                    onChange={(e) => setPreferredCauses(e.target.value)}
                  />
                </div>
              </div>

              <div className="formGroup fullWidth">
                <label className="profileLabel">About me</label>
                <textarea
                  className="profileTextarea"
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="buttonGroup">
                <button type="submit" className="saveBtn">
                  Save changes
                </button>
                <button
                  type="button"
                  className="cancelBtn"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
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
                onClick={handleUpdatePassword}
              >
                Update password
              </button>
            </div>
          </div>
        </div>

        <div className="profileCard">
          <div className="notificationsSection">
            <h3 className="sectionTitle">Notifications</h3>
            <label className="checkboxLabel">
              <input
                type="checkbox"
                className="checkbox"
                checked={emailReminders}
                onChange={(e) => setEmailReminders(e.target.checked)}
              />
              <span>Email reminders for approval for signed up events</span>
            </label>
            <label className="checkboxLabel">
              <input
                type="checkbox"
                className="checkbox"
                checked={levelUpdates}
                onChange={(e) => setLevelUpdates(e.target.checked)}
              />
              <span>Level up & badge updates</span>
            </label>
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
    </div>
  );
};

export default Profile;