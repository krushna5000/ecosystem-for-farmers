import React from "react";
import { motion } from "framer-motion";

export default function ProductCard({ img, title, delay = 0 }) {
  return (
    <div className="text-center transition-transform duration-300 hover:scale-105 cursor-pointer">
      <motion.img
        src={img}
        alt={title}
        className="rounded-lg w-full h-48 object-cover shadow-md mb-3 
           transition-all duration-300 ease-out 
           hover:shadow-xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
        viewport={{ once: true }}
      />
      <motion.p
        className="text-sm font-medium"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        {title}
      </motion.p>
    </div>
  );
}
