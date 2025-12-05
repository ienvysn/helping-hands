import React, { useState } from "react";
import "../style/Register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const userType = "volunteer";

  // Password validation function
  const validatePassword = (value) => {
    const regex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-={}[\]|\\:;"'<>,.?/~`]).{8,}$/;

    // No error when field is empty
    if (value.length === 0) {
      setPasswordError("");
      return;
    }

    // Show or hide error
    if (!regex.test(value)) {
      setPasswordError(
        "Password must be at least 8 characters, include a number and a special character."
      );
    } else {
      setPasswordError(""); // error disappears immediately when valid
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // block submission if password invalid
    if (passwordError || password.trim() === "") {
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
        alert("Register successful!");
        localStorage.setItem("token", data.token);
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
            {passwordError && (
              <p style={{ color: "red", fontSize: "14px" }}>
                {passwordError}
              </p>
            )}

            {/* Already have an account */}
            <div className="accountRow">
              <span className="smallNote">
                Already have an account?
                <b
                  style={{ cursor: "pointer", color: "#007bff" }}
                  onClick={() => (window.location.href = "/")}
                >
                  {" "}Sign In
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
