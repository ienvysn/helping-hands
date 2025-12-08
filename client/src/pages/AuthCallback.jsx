import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userType = searchParams.get("userType");
    const error = searchParams.get("error");

    if (error) {
      alert("Google authentication failed. Please try again.");
      navigate("/login");
      return;
    }

    if (token) {
      localStorage.setItem("token", token);

      navigate("/");
    } else {
      alert("Authentication failed - no token received");
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div style={{ fontSize: "1.2rem" }}>Authenticating with Google...</div>
      <div>Please wait...</div>
    </div>
  );
};

export default AuthCallback;
