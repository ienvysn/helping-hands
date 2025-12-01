import React, { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", { // full backend URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (res.ok) {
        alert("Login successful!");

        // Save JWT in localStorage for authenticated requests
        localStorage.setItem("token", data.token);

        // Optional: redirect to dashboard or another page
        // window.location.href = "/dashboard";
      } else {
        alert(data.message || "Login failed");
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
        <h1 style={styles.title}>Helping Hands</h1>
        <p style={styles.subtitle}>Your Hands Can Change Lives</p>
        <img
          src="/images/signinremovebg.png"
          alt="Helping Hands Illustration"
          style={styles.illustration}
        />
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.rightSection}>
        <div style={styles.formContainer}>
          <h2 style={styles.heading}>Welcome Back!</h2>
          <p style={styles.smallText}>
            Enter your email and password to access your account
          </p>

          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div style={styles.linksRow}>
              <span>Don’t have an account? <b>Sign Up</b></span>
              <span><b>Forgot Password?</b></span>
            </div>

            <button type="submit" style={styles.signInBtn}>
              Sign In
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

// Keep your styles as is
const styles = {
  wrapper: { display: "flex", height: "100vh", fontFamily: "Poopins" },
  leftSection: {
    flex: 1,
    background: "#e9f0fb",
    padding: "60px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    borderTopRightRadius: "40px",
    borderBottomRightRadius: "40px",
  },
  title: { fontSize: "48px", fontWeight: "bold", color: "#123a7d", textAlign: "center" },
  subtitle: { fontSize: "20px", marginTop: "10px", color: "#345f9c", textAlign: "center" },
  illustration: { width: "85%", marginTop: "40px" },
  rightSection: { flex: 1, display: "flex", justifyContent: "center", alignItems: "center" },
  formContainer: { width: "70%" },
  heading: { fontSize: "32px", marginBottom: "8px" },
  smallText: { fontSize: "14px", color: "#777", marginBottom: "20px" },
  label: { marginTop: "10px", display: "block", fontWeight: "bold", fontSize: "14px" },
  input: { width: "100%", padding: "12px", marginTop: "5px", marginBottom: "15px", borderRadius: "6px", border: "1px solid #ddd", background: "#f7f7f7", fontSize: "16px" },
  linksRow: { display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "14px" },
  signInBtn: { width: "100%", padding: "12px", background: "#000", color: "white", fontSize: "16px", borderRadius: "8px", border: "none", cursor: "pointer", marginBottom: "10px" },
  googleBtn: { width: "100%", padding: "12px", background: "#fff", border: "1px solid #ccc", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" },
  googleIcon: { width: "30px", marginRight: "20px" },
};

export default Login;
