import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- useNavigate
import "../style/ForgetPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate(); // <-- initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      alert("Password reset link sent to your email!");
      // optionally redirect to login after sending link
      navigate("/"); // <-- redirect to login after submit
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
          src="/images/forget.png"
          alt="Helping Hands Illustration"
          className="illustration"
        />
      </div>

      <div className="rightSection">
        <div className="formContainer">
          <h2 className="heading">Helping Hands</h2>
          <p className="smallText" style={{ color: "#4a6883", fontWeight: 500 }}>
            Your Hands Can Change Lives
          </p>

          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.5rem" }}>
            Forgot Password?
          </h3>
          <p className="smallText" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
            No worries! Enter your email address and we'll send you a link to reset your password.
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

            <button type="submit" className="signInBtn" style={{ marginTop: "1.5rem" }}>
              Send Reset Link
            </button>

            {/* Back to Login */}
            <b 
              className="backLink" 
              style={{cursor:"pointer"}} 
              onClick={() => navigate("/")} // <-- useNavigate back to login
            >
              ← Back to Login
            </b>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
