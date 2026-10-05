import { ArrowRight } from "lucide-react";

const AIPredictionCard = ({ data }) => {
  return (
    <div className="bg-[#033D28] text-white rounded-[32px] p-8 relative overflow-hidden">
      <p className="uppercase text-xs tracking-[3px] text-[#78D39B] font-bold mb-3">
        AI Prediction
      </p>

      <h2 className="text-2xl font-bold mb-6">
        {data.title}
      </h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-[#0E5B3C] flex items-center justify-center">
          <ArrowRight size={24} />
        </div>

        <div>
          <h3 className="font-bold text-[#7BFF9E]">
            {data.nextStage}
          </h3>

          <p className="text-sm text-gray-300">
            {data.estimated}
          </p>
        </div>
      </div>

      <div className="bg-[#124D37] rounded-2xl p-5">
        <div className="flex justify-between text-sm mb-2">
          <span>Confidence Score</span>
          <span className="font-bold text-[#7BFF9E]">
            {data.confidence}%
          </span>
        </div>

        <div className="h-2 bg-[#0B3526] rounded-full overflow-hidden mb-3">
          <div
            style={{ width: `${data.confidence}%` }}
            className="h-full bg-[#7BFF9E]"
          />
        </div>

        <p className="text-xs italic text-gray-300 leading-5">
          "{data.note}"
        </p>
      </div>

      <div className="absolute top-5 right-5 text-white/10 text-7xl">
        ✦
      </div>
    </div>
  );
};

export default AIPredictionCard;