import { BadgeCheck } from "lucide-react";

const ReportSummary = ({ crop, issue }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div className="bg-[#F8FAFC] rounded-[22px] p-6">
        <p className="text-xs font-[900] tracking-wide text-[#111827]">
          CROP TYPE
        </p>

        <h3 className="text-xl font-[900] mt-3">
          {crop?.cropName || "Unknown"}
        </h3>

        <p className="text-sm text-[#64748B] mt-1">
          {crop?.growthStage}
        </p>
      </div>

      <div className="bg-[#F8FAFC] rounded-[22px] p-6 border-l-4 border-[#DC2626]">
        <p className="text-xs font-[900] tracking-wide text-[#111827]">
          DISEASE PREDICTION
        </p>

        <h3 className="text-xl font-[900] text-[#B91C1C] mt-3">
          {issue?.name || "Not detected"}
        </h3>

        <p className="text-sm text-[#64748B] mt-1">
          {issue?.scientificName}
        </p>
      </div>

      <div className="bg-[#F8FAFC] rounded-[22px] p-6">
        <p className="text-xs font-[900] tracking-wide text-[#111827]">
          CONFIDENCE SCORE
        </p>

        <div className="flex items-center gap-2 mt-3">
          <h3 className="text-[28px] font-[900] text-[#087333]">
            {issue?.confidence === "high" ? "94.2%" : "78.5%"}
          </h3>

          <BadgeCheck size={18} className="text-[#087333]" />
        </div>

        <p className="text-sm text-[#64748B] mt-1 capitalize">
          {issue?.confidence} confidence
        </p>
      </div>
    </div>
  );
};

export default ReportSummary;