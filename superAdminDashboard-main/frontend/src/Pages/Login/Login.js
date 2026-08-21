

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import API_BASE_URL from "../../config"; // ✅ Path to your config file

// export const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       navigate("/dashboard", { replace: true });
//     }
//   }, [navigate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     if (!email || !password) {
//       setError("All fields are required.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await axios.post(`${API_BASE_URL}/login`, {
//         email,
//         password,
//       });

//       const { token, user } = res.data;

//       if (token) {
//         localStorage.setItem("token", token);
//         localStorage.setItem("user", JSON.stringify(user));
//         navigate("/dashboard", { replace: true });
//       } else {
//         throw new Error("Invalid response from server");
//       }
//     } catch (err) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");

//       if (err.response && err.response.status === 401) {
//         setError("Invalid token. Please log in again.");
//         navigate("/login");
//       } else {
//         setError(err.response?.data?.message || "Login failed. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-teal-500 px-4">
//       <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl border border-white/20 text-white">
//         <h2 className="text-3xl font-extrabold text-center">Admin Login</h2>

//         {error && (
//           <p className="mt-4 text-center text-red-300 font-semibold">{error}</p>
//         )}

//         <form onSubmit={handleSubmit} className="mt-6 space-y-6">
//           <div>
//             <label className="block text-sm font-medium">Email</label>
//             <input
//               type="email"
//               className="w-full mt-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/30"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium">Password</label>
//             <input
//               type="password"
//               className="w-full mt-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/30"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full py-3 bg-white text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 transition duration-300"
//             disabled={loading}
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };



import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config"; // ✅ Path to your config file

// Token utility functions
export const tokenUtils = {
  // Check if token is expired
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Clear all auth data
  clearAuthData: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Check token validity and redirect if expired
  checkTokenAndRedirect: (navigate) => {
    const token = tokenUtils.getToken();
    if (!token || tokenUtils.isTokenExpired(token)) {
      tokenUtils.clearAuthData();
      navigate("/Login", { replace: true });
      return false;
    }
    return true;
  }
};

// Axios interceptor for handling token expiration globally
export const setupAxiosInterceptors = (navigate) => {
  // Clear existing interceptors to avoid duplicates
  axios.interceptors.request.clear();
  axios.interceptors.response.clear();

  // Request interceptor to add token to headers
  axios.interceptors.request.use(
    (config) => {
      const token = tokenUtils.getToken();
      if (token && !tokenUtils.isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token expired or invalid
        tokenUtils.clearAuthData();
        navigate("/Login", { replace: true });
      }
      return Promise.reject(error);
    }
  );
};

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in with valid token
    const token = tokenUtils.getToken();
    if (token && !tokenUtils.isTokenExpired(token)) {
      navigate("/Dashboard", { replace: true });
    } else if (token && tokenUtils.isTokenExpired(token)) {
      // Clear expired token
      tokenUtils.clearAuthData();
      setError("Your session has expired. Please log in again.");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/login`, {//changes done my me here
        email,
        password,
      });

      const { token, user } = res.data;

      if (token) {
        // Verify token is not expired before storing
        if (tokenUtils.isTokenExpired(token)) {
          throw new Error("Received expired token from server");
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/Dashboard", { replace: true });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      tokenUtils.clearAuthData();

      if (err.response && err.response.status === 401) {
        setError("Invalid credentials. Please try again.");
      } else if (err.response && err.response.status === 403) {
        setError("Access denied. Please contact administrator.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-teal-500 px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl border border-white/20 text-white">
        <h2 className="text-3xl font-extrabold text-center">Admin Login</h2>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-400/30">
            <p className="text-center text-red-200 font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/30 transition-all duration-200"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 rounded-lg bg-white/20 border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/30 transition-all duration-200"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-white text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};