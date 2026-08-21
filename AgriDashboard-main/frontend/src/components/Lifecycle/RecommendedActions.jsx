import { ClipboardList } from "lucide-react";

const RecommendedActions = ({ actions }) => {
  return (
    <div className="col-span-6">
      <h3 className="flex items-center gap-2 font-bold mb-5">
        <ClipboardList size={18} className="text-[#087333]" />
        Recommended Actions
      </h3>

      <div className="space-y-4">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <div
              key={index}
              className="bg-[#F4F6FB] rounded-2xl p-5 flex gap-4"
            >
              <Icon size={22} className="text-[#087333] mt-1" />

              <div>
                <h4 className="font-bold">{action.title}</h4>

                <p className="text-sm text-gray-600 mt-1 leading-5">
                  {action.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedActions;