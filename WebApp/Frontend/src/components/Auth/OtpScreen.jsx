import { useEffect, useRef, useState } from "react";
import { CheckCircle, Timer } from "lucide-react";

export default function OtpScreen({
  otp,
  setOtp,
  onVerify,
  onResend,
  loading,
  phone,
}) {
  const OTP_LENGTH = otp.length;
  const [timer, setTimer] = useState(30);
  const inputsRef = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every((d) => d !== "");

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white text-center">
        Verify Account
      </h2>

      <p className="text-sm text-white/60 text-center mt-2">
        We sent a code to <span className="text-white">{phone}</span>
      </p>

      {/* OTP Boxes */}
      <div className="flex justify-between gap-2 mt-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="
              h-12 w-12 text-center text-lg font-semibold
              rounded-lg bg-white/5 border border-white/20
              text-white outline-none
              focus:border-green-500 focus:ring-1 focus:ring-green-500
            "
          />
        ))}
      </div>

      {/* Resend */}
      <div className="mt-6 text-center">
        {timer > 0 ? (
          <div className="inline-flex items-center gap-2 text-sm text-green-400 bg-green-400/10 px-4 py-2 rounded-full">
            <Timer size={14} />
            Resend code in 00:{timer.toString().padStart(2, "0")}
          </div>
        ) : (
          <button
            onClick={() => {
              setTimer(30);
              onResend();
            }}
            className="text-green-400 font-medium cursor-pointer hover:underline"
          >
            Resend Code
          </button>
        )}
      </div>

      {/* Verify */}
      <button
        disabled={!isComplete || loading}
        onClick={onVerify}
        className={`
          w-full mt-6 py-3 rounded-xl font-semibold cursor-pointer flex
          items-center justify-center gap-2
          ${
            isComplete
              ? "bg-green-500 hover:bg-green-600 text-black"
              : "bg-green-500/30 text-black/40 cursor-not-allowed"
          }
        `}
      >
        {loading ? "Verifying..." : "Verify Now"}
        {isComplete && !loading && <CheckCircle size={18} />}
      </button>
    </div>
  );
}
