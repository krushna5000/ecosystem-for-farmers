import React from "react";
import { motion } from "framer-motion";

export default function ServiceCard({ img, title, description, delay = 0 }) {
  return (
    <di className="transition-transform duration-300 hover:scale-103 cursor-pointer">
      <motion.img
        src={img}
        alt={title}
        className="rounded-lg w-full h-98 object-cover shadow-md mb-3"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
        viewport={{ once: true }}
      />
      <motion.p
        className="text-md font-bold"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        {title}
      </motion.p>
      <motion.p
        className="text-xs font-light"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        {description}
      </motion.p>
    </di>
  );
}
