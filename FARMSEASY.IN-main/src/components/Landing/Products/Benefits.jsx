import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Benefits() {
  const [openIndex, setOpenIndex] = useState(null);

  const benefits = [
    {
      id: "01",
      title: "Increase Crop Yield",
      description:
        "FarmsEasy elevates crop productivity sustainably by optimizing farming methods and integrating innovative technologies, ensuring a fruitful harvest while preserving natural resources for future generations.",
    },
    {
      id: "02",
      title: "Reduce Water Usage",
      description:
        "Advanced irrigation technologies and precision agriculture help farmers use water efficiently, saving resources and cutting costs.",
    },
    {
      id: "03",
      title: "Improve Soil Health",
      description:
        "By using organic fertilizers and monitoring soil nutrients, FarmsEasy ensures long-term fertility and ecosystem balance.",
    },
  ];

  return (
    <div className="mt-16">
      <p className="text-lg md:text-3xl font-semibold mb-4">
        Modern Farming Solutions With Real-World Impact
      </p>

      <p className="text-sm font-semibold leading-relaxed">
        See how <span className="font-bold">FarmsEasy</span> delivers measurable
        benefits across the entire farming cycle. At FarmsEasy, we offer
        intelligent services that help farmers improve yields, reduce
        environmental impact, and build long-term sustainability.
      </p>

      <div className="mt-10">
        <p className="text-sm font-normal mb-2">Benefits of FarmsEasy</p>
        <div className="border-b border-gray-300 mb-6"></div>

        <div className="space-y-4">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.id}
              className="border-b border-gray-200 pb-2 cursor-pointer"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <span className="text-lg font-bold text-[#CBFF2E]">
                    {benefit.id}
                  </span>
                  <p className="font-semibold text-base">{benefit.title}</p>
                </div>
                <motion.span
                  animate={{ rotate: openIndex === index ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-600 text-xl font-bold"
                >
                  →
                </motion.span>
              </div>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="text-sm text-gray-600 mt-3 ml-10 overflow-hidden"
                  >
                    {benefit.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
