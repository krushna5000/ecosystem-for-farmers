import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
// import { domain } from "../utils/domain";
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

      const response = await api.post("/vendor/login", data);

      if (response.status === 200) {
        toast.success("Logged in successfully!");
        localStorage.setItem("vendorID", response.data.vendor.id);

        navigate("/vendor/dashboard");
      }
    } catch (error) {
      toast.error("Invalid credentials");
      console.log({ error });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-center text-gray-800">
            Welcome to FarmsEasy
          </h1>

          <p className="text-sm text-center text-gray-500">
            Sign In to your FarmsEasy <strong>Vendor</strong> Dashboard
          </p>
        </div>

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
              className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 w-full pr-10"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!email || !password}
          className={`${
            !email || !password ? "opacity-60 cursor-not-allowed" : ""
          } bg-[#CBFF2E] hover:bg-[#8eb102d7] text-black font-semibold px-6 py-2 rounded-full shadow-md transition duration-200`}
        >
          Login
        </button>
      </form>
    </div>
  );
}
