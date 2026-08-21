import React, { useState } from "react";
import { Eye, EyeClosed, EyeOff, X } from "lucide-react";

const CreateAdmin = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  if (!isOpen) return null;

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[70%] max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold text-center mb-5">
          {isEditing ? "Update Admin" : "Create New Admin"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Enter Admin Name"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Enter Admin Email"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1 "
              required
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  placeholder="Enter Password"
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 mt-1 pr-10"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer"
                >
                  {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#cbff2e] cursor-pointer font-semibold py-2 rounded-lg hover:bg-[#baff00] transition-colors"
          >
            {isEditing ? "Update Admin" : "Create Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;
