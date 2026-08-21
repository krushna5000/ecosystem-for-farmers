import React, { useState } from "react";
import { createConnection } from "../../api/connection.js";
import toast from "react-hot-toast";

function Form({ className = "" }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    query: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      setFormData({ ...formData, mobile: value.replace(/\D/g, "") });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!mobileRegex.test(formData.mobile))
      newErrors.mobile = "Enter valid 10-digit number";

    if (!formData.query.trim()) newErrors.query = "Message cannot be empty";

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length !== 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);
      const res = await createConnection(formData);
      toast.success(res.message || "Message sent successfully");
      setFormData({ name: "", email: "", mobile: "", query: "" });
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-8 ${className}`}
    >
      <div className="w-full max-w-6xl">
        <div className="grid md:grid-cols-2 gap-5 md:gap-8 items-start">
          {/* ================= INFO SECTION (FIRST ON MOBILE) ================= */}
          <div className="space-y-8 md:sticky md:top-8 order-1 md:order-1">
            <div className="space-y-4">
              <span className="inline-block bg-[#CBFF2E] text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                Get in Touch
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl  font-bold text-gray-900 leading-tight">
                Let's Start a
                <span className="block bg-gradient-to-r from-[#CBFF2E] to-[#9ed10b] bg-clip-text text-transparent mt-2">
                  Conversation
                </span>
              </h1>

              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                Have a question or want to work together? We're here to help
                bring your ideas to life.
              </p>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-[#CBFF2E]/20 p-2 md:p-3 rounded-lg md:rounded-xl">
                    <svg
                      className="w-6 h-6 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />{" "}
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-1">
                      Email Us
                    </h3>
                    <a
                      href="mailto:app@farmseasy.in"
                      className="hover:text-green-600 transition"
                    >
                      app@farmseasy.in
                    </a>
                  </div>
                </div>
              </div>

              {/* Call */}
              <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-[#CBFF2E]/20 p-2 md:p-3 rounded-lg md:rounded-xl">
                    <svg
                      className="w-6 h-6 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />{" "}
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-1">
                      Call Us
                    </h3>
                    <a
                      href="tel:+919665333037"
                      className="hover:text-green-600 transition"
                    >
                      (+91) 96653 33037
                    </a>
                  </div>
                </div>
              </div>

              {/* Visit */}
              <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-[#CBFF2E]/20 p-2 md:p-3 rounded-lg md:rounded-xl">
                    <svg
                      className="w-6 h-6 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />{" "}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />{" "}
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-1">
                      Visit Us
                    </h3>
                    <a
                      href="https://www.google.com/maps?q=C+Wing+604,+Sutgirni+Chowk,+Chhatrapati+Sambhajinagar,+India"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-600 transition"
                    >
                      <p className="text-sm text-gray-600">
                        C Wing 604, Sutgirni Chowk, Chhatrapati Sambhajinagar,
                        India
                      </p>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= FORM SECTION ================= */}
          <div className="bg-white border border-gray-200 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl order-2 md:order-2">
            <div className="space-y-6">
              {["name", "email", "mobile"].map((field) => (
                <div key={field}>
                  <label className="text-sm font-semibold text-gray-700">
                    {field === "name"
                      ? "Full Name"
                      : field === "email"
                      ? "Email Address"
                      : "Mobile Number"}{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    maxLength={field === "mobile" ? 10 : undefined}
                    className={`w-full mt-1 px-4 py-3 rounded-xl border ${
                      errors[field] ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-[#CBFF2E] outline-none`}
                  />

                  {errors[field] && (
                    <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="query"
                  rows="4"
                  value={formData.query}
                  onChange={handleChange}
                  className={`w-full mt-1 px-4 py-3 rounded-xl border ${
                    errors.query ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-[#CBFF2E] outline-none resize-none`}
                />
                {errors.query && (
                  <p className="text-xs text-red-500 mt-1">{errors.query}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#CBFF2E] to-[#9ed10b] py-4 rounded-xl font-bold hover:scale-[1.02] transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

              <p className="text-center text-gray-500 text-sm">
                We'll respond within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Form;
