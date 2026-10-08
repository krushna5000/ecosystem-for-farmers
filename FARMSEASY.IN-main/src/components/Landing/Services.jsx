import React from "react";
import ServicesList from "./Services/ServicesList";
import { motion } from "framer-motion";
import image1 from "../../assets/image1.png";
import image2 from "../../assets/image2.png";
import image3 from "../../assets/image3.png";
import { Leaf } from "lucide-react";

export default function Services() {
  return (
    <section className="md:py-12 text-white">
      <h1 className="text-3xl md:text-4xl max-w-4xl md:font-semibold mb-6 text-left leading-tight">
        Innovative Modern Agriculture Solutions For Better Growth.
      </h1>
      <p className="text-sm mb-2">
        We provide precision-focused solutions that help farmers monitor crops,
        optimize resources, and make informed decisions at every stage of
        cultivation. <br />
        Technology-driven farming methods built for efficiency and performance.{" "}
      </p>

      <div className="flex flex-col">
        <ServicesList />
      </div>
      {/* <div className="flex items-center justify-center h-full px-4 py-10 md:py-20">
        <h1 className="text-xl md:text-2xl font-semibold max-w-sm text-left">
          Changing The Game In Farming With Sustainable Practices And Cool
          Technologies, Shaping The Future Of Agriculture.
        </h1>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-start">
          <motion.img
            src={image1}
            alt="connect1"
            className="w-45 h-45 md:w-94 md:h-94 object-cover rounded-lg shadow-md"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          />
          <motion.div
            className="flex-1 flex gap-2"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Leaf className="w-3" />
            <p className="mt-1 text-xs">Lowa Farmer, Lowa City</p>
          </motion.div>
        </div>

        <div className="flex flex-col items-end">
          <motion.img
            src={image2}
            alt="connect2"
            className="w-45 h-45 md:w-94 md:h-94 object-cover rounded-lg shadow-md"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          />
          <motion.div
            className="flex-1 flex gap-2 w-45 md:w-94"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Leaf className="w-3" />
            <p className="mt-1 text-xs text-left">Queensland, Australia</p>
          </motion.div>
        </div>

        <div className="flex flex-col items-start">
          <motion.img
            src={image3}
            alt="connect3"
            className="w-45 h-45 md:w-94 md:h-94 object-cover rounded-lg shadow-md"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          />
          <motion.div
            className="flex-1 flex gap-2"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Leaf className="w-3" />
            <p className="mt-1 text-xs ">Farmsly, Columbia</p>
          </motion.div>
        </div>
      </div> */}
    </section>
  );
}
