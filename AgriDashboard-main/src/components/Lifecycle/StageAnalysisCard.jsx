import RecommendedActions from "./RecommendedActions";
import ActiveRisksCard from "./ActiveRisksCard";

const StageAnalysisCard = ({ data }) => {
  return (
    <div className="col-span-8 bg-white rounded-[32px] p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-xs font-bold tracking-[2px]">
            {data.tag}
          </span>

          <h2 className="text-3xl font-bold mt-5">
            {data.title}
          </h2>
        </div>

        <div className="text-right">
          <h3 className="text-4xl font-extrabold text-[#087333]">
            {data.day}
          </h3>

          <p className="text-sm text-gray-500">
            {data.duration}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <RecommendedActions actions={data.actions} />

        <ActiveRisksCard
          risks={data.risks}
          growthTrend={data.growthTrend}
        />
      </div>
    </div>
  );
};

export default StageAnalysisCard;