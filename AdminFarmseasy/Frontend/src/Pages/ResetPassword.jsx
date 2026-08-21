import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import FarmsEasy from "../assets/FarmsEasy.jpeg"

const ResetPassword = () => {
  const { token, role } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const url =
        role === "company"
          ? `${BASE_URL}/companies/company/reset-password/${token}`
          : `${BASE_URL}/vendors/reset-password/${token}`;

      console.log("URL:", url);
      console.log("Body:", { newPassword: newPassword });

      const response = await axios.post(url, { newPassword });
      console.log(response.data);

      setSuccess("Password reset successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-200 to-lime-50 px-4">
      <div className="w-full max-w-md">

        <div className="flex justify-center mb-6">
          <img
            src={FarmsEasy}
            alt="Farmseasy"
            className="w-28 h-28 object-cover rounded-full shadow-lg"
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter a new password to secure your account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            {/* Input fields */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-lime-400 focus:ring focus:ring-lime-200 outline-none transition"
                placeholder="Enter new password"
              />
              <span className="absolute right-3 top-11 -translate-y-1/2 cursor-pointer text-gray-400" onClick={() => setShowNew(prev => !prev)}>
                {showNew ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </span>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-lime-400 focus:ring focus:ring-lime-200 outline-none transition"
                placeholder="Confirm new password"
              />
              <span className="absolute right-3 top-11 -translate-y-1/2 cursor-pointer text-gray-400" onClick={() => setShowConfirm(prev => !prev)}>
                {showConfirm ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </span>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-white bg-lime-500 hover:bg-lime-600 rounded-xl font-semibold transition disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
