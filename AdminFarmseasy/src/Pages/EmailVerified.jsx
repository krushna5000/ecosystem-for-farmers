import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import FarmsEasy from "../assets/FarmsEasy.jpeg";

const EmailVerified = () => {
  const { token, role } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [newToken, setNewToken] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const BASE_URL = import.meta.env.VITE_BACKEND_URL;

        const url =
          role === "company"
            ? `${BASE_URL}/companies/company/verify-email/${token}`
            : `${BASE_URL}/vendors/verify-email/${token}`;

        console.log("Verifying email URL:", url);

        const response = await axios.get(url);
        console.log("Verification response:", response.data);

        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
        // Use the new token from response, or check if we already have a valid token
        if (response.data.token) {
          setNewToken(response.data.token);
        } else if (response.data.message?.includes("already verified")) {
          // If already verified, we need to get the current valid token
          // The user should use the link from their email instead
          setNewToken("");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Email verification failed. The link may be invalid or expired."
        );
      }
    };

    if (token && role) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("Invalid verification link");
    }
  }, [token, role]);

  const handleSetPassword = () => {
    navigate(`/reset-password/${role}/${newToken || token}`);
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
          <h1 className="text-3xl font-bold text-gray-800">
            {status === "loading"
              ? "Verifying..."
              : status === "success"
              ? "Email Verified!"
              : "Verification Failed"}
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {status === "loading" && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <p className="text-gray-600 mb-6">{message}</p>

              <button
                onClick={handleSetPassword}
                className="w-full py-3 text-white bg-lime-500 hover:bg-lime-600 rounded-xl font-semibold transition"
              >
                Set Password
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>

              <p className="text-gray-600 mb-6">{message}</p>

              <button
                onClick={() => navigate("/")}
                className="w-full py-3 text-white bg-gray-500 hover:bg-gray-600 rounded-xl font-semibold transition"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerified;