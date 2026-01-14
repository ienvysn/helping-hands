import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgetPassword";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/VolunteerProfile";
import VolDashboard from "./pages/VolunteerDashbaord";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import OrganizationProfile from "./pages/OrganizationProfile";
import Notification from "./pages/Notification";
import MyEvents from "./pages/MyEvents"; 

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import EventDetail from "./pages/EventDetail";
import VolunteerOpportunity from "./pages/VolunteerOpportunity";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (Redirect to Dashboard if logged in) */}
        <Route element={<PublicRoute />}>

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes (Redirect to Login if NOT logged in) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<VolDashboard />} />
          <Route path="/opportunities" element={<VolunteerOpportunity />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/organization-profile" element={<OrganizationProfile />} />
          <Route
            path="/organization-dashboard"
            element={<OrganizationDashboard />}
          />
          <Route path="/opportunities/:id" element={<EventDetail />} />
        </Route>

        {/* Shared / Unprotected / Callback */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/call back" element={<AuthCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
