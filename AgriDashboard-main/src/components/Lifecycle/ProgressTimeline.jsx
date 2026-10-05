import { Activity } from "lucide-react";

const ProgressTimeline = ({ data }) => {
  const getStageStyle = (status) => {
    if (status === "completed") {
      return "bg-[#087333] text-white border-[#087333]";
    }

    if (status === "active") {
      return "bg-[#D6A800] text-white border-white shadow-[0_0_0_10px_rgba(214,168,0,0.12)]";
    }

    return "bg-gray-200 text-gray-400 border-gray-200";
  };

  const getLineStyle = (status) => {
    if (status === "completed") {
      return "bg-[#087333]";
    }

    return "bg-gray-200";
  };

  return (
    <div className="bg-[#EAF1FA] rounded-[32px] p-8">
      <div className="flex justify-between items-center mb-12">
        <h2 className="flex items-center gap-3 text-xl font-bold">
          <Activity size={20} className="text-[#087333]" />
          {data.label}:{" "}
          <span className="text-[#087333]">
            {data.currentStage} - {data.percentage}% complete
          </span>
        </h2>

        <div className="flex gap-5 text-xs font-bold tracking-[3px]">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#087333] rounded-full" />
            COMPLETED
          </span>

          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#D6A800] rounded-full" />
            ACTIVE
          </span>

          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-300 rounded-full" />
            FUTURE
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-8">
        {data.stages.map((stage, index) => {
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex-1 flex items-center">
              <div className="flex flex-col items-center min-w-[120px]">
                <div
                  className={`w-14 h-14 rounded-full border-4 flex items-center justify-center ${getStageStyle(
                    stage.status
                  )}`}
                >
                  <Icon size={24} />
                </div>

                <h4 className="font-bold mt-4">{stage.name}</h4>

                <p className="text-xs text-gray-500 mt-1">
                  {stage.date}
                </p>

                {stage.status === "active" && (
                  <span className="mt-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                    IN PROGRESS
                  </span>
                )}
              </div>

              {index !== data.stages.length - 1 && (
                <div
                  className={`h-[3px] flex-1 ${getLineStyle(
                    stage.status
                  )}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTimeline;