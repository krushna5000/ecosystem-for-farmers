import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { loginDomain } from "../utils/loginDomain";
import { api } from "../api/api";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const data = { email, password };
      console.log("Form Data:", data);

      const response = await axios.post(`${loginDomain}/company/login`, data, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
        },
      });
      if (response.status === 200) {
        toast.success("Logged in successfully!");

        console.log({ response });
        navigate("/company/dashboard");
      }
    } catch (error) {
      toast.error("Invalid credentials");
      console.log({ error });
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-white">
      {/* Left Side - Deep Green Brand Area */}
      <div className="hidden lg:flex lg:w-[60%] bg-[#2D4A22] flex-col justify-between p-12 lg:p-16 relative overflow-hidden">
        <div className="z-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-wide">
            FarmsEasy
          </h1>
          <p className="text-[#CBFF2E] font-medium mt-2">Company Portal</p>
        </div>

        <div className="w-full max-w-md mx-auto my-8 relative z-10 flex-grow flex items-center justify-center">
          <img
            src="/undraw_authentication_1evl.svg"
            alt="Agritech Authentication"
            className="w-full h-auto drop-shadow-none xl:scale-110 transition-transform duration-500"
          />
        </div>

        <div className="z-10 text-white opacity-90 max-w-lg mb-4">
          <h2 className="text-2xl lg:text-3xl font-semibold mb-3">
            Streamline Your Products
          </h2>
          <p className="text-base leading-relaxed text-gray-200">
            Access your dashboard to manage inventory, sales, and analytics in
            real-time.
          </p>
        </div>

        {/* Subtle decorative flat background shapes */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#CBFF2E] opacity-[0.03] rounded-full translate-y-1/3 -translate-x-1/4"></div>
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-white opacity-[0.02] rounded-full -translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[40%] p-8 sm:p-12 lg:p-10 xl:p-16 bg-white flex flex-col justify-center relative">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm mx-auto flex flex-col gap-6 relative z-10"
        >
          {/* Mobile Title (hidden on desktop) */}
          <div className="lg:hidden flex flex-col gap-1 mb-4">
            <h1 className="text-4xl font-bold text-[#2D4A22] tracking-wide">
              FarmsEasy
            </h1>
            <p className="text-[#7ea802] font-semibold text-sm uppercase tracking-wider mt-1">
              Company Portal
            </p>
          </div>

          <div className="flex flex-col gap-2 mb-4 mt-2 lg:mt-0">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2937]">
              Welcome back
            </h2>
            <p className="text-base text-[#6B7280]">
              Please enter your details to sign in.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="font-medium text-[#374151] text-sm"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#1F2937] p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CBFF2E] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="font-medium text-[#374151] text-sm"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#1F2937] p-4 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CBFF2E] focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={20} strokeWidth={2} />
                ) : (
                  <Eye size={20} strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!email || !password}
            className={`${
              !email || !password
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#b5e629] active:scale-[0.99]"
            } mt-6 w-full bg-[#CBFF2E] text-[#2D4A22] font-bold text-[16px] py-4 rounded-xl transition-all shadow-sm`}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
