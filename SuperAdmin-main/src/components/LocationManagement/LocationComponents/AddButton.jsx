import React from "react";

const AddButton = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-[#CBFF2E] cursor-pointer hover:bg-[#baff00] text-black font-medium px-4 py-2 rounded-md shadow transition"
    >
      <span className="text-xl font-bold">+</span>
      {label}
    </button>
  );
};

export default AddButton;
