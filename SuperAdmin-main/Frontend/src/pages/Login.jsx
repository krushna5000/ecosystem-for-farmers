import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { domain } from "../utils/domain";
// import LoginBg from "../assets/login-Bg.png";
import LoginBg from "../assets/loginBg.png";
import { Eye, EyeClosed } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/superadmin/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!email.endsWith("@farmseasy.in")) {
        toast.error("Email must end with @farmseasy.in");
        return;
      }

      const data = { email, password };

      const response = await axios.post(`${domain}/superadmin/login`, data, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success("Logged in successfully!");
        login();
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-end bg-cover md:bg-center relative md:px-20 p-8"
      style={{
        backgroundImage: `url(${LoginBg})`,
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white backdrop-blur-xl shadow-2xl rounded-2xl p-8 w-full max-w-sm flex flex-col gap-5 border border-white/30"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-center text-gray-700">
            Welcome to FarmsEasy
          </h1>

          <p className="text-sm text-center text-gray-500">
            Sign In to your FarmsEasy <strong>SuperAdmin</strong> Dashboard
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-medium text-gray-600">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Email"
            className="border border-gray-700 p-2 rounded-md focus:outline-none focus:ring-1"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="font-medium text-gray-600">
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="border border-gray-700 p-2 rounded-md w-full pr-10 focus:outline-none focus:ring-1"
              required
            />

            {/* Eye Button */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
            >
              {showPassword ? <Eye /> : <EyeClosed />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!email || !password}
          className={`${
            !email || !password
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer"
          } bg-[#CBFF2E] hover:bg-[#8eb102d7] text-black font-semibold px-6 py-2 rounded-full shadow-md transition duration-200`}
        >
          Login
        </button>
      </form>
    </div>
  );
}
