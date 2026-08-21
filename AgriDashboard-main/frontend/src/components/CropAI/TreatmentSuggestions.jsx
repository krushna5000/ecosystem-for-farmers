const TreatmentSuggestions = ({ treatmentPlan }) => {
  const organic = treatmentPlan?.organicAlternatives?.[0];
  const chemical = treatmentPlan?.chemicalTreatment?.[0];

  return (
    <div>
      <h3 className="text-sm font-[900] tracking-wide mb-5">
        DIAGNOSIS & SUGGESTED TREATMENTS
      </h3>

      <div className="space-y-5">
        {organic && (
          <div className="rounded-[24px] border border-[#BDEDD0] bg-[#F2FFF7] p-6">
            <p className="text-xs font-[900] text-[#0B7A35] tracking-wide mb-3">
              ORGANIC APPROACH
            </p>

            <h4 className="font-[800] text-[#0F1F17]">
              {organic.name}
            </h4>

            <p className="text-[#0F1F17] mt-3 leading-relaxed">
              {organic.usage}
            </p>
          </div>
        )}

        {chemical && (
          <div className="rounded-[24px] border border-[#D8DEE8] bg-[#F8FAFC] p-6">
            <p className="text-xs font-[900] text-[#111827] tracking-wide mb-3">
              CHEMICAL APPROACH
            </p>

            <h4 className="font-[800] text-[#0F1F17]">
              {chemical.productName}
            </h4>

            <p className="text-[#0F1F17] mt-3 leading-relaxed">
              {chemical.applicationMethod} — {chemical.dosage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentSuggestions;