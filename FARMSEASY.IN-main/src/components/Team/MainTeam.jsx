import React from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function MainTeam({ members }) {
  return (
    <>
      {members.map((member, index) => (
        <div
          key={index}
          className={`flex flex-col md:flex-row ${member.reverse ? "md:flex-row-reverse md:gap-16" : ""
            } gap-8`}
        >
          <motion.div
            className="flex flex-col items-center justify-center md:items-start md:w-1/2"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <img
              src={member.img}
              alt={member.name}
              className="w-68 h-68 md:w-94 md:h-94 object-cover rounded-lg shadow-md"
            />
            <h2 className="text-white text-xl md:text-2xl font-semibold mt-4">
              {member.name}
            </h2>
            <p className="flex items-center gap-2 text-gray-300 text-sm mt-1">
              <Leaf className="w-4 h-4" />
              {member.position}
            </p>
          </motion.div>

          <motion.div
            className="md:w-1/2 text-center flex flex-col gap-16 md:text-left text-gray-300 mt-10"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <p className="text-base md:text-lg text-justify">
              {member.thoughts}
            </p>

            <p className="text-base font-bold text-[#b8d404f2] md:text-lg">
              {member.subThoughts}
            </p>
          </motion.div>
        </div>
      ))}
    </>
  );
}
