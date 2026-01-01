import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  if (token && userString) {
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
    }
  }

  return <Outlet />;
};

export default PublicRoute;
