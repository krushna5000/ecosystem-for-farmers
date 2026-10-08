import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { domain } from "../../utils/domain";
import background from "../../assets/background.png"; // use your correct path
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = { email, password };

      const response = await axios.post(`${domain}/login`, data, {
        withCredentials: true,
        headers: { Accept: "application/json" },
      });
      if (response.data.success) {
        toast.success("Logged in successfully!");
        login();
        navigate("/admin/careers");
      }
    } catch (error) {
      // 🌟 More Detailed Error Handling
      if (error.response) {
        // Server responded but status code is not 2xx
        const msg = error.response.message || "Invalid credentials!";
        toast.error(msg);
      } else if (error.request) {
        // Request was made but no response
        toast.error("Server not responding. Please try again.");
      } else {
        // Anything else
        toast.error("Something went wrong. Try again later.");
      }

      console.log("LOGIN ERROR:", error);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh",
      }}
      className="flex flex-col justify-center gap-10 px-4"
    >
      {/* Heading Section */}
      <div className="w-full md:w-[60%] lg:w-[50%] xl:w-[80%] mt-20">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white font-bold drop-shadow-xl">
          Welcome To FarmsEasy
        </h1>

        <p className="text-lg sm:text-xl lg:text-2xl text-white font-semibold mt-2 drop-shadow-xl">
          Revolutionizing Agriculture Through Innovation
        </p>
      </div>

      {/* Form Section */}
      <div className="w-full flex md:justify-center lg:justify-end xl:justify-end xl:mb-50">
        <form
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/30 border border-white/50 shadow-2xl 
                     rounded-3xl p-8 sm:p-10 w-full max-w-sm sm:max-w-md xl:mr-50 
                     flex flex-col gap-6 animate-fadeIn"
        >
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
              FarmsEasy Admin
            </h1>

            <p className="text-white/90 text-xs sm:text-sm font-medium">
              Sign in to your <strong>Admin</strong> Dashboard
            </p>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-white font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email"
              className="bg-white/40 border border-white/60 p-3 rounded-xl 
                         text-black placeholder-black/60 
                         focus:outline-none focus:ring-2 focus:ring-[#CBFF2E] transition"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2 relative">
            <label htmlFor="password" className="text-white font-medium">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="bg-white/40 border border-white/60 p-3 rounded-xl
                         text-black placeholder-black/60
                         focus:outline-none focus:ring-2 focus:ring-[#CBFF2E] transition pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[66%]  -translate-y-1/2 text-black cursor-pointer"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!email || !password}
            className={`${!email || !password ? "opacity-80 cursor-not-allowed" : ""
              } bg-[#CBFF2E] hover:bg-[#b5fd32] text-black font-semibold px-6 py-3 
             rounded-full shadow-lg transition-transform transform hover:scale-105 cursor-pointer`}
          >
            Login
          </button>

          <p className="text-center text-white/80 text-xs">
            © {new Date().getFullYear()} FarmsEasy · All Rights Reserved
          </p>
        </form>
      </div>
    </div>
  );
}
