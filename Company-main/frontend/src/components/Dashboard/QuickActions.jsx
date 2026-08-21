import React from "react";
import { Plus, Layers, Package, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Add Brand",
      desc: "Register new vendor",
      icon: <Plus size={18} />,
      color: "text-purple-600 bg-purple-50 group-hover:bg-purple-100",
      onClick: () => navigate("/company/brand-management"),
    },
    {
      label: "Add Category",
      desc: "Organize inventory",
      icon: <Layers size={18} />,
      color: "text-blue-600 bg-blue-50 group-hover:bg-blue-100",
      onClick: () => navigate("/company/product-management/catagory"),
    },
    {
      label: "Add Product",
      desc: "Create new SKU",
      icon: <Package size={18} />,
      color: "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100",
      onClick: () => navigate("/company/product-management/products"),
    },
  ];

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="group relative flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-all duration-200 hover:border-gray-100 hover:bg-gray-50 hover:shadow-sm active:scale-[0.98] cursor-pointer"
          >
            {/* Icon Box */}
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${action.color}`}
            >
              {action.icon}
            </span>

            {/* Text */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                {action.label}
              </p>
              <p className="text-[11px] font-medium text-gray-400 group-hover:text-gray-500">
                {action.desc}
              </p>
            </div>

            {/* Arrow */}
            <ChevronRight size={16} className="text-gray-300 opacity-0 transition-all duration-300 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
          </button>
        ))}
      </div>
    </div>
  );
}