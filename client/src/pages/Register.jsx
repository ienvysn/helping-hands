import React, { useState } from "react";
import "../style/Register.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const userType = "volunteer";

  const validatePassword = (value) => {
    const regex = /^(?=.*[0-9]).{6,}$/;

    if (value.length === 0) {
      setError("");
      return;
    }

    if (!regex.test(value)) {
      setError("Password must be at least 6 characters with a number");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (error || password.trim() === "") {
      alert("Please enter a valid password.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, userType, username }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        alert("Register successful!");
        navigate("/");
      } else {
        setError("Email already exists. Please log in.");
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="wrapper">
      <div className="leftSection">
        <div className="textBlock">
          <h1 className="title">Helping Hands</h1>
          <p className="subtitle">Lend a Hand. Change a Life.</p>
        </div>

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
            {/* Username */}
            <label className="label">Username</label>
            <input
              className="input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* Email */}
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password */}
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
                validatePassword(value);
              }}
            />

            {/* Password error message */}
            {error && <p className="error-message">{error}</p>}

            {/* Already have an account */}
            <div className="accountRow">
              <span className="smallNote">
                Already have an account?
                <b
                  style={{ cursor: "pointer", color: "#007bff" }}
                  onClick={() => (window.location.href = "/")}
                >
                  {" "}
                  Sign In
                </b>
              </span>
            </div>

            {/* Sign Up button */}
            <button type="submit" className="signUpBtn" disabled={error !== ""}>
              Sign Up
            </button>

            {/* Google sign-in */}
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
