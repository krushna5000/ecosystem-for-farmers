import React from "react";
import ActionButton from "../ActionButton";
import { motion } from "framer-motion";

export default function Community() {
  return (
    <div className="md:py-12 w-full">
      <motion.h1
        className="text-3xl md:w-2xl md:text-4xl md:font-semibold mb-6 text-left leading-tight"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        Collaborate and Learn from Industry Experts & Enthusiasts.
      </motion.h1>
      <div className="absolute bottom-6 right-4">
        <ActionButton text="Join the Community" href="#community" />
      </div>
    </div>
  );
}
