import { ArrowRight } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ActionButton from "../ActionButton";
import { Mail, Phone, Linkedin } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();

  const products = [
    {
      name: "Product Recommendation Engine",
      path: "/product-recommendation/coming-soon",
      comingSoon: true,
    },
    {
      name: "FarmsEasy SaaS model",
      path: "/saas/coming-soon",
      comingSoon: true,
    },
    {
      name: "Launch Pad",
      path: "/launchpad/coming-soon",
      comingSoon: true,
    },
    {
      name: "Crop Life Cycle AI",
      path: "/crop-life-cycle/coming-soon",
      comingSoon: true,
    },
    {
      name: "Crop Disease Detection AI",
      path: "/crop-disease-detection",
      comingSoon: false,
    },
  ];

  const handleClick = (sectionId) => {
    navigate("/"); // home route
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
  };

  return (
    <footer className="bg-white py-10 text-gray-700">
      <div
        className="max-w-7xl mx-auto px-12 
      grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-[1fr_1fr_2fr_1fr_1fr]
      gap-14 items-start"
      >
        {/* Column 1 */}
        <div className="min-w-[180px]">
          <h3 className="font-semibold mb-4">FarmsEasy</h3>
          <ul className="text-black font-semibold md:text-sm space-y-2">
            <li>
              We are on a mission to transform agriculture by combining
              innovation and technology to support farmers worldwide.
            </li>
            <li className="pt-2">
              <a
                href="/admin/login"
                rel="noopener noreferrer"
                className="bg-[#CBFF2E] hover:bg-[#8eb102d7] text-black 
                font-semibold px-6 py-2 rounded-full shadow-md 
                inline-flex items-center gap-2"
              >
                Login
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2 */}
        <div className="min-w-[80px] ">
          <h3 className="font-semibold mb-4">Navigation</h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleClick("services")}
                className="hover:text-green-600 transition cursor-pointer"
              >
                Services
              </button>
            </li>
            <li>
              <button
                onClick={() => handleClick("products")}
                className="hover:text-green-600 transition cursor-pointer"
              >
                Products
              </button>
            </li>
            <li>
              <Link
                to="/careers"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-green-600 transition cursor-pointer"
              >
                Careers
              </Link>
            </li>
            <li>
              <Link
                to="/team"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-green-600 transition cursor-pointer"
              >
                Team
              </Link>
            </li>
            <li>
              <Link
                to="/blogs"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-green-600 transition cursor-pointer"
              >
                Blog
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="min-w-[180px] gap-0">
          <h3 className="font-semibold mb-4">Products</h3>
          <ul className="space-y-2">
            {products.map((item, i) => (
              <li
                key={i}
                className="relative flex items-center gap-2 whitespace-nowrap group"
              >
                <span
                  className="truncate max-w-[150px] hover:text-green-600 transition cursor-pointer"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    navigate(item.path, { state: { name: item.name } });
                  }}
                >
                  {item.name}
                </span>

                {/* Tooltip on hover */}
                <div
                  className="absolute left-0 -top-7 hidden group-hover:block 
                  bg-black text-white text-xs px-2 py-1 rounded-md 
                  whitespace-nowrap z-20 shadow-lg"
                >
                  {item.name}
                </div>

                {item.comingSoon && (
                  <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                    Coming Soon
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4 */}
        <div className="min-w-[180px]">
          <h3 className="font-semibold mb-4">Address</h3>
          <a
            href="https://www.google.com/maps?q=C+Wing+604,+Sutgirni+Chowk,+Chhatrapati+Sambhajinagar,+India"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-600 transition"
          >
            <ul className="space-y-1">
              <li>C Wing 604</li>
              <li>Sutgirni Chowk</li>
              <li>Chhatrapati Sambhajinagar, India</li>
            </ul>
          </a>
        </div>

        {/* Column 5 */}
        <div className="min-w-[180px]">
          <h3 className="font-semibold mb-4">Contact</h3>
          <ul className="space-y-3">
            {/* Email */}
            <li>
              <a
                href="mailto:app@farmseasy.in"
                className="flex items-center gap-2 hover:text-green-600 transition"
              >
                <Mail size={18} strokeWidth={1.7} />
                app@farmseasy.in
              </a>
            </li>

            {/* Phone */}
            <li>
              <a
                href="tel:+919665333037"
                className="flex items-center gap-2 hover:text-green-600 transition"
              >
                <Phone size={18} strokeWidth={1.7} />
                (+91) 96653 33037
              </a>
            </li>

            {/* LinkedIn */}
            <li>
              <a
                href="https://www.linkedin.com/company/farmseasy/ "
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-green-600 transition"
              >
                <Linkedin size={18} strokeWidth={1.7} />
                FarmsEasy
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className="md:grid md:grid-cols-2 mt-10 border-t border-gray-200 
      pt-4 text-sm text-gray-500"
      >
        <div className="text-center mb-2">
          © {new Date().getFullYear()} FarmsEasy. All rights reserved.
        </div>

        <div className="flex justify-center">
          <ul className="flex gap-4">
            <li>
              <Link
                to="/privacy_policy"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                className="hover:text-green-600 transition cursor-pointer"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/termsforservices"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
                className="hover:text-green-600 transition cursor-pointer"
              >
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
