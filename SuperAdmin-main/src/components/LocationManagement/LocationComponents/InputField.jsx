import React from "react";

const InputField = ({ label, value, onChange, type = "text" }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-lime-300"
      />
    </div>
  );
};

export default InputField;
