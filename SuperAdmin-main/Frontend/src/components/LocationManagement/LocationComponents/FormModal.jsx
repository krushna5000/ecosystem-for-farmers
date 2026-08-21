import React, { useState, useEffect } from "react";
import InputField from "./InputField";
import SelectField from "./SelectField";
import toast from "react-hot-toast";

const FormModal = ({
  isOpen,
  onClose,
  title,
  fields = [],
  initialValues = {},
  onSubmit,
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialValues);
    setErrors({});
  }, [initialValues, isOpen]);

  if (!isOpen) return null;

  const handleChange = (name, value, field = {}) => {
    let errorMsg = "";

    // Pincode Validation
    if (name === "pincode") {
      value = value.replace(/\D/g, "");

      if (value.length >= 7) {
        value = value.slice(0, 6);
        errorMsg = "Pincode should be 6 digits only.";
      }
    }

    // Alphabet-only Validation
    if (field.onlyAlphabets) {
      if (/[^A-Za-z\s]/.test(value)) {
        toast.error("Only alphabets are allowed.");
      }
      value = value.replace(/[^A-Za-z\s]/g, "");
    }

    // Update errors
    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Prevent submission if any error exists
    const hasError = Object.values(errors).some((msg) => msg);

    if (hasError) {
      toast.error("Fix the highlighted errors before saving.");
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 text-xl cursor-pointer hover:text-black"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field) => {
            const showError = errors[field.name];

            if (field.type === "text" || field.type === "number") {
              return (
                <div key={field.name}>
                  <InputField
                    label={field.label}
                    value={formData[field.name] || ""}
                    type={field.type}
                    onChange={(e) =>
                      handleChange(field.name, e.target.value, field)
                    }
                  />
                  {showError && (
                    <p className="text-red-500 text-sm mt-1">{showError}</p>
                  )}
                </div>
              );
            }

            if (field.type === "select") {
              return (
                <div key={field.name}>
                  <SelectField
                    label={field.label}
                    value={formData[field.name] || ""}
                    options={field.options || []}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                </div>
              );
            }

            return null;
          })}
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded-md cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-lime-400 hover:bg-lime-500 cursor-pointer rounded-md"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
