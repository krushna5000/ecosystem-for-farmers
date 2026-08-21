
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FiChevronDown, FiLogOut, FiMenu } from "react-icons/fi";

// import profilePlaceholder from "../../Assets/Images/profile.jpg";
// import API_BASE_URL from "../../config"; // ✅ Import base URL

// export const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
//   const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     try {
//       const storedUser = localStorage.getItem("user");
//       if (storedUser) {
//         setUser(JSON.parse(storedUser));
//       }
//     } catch (error) {
//       console.error("Error parsing user data from localStorage:", error);
//     }
//   }, []);

//   const logoutCleanup = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     sessionStorage.clear();
//     caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
//     setUser(null);
//     navigate("/", { replace: true });
//   };

//   const handleLogout = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         logoutCleanup();
//         return;
//       }

//       await fetch(`${API_BASE_URL}/logout`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       logoutCleanup();
//     } catch {
//       alert("Logout error. Try again.");
//       logoutCleanup();
//     }
//   };

//   return (
//     <header className="bg-white/60 backdrop-blur-md border-b border-gray-200 shadow-sm h-20 w-full px-10 sticky top-0 z-50 flex justify-between items-center">
//       {/* Left - Logo and Menu */}
//       <div className="flex items-center gap-2">
//         <button
//           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//           className="text-blue-600 hover:text-blue-800 transition"
//         >
//           <FiMenu size={24} />
//         </button>
//         <h2 className="text-lg font-semibold text-gray-800">Super Admin</h2>
//       </div>

//       {/* Right - User Dropdown */}
//       <div className="flex items-center gap-6">
//         <div className="relative">
//           <button
//             onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
//             className="flex items-center gap-3"
//           >
//             <img
//               src={user?.photo || profilePlaceholder}
//               alt="User"
//               className="h-9 w-9 rounded-full object-cover shadow-sm"
//             />
//             <span className="text-gray-700 hidden md:inline font-medium">
//               {user?.name || "SuperAdmin"}
//             </span>
//             <FiChevronDown className="text-gray-600" />
//           </button>

//           {isUserDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg z-50 animate-fadeIn">
//               <div className="px-4 py-2 text-gray-700 hover:bg-blue-50 cursor-pointer transition">
//                 Settings
//               </div>
//               <div
//                 className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer transition"
//                 onClick={() => {
//                   handleLogout();
//                   setIsUserDropdownOpen(false);
//                 }}
//               >
//                 <FiLogOut className="mr-2" /> Logout
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiLogOut, FiMenu } from "react-icons/fi";

import profilePlaceholder from "../../Assets/Images/profile.jpg";
import API_BASE_URL from "../../config";

export const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
    }
  }, []);

  const logoutCleanup = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
    } catch (error) {
      console.error("Error during logout cleanup:", error);
    } finally {
      setUser(null);
      navigate("/", { replace: true });
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        await logoutCleanup();
        return;
      }

      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      await logoutCleanup();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout error. Try again.");
      await logoutCleanup();
    }
  };

  return (
    <header className="bg-white/60 backdrop-blur-md border-b border-gray-200 shadow-md h-20 w-full px-8 md:px-10 sticky top-0 z-50 flex justify-between items-center transition-all">
      
      {/* Left - Logo and Menu */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-teal-600 hover:text-teal-800 p-2 rounded-lg hover:bg-teal-50 transition-all shadow-sm"
        >
          <FiMenu size={24} />
        </button>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 tracking-wide">
          Super Admin
        </h2>
      </div>

      {/* Right - User Dropdown */}
      <div className="flex items-center gap-4 md:gap-6 relative">
        <button
          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          className="flex items-center gap-2 md:gap-3 bg-teal-50/70 backdrop-blur-sm px-3 py-1 rounded-full hover:shadow-lg transition-all border border-teal-200"
        >
          <img
            src={user?.photo || profilePlaceholder}
            alt="User"
            className="h-9 w-9 rounded-full object-cover border border-gray-200 shadow-sm"
          />
          <span className="text-teal-800 hidden md:inline font-medium">
            {user?.name || "SuperAdmin"}
          </span>
          <FiChevronDown className={`text-teal-600 transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {isUserDropdownOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white/90 backdrop-blur-md rounded-xl shadow-lg z-50 animate-fadeIn ring-1 ring-gray-200">
            <div className="px-4 py-2 text-gray-700 hover:bg-teal-50 cursor-pointer transition-colors rounded-lg font-medium">
              Settings
            </div>
            <div
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-100 cursor-pointer transition-colors rounded-lg font-medium"
              onClick={() => {
                handleLogout();
                setIsUserDropdownOpen(false);
              }}
            >
              <FiLogOut className="mr-2" /> Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
