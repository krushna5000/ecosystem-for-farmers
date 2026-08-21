import axios from "axios";
import { toast } from "react-hot-toast";
import { Phone } from "lucide-react";
import Logo from "../assets/FarmsEasy.jpeg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React, { useEffect, useState } from "react";
import OtpScreen from "../components/Auth/OtpScreen";

export default function Login() {
  const OTP_LENGTH = 6;
  const { user } = useAuth();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const domain = "http://localhost:5004/api";
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));

  useEffect(() => {
    if (user) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [user]);

  // SEND OTP (LOGIN)
  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      toast.error("Enter valid 10-digit number");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${domain}/auth/login/send-otp`, {
        phone_number: mobile,
      });

      alert(res.data.otp);
      if (res.data.success) {
        toast.success(res.data.message);
        setOtpSent(true);
        setIsNewUser(false);
      }
    } catch (err) {
      if (err?.response?.data?.message?.includes("register")) {
        setIsNewUser(true);
      } else {
        toast.error("Failed to send OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  // SEND OTP (REGISTER)
  const handleSendRegisterOtp = async () => {
    if (!name.trim()) {
      toast.error("Enter your full name");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${domain}/auth/register/send-otp`,
        { phone_number: mobile, full_name: name },
        { headers: { "X-User-Type": "webapp" } }
      );

      alert(res.data.otp);

      if (res.data.success) {
        toast.success(res.data.message);
        setOtpSent(true);
      }
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== OTP_LENGTH) {
      toast.error("Enter complete OTP");
      return;
    }

    setLoading(true);
    try {
      const url = isNewUser
        ? `${domain}/auth/register/verify-otp`
        : `${domain}/auth/login/verify-otp`;

      const res = await axios.post(
        url,
        { phone_number: mobile, otp: finalOtp },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setUser(res.data.user);
        navigate("/app/dashboard");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-8 text-white">
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="logo" className="w-24 h-24 rounded-full" />
        </div>
        <h1 className="text-3xl font-semibold text-center mb-2">Login</h1>
        <p className="text-xs text-center text-white/70 mb-6">
          Welcome back to FarmsEasy
        </p>
        {!otpSent ? (
          <>
            {/* Phone */}
            <div className="mb-4">
              <label htmlFor="mobile" className="text-sm text-white/80">
                Mobile Number
              </label>
              <div className="flex items-center bg-white/5 border border-white/20 rounded-lg p-3 mt-1">
                <Phone size={18} className="mr-2 text-white/50" />
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  autoFocus
                  placeholder="Enter Mobile Number"
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className="bg-transparent outline-none w-full text-white"
                />
              </div>
            </div>

            {isNewUser && (
              <div className="mb-4">
                <label htmlFor="name" className="text-sm text-white/80">
                  Your Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white"
                />
              </div>
            )}

            <button
              onClick={isNewUser ? handleSendRegisterOtp : handleSendOtp}
              disabled={loading}
              className="w-full bg-green-500 py-2 rounded-lg cursor-pointer"
            >
              Send OTP
            </button>
          </>
        ) : (
          <OtpScreen
            otp={otp}
            setOtp={setOtp}
            loading={loading}
            phone={`+91 ${mobile.slice(0, 2)}****${mobile.slice(-2)}`}
            onVerify={handleVerifyOtp}
            onResend={isNewUser ? handleSendRegisterOtp : handleSendOtp}
          />
        )}
      </div>
    </div>
  );
}
