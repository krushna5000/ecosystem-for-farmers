import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ActionButton({
  text = "Click Here",
  href = "https://zeocrop.farmseasy.in",
  target = "_self",
  icon = <ArrowRight className="w-5 h-5" />,
}) {
  return (
    <motion.a
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className="bg-[#CBFF2E] hover:bg-[#8eb102d7] text-black font-semibold px-6 py-2 rounded-full shadow-md inline-flex items-center gap-2"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.95 }}
    >
      {text}
      <span className="bg-black p-1 rounded-full text-white font-light">
        {icon}
      </span>
    </motion.a>
  );
}
