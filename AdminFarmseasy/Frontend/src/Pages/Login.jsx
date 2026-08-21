import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Use environment variable for backend URL
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { email, password };
      const response = await axios.post(`${BACKEND_URL}/login`, data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // ensures cookies are sent/received
      });

      if (response.status === 200) {
        toast.success("Logged in successfully!");
        navigate("/admin");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          "Login failed. Check your credentials!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src={new URL("../assets/Backgroundvideo.mp4", import.meta.url).href}
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-black/30"></div>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm flex flex-col gap-5"
      >
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-center text-gray-800">
            Welcome to FarmsEasy
          </h1>
          <p className="text-sm text-center text-gray-500">
            Login to your FarmsEasy <strong>Admin</strong> Dashboard
          </p>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Email"
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2"
            required
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              tabIndex={-1} // optional: skip tab focus
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!email || !password || loading}
          className={`${
            !email || !password || loading
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer"
          } bg-[#CBFF2E] hover:bg-[#8eb102d7] text-black font-semibold px-6 py-2 rounded-full shadow-md transition duration-200`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
