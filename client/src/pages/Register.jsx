import React, { useState } from "react";
import "../style/Register.css";
import { useNavigate, useLocation } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Default to volunteer if not specified
  const [userType, setUserType] = useState(location.state?.userType || "volunteer");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const validatePassword = (value) => {
    const regex = /^(?=.*[0-9]).{6,}$/;

    if (value.length === 0) {
      setPasswordError("");
      return;
    }

    if (!regex.test(value)) {
      setPasswordError("Password must be at least 6 characters with a number");
    } else {
      setPasswordError("");
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError || password.trim() === "") {
      alert("Please enter a valid password.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userType,
          displayName,
        }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Register successful!");
        if (data.user.userType === "organization") {
          navigate("/organization-registration");
        } else {
          navigate("/dashboard");
        }
      } else {
        setSubmitError(
          data.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
      setSubmitError("Server error. Please try again.");
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `http://localhost:5000/api/auth/google?userType=${userType}`;
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

          <div className="user-type-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setUserType('volunteer')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: userType === 'volunteer' ? '#1e4d8b' : '#e5e7eb',
                color: userType === 'volunteer' ? 'white' : 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Volunteer
            </button>
            <button
              type="button"
              onClick={() => setUserType('organization')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: userType === 'organization' ? '#1e4d8b' : '#e5e7eb',
                color: userType === 'organization' ? 'white' : 'black',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Organization
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <label className="label">{userType === 'organization' ? 'Organization Name' : 'Username'}</label>
            <input
              className="input"
              type="text"
              placeholder={userType === 'organization' ? 'Enter organization name' : 'Enter your username'}
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setSubmitError("");
              }}
            />

            {/* Email */}
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSubmitError("");
              }}
            />

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
                setSubmitError("");
              }}
            />
            {/* error message */}
            {passwordError && <p className="error-message">{passwordError}</p>}
            {submitError && <p className="error-message">{submitError}</p>}

            {/* Already have an account */}
            <div className="accountRow">
              <span className="smallNote">
                Already have an account?
                <b
                  style={{ cursor: "pointer", color: "#007bff" }}
                  onClick={() => navigate("/login")}
                >
                  {" "}
                  Sign In
                </b>
              </span>
            </div>

            {/* Sign Up button */}
            <button
              type="submit"
              className="signUpBtn"
              disabled={passwordError !== ""}
            >
              Sign Up
            </button>

            <button
              type="button"
              className="googleBtn"
              onClick={handleGoogleSignIn}
            >
              <img
                src="/images/google.png"
                alt="Google"
                className="googleIcon"
              />
              Sign up with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
