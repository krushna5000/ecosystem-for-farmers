import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function TeamGrid({ members }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const totalWidth = containerRef.current.scrollWidth / 2;
      setWidth(totalWidth);
    }
  }, [members]);

  const doubledMembers = [...members, ...members];

  return (
    <div className="mt-16">
      {/* Desktop: Infinite Slider */}
      <div className="hidden md:block overflow-hidden relative">
        <motion.div
          ref={containerRef}
          className="flex"
          animate={{
            x: [0, -width],
          }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 30,
          }}
        >
          {doubledMembers.map((member, index) => (
            <div
              key={index}
              className="flex flex-col items-center flex-shrink-0 w-48"
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-40 h-40 object-cover rounded-xl shadow-lg"
              />
              <h2 className="text-white text-base font-semibold mt-2 text-center">
                {member.name}
              </h2>
              <p className="text-[#b8d404cf] text-sm mt-1 text-center">
                {member.position}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0c1515] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0c1515] to-transparent" />
      </div>

      {/* Mobile: Static Grid */}
      <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-3 md:hidden gap-6 mt-6">
        {members.map((member, index) => (
          <div key={index} className="flex flex-col items-center">
            <img
              src={member.img}
              alt={member.name}
              className="w-28 h-28 object-cover rounded-lg shadow-md"
            />
            <h2 className="text-white text-sm font-semibold mt-2 text-center">
              {member.name}
            </h2>
            <p className="text-[#b8d404cf] text-xs mt-1 text-center">
              {member.position}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
