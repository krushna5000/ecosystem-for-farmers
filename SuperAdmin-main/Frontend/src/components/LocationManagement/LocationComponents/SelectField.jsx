import React from "react";

const SelectField = ({ label, value, onChange, options }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="border border-gray-300 cursor-pointer px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-lime-300"
      >
        <option value="">Select</option>
        {options?.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
