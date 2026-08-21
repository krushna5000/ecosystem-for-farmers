import React from "react";
import { motion } from "framer-motion";
import ConnectImg from "../../assets/connect.png";
import contact from "../../assets/contact-us.jpg";
import Form from "./Form";

export default function Connect() {
  const [isShowForm, setShowForm] = React.useState(false);

  return (
    <div className="w-full h-auto">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 ">
        {/* Form */}
        <div className="w-full h-[70%]">
          <Form />
        </div>

        {/* Image */}
        
      </div>

      {/* Full-width Animated Form Section */}
      {isShowForm && (
        <motion.div
          id="connectForm"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
          className="w-full mt-12 bg-black text-white py-12 px-4 md:px-20 flex flex-col items-center"
        >
          {/* Image on top (visible on all screens) */}
          <div className="w-full md:w-2/3 lg:w-1/2 mb-8 rounded-xl">
            <img
              src={contact}
              alt="contact"
              className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
            />
          </div>

          {/* Horizontal Form */}
          <div className="w-full md:w-2/3 lg:w-1/2">
            <div className="backdrop-blur-md p-6 rounded-xl shadow-lg">
              <Form className="flex flex-col md:flex-row gap-4" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
