
// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// import { Login } from './Pages/Login/Login';
// import { Dashboard } from './Pages/Dashboard/Dashboard';
// import { Home } from './Pages/Home/Home';
// import User from './Pages/Dashboard/User';
// import Crop from './Pages/Dashboard/Crop';
// import CropCategoryPage from './Pages/Dashboard/CropCategoryPage';
// import CropStages from './Pages/Dashboard/CropStages'; 
// import PincodeManager from './Pages/Dashboard/PincodeManager';
// import CropDetails from './Components/CropDetails';
// import StageDetailsPage from './Components/StageDetailsPage';

// const LoginMiddleware = () => {
//   const isAuthenticated = !!localStorage.getItem('token');
//   return isAuthenticated ? <Navigate to="/Dashboard" /> : <Login />;
// };

// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = !!localStorage.getItem('token');
//   if (!isAuthenticated) {
//     alert("Session expired. Please login again.");
//     return <Navigate to="/Login" />;
//   }
//   return children;
// };

// export const App = () => {
//   return (
//     <div>
//       <BrowserRouter>
     
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/Home" element={<Home />} />
//           <Route path="/Login" element={<LoginMiddleware />} />
//           <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//           <Route path="/User" element={<ProtectedRoute><User /></ProtectedRoute>} />
//           <Route path="/Crop" element={<ProtectedRoute><Crop /></ProtectedRoute>} />
//           <Route path="/Crop/:id" element={<ProtectedRoute><CropDetails /></ProtectedRoute>} />
//           <Route path="/CropCategoryPage" element={<ProtectedRoute><CropCategoryPage /></ProtectedRoute>} />
//           <Route path="/CropStages" element={<ProtectedRoute><CropStages /></ProtectedRoute>} />
//           <Route path="/stages/:categoryId" element={<ProtectedRoute><StageDetailsPage /></ProtectedRoute>} />
//           <Route path="/PincodeManager" element={<ProtectedRoute><PincodeManager /></ProtectedRoute>} />
//         </Routes>
//       </BrowserRouter>
//     </div>
//   );
// };


import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { Login, setupAxiosInterceptors, tokenUtils } from './Pages/Login/Login';
import { Dashboard } from './Pages/Dashboard/Dashboard';
import { Home } from './Pages/Home/Home';
import User from './Pages/Dashboard/User';
import Crop from './Pages/Dashboard/Crop';
import CropCategoryPage from './Pages/Dashboard/CropCategoryPage';
import CropStages from './Pages/Dashboard/CropStages';
import PincodeManager from './Pages/Dashboard/PincodeManager';
import CropDetails from './Components/CropDetails';
import StageDetailsPage from './Components/StageDetailsPage';

// Global axios interceptor setup component
const GlobalInterceptorSetup = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    setupAxiosInterceptors(navigate);
  }, [navigate]);
  
  return null;
};

// Enhanced Login Middleware with token expiration check
const LoginMiddleware = () => {
  const token = tokenUtils.getToken();
  
  // If token exists and is valid, redirect to dashboard
  if (token && !tokenUtils.isTokenExpired(token)) {
    return <Navigate to="/Dashboard" replace />;
  }
  
  // If token exists but is expired, clear it and show login with message
  if (token && tokenUtils.isTokenExpired(token)) {
    tokenUtils.clearAuthData();
  }
  
  return <Login />;
};

// Enhanced Protected Route with proper token validation
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check token validity on component mount
    const isValid = tokenUtils.checkTokenAndRedirect(navigate);
    
    if (!isValid) {
      return;
    }

    // Set up periodic token check (every minute)
    const tokenCheckInterval = setInterval(() => {
      const currentToken = tokenUtils.getToken();
      if (!currentToken || tokenUtils.isTokenExpired(currentToken)) {
        tokenUtils.clearAuthData();
        clearInterval(tokenCheckInterval);
        navigate('/Login', { replace: true });
      }
    }, 60000); // Check every minute

    return () => clearInterval(tokenCheckInterval);
  }, [navigate]);

  const token = tokenUtils.getToken();
  
  // If no token or token is expired, redirect to login
  if (!token || tokenUtils.isTokenExpired(token)) {
    tokenUtils.clearAuthData();
    return <Navigate to="/Login" replace />;
  }

  return children;
};

// Main App component
export const App = () => {
  return (
    <div>
      <BrowserRouter>
        {/* Setup global axios interceptors */}
        <GlobalInterceptorSetup />
        
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Login" element={<LoginMiddleware />} />
          
          {/* Protected routes */}
          <Route 
            path="/Dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/User" 
            element={
              <ProtectedRoute>
                <User />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/Crop" 
            element={
              <ProtectedRoute>
                <Crop />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/Crop/:id" 
            element={
              <ProtectedRoute>
                <CropDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/CropCategoryPage" 
            element={
              <ProtectedRoute>
                <CropCategoryPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/CropStages" 
            element={
              <ProtectedRoute>
                <CropStages />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/stages/:categoryId" 
            element={
              <ProtectedRoute>
                <StageDetailsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/PincodeManager" 
            element={
              <ProtectedRoute>
                <PincodeManager />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};