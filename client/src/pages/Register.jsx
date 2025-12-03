import React, { useState } from "react";
import "../style/Register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const userType = "volunteer";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, userType, username }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (res.ok) {
        alert("Register successful!");
        localStorage.setItem("token", data.token);
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
    <div className="wrapper">
      {/* LEFT SIDE */}
      <div className="leftSection">
        <div className="textBlock">
          <h1 className="title">Helping Hands</h1>
          <p className="subtitle">Lend a Hand. Change a Life.</p>
        </div>

        {/* SIGNUP IMAGE */}
        <img
          src="/images/signuphelping.png"
          alt="Helping Hands Illustration"
          className="illustration"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="rightSection">
        <div className="formContainer">
          <h2 className="heading">Welcome</h2>
          <p className="smallText">
            Enter your username, email and password to get started
          </p>

          <form onSubmit={handleSubmit}>
            <label className="label">Username</label>
            <input
              className="input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="accountRow">
  <span className="smallNote">
    Already have an account? 
    <b
      style={{ cursor: "pointer", color: "#007bff" }}
      onClick={() => window.location.href = "/"}
    >
      {" "}Sign In
    </b>
  </span>
</div>


            <button type="submit" className="signUpBtn">
              Sign Up
            </button>

            <button type="button" className="googleBtn">
              <img
                src="/images/google.png"
                alt="Google"
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

export default Register;
