import React, { useState, useEffect } from "react";
import "../style/Login.css";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const userType = location.state?.userType || "volunteer";

  // Check for errors returned from Google Auth
  useEffect(() => {
    const errorMsg = searchParams.get("error");
    if (errorMsg) {
      setSubmitError(decodeURIComponent(errorMsg));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        console.log("Logged in as:", data.data.user.userType);

        if (data.data.user.userType === "organization") {
          navigate("/organization-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        setSubmitError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error.message);
      setSubmitError("Server not responding");
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `http://localhost:5000/api/auth/google?userType=volunteer`;
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
              onChange={(e) => {
                setEmail(e.target.value);
                setSubmitError("");
              }}
              required
            />

            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setSubmitError("");
              }}
              required
            />
            {submitError && <p className="error-message">{submitError}</p>}

            <div className="linksRow">
              <span>
                Don't have an account?
                <b
                  style={{ cursor: "pointer", color: "#007bff" }}
                  onClick={() =>
                    navigate("/register", {
                      state: {
                        userType: location.state?.userType || "volunteer",
                      },
                    })
                  }
                >
                  {" "}
                  Sign Up
                </b>
              </span>

              <span>
                <b
                  style={{ cursor: "pointer", color: "#007bff" }}
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </b>
              </span>
            </div>

            <button type="submit" className="signInBtn">
              Sign In
            </button>

            <button
              type="button"
              className="googleBtn"
              onClick={handleGoogleSignIn}
            >
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
