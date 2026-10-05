import ReportSummary from "./ReportSummary";
import SymptomsList from "./SymptomsList";
import TreatmentSuggestions from "./TreatmentSuggestions";
import ActionPlan from "./ActionPlan";

const AIReportCard = ({ diagnosisData }) => {
  if (!diagnosisData) {
    return (
      <div className="bg-white rounded-[30px] p-8 shadow-sm">
        <p className="text-gray-500">No diagnosis data available, please upload crop image.</p>
      </div>
    );
  }

  const crop = diagnosisData.cropIdentification;
  const issue = diagnosisData.diagnosis?.primaryIssue;
  const symptoms = diagnosisData.visibleSymptoms?.symptoms || [];
  const treatmentPlan = diagnosisData.treatmentPlan;
  const actionPlan = diagnosisData.farmerActionPlan;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* TOP DARK HEADER */}
      <div className="bg-[#002E1F] text-white px-8 py-7 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-[4px] text-[#9ED7B8] font-[800] mb-2">
            AI ANALYSIS OUTPUT
          </p>

          <h2 className="text-[30px] font-[900]">
            Detection Report: #XJ-904
          </h2>
        </div>

        <span className="px-5 py-2 rounded-full bg-[#6DFF8C] text-[#064E2F] text-sm font-[900]">
          COMPLETED
        </span>
      </div>

      <div className="p-8 space-y-8">
        <ReportSummary crop={crop} issue={issue} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <SymptomsList symptoms={symptoms} />

          <TreatmentSuggestions treatmentPlan={treatmentPlan} />
        </div>

        <ActionPlan actionPlan={actionPlan} />

        <div className="border-t pt-6 flex items-center justify-between">
          <button className="text-[#111827] font-semibold cursor-pointer flex items-center gap-2">
            ▣ Research references link →
          </button>

          <div className="flex items-center gap-4">
            <button className="font-semibold cursor-pointer text-[#111827]">
              Export PDF
            </button>

            <button className="px-7 py-3 rounded-2xl bg-[#0B5D3B] cursor-pointer text-white font-[800] shadow">
              Apply to Field Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReportCard;