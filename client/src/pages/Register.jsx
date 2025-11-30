import React, { useState } from "react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const userType = "volunteer"
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, userType,username }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (res.ok) {
        alert("Register successful!");
        localStorage.setItem("token", data.token);
        // Optional: redirect to dashboard
        // window.location.href = "/dashboard";
      } else {
        alert(data.message || "Register failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server not responding");
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* LEFT SIDE */}
      <div style={styles.leftSection}>
        <div style={styles.textBlock}>
          <h1 style={styles.title}>Helping Hands</h1>
          <p style={styles.subtitle}>Lend a Hand. Change a Life.</p>
        </div>

        <img
          src="/images/signuphelping.png"
          alt="Helping Hands Illustration"
          style={styles.illustration}
        />
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.rightSection}>
        <div style={styles.formContainer}>
          <h2 style={styles.heading}>Welcome</h2>
          <p style={styles.smallText}>
            Enter your username, email and password to get started
          </p>

          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div style={styles.accountRow}>
              <span style={styles.smallNote}>
                Already have an account?{" "}
                <b style={{ cursor: "pointer" }}>Sign In</b>
              </span>
            </div>

            <button type="submit" style={styles.signUpBtn}>
              Sign Up
            </button>

            <button type="button" style={styles.googleBtn}>
              <img
                src="/images/google.png"
                alt="google"
                style={styles.googleIcon}
              />
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    height: "100vh",
    fontFamily: "Poppins, sans-serif",
    background: "#fff",
  },

  /* LEFT SECTION */
  leftSection: {
    flex: 1,
    background: "#e9f0fb",
    padding: "56px 72px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderTopRightRadius: "40px",
    borderBottomRightRadius: "40px",
    boxSizing: "border-box",
  },

  textBlock: {
    textAlign: "center",
    marginTop: "20px",
  },

  title: {
    fontSize: "64px",
    fontWeight: 900,
    fontFamily: "Poppins, sans-serif",
    color: "#1e3f78",
    margin: 0,
    marginBottom: "20px",
    lineHeight: 1,
  },

  subtitle: {
    fontSize: "20px",
    marginTop: "12px",
    color: "#3f5f99",
    marginBottom: 0,
    fontWeight: 600,
  },

  illustration: {
    width: "105%",
    marginTop: "50px",
    objectFit: "contain",
    alignSelf: "center",
  },

  /* RIGHT SECTION */
  rightSection: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  formContainer: {
    width: "68%",
    maxWidth: "420px",
  },

  heading: {
    fontSize: "36px",
    fontWeight: 800,
    fontFamily: "Poppins, sans-serif",
    textAlign: "center",
    marginBottom: "6px",
  },

  smallText: {
    fontSize: "13px",
    color: "#7a7a7a",
    marginBottom: "22px",
    textAlign: "center",
  },

  label: {
    marginTop: "10px",
    display: "block",
    fontWeight: 600,
    fontSize: "13px",
    color: "#333",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    marginTop: "2px",
    marginBottom: "14px",
    borderRadius: "10px",
    border: "1px solid #eee",
    background: "#f7f8fa",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  accountRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "12px",
  },

  smallNote: {
    fontSize: "13px",
    color: "#444",
  },

  signUpBtn: {
    width: "100%",
    padding: "14px",
    background: "#000",
    color: "#fff",
    fontSize: "16px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    marginTop: "6px",
  },

  googleBtn: {
    width: "100%",
    padding: "12px",
    marginTop: "14px",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "15px",
  },

  googleIcon: {
    width: "20px",
    height: "20px",
  },
};

export default Register;
