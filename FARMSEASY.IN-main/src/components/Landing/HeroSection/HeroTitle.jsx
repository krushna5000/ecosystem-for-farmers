import React from "react";
import { motion } from "framer-motion";

export default function HeroTitle() {
  return (
    <motion.h1
      className="text-[1.65rem] md:text-5xl font-semibold mb-6 text-left leading-tight"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      Building India’s AI-First <br /> Agriculture Platform
      {/* Revolutionizing Agriculture <br /> Through Innovation */}
    </motion.h1>
  );
}
