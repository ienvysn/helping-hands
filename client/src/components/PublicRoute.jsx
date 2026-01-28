import { Navigate, Outlet } from "react-router-dom";
import { isTokenExpired } from "../utils/authUtils";

const PublicRoute = () => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  if (token && userString) {
    // Check if token is expired
    if (isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      return <Outlet />;
    }

    try {
      const user = JSON.parse(userString);
      if (user.userType === "organization") {
        return <Navigate to="/organization-dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    } catch (e) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Outlet />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;
