import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "../style/ResetPassword.css";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get token from URL query parameter
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one number");
      return;
    }

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Backend validation errors
        if (data.errors) {
          setError(data.errors.join(", "));
        } else {
          setError(
            data.message || "Failed to reset password. Please try again."
          );
        }
        return;
      }

      if (data.success) {
        setSuccess(true);
        alert("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="reset-password-wrapper">
      <div className="reset-password-modal">
        <button className="close-btn" onClick={() => navigate("/")}>
          ×
        </button>

        <h2>Change password</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Enter your new password</label>
            <div className="input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading || success}
              />
              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex="-1"
              >
                {showNewPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm your new password</label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || success}
              />
              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          {error && <p className="error-message">❌ {error}</p>}
          {success && (
            <p className="success-message">✅ Password reset successful!</p>
          )}

          <button
            type="submit"
            className="confirm-btn"
            disabled={loading || success}
          >
            {loading ? "Processing..." : success ? "Success!" : "Confirm"}
          </button>
        </form>

        <p className="password-requirements">
          Password must be at least 6 characters and contain a number
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
