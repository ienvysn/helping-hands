import React, { useState } from "react";
import "../style/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (res.ok) {
        alert("Login successful!");
        localStorage.setItem("token", data.token);
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server not responding");
    }
  };

  return (
    <div className="wrapper">
      <div className="leftSection">
        <h1 className="title">Helping Hands</h1>
        <p className="subtitle">Your Hands Can Change Lives</p>
        <img
          src="/images/signinremovebg.png"
          alt="Helping Hands Illustration"
          className="illustration"
        />
      </div>

      <div className="rightSection">
        <div className="formContainer">
          <h2 className="heading">Welcome Back!</h2>
          <p className="smallText">
            Enter your email and password to access your account
          </p>

          <form onSubmit={handleSubmit}>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="linksRow">
              <span>
                Don’t have an account? <b>Sign Up</b>
              </span>
              <span>
                <b>Forgot Password?</b>
              </span>
            </div>

            <button type="submit" className="signInBtn">
              Sign In
            </button>

            <button type="button" className="googleBtn">
              <img
                src="/images/google.png"
                alt="google"
                className="googleIcon"
              />
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
