import React from "react";
import { Leaf } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroContent() {
  return (
    <div className="flex flex-col md:flex-row gap-4 max-w-2xl w-full mb-8">
      <motion.div
        className="flex-1 flex gap-3"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <p className="text-sx md:text-base">
          FarmsEasy is an AI-powered agricultural platform that unifies crop
          lifecycle intelligence, computer vision, and satellite data to enable
          scalable, data-driven farming across India —{" "}
          <strong>free for farmers</strong>.
          {/* Dive into a world of possibilities <br />
          where traditional farming meets <br />
          modern solutions. */}
        </p>
      </motion.div>

      <motion.div
        className="flex-1"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <p className="text-sm md:text-base">
          Smarter farming solutions designed to increase productivity, improve
          sustainability, and shape the future of food.
        </p>
      </motion.div>
    </div>
  );
}
