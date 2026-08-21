import React from "react";

export default function BenefitCard({ image, title, description }) {
  return (
    <div
      className="
        shadow-xl 
        overflow-hidden 
        rounded-lg
        transform // Enable CSS transforms
        hover:scale-105 // Slightly enlarge on hover
        hover:shadow-2xl // Make shadow more prominent
        transition-all // Animate all changes
        duration-300 // Set animation duration to 300ms
        ease-in-out // Use an ease-in-out timing function
        cursor-pointer // Indicate it's clickable
      "
    >
      <img
        className="w-full h-56 object-cover"
        src={image}
        alt={title}
      />
      <div className="bg-[#0C1515] text-white p-8 h-full">
        <h3 className="text-2xl font-bold mb-3">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
}