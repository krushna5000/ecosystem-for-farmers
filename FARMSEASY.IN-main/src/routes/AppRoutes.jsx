import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "../pages/Landing/Landing";
import Teams from "../pages/Team/Teams";
import Careers from "../pages/Careers/Careers";
import Login from "../pages/AdminCareers/Login";
import ProtectedRoute from "../routes/ProtectedRoute";
import PublicRoute from "./PublicRoute";
import { AuthProvider } from "../context/AuthContext";
import UserBlogs from "../components/UserBlogs/UserBlogs";
import AdminLayout from "../layout/AdminLayout";
import ComingSoon from "../pages/CoomingSoon";

// Admin Pages
import AllJobs from "../components/AllJobs/AllJobs";
import FormData from "../components/FormData/FormData";
import ConnectedUser from "../components/ConnectedUser/ConnectedUser";
import Blog from "../components/Blog/Blog";
import TeamManagement from "../components/TeamManagement/TeamManagement";
import PrivacyAndPolicy from "../components/PrivacyAndPolicy/PrivacyAndPolicy";
import AboutUs from "../components/AboutUs/AboutUs";
import TermsOfService from "../components/TermsOfServices/TermsOfServices";
import CropAIPage from "../components/CropAI/CropAIPage";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/team" element={<Teams />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/blogs" element={<UserBlogs />} />
        <Route path="/blogs/:id" element={<UserBlogs />} />
        <Route path="about-us" element={<AboutUs />} />
        <Route path="/privacy_policy" element={<PrivacyAndPolicy />} />
        <Route path="/termsforservices" element={<TermsOfService />} />
        <Route path="/product-recommendation/coming-soon" element={<ComingSoon />} />
        <Route path="/saas/coming-soon" element={<ComingSoon />} />
        <Route path="/launchpad/coming-soon" element={<ComingSoon />} />
        <Route path="/crop-life-cycle/coming-soon" element={<ComingSoon />} />
        <Route path="/crop-disease-detection" element={<CropAIPage />} />

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Admin Layout */}
        <Route
          path="/admin/careers"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Default redirect */}
          <Route index element={<Navigate to="all-jobs" />} />

          <Route path="all-jobs" element={<AllJobs />} />
          <Route path="post-job" element={<FormData />} />
          <Route path="connected-users" element={<ConnectedUser />} />
          <Route path="blogs" element={<Blog />} />
          <Route path="team-management" element={<TeamManagement />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
